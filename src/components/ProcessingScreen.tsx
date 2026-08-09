import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  Upload,
  BookOpen,
  FileSearch,
  FileText,
  Layers,
  Brain,
  Target,
  BarChart3,
} from "lucide-react";

/* ─────────────── Types ─────────────── */

interface Step {
  id: string;
  icon: React.ReactNode;
  label: string;
  status: "pending" | "processing" | "done";
}

/* ─────────────── Steps definition ─────────────── */

const STEPS: Omit<Step, "status">[] = [
  { id: "upload", icon: <Upload size={15} />, label: "Upload Complete" },
  { id: "reading", icon: <FileSearch size={15} />, label: "Reading document..." },
  {
    id: "extracting",
    icon: <FileText size={15} />,
    label: "Extracting important concepts...",
  },
  {
    id: "summary",
    icon: <BookOpen size={15} />,
    label: "Generating Smart Summary...",
  },
  {
    id: "flashcards",
    icon: <Layers size={15} />,
    label: "Creating Flashcards...",
  },
  {
    id: "quiz",
    icon: <Brain size={15} />,
    label: "Building AI Quiz...",
  },
  {
    id: "mission",
    icon: <Target size={15} />,
    label: "Preparing Daily Mission...",
  },
  {
    id: "analytics",
    icon: <BarChart3 size={15} />,
    label: "Updating Analytics...",
  },
];

/* ─────────────── Helpers ─────────────── */

const NOTIFICATION_DURATION = 1200; // ms each step stays visible before next begins

/* ─────────────── Component ─────────────── */

export default function ProcessingScreen({ filename }: { filename: string }) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>(() =>
    STEPS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [isComplete, setIsComplete] = useState(false);

  const advanceStep = useCallback((stepIndex: number) => {
    if (stepIndex >= STEPS.length) {
      setIsComplete(true);
      return;
    }

    // Mark this step as processing
    setSteps((prev) =>
      prev.map((s, i) => (i === stepIndex ? { ...s, status: "processing" as const } : s)),
    );

    const nextDelay = stepIndex === 0 ? 600 : NOTIFICATION_DURATION;

    setTimeout(() => {
      // Mark this step as done, schedule next
      setSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "done" as const } : s)),
      );

      // Brief pause before next step starts
      setTimeout(() => {
        advanceStep(stepIndex + 1);
      }, 300);
    }, nextDelay);
  }, []);

  useEffect(() => {
    advanceStep(0);
  }, [advanceStep]);

  /* ── Progress ── */
  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8">
      <div className="mx-auto w-full max-w-lg px-4">
        {/* ── Card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg sm:p-10">
          {/* Decorative gradient blob */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/8 to-secondary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-accent/8 to-primary/5 blur-2xl" />

          {/* ── Header ── */}
          <div className="relative mb-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                {isComplete ? <Sparkles size={28} /> : <Loader2 size={28} className="animate-spin" />}
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {isComplete ? "All Done!" : "AI is Processing"}
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              {isComplete
                ? "Your learning workspace is ready."
                : `Analyzing ${filename}`}
            </p>
          </div>

          {/* ── Progress Bar ── */}
          <div className="relative mb-7">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${progress}% complete`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs font-medium text-foreground/40">
              {progress}%
            </p>
          </div>

          {/* ── Steps List ── */}
          <div className="relative space-y-1.5">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500 ease-out ${
                  step.status === "done"
                    ? "bg-emerald-50/70 opacity-100"
                    : step.status === "processing"
                      ? "bg-primary/5 opacity-100"
                      : "opacity-25"
                }`}
              >
                {/* Status icon */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                    step.status === "done"
                      ? "bg-emerald-100 text-emerald-600"
                      : step.status === "processing"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-foreground/30"
                  } transition-all duration-300`}
                >
                  {step.status === "done" ? (
                    <CheckCircle2 size={16} />
                  ) : step.status === "processing" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    step.icon
                  )}
                </span>

                {/* Label */}
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    step.status === "done"
                      ? "text-emerald-700"
                      : step.status === "processing"
                        ? "text-primary"
                        : "text-foreground/50"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── CTA Button (appears when complete) ── */}
          {isComplete && (
            <div className="relative mt-8 animate-[fadeSlideUp_0.5s_ease-out]">
              <button
                onClick={() => navigate("/workspace")}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 ease-out hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={20} />
                Start Learning
                <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}