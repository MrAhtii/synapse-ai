import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

function InputField({
  icon: Icon,
  label,
  error,
  ...props
}: {
  icon: React.ElementType;
  label: string;
  error?: string;
  [key: string]: unknown;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-card px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-200 ease-out focus:outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border"
          }`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setIsLoading(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    setSent(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <PageContainer maxWidth="sm">
        <Card className="p-8 sm:p-10">
          {!sent ? (
            /* ── Forgot Password form ── */
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                  {/* Light Mode Logo */}
                  <img
                    src="/lightmodelogo.png"
                    alt="Synapse AI"
                    className="h-[38px] w-auto block dark:hidden"
                  />
                  {/* Dark Mode Logo */}
                  <img
                    src="/darkmodelogo.png"
                    alt="Synapse AI"
                    className="h-[38px] w-auto hidden dark:block"
                  />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Forgot Password
                </h1>
                <p className="mt-2 text-sm text-foreground/60">
                  Enter your email address and we&apos;ll send you password reset
                  instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email */}
                <InputField
                  icon={Mail}
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  error={error}
                  autoComplete="email"
                />

                {/* Send Reset Link */}
                <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                  <Send size={18} />
                  Send Reset Link
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/50 transition-colors duration-200 hover:text-primary cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </a>
              </div>
            </>
          ) : (
            /* ── Success state ── */
            <>
              {/* Success icon */}
              <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Check Your Email
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  Password reset instructions have been sent to your email.
                </p>
              </div>

              {/* Back to Login */}
              <a href="/login" className="block">
                <Button type="button" className="w-full" size="lg">
                  <ArrowLeft size={18} />
                  Back to Login
                </Button>
              </a>
            </>
          )}
        </Card>
      </PageContainer>
    </div>
  );
}