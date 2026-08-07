import { useState, useCallback } from "react";

const STORAGE_KEY = "synapse-sidebar-collapsed";

function getInitialState(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  } catch {
    return false;
  }
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(getInitialState);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable (private mode, SSR, etc.)
      }
      return next;
    });
  }, []);

  return { collapsed, toggleCollapsed };
}