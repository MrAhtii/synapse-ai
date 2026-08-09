import { useNavigate } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Tags,
  ListChecks,
  Layers,
  Brain,
  Crosshair,
  ArrowLeft,
  Upload,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";

interface SmartSummaryProps {
  onBack?: () => void;
}

export default function SmartSummary({ onBack }: SmartSummaryProps) {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const latestDocument = documents[0];
  const summary = latestDocument?.summary;
  const hasSummaries = documents.some((d) => d.summary_generated);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(isDemo ? "/demo/workspace" : "/workspace");
    }
  };

  // If authenticated with no summaries, show empty state
  if (!isDemo && !hasSummaries) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Smart Summary
          </h1>
          <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
            AI-powered summaries of your uploaded notes — coming soon.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            AI Summary generation is coming soon
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mb-6">
            Your uploaded notes will automatically generate intelligent
            summaries once AI processing is enabled.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(isDemo ? "/demo/upload" : "/upload")}
          >
            <Upload size={18} />
            Upload Notes
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Smart Summary
        </h1>
        <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
          Your uploaded notes have been transformed into an easy-to-understand
          summary.
        </p>
      </div>

      {/* Document Metadata Bar */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 p-4 sm:p-5 bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Document
            </p>
            <p className="text-sm font-semibold text-foreground">
              {latestDocument?.title ?? "No document"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Summary Card */}
      <Card className="mb-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              AI-Generated Summary
            </h2>
            <p className="text-xs text-foreground/40">
              Auto-generated from your uploaded notes
            </p>
          </div>
        </div>

        <div className="space-y-5 text-foreground/80 leading-relaxed text-sm sm:text-base">
          <p>{summary ?? "No summary available."}</p>
        </div>
      </Card>

      {/* Key Topics */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Tags size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-foreground">
            Key Topics
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(latestDocument?.key_topics ?? []).map((topic: string) => (
            <span
              key={topic}
              className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 border border-primary/20 transition-all duration-200 hover:bg-primary/20 hover:border-primary/30 cursor-default"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Important Points Checklist */}
      <Card className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <ListChecks size={20} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Important Points
            </h2>
            <p className="text-xs text-foreground/40">
              key learning points to remember
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {(latestDocument?.important_points ?? []).map(
            (point: string, i: number) => (
              <li key={i} className="flex items-start gap-3 group">
                <span className="flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-md border-2 border-primary/30 bg-card transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/5">
                  <span className="text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                </span>
                <span className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                  {point}
                </span>
              </li>
            )
          )}
        </ul>
      </Card>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Quick Actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() =>
              navigate(isDemo ? "/demo/flashcards" : "/flashcards")
            }
          >
            <Layers size={16} />
            Review Flashcards
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(isDemo ? "/demo/quiz" : "/quiz")}
          >
            <Brain size={16} />
            Start Quiz
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(isDemo ? "/demo/missions" : "/missions")}
          >
            <Crosshair size={16} />
            View Daily Mission
          </Button>
          <Button variant="ghost" size="md" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Learning Workspace
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}