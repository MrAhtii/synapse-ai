import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

/* ─────────────── Types ─────────────── */

export interface UserStats {
  documentsUploaded: number;
  flashcardsReviewed: number;
  quizzesCompleted: number;
  studyMinutes: number;
  learningAccuracy: number; // 0–100
  missionsCompleted: number;
  learningStreak: number; // days
  xp: number;
  summariesGenerated: number;
  weeklyGoalProgress: number;
  weeklyGoalTarget: number;
  bestQuizScore: number;
}

/* ─────────────── Empty / default ─────────────── */

export const EMPTY_STATS: UserStats = {
  documentsUploaded: 0,
  flashcardsReviewed: 0,
  quizzesCompleted: 0,
  studyMinutes: 0,
  learningAccuracy: 0,
  missionsCompleted: 0,
  learningStreak: 0,
  xp: 0,
  summariesGenerated: 0,
  weeklyGoalProgress: 0,
  weeklyGoalTarget: 5,
  bestQuizScore: 0,
};

export const STATS_CHANGED_EVENT = "synapse:stats-updated";

export function notifyStatsChanged() {
  window.dispatchEvent(new CustomEvent(STATS_CHANGED_EVENT));
}

/* ─────────────── RPC helper ─────────────── */

type ActivityEvent = {
  type:
    | "quiz"
    | "flashcards"
    | "study_session"
    | "summary"
    | "upload"
    | "mission_task";
  count?: number;
  score_pct?: number;
  minutes?: number;
  task_key?: string;
  task_label?: string;
  task_xp?: number;
  completed?: boolean;
  detail?: string;
};

export async function recordUserActivity(event: ActivityEvent): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Pass flat parameters or spread JSON expected by Postgres
  const { error } = await supabase.rpc("record_user_activity", {
    p_user_id: user.id,
    p_type: event.type,
    p_task_key: event.type === "mission_task" ? event.task_key : null,
    p_task_label: event.type === "mission_task" ? event.task_label : null,
    p_task_xp: event.type === "mission_task" ? event.task_xp : null,
    p_completed: event.type === "mission_task" ? event.completed : null,
  });

  if (error) {
    console.error("record_user_activity RPC error:", error);
    throw error;
  }

  notifyStatsChanged();
}

/* ─────────────── High-level record helpers ─────────────── */

/** Call after a quiz is completed (scorePct = 0–100). */
export async function recordQuizCompleted(scorePct: number): Promise<void> {
  const score = Math.max(0, Math.min(100, Math.round(scorePct)));
  await recordUserActivity({ type: "quiz", score_pct: score });
}

/** Call after reviewing a set of flashcards. */
export async function recordFlashcardsReviewed(count: number): Promise<void> {
  await recordUserActivity({
    type: "flashcards",
    count: Math.max(1, Math.floor(count)),
  });
}

/** Call after a study session ends. */
export async function recordStudyMinutes(minutes: number): Promise<void> {
  await recordUserActivity({
    type: "study_session",
    minutes: Math.max(1, Math.round(minutes)),
  });
}

/** Call when a smart summary is generated / viewed by the user. */
export async function recordSummaryGenerated(detail?: string): Promise<void> {
  await recordUserActivity({ type: "summary", detail });
}

/** Call after a document is uploaded. */
export async function recordUpload(detail?: string): Promise<void> {
  await recordUserActivity({ type: "upload", detail });
}

/** Call when a mission task is toggled. */
export async function completeMissionTask(
  task: { key: string; label: string; xp: number },
  completed: boolean,
): Promise<void> {
  await recordUserActivity({
    type: "mission_task",
    task_key: task.key,
    task_label: task.label,
    task_xp: task.xp,
    completed,
  });
}

export async function bumpStudyStreak(): Promise<void> {
  await recordUserActivity({ type: "study_session", minutes: 1 });
}

/* ─────────────── Row mapping ─────────────── */

interface UserStatsRow {
  flashcards_reviewed: number;
  quizzes_completed: number;
  study_minutes: number;
  learning_accuracy: number;
  missions_completed: number;
  learning_streak: number;
  xp: number;
  summaries_generated: number;
  weekly_goal_progress: number;
  weekly_goal_target: number;
  best_quiz_score: number;
}

function mapRow(row: UserStatsRow | null, documentCount: number): UserStats {
  if (!row) return { ...EMPTY_STATS, documentsUploaded: documentCount };
  return {
    documentsUploaded: documentCount,
    flashcardsReviewed: row.flashcards_reviewed ?? 0,
    quizzesCompleted: row.quizzes_completed ?? 0,
    studyMinutes: row.study_minutes ?? 0,
    learningAccuracy: Math.round(row.learning_accuracy ?? 0),
    missionsCompleted: row.missions_completed ?? 0,
    learningStreak: row.learning_streak ?? 0,
    xp: row.xp ?? 0,
    summariesGenerated: row.summaries_generated ?? 0,
    weeklyGoalProgress: row.weekly_goal_progress ?? 0,
    weeklyGoalTarget: row.weekly_goal_target ?? 5,
    bestQuizScore: row.best_quiz_score ?? 0,
  };
}

/* ─────────────── Hook ─────────────── */

export function useDashboardStats(user: User | null, documentCount: number) {
  const [stats, setStats] = useState<UserStats>({
    ...EMPTY_STATS,
    documentsUploaded: documentCount,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const refreshRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setStats({ ...EMPTY_STATS, documentsUploaded: documentCount });
      setIsLoading(false);
      setLoadError(null);
      return;
    }
    const tag = ++refreshRef.current;
    setIsLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("user_stats")
      .select(
        "flashcards_reviewed, quizzes_completed, study_minutes, learning_accuracy, missions_completed, learning_streak, xp, summaries_generated, weekly_goal_progress, weekly_goal_target, best_quiz_score",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (tag !== refreshRef.current) return;

    if (error) {
      setLoadError("We couldn't load your learning stats.");
      setStats({ ...EMPTY_STATS, documentsUploaded: documentCount });
    } else {
      setStats(mapRow(data, documentCount));
    }
    setIsLoading(false);
  }, [user?.id, documentCount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(STATS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(STATS_CHANGED_EVENT, handler);
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  return { stats, isLoading, loadError, refresh };
}