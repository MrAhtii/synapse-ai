import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Upload,
  GraduationCap,
  Target,
  Brain,
  Clock,
  Flame,
  BarChart3,
  ArrowLeft,
  Zap,
  Trophy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useAnalytics } from "../hooks/useAnalytics";
import type { DayData, ActivityItem } from "../hooks/useAnalytics";

/* ─────────────── Icons map ─────────────── */

const ICON_MAP: Record<string, React.ElementType> = {
  quiz: Zap,
  flashcards: GraduationCap,
  session: Clock,
  summary: BookOpen,
  upload: Upload,
  mission: CheckCircle2,
  default: CheckCircle2,
};

/* ─────────────── Sub-components ─────────────── */

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground/60">{label}</p>
        <p className="font-heading text-xl font-bold text-foreground">{value}</p>
      </div>
    </Card>
  );
}

function InsightsCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground/60">{label}</p>
        <p className="font-heading text-base font-bold text-foreground">{value}</p>
      </div>
    </Card>
  );
}

function WeeklyChart({ data, hasActivity }: { data: DayData[]; hasActivity: boolean }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  if (!hasActivity) {
    return (
      <div className="text-center py-6">
        <div className="flex items-end justify-between gap-2 opacity-20" role="img" aria-label="Weekly chart empty">
          {data.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-end justify-center" style={{ height: 80 }}>
                <div className="w-full max-w-[32px] rounded-t-md bg-primary/30" style={{ height: "2%" }} />
              </div>
              <span className="text-[11px] font-medium text-foreground/50">{d.day}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs italic text-foreground/40">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly learning activity bar chart">
      {data.map((d) => {
        const heightPct = (d.value / maxVal) * 100;
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-foreground/40">{d.value}</span>
            <div className="flex w-full items-end justify-center" style={{ height: 120 }}>
              <div
                className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all duration-300 ease-out hover:from-primary hover:to-secondary"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-foreground/50">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Clock size={18} className="text-foreground/30" />
        </div>
        <p className="text-sm text-foreground/40">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-px bg-border" aria-hidden="true" />
      <ul className="space-y-5">
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] ?? ICON_MAP.default;
          const colorMap: Record<string, string> = {
            quiz: "text-violet-500",
            flashcards: "text-amber-500",
            session: "text-sky-500",
            summary: "text-indigo-500",
            upload: "text-emerald-500",
            mission: "text-primary",
          };
          const iconColor = colorMap[item.icon] ?? "text-foreground/60";
          return (
            <li key={i} className="relative flex items-start gap-4">
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card ring-2 ring-border ${iconColor}`}>
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-foreground/50">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────── Format helpers ─────────────── */

function formatStudyTime(minutes: number): string {
  if (minutes === 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ─────────────── Page ─────────────── */

export default function Analytics() {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const { stats } = useDashboardStats(isDemo ? null : user, documents.length);
  const { weekly, hasWeeklyActivity, recentActivity} = useAnalytics(isDemo ? null : user);

  // Demo mock data
  const demoStats = [
    { label: "Study Sessions", value: 28, icon: BookOpen, color: "from-blue-400 to-indigo-500" },
    { label: "Documents Uploaded", value: 14, icon: Upload, color: "from-emerald-400 to-teal-500" },
    { label: "Flashcards Reviewed", value: 126, icon: GraduationCap, color: "from-amber-400 to-yellow-500" },
    { label: "Quiz Accuracy", value: "82%", icon: Target, color: "from-violet-400 to-purple-500" },
  ];
  const demoWeeklyData: DayData[] = [
    { day: "Mon", value: 40 }, { day: "Tue", value: 55 }, { day: "Wed", value: 30 },
    { day: "Thu", value: 70 }, { day: "Fri", value: 48 }, { day: "Sat", value: 22 }, { day: "Sun", value: 5 },
  ];
  const demoInsights = [
    { label: "Strongest Topic", value: "JavaScript Basics", icon: Trophy, color: "from-emerald-400 to-teal-500" },
    { label: "Weakest Topic", value: "CSS Grid & Flexbox", icon: AlertTriangle, color: "from-rose-400 to-red-500" },
    { label: "Total Study Time", value: "14h 32m", icon: Clock, color: "from-blue-400 to-indigo-500" },
    { label: "Current Learning Streak", value: "5 Days", icon: Flame, color: "from-orange-400 to-rose-500" },
  ];
  const demoActivity: ActivityItem[] = [
    { label: "Uploaded JavaScript Notes", icon: "upload", time: "2 hours ago" },
    { label: "Completed Flashcards", icon: "flashcards", time: "5 hours ago" },
    { label: "Finished Quiz", icon: "quiz", time: "Yesterday" },
    { label: "Completed Daily Mission", icon: "mission", time: "Yesterday" },
  ];

  // Live insights
  const liveInsights = [
    { label: "Strongest Topic", value: "No data yet", icon: Trophy, color: "from-emerald-400 to-teal-500" },
    { label: "Weakest Topic", value: "No data yet", icon: AlertTriangle, color: "from-rose-400 to-red-500" },
    { label: "Total Study Time", value: formatStudyTime(stats.studyMinutes), icon: Clock, color: "from-blue-400 to-indigo-500" },
    { label: "Current Learning Streak", value: `${stats.learningStreak} Day${stats.learningStreak === 1 ? "" : "s"}`, icon: Flame, color: "from-orange-400 to-rose-500" },
  ];

  // Live stat cards
  const liveStatsCards = [
    { label: "Study Sessions", value: stats.quizzesCompleted + stats.flashcardsReviewed > 0 ? stats.quizzesCompleted + Math.floor(stats.flashcardsReviewed / 10) : 0, icon: BookOpen, color: "from-blue-400 to-indigo-500" },
    { label: "Documents Uploaded", value: stats.documentsUploaded, icon: Upload, color: "from-emerald-400 to-teal-500" },
    { label: "Flashcards Reviewed", value: stats.flashcardsReviewed, icon: GraduationCap, color: "from-amber-400 to-yellow-500" },
    { label: "Quiz Accuracy", value: `${stats.learningAccuracy}%`, icon: Target, color: "from-violet-400 to-purple-500" },
  ];

  const noLiveActivity = !isDemo && stats.quizzesCompleted === 0 && stats.flashcardsReviewed === 0 && stats.studyMinutes === 0 && !hasWeeklyActivity;

  // If authenticated with no activity, show empty state
  if (noLiveActivity) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Progress Analytics</h1>
          <p className="mt-2 text-base text-foreground/60">
            Track your learning progress and performance metrics.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            No learning analytics available yet
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mb-6">
            Analytics will begin tracking after AI-powered study sessions.
            Upload notes and start learning to see your progress here.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate(isDemo ? "/demo/upload" : "/upload")}>
            <Upload size={18} />
            Upload Notes
          </Button>
        </Card>

        <div className="flex justify-center pt-2 pb-4">
          <Button as="a" href={isDemo ? "/demo" : "/dashboard"} variant="outline" size="lg">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ── 1. Header ── */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Progress Analytics</h1>
        <p className="mt-2 text-base text-foreground/60">
          Track your learning progress and performance metrics.
        </p>
      </div>

      {/* ── 2. Stat Cards ── */}
      <section className="mb-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="mb-4 font-heading text-lg font-semibold text-foreground">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(isDemo ? demoStats : liveStatsCards).map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── 3. Weekly Learning Chart ── */}
      <section className="mb-8" aria-labelledby="weekly-heading">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm">
                <BarChart3 size={18} />
              </div>
              <h2 id="weekly-heading" className="font-heading text-lg font-semibold text-foreground">
                Weekly Learning Activity
              </h2>
            </div>
            <span className="hidden text-xs text-foreground/40 sm:inline">
              Last 7 days
            </span>
          </div>
          <WeeklyChart data={isDemo ? demoWeeklyData : weekly} hasActivity={isDemo || hasWeeklyActivity} />
        </Card>
      </section>

      {/* ── 4. Learning Insights ── */}
      <section className="mb-8" aria-labelledby="insights-heading">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
            <Brain size={18} />
          </div>
          <h2 id="insights-heading" className="font-heading text-lg font-semibold text-foreground">
            Learning Insights
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(isDemo ? demoInsights : liveInsights).map((card) => (
            <InsightsCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* ── 5. Recent Activity ── */}
      <section className="mb-8" aria-labelledby="activity-heading">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
            <Clock size={18} />
          </div>
          <h2 id="activity-heading" className="font-heading text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
        </div>
        <Card>
          <ActivityTimeline items={isDemo ? demoActivity : recentActivity}/>
        </Card>
      </section>

      {/* ── 6. Back to Dashboard ── */}
      <div className="flex justify-center pt-2 pb-4">
        <Button as="a" href={isDemo ? "/demo" : "/dashboard"} variant="outline" size="lg">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Button>
      </div>
    </PageContainer>
  );
  }