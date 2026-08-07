import { useNavigate } from "react-router-dom";
import { FileText, Layers, Brain, Crosshair, TrendingUp, AlertTriangle, CheckCircle2, Upload as UploadIcon } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";
import { useDashboardStats } from "../hooks/useDashboardStats";

const progressSteps = [
  { label: "Summary", completed: true },
  { label: "Flashcards", completed: true },
  { label: "Quiz", completed: true },
  { label: "Mission", completed: true },
];

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  accent: string;
  onClick?: () => void;
}

function ProgressBar() {
  return (
    <div className="mb-8">
      <h2 className="font-heading text-sm font-semibold text-foreground/60 mb-3">
        Learning Journey Progress
      </h2>
      <div className="flex items-center gap-1 sm:gap-2">
        {progressSteps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 sm:gap-2 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-semibold whitespace-nowrap">
              <CheckCircle2 size={14} className="shrink-0" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.label.charAt(0)}</span>
            </div>
            {i < progressSteps.length - 1 && (
              <div className="flex-1 h-px bg-primary/20 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Workspace() {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const { stats } = useDashboardStats(isDemo ? null : user, documents.length);
  const hasDocs = documents.length > 0;
  const accuracy = stats.learningAccuracy || 0;

  // If authenticated with no documents, show empty state
  if (!isDemo && !hasDocs) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Your Learning Journey
          </h1>
          <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
            Everything generated from your uploaded notes is available here.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UploadIcon size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            AI processing has not been connected yet
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mb-6">
            Your uploaded documents will automatically generate learning resources
            in a future update. Start by uploading your notes below.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate("/upload")}>
            <UploadIcon size={18} />
            Upload Notes
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const featureCards: FeatureCard[] = [
    {
      icon: <FileText size={24} />,
      title: "Smart Summary",
      description: isDemo ? "Read a concise AI-generated summary of your notes." : "AI Summary generation is coming soon.",
      buttonLabel: "Open Summary",
      accent: "text-indigo-500 bg-indigo-50",
      onClick: () => navigate(isDemo ? "/demo/summary" : "/summary"),
    },
    {
      icon: <Layers size={24} />,
      title: "Flashcards",
      description: isDemo ? "Practice active recall with AI-generated flashcards." : "AI Flashcard generation is coming soon.",
      buttonLabel: "Start Flashcards",
      accent: "text-emerald-500 bg-emerald-50",
      onClick: () => navigate(isDemo ? "/demo/flashcards" : "/flashcards"),
    },
    {
      icon: <Brain size={24} />,
      title: "AI Quiz",
      description: isDemo ? "Test your understanding with personalized questions." : "AI Quiz generation is coming soon.",
      buttonLabel: "Take Quiz",
      accent: "text-violet-500 bg-violet-50",
      onClick: () => navigate(isDemo ? "/demo/quiz" : "/quiz"),
    },
    {
      icon: <Crosshair size={24} />,
      title: "Daily Mission",
      description: isDemo ? "Complete today's personalized learning tasks." : "Daily learning missions are coming soon.",
      buttonLabel: "View Mission",
      accent: "text-amber-500 bg-amber-50",
      onClick: () => navigate(isDemo ? "/demo/missions" : "/missions"),
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Your Learning Journey
        </h1>
        <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
          Everything generated from your uploaded notes is available here.
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressBar />

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {featureCards.map((card) => (
          <Card key={card.title} hover className="flex flex-col relative">
            {!isDemo && (
              <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20">
                Coming Soon
              </span>
            )}
            {isDemo && (
              <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
                Demo Data
              </span>
            )}
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accent}`}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-foreground/60 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
            <div className="mt-auto pt-5">
              <Button variant="primary" size="md" onClick={card.onClick}>
                {card.buttonLabel}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Row: Confidence Score + Weak Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Confidence Score */}
        <Card hover className="flex flex-col">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sky-500 bg-sky-50">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Confidence Score
            </h3>
          </div>
          <div className="mt-5 flex items-baseline gap-1">
            <span className="font-heading text-5xl font-bold text-primary">{accuracy}%</span>
            <span className="text-sm text-foreground/40 ml-1">estimated</span>
          </div>
          <p className="mt-1 text-sm text-foreground/60">
            Estimated understanding based on recent activity.
          </p>
          {/* Mini progress ring */}
          <div className="mt-5 w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </Card>

        {/* Weak Topics */}
        <Card hover className="flex flex-col">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-rose-500 bg-rose-50">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Weak Topics
            </h3>
          </div>
          <p className="mt-2 text-sm text-foreground/60">
            Topics that need more review. Focus on these next.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <span
              className="inline-flex items-center rounded-full bg-rose-50 text-rose-600 text-xs font-semibold px-3.5 py-1.5 border border-rose-100"
            >
              —
            </span>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}