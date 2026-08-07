import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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

export default function UpdatePassword() {
  const { user, isLoading, updatePassword, signOut } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
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

    setIsSaving(true);
    const { error } = await updatePassword(password);
    setIsSaving(false);

    if (error) {
      setServerError(error);
      return;
    }

    // Password updated successfully — sign out and show success
    await signOut();
    setSuccess(true);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-border border-t-primary" />
          <p className="text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  // No user — invalid/expired recovery link
  if (!user && !success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-sm p-8 sm:p-10">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Invalid Link
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              This password reset link is invalid or has expired. Please request a
              new one.
            </p>
          </div>
          <a href="/forgot-password" className="mt-6 block">
            <Button type="button" className="w-full" size="lg">
              <ArrowLeft size={18} />
              Request New Link
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-sm p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Password Updated
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              Your password has been successfully updated.
            </p>
          </div>
          <a href="/login" className="block">
            <Button type="button" className="w-full" size="lg">
              <ArrowLeft size={18} />
              Back to Login
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  // Form
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-sm p-8 sm:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <img src="/lightmodelogo.png" alt="Synapse AI" className="h-[38px] w-auto" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Enter your new password below.
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

          {/* New Password */}
          <InputField
            icon={Lock}
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
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

          {/* Confirm New Password */}
          <InputField
            icon={Lock}
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
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
          <Button type="submit" className="w-full" isLoading={isSaving} size="lg">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}