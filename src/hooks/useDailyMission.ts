import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { completeMissionTask, STATS_CHANGED_EVENT, notifyStatsChanged } from "./useDashboardStats";
import { createNotification } from "../lib/notifications";
import type { User } from "@supabase/supabase-js";

/* ─────────────── Task definitions ─────────────── */

export interface MissionTaskDef {
  key: string;
  label: string;
  xp: number;
}

export const MISSION_TASKS: MissionTaskDef[] = [
  { key: "summary", label: "Read Smart Summary", xp: 25 },
  { key: "flashcards", label: "Complete Flashcards", xp: 30 },
  { key: "quiz", label: "Finish AI Quiz", xp: 35 },
  { key: "weak", label: "Review Weak Topics", xp: 20 },
];

export const MISSION_BONUS_XP = 50;

export interface MissionTask extends MissionTaskDef {
  completed: boolean;
}

/* ─────────────── Hook ─────────────── */

export function useDailyMission(user: User | null) {
  const [tasks, setTasks] = useState<MissionTask[]>(() =>
    MISSION_TASKS.map((t) => ({ ...t, completed: false })),
  );
  const [isLoading, setIsLoading] = useState(true);
  const refreshRef = useRef(0);

  const todayStr = new Date().toISOString().slice(0, 10);

  const refresh = useCallback(async () => {
    if (!user) {
      setTasks(MISSION_TASKS.map((t) => ({ ...t, completed: false })));
      setIsLoading(false);
      return;
    }

    const tag = ++refreshRef.current;
    setIsLoading(true);

    const { data } = await supabase
      .from("daily_missions")
      .select("task_key, completed")
      .eq("user_id", user.id)
      .eq("mission_date", todayStr);

    if (tag !== refreshRef.current) return;

    const completedSet = new Set(
      (data ?? []).filter((r) => r.completed).map((r) => r.task_key),
    );

    setTasks(
      MISSION_TASKS.map((t) => ({
        ...t,
        completed: completedSet.has(t.key),
      })),
    );
    setIsLoading(false);
  }, [user?.id, todayStr]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-fetch when stats change (e.g. a quiz could mark the quiz task)
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(STATS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(STATS_CHANGED_EVENT, handler);
  }, [refresh]);

  const toggleTask = useCallback(
    async (key: string, completed: boolean) => {
      const def = MISSION_TASKS.find((t) => t.key === key);
      if (!def || !user) return;

      // Optimistic update
      let newAllDone = false;
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.key === key ? { ...t, completed } : t,
        );
        newAllDone = updated.every((t) => t.completed);
        return updated;
      });

      await completeMissionTask(def, completed);

      // Notify when all tasks are completed
      if (completed && newAllDone) {
        const totalXp =
          MISSION_TASKS.reduce((s, t) => s + t.xp, 0) + MISSION_BONUS_XP;
        createNotification(user.id, "Daily mission completed!", {
          body: `All tasks done! You earned ${totalXp} XP today.`,
          icon: "Target",
          link: "/missions",
        });
      }

      // Re-fetch to sync
      await refresh();
    },
    [user?.id, refresh],
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const xpEarned = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.xp, 0);
  const xpTarget = tasks.reduce((sum, t) => sum + t.xp, 0);
  const allDone = completedCount === totalCount;

  return {
    tasks,
    isLoading,
    toggleTask,
    completedCount,
    totalCount,
    xpEarned,
    xpTarget,
    allDone,
    todayStr,
  };
}