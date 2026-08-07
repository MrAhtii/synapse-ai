import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

/* ─────────────── Types ─────────────── */

export interface DayData {
  day: string;
  value: number;
}

export interface ActivityItem {
  label: string;
  icon: string; // string key mapped to lucide icon on the consumer
  time: string;
}

export interface AnalyticsData {
  weekly: DayData[]; // last 7 days, Mon..Sun
  hasWeeklyActivity: boolean;
  totalSessions: number;
  recentActivity: ActivityItem[];
  isLoading: boolean;
}

/* ─────────────── Helpers ─────────────── */

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Build an array of 7 DayData items ending today (Mon → Sun if today is Sun). */
function buildEmptyWeek(): DayData[] {
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sun
  const result: DayData[] = [];
  // last 7 days: day = Mon(1)..Sun(0) aligned to the current week
  // We want Mon..Sun in order. Generate 7 days ending today.
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push({ day: WEEKDAY_SHORT[d.getDay()], value: 0 });
  }
  return result;
}

/* ─────────────── Hook ─────────────── */

export function useAnalytics(user: User | null) {
  const [weekly, setWeekly] = useState<DayData[]>(() => buildEmptyWeek());
  const [hasWeeklyActivity, setHasWeeklyActivity] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const refreshRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setWeekly(buildEmptyWeek());
      setHasWeeklyActivity(false);
      setTotalSessions(0);
      setRecentActivity([]);
      setIsLoading(false);
      return;
    }

    const tag = ++refreshRef.current;
    setIsLoading(true);

    // Fetch last 7 days of activity (UTC)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const start = sevenDaysAgo.toISOString().slice(0, 10);
    const end = today.toISOString().slice(0, 10);

    const [{ data: activityRows }, { data: logRows }] = await Promise.all([
      supabase
        .from("learning_activity")
        .select("day, study_minutes, quizzes_completed, flashcards_reviewed, sessions")
        .gte("day", start)
        .lte("day", end)
        .eq("user_id", user.id)
        .order("day", { ascending: true }),

      supabase
        .from("activity_log")
        .select("action, detail, icon, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    if (tag !== refreshRef.current) return;

    // Build 7-day array
    const dayMap: Record<string, { sessions: number; items: number }> = {};
    for (const row of activityRows ?? []) {
      const d = new Date(row.day + "T00:00:00Z");
      const key = WEEKDAY_SHORT[d.getUTCDay()];
      if (key) {
        dayMap[key] = {
          sessions: (dayMap[key]?.sessions ?? 0) + (row.sessions ?? 0),
          items:
            (dayMap[key]?.items ?? 0) +
            (row.quizzes_completed ?? 0) +
            (row.flashcards_reviewed ?? 0) +
            (row.study_minutes > 0 ? 1 : 0),
        };
      }
    }

    // Map to Mon..Sun ordered grid
    const weekData = buildEmptyWeek();
    let totalActive = 0;
    let anyActivity = false;
    for (const d of weekData) {
      const exists = dayMap[d.day];
      if (exists) {
        // Use sessions count if > 0, else fallback to items sum
        const val = exists.sessions > 0 ? exists.sessions : exists.items;
        d.value = val;
        if (val > 0) anyActivity = true;
        totalActive += exists.sessions;
      }
    }

    setWeekly(weekData);
    setHasWeeklyActivity(anyActivity);
    setTotalSessions(totalActive);

    // Map activity log
    const mapped: ActivityItem[] = (logRows ?? []).map((row) => ({
      label: row.detail
        ? row.detail
        : row.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: row.icon ?? "default",
      time: formatRelativeTime(row.created_at),
    }));

    setRecentActivity(mapped);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weekly, hasWeeklyActivity, totalSessions, recentActivity, isLoading, refresh };
}