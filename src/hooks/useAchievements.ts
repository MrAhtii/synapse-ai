import {
  Upload,
  Brain,
  Flame,
  Trophy,
  BookOpen,
  Star,
  Award,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { UserStats } from "./useDashboardStats";

/* ─────────────── Types ─────────────── */

export interface AchievementDef {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  earned: boolean;
}

export interface AchievementsData {
  achievements: AchievementDef[];
  unlocked: number;
  total: number;
}

/* ─────────────── Achievements ─────────────── */

const ACHIEVEMENT_TEMPLATES: Omit<AchievementDef, "earned">[] = [
  {
    name: "First Upload",
    description: "Upload your first document",
    icon: Upload,
    color: "from-blue-400 to-indigo-500",
  },
  {
    name: "Quiz Master",
    description: "Complete 10 quizzes",
    icon: Brain,
    color: "from-amber-400 to-yellow-500",
  },
  {
    name: "7 Day Streak",
    description: "Study for 7 days in a row",
    icon: Flame,
    color: "from-orange-400 to-rose-500",
  },
  {
    name: "Study Champion",
    description: "Study for 300 minutes",
    icon: Trophy,
    color: "from-violet-400 to-purple-500",
  },
  {
    name: "Flashcard Fanatic",
    description: "Review 500 flashcards",
    icon: BookOpen,
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: Star,
    color: "from-yellow-400 to-orange-500",
  },
  {
    name: "Century Club",
    description: "Complete 100 missions",
    icon: Award,
    color: "from-pink-400 to-rose-500",
  },
  {
    name: "Knowledge Seeker",
    description: "Upload 5 different documents",
    icon: GraduationCap,
    color: "from-indigo-400 to-violet-500",
  },
];

/* ─────────────── Computation ─────────────── */

const ACHIEVEMENT_CHECKS: ((s: UserStats) => boolean)[] = [
  (s) => s.documentsUploaded >= 1,
  (s) => s.quizzesCompleted >= 10,
  (s) => s.learningStreak >= 7,
  (s) => s.studyMinutes >= 300,
  (s) => s.flashcardsReviewed >= 500,
  (s) => s.bestQuizScore >= 100,
  (s) => s.missionsCompleted >= 100,
  (s) => s.documentsUploaded >= 5,
];

export function computeAchievements(stats: UserStats): AchievementsData {
  const achievements = ACHIEVEMENT_TEMPLATES.map((tpl, i) => ({
    ...tpl,
    earned: ACHIEVEMENT_CHECKS[i]?.(stats) ?? false,
  }));

  return {
    achievements,
    unlocked: achievements.filter((a) => a.earned).length,
    total: achievements.length,
  };
}