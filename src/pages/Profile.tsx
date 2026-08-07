import { useRef, useState, useCallback } from "react";
import {
  User,
  Settings,
  Upload,
  BookOpen,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  Flame,
  Trophy,
  Medal,
  Lock,
  Sparkles,
  ArrowRight,
  Calendar,
  GraduationCap,
  Star,
  Award,
  Brain,
  BarChart3,
  TrendingUp,
  Camera,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loading from "../components/ui/Loading";
import Toast from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { useDemoMode } from "../context/DemoMode";
import { useProfile, validateAvatarFile } from "../hooks/useProfile";
import { useDocuments } from "../hooks/useDocuments";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useAnalytics } from "../hooks/useAnalytics";
import { computeAchievements } from "../hooks/useAchievements";
import type { Profile } from "../hooks/useProfile";

/* ─────────────── Types ─────────────── */

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface Achievement {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
}

interface Activity {
  action: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

/* ─── Demo mock data ─── */

const demoStats: Stat[] = [
  { label: "Documents Uploaded", value: 12, icon: Upload, color: "from-blue-400 to-indigo-500" },
  { label: "Flashcards Reviewed", value: 247, icon: BookOpen, color: "from-emerald-400 to-teal-500" },
  { label: "Quizzes Completed", value: 18, icon: Zap, color: "from-amber-400 to-yellow-500" },
  { label: "Missions Completed", value: 42, icon: Target, color: "from-violet-400 to-purple-500" },
  { label: "Study Hours", value: 36, icon: Clock, color: "from-cyan-400 to-blue-500" },
  { label: "Current Accuracy", value: "87%", icon: TrendingUp, color: "from-rose-400 to-pink-500" },
];

const demoAchievements: Achievement[] = [
  { name: "First Upload", description: "Upload your first document", icon: Upload, color: "from-blue-400 to-indigo-500", earned: true },
  { name: "Quiz Master", description: "Complete 10 quizzes", icon: Brain, color: "from-amber-400 to-yellow-500", earned: true },
  { name: "7 Day Streak", description: "Study for 7 days in a row", icon: Flame, color: "from-orange-400 to-rose-500", earned: true },
  { name: "Study Champion", description: "Complete 50 study sessions", icon: Trophy, color: "from-violet-400 to-purple-500", earned: false },
  { name: "Flashcard Fanatic", description: "Review 500 flashcards", icon: BookOpen, color: "from-emerald-400 to-teal-500", earned: false },
  { name: "Perfect Score", description: "Get 100% on any quiz", icon: Star, color: "from-yellow-400 to-orange-500", earned: false },
  { name: "Century Club", description: "Complete 100 missions", icon: Award, color: "from-pink-400 to-rose-500", earned: false },
  { name: "Knowledge Seeker", description: "Study across 5 different subjects", icon: GraduationCap, color: "from-indigo-400 to-violet-500", earned: false },
];

const demoActivity: Activity[] = [
  { action: "Uploaded JavaScript Notes", time: "2 hours ago", icon: Upload, color: "from-blue-400 to-indigo-500" },
  { action: "Completed AI Quiz", time: "Yesterday", icon: Brain, color: "from-amber-400 to-yellow-500" },
  { action: "Reviewed Flashcards", time: "Yesterday", icon: BookOpen, color: "from-emerald-400 to-teal-500" },
  { action: "Finished Daily Mission", time: "2 days ago", icon: Target, color: "from-violet-400 to-purple-500" },
];

const demoWeeklyGoal = {
  label: "Weekly Goal",
  completed: 4,
  total: 5,
  description: "study sessions completed",
};

/* ─────────────── Helpers ─────────────── */

function getInitials(fullName: string | null | undefined, email: string | null | undefined): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
    if (initials) return initials;
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch { return "—"; }
}

function formatStudyTime(minutes: number): string {
  if (minutes === 0) return "0 hrs";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h} hrs`;
  return `${m}m`;
}

function daysUntilNextMonday(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  if (day === 0) return 1; // next Monday = tomorrow
  return 8 - day; // days until next Monday
}

/* ─────────────── Sub-components ─────────────── */

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground/70">{label}</span>
        <span className="text-foreground/50">{value}/{max}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`${pct}% complete`}>
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-foreground/50">{pct}% of weekly goal</p>
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <Card className="flex items-center gap-4 transition-all duration-200 hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground/60">{stat.label}</p>
        <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
      </div>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon;
  return (
    <div className={`relative flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200 ${achievement.earned ? "border-primary/20 bg-card shadow-sm hover:shadow-md" : "border-border bg-card/50 opacity-60"}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${achievement.earned ? achievement.color : "from-muted to-muted"} text-white shadow-sm`}>
        {achievement.earned ? <Icon size={22} /> : <Lock size={18} className="text-foreground/30" />}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${achievement.earned ? "text-foreground" : "text-foreground/40"}`}>{achievement.name}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-foreground/50">{achievement.description}</p>
      </div>
      {achievement.earned && (
        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20">
          <CheckCircle2 size={12} className="text-emerald-500" />
        </span>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = activity.icon;
  return (
    <div className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${activity.color} text-white shadow-sm`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{activity.action}</p>
        <p className="mt-0.5 text-xs text-foreground/40">{activity.time}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-foreground/20" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <Card>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="h-20 w-20 shrink-0 rounded-2xl skeleton" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="mx-auto h-6 w-40 skeleton sm:mx-0" />
          <div className="mx-auto h-4 w-56 skeleton sm:mx-0" />
          <div className="mx-auto h-4 w-36 skeleton sm:mx-0" />
        </div>
      </div>
    </Card>
  );
}

/* ─────────────── Edit Form ─────────────── */

interface EditFormProps {
  profile: Profile;
  email: string;
  onSave: (fields: { full_name: string; username: string; bio: string }, avatarFile: File | null) => Promise<{ error: string | null }>;
  onCancel: () => void;
  isSaving: boolean;
}

function EditForm({ profile, email, onSave, onCancel, isSaving }: EditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ full_name?: string; username?: string; avatar?: string }>({});
  const existingAvatar = profile.avatar_url;

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const err = validateAvatarFile(file);
    if (err) { setErrors((prev) => ({ ...prev, avatar: err })); return; }
    setErrors((prev) => ({ ...prev, avatar: undefined }));
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleRemovePhoto = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAvatarFile(null);
    setErrors((prev) => ({ ...prev, avatar: undefined }));
  }, [previewUrl]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors: typeof errors = {};
    if (!fullName.trim()) fieldErrors.full_name = "Full name is required.";
    if (username.trim() && (username.trim().length < 3 || username.trim().length > 30)) fieldErrors.username = "Must be 3–30 characters.";
    if (username.trim() && !/^[a-zA-Z0-9_.-]+$/.test(username.trim())) fieldErrors.username = "Letters, numbers, periods, underscores, hyphens only.";
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setErrors({});
    const fileToPass = previewUrl ? avatarFile : existingAvatar ? null : undefined;
    const result = await onSave({ full_name: fullName, username, bio }, fileToPass as File | null);
    if (result.error) setErrors({ username: result.error });
  }, [fullName, username, bio, avatarFile, previewUrl, existingAvatar, onSave]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-md">
            {previewUrl ? <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" /> : existingAvatar ? <img src={existingAvatar} alt="Current avatar" className="h-full w-full object-cover" /> : getInitials(profile.full_name, email)}
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer" aria-label="Change profile photo"><Camera size={14} /></button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="sr-only" tabIndex={-1} aria-hidden="true" />
        </div>
        <div className="flex flex-wrap gap-2 self-center sm:self-end">
          {(previewUrl || existingAvatar) && <button type="button" onClick={handleRemovePhoto} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 cursor-pointer"><X size={13} /> Remove photo</button>}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 cursor-pointer"><Upload size={13} /> Upload photo</button>
        </div>
      </div>
      {errors.avatar && <p className="mb-3 text-center text-xs text-destructive" role="alert">{errors.avatar}</p>}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-full-name" className="text-sm font-medium text-foreground">Full Name</label>
          <input id="edit-full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSaving} className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed ${errors.full_name ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border focus:border-ring"}`} placeholder="Your full name" aria-invalid={errors.full_name ? "true" : undefined} aria-describedby={errors.full_name ? "edit-full-name-error" : undefined} />
          {errors.full_name && <p id="edit-full-name-error" className="text-xs text-destructive" role="alert">{errors.full_name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-username" className="text-sm font-medium text-foreground">Username</label>
          <input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed ${errors.username ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border focus:border-ring"}`} placeholder="your-username" aria-invalid={errors.username ? "true" : undefined} aria-describedby={errors.username ? "edit-username-error" : undefined} />
          {errors.username && <p id="edit-username-error" className="text-xs text-destructive" role="alert">{errors.username}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-bio" className="text-sm font-medium text-foreground">Bio <span className="text-foreground/40">(optional)</span></label>
          <textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} disabled={isSaving} rows={3} className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-200 focus:outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none" placeholder="Tell us a little about yourself..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input value={email} disabled className="w-full cursor-not-allowed rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground/60" readOnly tabIndex={-1} />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button type="submit" variant="primary" size="md" isLoading={isSaving}><Save size={16} /> Save Changes</Button>
      </div>
    </form>
  );
}

/* ─────────────── Main Page ─────────────── */

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { isDemo, showRestricted } = useDemoMode();
  const { profile, isLoading: profileLoading, loadError, isSaving, saveProfile } = useProfile(user);
  const { documents } = useDocuments(isDemo ? null : user);
  const { stats } = useDashboardStats(isDemo ? null : user, documents.length);
  const { recentActivity } = useAnalytics(isDemo ? null : user);
  const { achievements, unlocked: achievementsUnlocked, total: achievementsTotal } = computeAchievements(stats);

  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleEdit = useCallback(() => {
    if (isDemo && !user) { showRestricted("profile editing"); return; }
    setIsEditing(true);
  }, [isDemo, user, showRestricted]);

  const handleCancel = useCallback(() => { setIsEditing(false); }, []);
  const handleSave = useCallback(async (fields: { full_name: string; username: string; bio: string }, avatarFile: File | null): Promise<{ error: string | null }> => {
    const result = await saveProfile(fields, avatarFile);
    if (result.error) { setToast({ type: "error", message: result.error }); } else { setIsEditing(false); setToast({ type: "success", message: "Your profile has been saved successfully." }); }
    return result;
  }, [saveProfile]);

  /* ── Derived display values ── */
  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Synapse AI User";
  const displayEmail = user?.email ?? "—";
  const displayUsername = profile?.username ?? null;
  const displayAvatar = profile?.avatar_url ?? null;
  const displayBio = profile?.bio ?? null;
  const memberSince = formatDate(profile?.created_at);
  const initials = getInitials(profile?.full_name, user?.email);

  /* ── Live stats ── */
  const liveStats: Stat[] = [
    { label: "Documents Uploaded", value: stats.documentsUploaded, icon: Upload, color: "from-blue-400 to-indigo-500" },
    { label: "Flashcards Reviewed", value: stats.flashcardsReviewed, icon: BookOpen, color: "from-emerald-400 to-teal-500" },
    { label: "Quizzes Completed", value: stats.quizzesCompleted, icon: Zap, color: "from-amber-400 to-yellow-500" },
    { label: "Missions Completed", value: stats.missionsCompleted, icon: Target, color: "from-violet-400 to-purple-500" },
    { label: "Study Hours", value: formatStudyTime(stats.studyMinutes), icon: Clock, color: "from-cyan-400 to-blue-500" },
    { label: "Current Accuracy", value: `${stats.learningAccuracy}%`, icon: TrendingUp, color: "from-rose-400 to-pink-500" },
  ];

  /* ── Activity feed ── */
  const activityColorMap: Record<string, string> = {
    quiz: "from-amber-400 to-yellow-500",
    flashcards: "from-emerald-400 to-teal-500",
    session: "from-cyan-400 to-blue-500",
    summary: "from-indigo-400 to-violet-500",
    upload: "from-blue-400 to-indigo-500",
    mission: "from-violet-400 to-purple-500",
    default: "from-muted to-muted",
  };
  const activityIconMap: Record<string, React.ElementType> = {
    quiz: Brain, flashcards: BookOpen, session: Clock, summary: BookOpen, upload: Upload, mission: Target, default: ArrowRight,
  };

  const liveActivity: Activity[] = recentActivity.slice(0, 8).map((a) => ({
    action: a.label,
    time: a.time,
    icon: activityIconMap[a.icon] ?? activityIconMap.default,
    color: activityColorMap[a.icon] ?? activityColorMap.default,
  }));

  /* ── Weekly goal ── */
  const weeklyGoal = {
    label: "Weekly Goal",
    completed: stats.weeklyGoalProgress,
    total: stats.weeklyGoalTarget,
    description: "study sessions completed",
  };
  const goalStatus = stats.weeklyGoalProgress === 0 ? "Not started" : stats.weeklyGoalProgress >= stats.weeklyGoalTarget ? "Complete!" : "On track";
  const goalStatusColor = stats.weeklyGoalProgress === 0 ? "text-foreground/50 bg-muted" : "text-emerald-600 bg-emerald-400/10";

  if (authLoading) {
    return (<PageContainer><Loading size="md" text="Loading your profile..." /></PageContainer>);
  }

  /* ── Not signed in (demo) ── */
  if (!user) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Profile</h1>
          <p className="mt-2 text-base text-foreground/60">Your learning journey, all in one place.</p>
        </div>

        <Card className="mb-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-md">JD</div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <h2 className="font-heading text-xl font-bold text-foreground">Jordan Davis</h2>
                <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-orange-400/10 to-rose-400/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 sm:mt-0"><Flame size={13} /> 7-day streak</span>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground/60"><User size={13} className="shrink-0" /> jordan.davis@example.com</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/40"><Calendar size={12} className="shrink-0" /> Member since December 2024</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><GraduationCap size={13} /> Student</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600"><Medal size={13} /> Active Learner</span>
              </div>
            </div>
            <div className="hidden shrink-0 sm:block"><Button variant="outline" size="sm" onClick={handleEdit}><Settings size={14} /> Edit</Button></div>
          </div>
        </Card>

        <section className="mb-8" aria-labelledby="stats-heading">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-sm"><BarChart3 size={18} /></div>
            <div><h2 id="stats-heading" className="font-heading text-lg font-semibold text-foreground">Learning Statistics</h2><p className="mt-0.5 text-xs text-foreground/40">Your overall performance snapshot</p></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{demoStats.map((s) => <StatCard key={s.label} stat={s} />)}</div>
        </section>

        <section className="mb-8" aria-labelledby="goals-heading">
          <Card className="transition-all duration-200 hover:shadow-md">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md"><Target size={22} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="goals-heading" className="font-heading text-lg font-semibold text-foreground">{demoWeeklyGoal.label}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600"><Sparkles size={12} /> On track</span>
                </div>
                <div className="mt-4"><ProgressBar value={demoWeeklyGoal.completed} max={demoWeeklyGoal.total} label={demoWeeklyGoal.description} /></div>
                <div className="mt-4 flex items-center gap-4 text-xs text-foreground/50">
                  <span className="flex items-center gap-1.5"><Clock size={13} /> Resets in 3 days</span>
                  <span className="flex items-center gap-1.5"><Star size={13} className="text-amber-500" /> 120 XP reward</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-8" aria-labelledby="achievements-heading">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm"><Trophy size={18} /></div>
              <div><h2 id="achievements-heading" className="font-heading text-lg font-semibold text-foreground">Achievements</h2><p className="mt-0.5 text-xs text-foreground/40">3 of 8 unlocked</p></div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">38% complete</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{demoAchievements.map((a) => <AchievementCard key={a.name} achievement={a} />)}</div>
        </section>

        <section aria-labelledby="activity-heading">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-sm"><Clock size={18} /></div>
            <div><h2 id="activity-heading" className="font-heading text-lg font-semibold text-foreground">Recent Activity</h2><p className="mt-0.5 text-xs text-foreground/40">Your latest learning actions</p></div>
          </div>
          <Card><div className="divide-y divide-border">{demoActivity.map((a) => <ActivityItem key={`${a.action}-${a.time}`} activity={a} />)}</div></Card>
        </section>

        <div className="mt-8 sm:hidden"><Button variant="outline" size="md" className="w-full" onClick={handleEdit}><Settings size={16} /> Edit Profile</Button></div>
      </PageContainer>
    );
  }

  /* ── Authenticated view ── */
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Profile</h1>
        <p className="mt-2 text-base text-foreground/60">Your learning journey, all in one place.</p>
      </div>

      {profileLoading ? <ProfileSkeleton /> : loadError ? (
        <Card className="mb-8"><div className="flex items-center gap-3 text-destructive"><AlertCircle size={18} /><p className="text-sm font-medium">{loadError}</p></div></Card>
      ) : (
        <Card className="mb-8">
          {isEditing ? (
            <EditForm profile={profile!} email={displayEmail} onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />
          ) : (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-md">
                {displayAvatar ? <img src={displayAvatar} alt={`${displayName}'s avatar`} className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h2 className="font-heading text-xl font-bold text-foreground">{displayName}</h2>
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-orange-400/10 to-rose-400/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 sm:mt-0"><Flame size={13} /> Active</span>
                </div>
                {displayUsername && <p className="mt-0.5 text-xs font-medium text-primary">@{displayUsername}</p>}
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground/60"><User size={13} className="shrink-0" /> {displayEmail}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/40"><Calendar size={12} className="shrink-0" /> Member since {memberSince}</p>
                {displayBio && <p className="mt-2 text-sm leading-relaxed text-foreground/60">{displayBio}</p>}
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><GraduationCap size={13} /> Learner</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600"><Medal size={13} /> Active Learner</span>
                </div>
              </div>
              <div className="hidden shrink-0 sm:block"><Button variant="outline" size="sm" onClick={handleEdit}><Settings size={14} /> Edit</Button></div>
            </div>
          )}
        </Card>
      )}

      {/* ── Learning Statistics (live) ── */}
      <section className="mb-8" aria-labelledby="stats-heading">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-sm"><BarChart3 size={18} /></div>
          <div><h2 id="stats-heading" className="font-heading text-lg font-semibold text-foreground">Learning Statistics</h2><p className="mt-0.5 text-xs text-foreground/40">Your overall performance snapshot</p></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{liveStats.map((s) => <StatCard key={s.label} stat={s} />)}</div>
      </section>

      {/* ── Weekly Goal (live) ── */}
      <section className="mb-8" aria-labelledby="goals-heading">
        <Card className="transition-all duration-200 hover:shadow-md">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md"><Target size={22} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="goals-heading" className="font-heading text-lg font-semibold text-foreground">{weeklyGoal.label}</h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${goalStatusColor}`}><Sparkles size={12} /> {goalStatus}</span>
              </div>
              <div className="mt-4"><ProgressBar value={weeklyGoal.completed} max={weeklyGoal.total} label={weeklyGoal.description} /></div>
              <div className="mt-4 flex items-center gap-4 text-xs text-foreground/50">
                <span className="flex items-center gap-1.5"><Clock size={13} /> Resets in {daysUntilNextMonday()} day{daysUntilNextMonday() === 1 ? "" : "s"}</span>
                <span className="flex items-center gap-1.5"><Star size={13} className="text-amber-500" /> {weeklyGoal.total * 20} XP reward</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Achievements (live) ── */}
      <section className="mb-8" aria-labelledby="achievements-heading">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm"><Trophy size={18} /></div>
            <div><h2 id="achievements-heading" className="font-heading text-lg font-semibold text-foreground">Achievements</h2><p className="mt-0.5 text-xs text-foreground/40">{achievementsUnlocked} of {achievementsTotal} unlocked</p></div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{Math.round((achievementsUnlocked / achievementsTotal) * 100)}% complete</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{achievements.map((a) => <AchievementCard key={a.name} achievement={a} />)}</div>
      </section>

      {/* ── Recent Activity (live) ── */}
      <section aria-labelledby="activity-heading">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-sm"><Clock size={18} /></div>
          <div><h2 id="activity-heading" className="font-heading text-lg font-semibold text-foreground">Recent Activity</h2><p className="mt-0.5 text-xs text-foreground/40">Your latest learning actions</p></div>
        </div>
        <Card>
          <div className="divide-y divide-border">
            {liveActivity.length === 0 ? (
              <div className="py-8 text-center"><p className="text-sm text-foreground/40">No activity yet — start learning to see your activity here</p></div>
            ) : (
              liveActivity.map((a, i) => <ActivityItem key={`${a.action}-${i}`} activity={a} />)
            )}
          </div>
        </Card>
      </section>

      <div className="mt-8 sm:hidden"><Button variant="outline" size="md" className="w-full" onClick={handleEdit}><Settings size={16} /> Edit Profile</Button></div>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </PageContainer>
  );
}