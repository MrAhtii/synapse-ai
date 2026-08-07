import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../lib/supabase";
import { notifyStatsChanged, recordUpload } from "./useDashboardStats";
import type { User } from "@supabase/supabase-js";

/* ─────────────── Types ─────────────── */

export interface DocumentRow {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  processing_status: "Pending" | "Processing" | "Completed";
  summary_generated: boolean;
}

/* ─────────────── Validation ─────────────── */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export function validatePdf(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return "Only PDF files can be uploaded.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File is too large — the maximum size is 20 MB.";
  }
  if (file.size === 0) return "That file appears to be empty.";
  return null;
}

/* ─────────────── XHR upload with progress ─────────────── */

function uploadWithProgress(
  file: File,
  path: string,
  accessToken: string,
  onProgress: (pct: number) => void,
): Promise<string | null> {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/storage/v1/object/documents/${encodeURI(path)}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(null);
      } else {
        let msg = "Upload failed. Please try again.";
        try {
          const j = JSON.parse(xhr.responseText);
          msg = j.message || j.error || msg;
        } catch {
          // ignore parse errors
        }
        resolve(msg);
      }
    };

    xhr.onerror = () => {
      resolve("Network error while uploading. Please check your connection and try again.");
    };

    xhr.send(file);
  });
}

/* ─────────────── Hook ─────────────── */

export function useDocuments(user: User | null) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const refreshRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      return;
    }
    const tag = ++refreshRef.current;
    setIsLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (tag !== refreshRef.current) return; // stale

    if (error) {
      setLoadError("We couldn't load your documents.");
      setDocuments([]);
    } else {
      setDocuments(data ?? []);
    }
    setIsLoading(false);
  }, [user?.id]);

  // Re-fetch when user changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Upload a PDF file with progress callbacks. Returns error string or null. */
  const uploadFile = useCallback(
    async (
      file: File,
      onProgress: (pct: number) => void,
    ): Promise<{
      error: string | null;
      /** UUID of the newly created document row, or null on failure. */
      documentId: string | null;
    }> => {
      if (!user) return { error: "You must be signed in to upload notes.", documentId: null };

      const validationError = validatePdf(file);
      if (validationError) return { error: validationError, documentId: null };

      const ext = "pdf";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      // Get fresh access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { error: "Session expired. Please sign in again.", documentId: null };
      }

      const uploadError = await uploadWithProgress(file, path, session.access_token, onProgress);
      if (uploadError) return { error: uploadError, documentId: null };

      // Insert DB row
      const { data: inserted, error: insertError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.pdf$/i, ""),
          file_name: file.name,
          file_url: path,
          file_size: file.size,
          processing_status: "Pending",
          summary_generated: false,
        })
        .select()
        .single();

      if (insertError) {
        // Clean up orphaned storage file
        await supabase.storage.from("documents").remove([path]).catch(() => {});
        return {
          error: "Your file was uploaded but we couldn't save it to your account. Please try again.",
          documentId: null,
        };
      }

      await refresh();
      await recordUpload(inserted.title || file.name.replace(/\.pdf$/i, ""));
      return { error: null, documentId: inserted.id };
    },
    [user?.id, refresh],
  );

  /** Delete a document (storage file + DB row) */
  const deleteDocument = useCallback(
    async (doc: DocumentRow): Promise<string | null> => {
      if (!user) return "You must be signed in.";
      if (doc.user_id !== user.id) return "You don't have permission to delete this document.";

      // Delete storage file (best-effort)
      await supabase.storage.from("documents").remove([doc.file_url]).catch(() => {});

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id)
        .eq("user_id", user.id);

      if (error) return "We couldn't delete that document. Please try again.";
      await refresh();
      notifyStatsChanged();
      return null;
    },
    [user?.id, refresh],
  );

  return {
    documents,
    isLoading,
    loadError,
    refresh,
    uploadFile,
    deleteDocument,
  };
}