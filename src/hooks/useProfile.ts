import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { createNotification } from "../lib/notifications";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/* ─────────────── Helpers ─────────────── */

/** Best-effort extract the storage path from a public avatar URL. */
function extractStoragePath(publicUrl: string): string | null {
  // URL format: /storage/v1/object/public/avatars/<path>
  const idx = publicUrl.indexOf("/public/avatars/");
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + "/public/avatars/".length));
}

function friendlyError(err: any, context: string): string {
  if (!err) return `Something went wrong while ${context}. Please try again.`;
  if (err.code === "23505") return "This username is already taken. Please choose another.";
  if (err.statusCode === "409" || err.statusCode === 409) return "This username is already taken. Please choose another.";
  if (err.message?.toLowerCase().includes("row-level security")) {
    return `You don't have permission to ${context}. Please sign out and sign in again.`;
  }
  if (err.message) return err.message;
  return `Something went wrong while ${context}. Please try again.`;
}

const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please select an image file (PNG, JPG, etc.).";
  if (file.size > AVATAR_MAX_SIZE) return "Image must be under 2 MB.";
  return null;
}

/* ─────────────── Hook ─────────────── */

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const cancelledRef = useRef(false);

  // Fetch profile whenever user changes
  useEffect(() => {
    cancelledRef.current = false;
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setLoadError("We couldn't load your profile. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      if (!data) {
        // First sign-in — create profile row
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
          })
          .select()
          .single();

        if (cancelled) return;

        if (createError) {
          setLoadError("We couldn't create your profile. Please refresh and try again.");
          setIsLoading(false);
          return;
        }
        setProfile(created);
      } else {
        setProfile(data);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      cancelledRef.current = true;
    };
  }, [user?.id]);

  /** Save profile fields and optionally upload / remove an avatar. */
  const saveProfile = useCallback(
    async (
      fields: { full_name: string; username: string; bio: string },
      avatarFile?: File | null, // null = remove existing avatar, undefined = leave as-is
    ): Promise<{ error: string | null }> => {
      if (!user) return { error: "You must be signed in." };

      // Validate
      const trimmed = {
        full_name: fields.full_name.trim(),
        username: fields.username.trim(),
        bio: fields.bio.trim(),
      };
      if (!trimmed.full_name) return { error: "Full name is required." };
      if (trimmed.username) {
        if (trimmed.username.length < 3 || trimmed.username.length > 30) {
          return { error: "Username must be between 3 and 30 characters." };
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed.username)) {
          return { error: "Username can only contain letters, numbers, periods, underscores, and hyphens." };
        }
      }

      setIsSaving(true);

      try {
        let avatar_url = profile?.avatar_url ?? null;

        // Handle avatar file upload / removal
        if (avatarFile !== undefined) {
          // Delete old avatar file from storage (best-effort)
          if (avatar_url) {
            const oldPath = extractStoragePath(avatar_url);
            if (oldPath) {
              await supabase.storage.from("avatars").remove([oldPath]).catch(() => {});
            }
          }

          if (avatarFile === null) {
            // User wants to remove avatar
            avatar_url = null;
          } else {
            // Upload new avatar
            const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
            const path = `${user.id}/avatar-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("avatars")
              .upload(path, avatarFile, {
                upsert: true,
                contentType: avatarFile.type,
              });

            if (uploadError) {
              return { error: friendlyError(uploadError, "uploading your avatar") };
            }

            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(path);
            avatar_url = urlData.publicUrl;
          }
        }

        // Update profile row
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: trimmed.full_name || null,
            username: trimmed.username || null,
            bio: trimmed.bio || null,
            avatar_url,
          })
          .eq("id", user.id);

        if (updateError) {
          return { error: friendlyError(updateError, "saving your profile") };
        }

        // Sync full_name and avatar_url into auth metadata so the
        // navbar and all other components stay in sync immediately
        await supabase.auth
          .updateUser({
            data: {
              full_name: trimmed.full_name,
              avatar_url,
            },
          })
          .catch(() => {});

        // Refresh local profile state
        const { data: fresh } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fresh) setProfile(fresh);

        // Notify about profile update
        const avatarChanged = avatarFile !== undefined;
        if (avatarChanged && avatarFile !== null) {
          createNotification(user.id, "Profile photo changed", {
            body: "Your profile photo has been updated successfully.",
            icon: "User",
            link: "/profile",
          });
        } else {
          createNotification(user.id, "Profile updated", {
            body: "Your profile information has been saved successfully.",
            icon: "User",
            link: "/profile",
          });
        }

        return { error: null };
      } finally {
        setIsSaving(false);
      }
    },
    [user, profile?.avatar_url],
  );

  return { profile, isLoading, loadError, isSaving, saveProfile };
}