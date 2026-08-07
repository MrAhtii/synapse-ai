import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { toFriendlyAuthError } from "../lib/authErrors";
import { createNotification } from "../lib/notifications";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{
    error: string | null;
    needsEmailConfirmation: boolean;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      } else if (event === "SIGNED_OUT") {
        setIsRecovery(false);
      }

      // Clean access token from URL after implicit flow login
      if (session && window.location.hash.includes("access_token")) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: toFriendlyAuthError(error) };
      return { error: null };
    },
    []
  );

  const signUp = useCallback(
    async (
      fullName: string,
      email: string,
      password: string
    ): Promise<{
      error: string | null;
      needsEmailConfirmation: boolean;
    }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) return { error: toFriendlyAuthError(error), needsEmailConfirmation: false };
      // If no session returned, email confirmation is required
      const needsConfirmation = !data.session;
      // Welcome notification (fire-and-forget)
      if (data.user) {
        createNotification(
          data.user.id,
          "Welcome to Synapse AI!",
          { body: "Start your learning journey by uploading your first note.", icon: "Sparkles", link: "/upload" },
        );
      }
      return { error: null, needsEmailConfirmation: needsConfirmation };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/update-password",
      });
      if (error) return { error: toFriendlyAuthError(error) };
      return { error: null };
    },
    []
  );

  const updatePassword = useCallback(
    async (password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: toFriendlyAuthError(error) };
      return { error: null };
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isRecovery,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}