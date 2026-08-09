import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  type,
  message,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const isSuccess = type === "success";

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-toast-in"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm transition-all duration-200 ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-red-200 bg-red-50 text-red-900"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
        ) : (
          <AlertCircle size={18} className="shrink-0 text-red-500" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onDismiss}
          className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors duration-200 cursor-pointer ${
            isSuccess
              ? "text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600"
              : "text-red-400 hover:bg-red-100 hover:text-red-600"
          }`}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
