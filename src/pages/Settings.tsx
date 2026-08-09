import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  BellRing,
  Clock,
  Target,
  Trophy,
  BarChart3,
  User,
  Mail,
  Calendar,
  Shield,
  Download,
  Trash2,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Brain,
  AlertTriangle,
  Rocket,
  Code2,
  GraduationCap,
  Sparkles,
  FileText,
  Globe,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import type { ThemeMode } from "../context/ThemeContext";

/* ─────────────── Types ─────────────── */

type QuizDifficulty = "easy" | "medium" | "hard";
type StudyGoal = 30 | 60 | 90 | 120;

interface NotificationPrefs {
  studyReminders: boolean;
  dailyMissions: boolean;
  weeklyReport: boolean;
  achievements: boolean;
}

/* ─────────────── Toggle ─────────────── */

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30
        active:scale-[0.96]
        ${checked ? "bg-primary" : "bg-border"}
      `}
    >
      <span
        className={`
          inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm
          transition-all duration-200 ease-out
          ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}
        `}
        style={{ height: "18px", width: "18px" }}
      />
    </button>
  );
}

/* ─────────────── Sections ─────────────── */

function AppearanceSection() {
  const { mode, setMode } = useTheme();

  const options: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Light Mode", icon: Sun },
    { value: "dark", label: "Dark Mode", icon: Moon },
    { value: "system", label: "System Default", icon: Monitor },
  ];

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
          <Sun size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Appearance</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            Choose how Synapse AI looks for you
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = mode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`
                relative flex items-center gap-3 rounded-xl border-2 p-4 text-left
                transition-all duration-200 ease-out cursor-pointer
                active:scale-[0.98]
                ${
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm"
                }
              `}
              aria-pressed={selected}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
                  selected
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-foreground/40"
                }`}
              >
                <Icon size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    selected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </p>
              </div>
              {selected && (
                <CheckCircle2 size={16} className="absolute right-3 top-3 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    studyReminders: true,
    dailyMissions: true,
    weeklyReport: false,
    achievements: true,
  });

  const set = (key: keyof NotificationPrefs) => (val: boolean) =>
    setPrefs((prev) => ({ ...prev, [key]: val }));

  const items: {
    key: keyof NotificationPrefs;
    label: string;
    desc: string;
    icon: React.ElementType;
  }[] = [
    { key: "studyReminders", label: "Study Reminders", desc: "Get nudges to keep your study streak alive", icon: Bell },
    { key: "dailyMissions", label: "Daily Mission Notifications", desc: "Be notified when new daily missions drop", icon: Target },
    { key: "weeklyReport", label: "Weekly Progress Report", desc: "Receive a weekly summary of your learning stats", icon: BarChart3 },
    { key: "achievements", label: "Achievement Notifications", desc: "Celebrate when you unlock a new badge", icon: Trophy },
  ];

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-sm">
          <BellRing size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Notifications</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            Control which notifications you receive
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/40">
                <Icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
              <div className="shrink-0">
                <Toggle
                  id={`notif-${item.key}`}
                  checked={prefs[item.key]}
                  onChange={set(item.key)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function LearningPreferencesSection() {
  const [goal, setGoal] = useState<StudyGoal>(30);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");

  const goalOptions: StudyGoal[] = [30, 60, 90, 120];

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-sm">
          <Brain size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Learning Preferences</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            Customise your learning experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Daily Study Goal */}
        <div className="flex flex-col gap-2">
          <label htmlFor="study-goal" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock size={15} className="text-foreground/50" />
            Daily Study Goal
          </label>
          <div className="relative">
            <select
              id="study-goal"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value) as StudyGoal)}
              className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground transition-all duration-200 ease-out focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/20 cursor-pointer"
            >
              {goalOptions.map((g) => (
                <option key={g} value={g}>
                  {g} minutes per day
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quiz Difficulty */}
        <div className="flex flex-col gap-2">
          <label htmlFor="quiz-difficulty" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BarChart3 size={15} className="text-foreground/50" />
            Quiz Difficulty
          </label>
          <div className="relative">
            <select
              id="quiz-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
              className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground transition-all duration-200 ease-out focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/20 cursor-pointer"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Summary chip */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Clock size={13} />
          {goal} min daily
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Brain size={13} />
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty
        </span>
      </div>
    </Card>
  );
}

function AccountSection({ user, profile }: { user: import("@supabase/supabase-js").User | null; profile: import("../hooks/useProfile").Profile | null }) {
  const [isDemo] = useState(() => window.location.pathname.includes("/demo"));

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Synapse AI User";
  const displayEmail = user?.email ?? "—";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Account</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            Your account details and information
          </p>
        </div>
      </div>

      <div className="mb-5 space-y-3.5">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <User size={16} className="shrink-0 text-foreground/40" />
          <span className="min-w-[5rem] text-xs font-medium text-foreground/50">Name</span>
          <span className="text-sm font-medium text-foreground">{displayName}</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <Mail size={16} className="shrink-0 text-foreground/40" />
          <span className="min-w-[5rem] text-xs font-medium text-foreground/50">Email</span>
          <span className="text-sm font-medium text-foreground">{displayEmail}</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <Calendar size={16} className="shrink-0 text-foreground/40" />
          <span className="min-w-[5rem] text-xs font-medium text-foreground/50">Member Since</span>
          <span className="text-sm font-medium text-foreground">{memberSince}</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <Shield size={16} className="shrink-0 text-foreground/40" />
          <span className="min-w-[5rem] text-xs font-medium text-foreground/50">Account Type</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Free Plan
          </span>
        </div>
      </div>

      <Button
        as="a"
        href={isDemo ? "/demo/profile" : "/profile"}
        variant="outline"
      >
        <ExternalLink size={16} />
        View Profile
      </Button>
    </Card>
  );
}

function DataManagementSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = useCallback(() => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }, []);

  const handleClear = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmClear = useCallback(() => {
    setShowConfirm(false);
  }, []);

  return (
    <Card className="relative transition-all duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm">
          <Trash2 size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Data Management</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            Export or clear your learning data
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exported}
          className="flex-1"
        >
          {exported ? (
            <>
              <CheckCircle2 size={16} />
              Exported
            </>
          ) : (
            <>
              <Download size={16} />
              Export Learning Data
            </>
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={handleClear}
          className="flex-1"
        >
          <Trash2 size={16} />
          Clear Demo Data
        </Button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2">
            <Card className="p-6 shadow-xl">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 size={22} className="text-destructive" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Clear all data?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                  This will remove all demo content, study notes, and progress. This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmClear}
                  className="flex-1"
                >
                  <Trash2 size={16} />
                  Clear Data
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </Card>
  );
}

function DangerZoneSection() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Card className="relative border-2 border-destructive/20 transition-all duration-200 hover:shadow-md hover:border-destructive/40">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Danger Zone</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            Irreversible account actions
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Delete Account Permanently</p>
            <p className="mt-0.5 text-xs text-foreground/50">
              Remove your account and all associated data forever.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2">
            <Card className="p-6 shadow-xl">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle size={22} className="text-destructive" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Delete account?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                  Permanent account deletion is currently under development.
                  In the final version this action will permanently remove your account,
                  uploaded notes, AI data, quizzes, flashcards, analytics and all associated
                  information.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled
                  className="flex-1 cursor-not-allowed opacity-60"
                >
                  <Rocket size={16} />
                  Coming Soon
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </Card>
  );
}

function UpcomingFeaturesSection() {
  const features = [
    { label: "AI Summary Generation", icon: Brain, status: "Live" },
    { label: "AI Flashcards", icon: GraduationCap, status: "Live" },
    { label: "AI Quiz Generator", icon: Sparkles, status: "Live" },
    { label: "Intelligent Study Recommendations", icon: Target, status: "Coming Soon" },
    { label: "Smart Learning Insights", icon: BarChart3, status: "Coming Soon" },
    { label: "Personalized Revision Planner", icon: Clock, status: "Coming Soon" },
    { label: "OCR Improvements", icon: FileText, status: "Coming Soon" },
    { label: "Multi-language Support", icon: Globe, status: "Coming Soon" },
  ];

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
          <Rocket size={20} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Upcoming Features</h2>
          <p className="mt-0.5 text-xs text-foreground/50">
            What&apos;s coming next to Synapse AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isLive = feature.status === "Live";
          return (
            <div
              key={feature.label}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/40">
                <Icon size={16} />
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground/80">
                {feature.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isLive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-foreground/50"
                }`}
              >
                {feature.status}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function VersionSection() {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white shadow-md">
            S
          </div>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              Synapse AI
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                v1.0
              </span>
            </h2>
            <p className="mt-0.5 text-sm text-foreground/60">
              Hackathon Edition
            </p>
            <p className="text-xs text-foreground/40">
              &copy; {new Date().getFullYear()} Synapse AI
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-foreground/60">
            <Code2 size={12} />
            React
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-foreground/60">
            <Code2 size={12} />
            TypeScript
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-foreground/60">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            Supabase
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary border border-primary/20">
            <Brain size={12} />
            AI Ready
          </span>
        </div>
      </div>
    </Card>
  );
}

function LogoutSection() {
  const navigate = useNavigate();
  const [isDemo] = useState(() => window.location.pathname.includes("/demo"));

  const handleLogout = () => {
    navigate(isDemo ? "/" : "/login");
  };

  return (
    <div className="text-center">
      <Button
        variant="destructive"
        onClick={handleLogout}
        size="lg"
        className="w-full sm:w-auto"
      >
        <LogOut size={18} />
        {isDemo ? "Exit Demo" : "Sign Out"}
      </Button>
      <p className="mt-2.5 text-xs text-foreground/40">
        {isDemo
          ? "Exit demo mode and return to the landing page."
          : "Sign out of your Synapse AI account."}
      </p>
    </div>
  );
}

/* ─────────────── Page ─────────────── */

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  return (
    <PageContainer>
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-base text-foreground/60">
          Manage your preferences, account, and data.
        </p>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-6">
        <AppearanceSection />
        <NotificationsSection />
        <LearningPreferencesSection />
        <AccountSection user={user} profile={profile} />
        <DataManagementSection />
        <DangerZoneSection />
        <UpcomingFeaturesSection />
        <VersionSection />
        <LogoutSection />
      </div>
    </PageContainer>
  );
}