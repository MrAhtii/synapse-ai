import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  FileText,
  Clock,
  Sparkles,
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
import { createNotification } from "../lib/notifications";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";

const keyTopics = [
  "JavaScript",
  "Promises",
  "Closures",
  "Async Await",
  "Functions",
];

const importantPoints = [
  "JavaScript is a single-threaded, non-blocking, asynchronous language.",
  "Promises provide a cleaner alternative to callbacks for handling async operations.",
  "Closures allow inner functions to access variables from their outer scope.",
  "Async/Await is syntactic sugar over Promises, making async code read like sync code.",
  "Functions in JavaScript are first-class citizens and can be passed as arguments.",
];

const metaData = [
  { icon: FileText, label: "Document Name", value: "JavaScript Notes.pdf" },
  { icon: Clock, label: "Reading Time", value: "5 min" },
  { icon: Sparkles, label: "Generated", value: "Just Now" },
];

interface SmartSummaryProps {
  onBack?: () => void;
}

export default function SmartSummary({ onBack }: SmartSummaryProps) {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const hasSummaries = documents.some((d) => d.summary_generated);

  // Clean import of Crosshair for the view
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(isDemo ? "/demo/workspace" : "/workspace");
    }
  };

  // Notify once when a summary is viewed (not in demo mode)
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!isDemo && !notifiedRef.current && (hasSummaries || isDemo)) {
      notifiedRef.current = true;
      if (user && hasSummaries) {
        createNotification(user.id, "Summary generated", {
          icon: "Sparkles",
          link: "/summary",
        });
      }
    }
  }, [isDemo, user, hasSummaries]);

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
            Your uploaded notes will automatically generate intelligent summaries
            once AI processing is enabled.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate(isDemo ? "/demo/upload" : "/upload")}>
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
        {metaData.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <item.icon size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
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
          <p>
            JavaScript is a versatile, high-level programming language that is
            essential for modern web development. It enables dynamic behavior on
            websites, allowing developers to create interactive user interfaces,
            handle events, and communicate with servers. As a core technology of
            the web alongside HTML and CSS, JavaScript is supported by all
            modern browsers and has evolved significantly over the years.
          </p>

          {/* Key Concepts */}
          <div>
            <h3 className="font-heading text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Key Concepts
            </h3>
            <p>
              The language supports multiple programming paradigms, including
              event-driven, functional, and object-oriented styles. Its
              single-threaded event loop model handles asynchronous operations
              efficiently without blocking the main thread, making it ideal for
              tasks like fetching data from APIs, handling user input, and
              animating UI elements.
            </p>
          </div>

          {/* Important Definitions */}
          <div>
            <h3 className="font-heading text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
              Important Definitions
            </h3>
            <p>
              A <strong>Promise</strong> is an object representing the eventual
              completion or failure of an asynchronous operation. Promises can
              be in one of three states: pending, fulfilled, or rejected. A{" "}
              <strong>Closure</strong> is the combination of a function bundled
              together with references to its surrounding state, giving you
              access to an outer function's scope from an inner function.{" "}
              <strong>Async/Await</strong> is syntactic sugar built on top of
              Promises that allows you to write asynchronous code that looks
              and behaves like synchronous code, improving readability and
              maintainability.
            </p>
          </div>

          {/* Main Takeaways */}
          <div>
            <h3 className="font-heading text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              Main Takeaways
            </h3>
            <p>
              Understanding these core JavaScript concepts is crucial for
              writing efficient, maintainable code. Promises and Async/Await
              simplify asynchronous programming, while closures provide
              powerful data encapsulation and functional programming patterns.
              Mastering these fundamentals will significantly improve your
              ability to build complex web applications with confidence.
            </p>
          </div>
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
          {keyTopics.map((topic) => (
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
              5 key learning points to remember
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {importantPoints.map((point, i) => (
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
          ))}
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
            onClick={() => navigate(isDemo ? "/demo/flashcards" : "/flashcards")}
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
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
          >
            <ArrowLeft size={16} />
            Back to Learning Workspace
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}