import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

/* ─────────────── Types ─────────────── */

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The user's chosen preference (light / dark / system). */
  mode: ThemeMode;
  /** The actual resolved theme after applying System detection. */
  resolved: "light" | "dark";
  /** Set a new theme preference. */
  setMode: (mode: ThemeMode) => Promise<void>;
}

/* ─────────────── Helpers ─────────────── */

const STORAGE_KEY = "synapse:theme:mode";

/** Resolve "system" at runtime. */
function resolveSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Apply or remove the `.dark` class on <html>. */
function applyClass(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/**
 * Read the cached preference from localStorage.
 * This is called synchronously inside the lazy initializer so the very first
 * render already has the cache (the inline <script> in index.html handles
 * the pre-first-paint class; this picks it up for React state).
 */
function readCache(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // localStorage unavailable (SSR, private mode in some browsers)
  }
  return "system";
}

/* ─────────────── Context ─────────────── */

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/* ─────────────── Provider ─────────────── */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  // Initialise from cache synchronously — no flash.
  const [mode, setModeState] = useState<ThemeMode>(readCache);
  const [resolved, setResolved] = useState<"light" | "dark">(() => {
    const cached = readCache();
    return cached === "light"
      ? "light"
      : cached === "dark"
        ? "dark"
        : resolveSystem();
  });

  // Keep the DOM class in sync whenever `resolved` changes.
  useEffect(() => {
    applyClass(resolved);
  }, [resolved]);

  // Listen to OS preference changes when mode is "system".
  useEffect(() => {
    if (mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolved(mq.matches ? "dark" : "light");
    handler(); // ensure current value
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  // When the user changes (sign-in / sign-out), sync theme from DB once.
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId === lastUserIdRef.current) return; // already synced for this user
    lastUserIdRef.current = currentId;

    if (!user) {
      // No user → keep the cached / default value.
      return;
    }

    // Fetch theme from profile and apply if different from cache.
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.theme && data.theme !== mode) {
        const dbMode = data.theme as ThemeMode;
        setModeState(dbMode);
        try {
          localStorage.setItem(STORAGE_KEY, dbMode);
        } catch {}
        setResolved(
          dbMode === "light"
            ? "light"
            : dbMode === "dark"
              ? "dark"
              : resolveSystem(),
        );
      }
    })();
    // Note: we intentionally depend on user?.id only — not `mode` — to avoid
    // loops. The first mount for this user reads DB once; subsequent changes
    // go through setMode() which writes both cache + DB.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Public setter — persists to cache + DB immediately.
  const setMode = useCallback(
    async (newMode: ThemeMode) => {
      setModeState(newMode);
      try {
        localStorage.setItem(STORAGE_KEY, newMode);
      } catch {}

      const newResolved: "light" | "dark" =
        newMode === "light"
          ? "light"
          : newMode === "dark"
            ? "dark"
            : resolveSystem();
      setResolved(newResolved);

      // Persist to Supabase when signed in — fire-and-forget.
      if (user) {
        try {
          await supabase
            .from("profiles")
            .update({ theme: newMode })
            .eq("id", user.id);
        } catch {
          // Non-blocking — theme is already cached locally.
        }
      }
    },
    [user],
  );

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─────────────── Hook ─────────────── */

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}