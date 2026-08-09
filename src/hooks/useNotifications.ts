import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { AppNotification } from "../lib/notifications";

/* ─────────────── Types ─────────────── */

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/* ─────────────── Hook ─────────────── */

export function useNotifications(user: User | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const refreshRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const tag = ++refreshRef.current;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (tag !== refreshRef.current) return;

    if (!error && data) {
      setNotifications(data as AppNotification[]);
    }
    setIsLoading(false);
  }, [user?.id]);

  // Initial fetch + poll every 30s
  useEffect(() => {
    refresh();

    pollingRef.current = setInterval(refresh, 30_000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [refresh]);

  // Also refresh on visibility change
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        await refresh();
      }
    },
    [user?.id, refresh],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }, [user?.id]);

  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setNotifications([]);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      await refresh();
    }
  }, [user?.id, refresh]);

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!user) return;

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        await refresh();
      }
    },
    [user?.id, refresh],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification,
    refresh,
  };
}