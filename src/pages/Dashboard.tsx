import {
  Target,
  BookOpen,
  CheckCircle2,
  Upload,
  Sparkles,
  Flame,
  Brain,
  BarChart3,
  Trophy,
  Layers,
  ArrowRight,
  Timer,
  Star,
  Quote,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDailyMission, MISSION_TASKS } from "../hooks/useDailyMission";
import { useAnalytics } from "../hooks/useAnalytics";
import type { DayData } from "../hooks/useAnalytics";

/* ─────────────── Types ─────────────── */

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  emptyCta?: string;
}

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  description: string;
}

/* ─── Demo mock stats ─── */

const demoStats: Stat[] = [
  { label: "Study Streak", value: "3 days", icon: Flame, color: "from-orange-400 to-rose-500" },
  { label: "Documents Uploaded", value: 12, icon: Layers, color: "from-blue-400 to-indigo-500" },
  { label: "Quizzes Completed", value: 8, icon: Trophy, color: "from-amber-400 to-yellow-500" },
  { label: "Flashcards Reviewed", value: 47, icon: BookOpen, color: "from-emerald-400 to-teal-500" },
];

const quickActions: QuickAction[] = [
  { label: "Upload New Notes", icon: Upload, href: "/upload", description: "Import study materials for AI processing" },
  { label: "Continue Learning", icon: Brain, href: "/missions", description: "Resume your daily learning mission" },
  { label: "View Analytics", icon: BarChart3, href: "/analytics", description: "Track your progress and insights" },
];

/* ─────────────── Sub-components ─────────────── */

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground/70">Progress</span>
        <span className="text-foreground/50">
          {value}/{max}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${pct}% complete`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const isEmpty = stat.emptyCta && (typeof stat.value === "number" ? stat.value === 0 : false);
  return (
    <Card className={`flex items-center gap-4 transition-all duration-200 hover:shadow-md ${isEmpty ? "border-dashed border-border/60" : ""}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground/60">{stat.label}</p>
        {isEmpty ? (
          <p className="mt-0.5 text-sm italic leading-tight text-foreground/40">
            {stat.emptyCta}
          </p>
        ) : (
          <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
        )}
      </div>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="flex items-center gap-4" aria-hidden="true">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-14 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}

function QuickActionCard({
  action,
  onAction,
}: {
  action: QuickAction;
  onAction?: () => void;
}) {
  const Icon = action.icon;

  if (onAction) {
    return (
      <button
        type="button"
        onClick={onAction}
        className="group block w-full text-left"
      >
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-out hover:shadow-md active:scale-[0.98] sm:p-6 cursor-pointer">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
            <Icon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-semibold text-foreground">{action.label}</p>
            <p className="mt-0.5 text-xs text-foreground/50">{action.description}</p>
          </div>
          <ArrowRight
            size={16}
            className="shrink-0 text-foreground/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </div>
      </button>
    );
  }

  return (
    <a href={action.href} className="group block">
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-out hover:shadow-md sm:p-6 cursor-pointer">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold text-foreground">{action.label}</p>
          <p className="mt-0.5 text-xs text-foreground/50">{action.description}</p>
        </div>
        <ArrowRight
          size={16}
          className="shrink-0 text-foreground/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </a>
  );
}

function WeeklyChart({
  data,
  hasActivity,
}: {
  data: DayData[];
  hasActivity: boolean;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const todayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

  if (!hasActivity) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-end justify-between gap-2 w-full opacity-30" role="img" aria-label="Weekly learning activity bar chart">
          {data.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-foreground/40">0</span>
              <div className="flex w-full items-end justify-center" style={{ height: 120 }}>
                <div className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-primary/60 to-primary" style={{ height: "2%" }} />
              </div>
              <span className="text-[11px] font-medium text-foreground/50">{d.day}</span>
            </div>
          ))}
        </div>
        <p className="text-xs italic text-foreground/40">No activity yet — complete a quiz or review flashcards</p>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly learning activity bar chart">
      {data.map((d) => {
        const heightPct = (d.value / maxVal) * 100;
        const isToday = d.day === todayShort;
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-foreground/40">{d.value}</span>
            <div className="flex w-full items-end justify-center" style={{ height: 120 }}>
              <div
                className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ease-out hover:from-primary hover:to-secondary ${
                  isToday
                    ? "bg-gradient-to-t from-secondary to-primary/80"
                    : "bg-gradient-to-t from-primary/60 to-primary"
                }`}
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              />
            </div>
            <span
              className={`text-[11px] font-medium ${
                isToday ? "text-primary" : "text-foreground/50"
              }`}
            >
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── Page ─────────────── */

export default function Dashboard() {
  const { isDemo, showRestricted } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const documentCount = isDemo ? 12 : documents.length;
  const { stats, isLoading: statsLoading } = useDashboardStats(isDemo ? null : user, documentCount);
  const { tasks: missionTasks, completedCount: mCompleted, totalCount: mTotal, xpEarned: mXp, xpTarget: mXpTotal} =
    useDailyMission(isDemo ? null : user);
  const { weekly, hasWeeklyActivity } = useAnalytics(isDemo ? null : user);

  // Live stats
  const liveStats: Stat[] = [
    {
      label: "Study Streak",
      value: stats.learningStreak > 0 ? `${stats.learningStreak} day${stats.learningStreak === 1 ? "" : "s"}` : 0,
      icon: Flame,
      color: "from-orange-400 to-rose-500",
      emptyCta: "Come back daily to start a streak",
    },
    {
      label: "Documents Uploaded",
      value: stats.documentsUploaded,
      icon: Layers,
      color: "from-blue-400 to-indigo-500",
      emptyCta: "Upload your first note",
    },
    {
      label: "Quizzes Completed",
      value: stats.quizzesCompleted,
      icon: Trophy,
      color: "from-amber-400 to-yellow-500",
      emptyCta: "Complete your first quiz",
    },
    {
      label: "Flashcards Reviewed",
      value: stats.flashcardsReviewed,
      icon: BookOpen,
      color: "from-emerald-400 to-teal-500",
      emptyCta: "Review your first flashcard",
    },
  ];

  const remainingXp = mXpTotal - mXp;
  const remainingTasks = mTotal - mCompleted;

  // Demo-aware quick actions
  const demoQuickActions: QuickAction[] = quickActions.map((a) => {
    if (a.label === "Upload New Notes" && isDemo) {
      return a;
    }
    return { ...a, href: isDemo ? `/demo${a.href}` : a.href };
  });

  const handleUploadAction = () => {
    showRestricted("Upload Notes");
  };

  // AI recommendation derived from real stats
  const getAiRecommendation = () => {
    if (stats.quizzesCompleted === 0 && stats.flashcardsReviewed === 0) {
      return "Upload notes and complete your first quiz to unlock personalized recommendations.";
    }
    if (stats.learningAccuracy < 70 && stats.quizzesCompleted > 0) {
      return "Review missed quiz topics to improve your accuracy score.";
    }
    if (stats.flashcardsReviewed < stats.quizzesCompleted * 3) {
      return "Spend a few minutes reviewing flashcards to reinforce your knowledge.";
    }
    if (stats.learningStreak < 3) {
      return "Keep your study streak alive — even 5 minutes a day builds momentum.";
    }
    return "Great momentum! Try a daily mission to challenge yourself further.";
  };

  return (
    <PageContainer>
      {/* ── 1. Welcome Section ── */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Welcome back <span className="inline-block" role="img" aria-label="wave">👋</span>
        </h1>
        <p className="mt-2 text-base text-foreground/60">
          Ready to continue your AI-powered learning journey?
        </p>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 sm:px-5">
          <Quote size={16} className="mt-0.5 shrink-0 text-primary/40" />
          <p className="text-sm italic leading-relaxed text-foreground/60">
            &ldquo;Small daily progress leads to big achievements.&rdquo;
          </p>
        </div>
      </div>

      {/* ── 2. Mission + 3. Quick Actions ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
              <Target size={18} />
            </div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Today&apos;s Learning Mission
            </h2>
          </div>

          <p className="mb-3 text-sm font-medium text-foreground/80">
            Quick Study Sprint
          </p>

          <ul className="space-y-2.5">
            {MISSION_TASKS.map((def) => {
              const done = missionTasks.find((t) => t.key === def.key)?.completed ?? false;
              return (
                <li key={def.key} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      done
                        ? "border-emerald-400 bg-emerald-400 text-white"
                        : "border-border text-transparent"
                    }`}
                  >
                    {done && <CheckCircle2 size={13} />}
                  </div>
                  <span
                    className={`text-sm transition-all duration-200 ${
                      done ? "text-foreground/40 line-through" : "text-foreground/80"
                    }`}
                  >
                    {def.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <ProgressBar value={mCompleted} max={mTotal} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-foreground/50">
              <span className="flex items-center gap-1.5">
                <Timer size={13} />
                {remainingTasks > 0 ? `${remainingTasks} task${remainingTasks === 1 ? "" : "s"} remaining` : "All done!"}
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={13} className="text-amber-500" />
                {remainingXp} XP reward
              </span>
            </div>

            <a
              href={isDemo ? "/demo/missions" : "/missions"}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] cursor-pointer"
            >
              Continue Learning
              <ArrowRight size={16} />
            </a>
          </div>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-3">
          {demoQuickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              action={action}
              onAction={
                isDemo && action.label === "Upload New Notes"
                  ? handleUploadAction
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* ── 4. Learning Stats ── */}
      <section className="mb-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="mb-4 font-heading text-lg font-semibold text-foreground">
          Learning Stats
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isDemo ? (
            demoStats.map((stat) => <StatCard key={stat.label} stat={stat} />)
          ) : statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            liveStats.map((stat) => <StatCard key={stat.label} stat={stat} />)
          )}
        </div>
      </section>

      {/* ── 5. AI Recommendation ── */}
      <section className="mb-8" aria-labelledby="ai-recommendation-heading">
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-xl" />

          <div className="relative flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
              <Brain size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="ai-recommendation-heading"
                  className="font-heading text-lg font-semibold text-foreground"
                >
                  AI Recommendation
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  <Sparkles size={12} />
                  Powered by AI
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {isDemo
                  ? "Based on your recent activity, reviewing JavaScript Promises today will improve your overall learning score."
                  : getAiRecommendation()}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── 6. Weekly Progress ── */}
      <section aria-labelledby="weekly-heading">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2
                  id="weekly-heading"
                  className="font-heading text-lg font-semibold text-foreground"
                >
                  Weekly Learning Activity
                </h2>
                <p className="mt-0.5 text-xs text-foreground/40">
                  Last 7 days
                </p>
              </div>
            </div>
            <a
              href={isDemo ? "/demo/analytics" : "/analytics"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-foreground/60 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary cursor-pointer"
            >
              View Detailed Analytics
              <ArrowRight size={14} />
            </a>
          </div>
          <WeeklyChart data={weekly} hasActivity={isDemo || hasWeeklyActivity} />
        </Card>
      </section>
    </PageContainer>
  );
}