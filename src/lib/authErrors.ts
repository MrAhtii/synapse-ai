import type { AuthError } from "@supabase/supabase-js";

export function toFriendlyAuthError(error: AuthError | null): string {
  if (!error) return "";
  const msg = error.message;
  if (msg.includes("Invalid login credentials"))
    return "Invalid email or password. Please try again.";
  if (msg.includes("Email not confirmed"))
    return "Please confirm your email before signing in. Check your inbox for the confirmation link.";
  if (msg.includes("User already registered"))
    return "An account with this email already exists. Try logging in instead.";
  if (msg.includes("Password should be at least 6 characters"))
    return "Password must be at least 6 characters.";
  if (msg.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("Email link is invalid or has expired"))
    return "This reset link is invalid or has expired. Please request a new one.";
  return msg;
}