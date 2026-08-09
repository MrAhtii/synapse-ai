import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Flame,
  Clock,
  Zap,
  CheckCircle2,
  Circle,
  BookOpen,
  Brain,
  ListChecks,
  Star,
  Sparkles,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import {
  useDailyMission,
  MISSION_TASKS,
  MISSION_BONUS_XP,
} from "../hooks/useDailyMission";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDocuments } from "../hooks/useDocuments";

/* ------------------------------------------------------------------ */
/*  Motivational messages per completion bracket                      */
/* ------------------------------------------------------------------ */

function getMotivation(completed: number, total: number): string {
  const ratio = total > 0 ? completed / total : 0;
  if (ratio === 0) return "Ready to start your learning journey today?";
  if (ratio <= 0.25)
    return "Great start! Every bit of learning counts — keep it up!";
  if (ratio <= 0.5) return "You're halfway there! Consistency builds mastery.";
  if (ratio < 1) return "Almost done! Finish strong and crush today's mission!";
  return "Mission complete! Fantastic work today — you're on fire!";
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface MissionsProps {
  onBack?: () => void;
}

export default function Missions({ onBack }: MissionsProps) {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user, isLoading: authLoading } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const { stats } = useDashboardStats(isDemo ? null : user, documents.length);
  const {
    tasks,
    isLoading: missionLoading,
    toggleTask,
    completedCount,
    totalCount,
    xpEarned,
    xpTarget,
    allDone,
  } = useDailyMission(isDemo ? null : user);

  const isLoading = authLoading || missionLoading;

  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = useCallback(
    (key: string) => {
      if (isDemo || !user || isLoading) return;
      const task = tasks.find((t) => t.key === key);
      if (!task) return;
      
      // Invert the completed flag explicitly
      toggleTask(key, !task.completed);
    },
    [tasks, toggleTask, isDemo, user, isLoading],
  );

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate(isDemo ? "/demo/workspace" : "/workspace");
  }, [onBack, navigate, isDemo]);

  return (
    <PageContainer maxWidth="lg">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Today&apos;s Mission
        </h1>
        <p className="mt-1 text-foreground/60 text-base sm:text-lg">
          {completedCount > 0
            ? `${completedCount} of ${totalCount} tasks completed`
            : "Complete today's tasks to earn XP and build your streak"}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Progress */}
        <Card className="flex items-center gap-3 !p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
              Progress
            </p>
            <p className="text-lg font-bold text-foreground">
              {isLoading ? "—" : `${progress}%`}
            </p>
          </div>
        </Card>

        {/* Streak */}
        <Card className="flex items-center gap-3 !p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
              Streak
            </p>
            <p className="text-lg font-bold text-foreground">
              {isDemo ? 7 : stats.learningStreak} day
              {isDemo ? "" : stats.learningStreak === 1 ? "" : "s"}
            </p>
          </div>
        </Card>

        {/* Estimated time */}
        <Card className="flex items-center gap-3 !p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
              Est. Time
            </p>
            <p className="text-lg font-bold text-foreground">20–30 min</p>
          </div>
        </Card>

        {/* XP to earn */}
        <Card className="flex items-center gap-3 !p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
              XP to Earn
            </p>
            <p className="text-lg font-bold text-foreground">
              {xpTarget + (allDone ? 0 : MISSION_BONUS_XP)} XP
            </p>
          </div>
        </Card>
      </div>

      {/* ── Task List ── */}
      <div className="mb-8 space-y-3">
        <h2 className="font-heading text-lg font-bold text-foreground mb-1">
          Today&apos;s Tasks
        </h2>

        {MISSION_TASKS.map((def) => {
          const task = tasks.find((t) => t.key === def.key);
          const isCompleted = task?.completed ?? false;

          return (
            <button
              key={def.key}
              type="button"
              onClick={() => handleToggle(def.key)}
              disabled={isDemo || isLoading}
              className={`w-full flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 cursor-pointer ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-border bg-card hover:border-primary/30 hover:bg-primary/[0.02]"
              } ${isDemo || isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-foreground/40"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </span>

              <span
                className={`flex items-center gap-2.5 flex-1 text-base font-medium ${
                  isCompleted
                    ? "text-emerald-800 line-through decoration-emerald-400/50"
                    : "text-foreground"
                }`}
              >
                <span
                  className={
                    isCompleted ? "text-emerald-500" : "text-foreground/50"
                  }
                >
                  {def.key === "summary" ? (
                    <BookOpen size={18} />
                  ) : def.key === "flashcards" ? (
                    <Brain size={18} />
                  ) : def.key === "quiz" ? (
                    <ListChecks size={18} />
                  ) : (
                    <Star size={18} />
                  )}
                </span>
                {def.label}
              </span>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-foreground/50"
                }`}
              >
                +{def.xp} XP
              </span>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-card text-foreground/50 border-border"
                }`}
              >
                {isCompleted ? "Completed" : "Pending"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Progress footer ── */}
      <Card className="!p-6 sm:!p-8 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground/60">
            Daily Progress
          </span>
          <span className="text-sm font-bold text-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <span className="text-sm font-semibold text-foreground/70">
            Total XP Earned:{" "}
            <span className="text-foreground font-bold">
              {xpEarned + (allDone ? MISSION_BONUS_XP : 0)}
            </span>
            <span className="text-foreground/40">
              {" "}
              / {xpTarget + MISSION_BONUS_XP}
            </span>
            {allDone && (
              <span className="text-emerald-600 ml-1">
                +{MISSION_BONUS_XP} bonus
              </span>
            )}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent/5 border border-accent/15 px-4 py-3">
          <Sparkles size={18} className="shrink-0 mt-0.5 text-accent" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            {getMotivation(completedCount, totalCount)}
          </p>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="ghost" size="md" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back to Learning Workspace
        </Button>
      </div>
    </PageContainer>
  );
}