import { useEffect, useRef, useState, useCallback, type DragEvent } from "react";
import {
  Upload,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Brain,
  ArrowUpFromLine,
  File,
  CheckCircle2,
  Clock,
  FilePlus,
  Trash2,
  Loader2,
  Hourglass,
  Zap,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toast from "../components/ui/Toast";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments, type DocumentRow } from "../hooks/useDocuments";
import { createNotification } from "../lib/notifications";

/* ─────────────── Types ─────────────── */

interface Feature {
  label: string;
  icon: React.ElementType;
  color: string;
}

const features: Feature[] = [
  { label: "Smart Summary", icon: FileText, color: "from-primary to-secondary" },
  { label: "Flashcards", icon: GraduationCap, color: "from-emerald-400 to-teal-500" },
  { label: "AI Quiz", icon: Sparkles, color: "from-amber-400 to-orange-500" },
  { label: "Daily Mission", icon: Target, color: "from-rose-400 to-pink-500" },
  { label: "Confidence Score", icon: TrendingUp, color: "from-blue-400 to-indigo-500" },
  { label: "Weak Topics Detection", icon: Brain, color: "from-violet-400 to-purple-500" },
];

/* ─────────────── Demo mock data ─────────────── */

const demoRecentUploads = [
  { filename: "JavaScript Notes.pdf", date: "2 hours ago", status: "ready" as const },
  { filename: "DBMS Unit 2.pdf", date: "Yesterday", status: "coming_soon" as const },
  { filename: "Operating Systems.docx", date: "2 days ago", status: "processing" as const },
];

/* ─────────────── Helpers ─────────────── */

const STATUS_MAP: Record<string, "ready" | "processing" | "pending"> = {
  Completed: "ready",
  Processing: "processing",
  Pending: "pending",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

/* ─────────────── Sub-components ─────────────── */

function StatusBadge({ status }: { status: "ready" | "processing" | "pending" | "coming_soon" }) {
  const styles: Record<string, { label: string; classes: string }> = {
    ready: {
      label: "Ready",
      classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    processing: {
      label: "Processing",
      classes: "bg-amber-50 text-amber-600 border-amber-200",
    },
    pending: {
      label: "Pending",
      classes: "bg-muted text-foreground/50 border-border",
    },
    coming_soon: {
      label: "AI Integration Coming Soon",
      classes: "bg-sky-50 text-sky-600 border-sky-200",
    },
  };
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${s.classes}`}
    >
      {status === "ready" && <CheckCircle2 size={12} />}
      {status === "processing" && <Clock size={12} className="animate-pulse" />}
      {status === "pending" && <Hourglass size={12} />}
      {status === "coming_soon" && <Zap size={12} />}
      {s.label}
    </span>
  );
}

function DropZone({ onFileSelect }: { onFileSelect?: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect?.(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect?.(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed
        p-10 transition-all duration-300 ease-out sm:p-14
        ${
          isDragOver
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border bg-card hover:border-primary/50 hover:bg-muted/30 hover:shadow-md"
        }
      `}
      aria-label="Upload your study material"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        aria-hidden="true"
        onChange={handleFileChange}
      />

      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary/8 to-secondary/5 blur-2xl" />

      <div
        className={`
          mb-5 flex h-16 w-16 items-center justify-center rounded-2xl
          transition-all duration-300 ease-out
          ${
            isDragOver
              ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
              : "bg-primary/10 text-primary"
          }
        `}
      >
        <ArrowUpFromLine size={28} />
      </div>

      <p className="font-heading text-lg font-semibold text-foreground sm:text-xl">
        {isDragOver ? "Drop your files here" : "Drag & Drop your files here"}
      </p>
      <p className="mt-2 text-sm text-foreground/50">Supports: PDF · Max 20 MB</p>

      <div className="mt-6">
        <Button
          variant="outline"
          size="md"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <FilePlus size={16} />
          Browse Files
        </Button>
      </div>
    </div>
  );
}

function UploadProgressCard({
  filename,
  progress,
}: {
  filename: string;
  progress: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/30 bg-card p-10 sm:p-14">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Loader2 size={28} className="animate-spin" />
      </div>
      <p className="font-heading text-lg font-semibold text-foreground sm:text-xl">
        Uploading…
      </p>
      <p className="mt-1 max-w-[280px] truncate text-sm text-foreground/50">
        {filename}
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-xs">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% uploaded`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs font-medium text-foreground/40">
          {progress}%
        </p>
      </div>
    </div>
  );
}

function RecentUploadsSection({
  documents,
  isLoading,
  isDemo,
  onDelete,
}: {
  documents: DocumentRow[];
  isLoading: boolean;
  isDemo: boolean;
  onDelete: (doc: DocumentRow) => void;
}) {
  if (isDemo) {
    return (
      <Card>
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
          Recent Uploads
        </h3>
        {demoRecentUploads.length === 0 ? (
          <p className="py-6 text-center text-sm text-foreground/40">
            No uploads yet — drop your first file above.
          </p>
        ) : (
          <ul className="divide-y divide-border" role="list">
            {demoRecentUploads.map((item) => (
              <li
                key={item.filename}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <File size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/40">{item.date}</p>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
        Recent Uploads
      </h3>
      {isLoading ? (
        <p className="py-6 text-center text-sm text-foreground/40">
          Loading your documents…
        </p>
      ) : documents.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground/40">
          No uploads yet — drop your first PDF above.
        </p>
      ) : (
        <ul className="divide-y divide-border" role="list">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <File size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {doc.file_name}
                </p>
                <p className="mt-0.5 text-xs text-foreground/40">
                  {formatRelativeTime(doc.uploaded_at)}
                </p>
              </div>
              <StatusBadge status={STATUS_MAP[doc.processing_status] ?? "pending"} />
              <button
                type="button"
                onClick={() => onDelete(doc)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/30 transition-colors duration-200 hover:bg-muted hover:text-red-500 cursor-pointer"
                aria-label={`Delete ${doc.file_name}`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}
      >
        <Icon size={18} />
      </div>
      <span className="text-sm font-medium text-foreground">{feature.label}</span>
    </div>
  );
}

function FeaturesPanel() {
  return (
    <Card>
      <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
        What Synapse AI will generate
      </h3>
      <p className="mb-5 text-sm text-foreground/50">
        Your uploaded notes become an entire learning ecosystem.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {features.map((feature) => (
          <FeatureCard key={feature.label} feature={feature} />
        ))}
      </div>
    </Card>
  );
}

/* ─────────────── Page ─────────────── */

export default function UploadPage() {
  const { isDemo, showRestricted } = useDemoMode();
  const { user } = useAuth();
  const { documents, isLoading: docsLoading, uploadFile, deleteDocument } = useDocuments(
    isDemo ? null : user,
  );

  const [phase, setPhase] = useState<"idle" | "uploading">("idle");
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showRestrictedOnMount, setShowRestrictedOnMount] = useState(false);
  const toastKey = useRef(0);

  useEffect(() => {
    if (isDemo && !showRestrictedOnMount) {
      const t = setTimeout(() => {
        showRestricted(
          "Upload Notes",
          "Uploading your own notes requires a free account.",
          "Create a free account to upload PDFs, generate flashcards, quizzes, and summaries — and sync everything across your devices.",
        );
        setShowRestrictedOnMount(true);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isDemo, showRestricted, showRestrictedOnMount]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    toastKey.current++;
    setToast({ type, message });
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (isDemo) {
        showRestricted(
          "Upload Notes",
          "Uploading your own notes requires a free account.",
          "Create a free account to upload PDFs, generate flashcards, quizzes, and summaries — and sync everything across your devices.",
        );
        return;
      }

      setUploadingFile(file);
      setPhase("uploading");
      setUploadProgress(0);

      const { error } = await uploadFile(file, (pct) => {
        setUploadProgress(pct);
      });

      if (error) {
        showToast("error", error);
      } else {
        showToast("success", "Notes uploaded successfully!");
        // Fire-and-forget notification
        if (user) {
          createNotification(user.id, "Notes uploaded successfully", {
            body: `"${file.name}" has been uploaded and is being processed.`,
            icon: "Upload",
            link: "/workspace",
          });
        }
      }
      setPhase("idle");
      setUploadingFile(null);
    },
    [isDemo, showRestricted, uploadFile, showToast],
  );

  const handleDelete = useCallback(
    async (doc: DocumentRow) => {
      const err = await deleteDocument(doc);
      if (err) showToast("error", err);
    },
    [deleteDocument, showToast],
  );

  return (
    <PageContainer>
      {toast && (
        <Toast
          key={toastKey.current}
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Upload Your Study Material
        </h1>
        <p className="mt-2 max-w-2xl text-base text-foreground/60">
          Upload notes and let Synapse AI transform them into your personalized Learning
          Journey.
        </p>
      </div>

      {/* ── Main grid ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {phase === "uploading" && uploadingFile ? (
            <UploadProgressCard filename={uploadingFile.name} progress={uploadProgress} />
          ) : (
            <DropZone onFileSelect={handleFileSelect} />
          )}
          <RecentUploadsSection
            documents={documents}
            isLoading={docsLoading}
            isDemo={isDemo}
            onDelete={handleDelete}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <FeaturesPanel />
        </div>
      </div>

      {/* ── Bottom info card ── */}
      <Card className="relative overflow-hidden border-l-4 border-l-primary">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-primary/8 to-secondary/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-accent/8 to-primary/5 blur-xl" />

        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
            <Upload size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Your Learning Journey Starts Here
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
              Upload once and let Synapse AI build a complete personalized learning
              experience.
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}