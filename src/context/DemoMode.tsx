import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

interface DemoModeContextValue {
  isDemo: boolean;
  exitDemo: () => void;
  showRestricted: (feature?: string, title?: string, body?: string) => void;
  hideRestricted: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemo: false,
  exitDemo: () => {},
  showRestricted: () => {},
  hideRestricted: () => {},
});

/* ─────────────── Restricted Feature Modal ─────────────── */

function RestrictedFeatureModal({
  feature,
  title,
  body,
  onClose,
}: {
  feature: string | null;
  title?: string | null;
  body?: string | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /* Trap Tab focus inside the modal */
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const focusable =
      'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const elements = el.querySelectorAll<HTMLElement>(focusable);
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="none"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop-fade" aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restricted-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl sm:p-10 animate-modal-enter"
      >
        {/* Close button — visually hidden on mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-foreground/30 hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Lock size={28} className="text-primary" />
        </div>

        {/* Title */}
        <h2
          id="restricted-title"
          className="text-center font-heading text-xl font-bold text-foreground"
        >
          {title ??
            (feature
              ? `Create an account to access ${feature}`
              : "Create a free account to continue")}
        </h2>

        {/* Body */}
        <p className="mt-3 text-center text-sm leading-relaxed text-foreground/60">
          {body ??
            "You're currently exploring Demo Mode. Create a free account to upload your own notes, save your learning progress, and sync your data across devices."}
        </p>

        {/* Actions */}
        <div className="mt-7 space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate("/register")}
          >
            <Sparkles size={16} />
            Create Account
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={onClose}
          >
            <ArrowLeft size={16} />
            Continue Demo
          </Button>
        </div>

        <p className="mt-5 text-center text-xs text-foreground/40">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

/* ─────────────── Provider ─────────────── */

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [restricted, setRestricted] = useState<{
    feature: string | null;
    title: string | null;
    body: string | null;
  } | null>(null);

  const exitDemo = useCallback(() => {
    window.location.href = "/";
  }, []);

  const showRestricted = useCallback((feature?: string, title?: string, body?: string) => {
    setRestricted({ feature: feature ?? null, title: title ?? null, body: body ?? null });
  }, []);

  const hideRestricted = useCallback(() => {
    setRestricted(null);
  }, []);

  return (
    <DemoModeContext.Provider
      value={{
        isDemo: true,
        exitDemo,
        showRestricted,
        hideRestricted,
      }}
    >
      {children}
      {restricted !== null && (
        <RestrictedFeatureModal
          feature={restricted.feature}
          title={restricted.title}
          body={restricted.body}
          onClose={hideRestricted}
        />
      )}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}