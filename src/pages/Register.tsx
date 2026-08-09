import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

function InputField({
  icon: Icon,
  label,
  error,
  type = "text",
  rightElement,
  ...props
}: {
  icon: React.ElementType;
  label: string;
  error?: string;
  type?: string;
  rightElement?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  const hasRight = !!rightElement;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          id={inputId}
          type={type}
          className={`w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-200 ease-out focus:outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 ${hasRight ? "pr-10" : ""} ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border"} pl-10`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsLoading(true);
    const { error, needsEmailConfirmation } = await signUp(
      fullName.trim(),
      email.trim(),
      password
    );
    setIsLoading(false);

    if (error) {
      setServerError(error);
      return;
    }

    if (needsEmailConfirmation) {
      setNeedsConfirmation(true);
      return;
    }

    // Session returned — no email confirmation needed
    navigate("/dashboard");
  };

  // Success — email confirmation required
  if (needsConfirmation) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <PageContainer maxWidth="sm">
          <Card className="p-8 sm:p-10">
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
                We sent a confirmation link to <strong>{email}</strong>.<br />
                Please verify your email address, then{" "}
                <a href="/login" className="text-primary hover:text-primary/80 transition-colors">
                  sign in
                </a>.
              </p>
            </div>
          </Card>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <PageContainer maxWidth="sm">
        <a
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground/50 transition-colors duration-200 hover:text-foreground cursor-pointer"
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
            className="shrink-0"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </a>
        <Card className="p-8 sm:p-10">
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
              Create your account
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Start your AI-powered learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Server error */}
            {serverError && (
              <div
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </div>
            )}

            {/* Full Name */}
            <InputField
              icon={User}
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              error={errors.fullName}
              autoComplete="name"
            />

            {/* Email */}
            <InputField
              icon={Mail}
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password */}
            <InputField
              icon={Lock}
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex items-center justify-center text-foreground/40 transition-colors duration-200 hover:text-foreground/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Confirm Password */}
            <InputField
              icon={Lock}
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="flex items-center justify-center text-foreground/40 transition-colors duration-200 hover:text-foreground/70"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  aria-pressed={showConfirm}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Submit */}
            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              <UserPlus size={18} />
              Create Account
            </Button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-foreground/60">
            Already have an account?{" "}
            <a
              href="/login"
              className="cursor-pointer font-medium text-primary transition-colors duration-200 hover:text-primary/80"
            >
              Sign in
            </a>
          </p>
        </Card>
      </PageContainer>
    </div>
  );
}