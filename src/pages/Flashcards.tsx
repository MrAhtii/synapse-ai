import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface FlashcardsProps {
  onBack?: () => void;
}
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Layers,
  Brain,
  Upload,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";
import { recordFlashcardsReviewed } from "../hooks/useDashboardStats";
import { createNotification } from "../lib/notifications";

interface FlashcardData {
  id: number;
  topic: string;
  question: string;
  answer: string;
}

const flashcards: FlashcardData[] = [
  {
    id: 1,
    topic: "JavaScript Variables",
    question: "What is the difference between var, let, and const?",
    answer:
      "var is function-scoped and can be redeclared. let is block-scoped and can be reassigned but not redeclared. const is block-scoped and cannot be reassigned or redeclared — it must be initialised at declaration.",
  },
  {
    id: 2,
    topic: "Closures",
    question: "What is a closure in JavaScript?",
    answer:
      "A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has finished executing. It 'closes over' those variables, preserving them for later use.",
  },
  {
    id: 3,
    topic: "Promises",
    question: "What is a Promise and what states can it be in?",
    answer:
      "A Promise is an object representing the eventual completion or failure of an asynchronous operation. It can be in one of three states: pending (initial state), fulfilled (operation completed successfully), or rejected (operation failed).",
  },
  {
    id: 4,
    topic: "Async/Await",
    question: "What does the async keyword do, and how does await work?",
    answer:
      "The async keyword declares a function that always returns a Promise. The await keyword pauses the execution of the async function until the awaited Promise settles, then resumes with the resolved value — making asynchronous code read like synchronous code.",
  },
  {
    id: 5,
    topic: "Event Loop",
    question: "How does the JavaScript event loop work?",
    answer:
      "The event loop continuously checks the call stack and the callback queue. If the call stack is empty, it takes the first callback from the queue and pushes it onto the stack for execution. This enables non-blocking I/O despite JavaScript being single-threaded.",
  },
  {
    id: 6,
    topic: "Hoisting",
    question: "What is hoisting in JavaScript?",
    answer:
      "Hoisting is JavaScript's default behaviour of moving declarations to the top of their containing scope during compilation. Function declarations are hoisted entirely, while var declarations are hoisted but not initialised — accessing them before declaration returns undefined. let and const are hoisted but not initialised, causing a Temporal Dead Zone.",
  },
];

export default function Flashcards({ onBack }: FlashcardsProps) {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const hasDocs = documents.length > 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [didRecord, setDidRecord] = useState(false);

  // If authenticated with no documents, show empty state
  if (!isDemo && !hasDocs) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            AI Flashcards
          </h1>
          <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
            AI-generated flashcards for active recall — coming soon.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Brain size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            AI Flashcard generation is coming soon
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mb-6">
            Your uploaded notes will automatically generate smart flashcards
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

  const card = flashcards[currentIndex];
  const total = flashcards.length;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  // Record flashcards reviewed once when user reaches the last card
  useEffect(() => {
    if (!isDemo && !didRecord && currentIndex === total - 1) {
      setDidRecord(true);
      recordFlashcardsReviewed(total);
      // Fire-and-forget notification
      if (user) {
        createNotification(user.id, "Flashcards reviewed", {
          body: `You reviewed all ${total} flashcards. Keep up the momentum!`,
          icon: "BookOpen",
          link: "/flashcards",
        });
      }
    }
  }, [isDemo, didRecord, currentIndex, total, user]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      setIsFlipped(false);
    },
    []
  );

  const goPrev = useCallback(() => {
    if (hasPrev) goTo(currentIndex - 1);
  }, [hasPrev, currentIndex, goTo]);

  const goNext = useCallback(() => {
    if (hasNext) goTo(currentIndex + 1);
  }, [hasNext, currentIndex, goTo]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          AI Flashcards
        </h1>
        <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
          Practice active recall using AI-generated flashcards.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground/60">
            {currentIndex + 1} of {total}
          </span>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 border border-primary/20">
          {card.topic}
        </span>
      </div>

      {/* Flashcard with 3D flip */}
      <div
        className="perspective-[1200px] mb-6"
        role="button"
        tabIndex={0}
        aria-label={
          isFlipped
            ? `Flashcard ${currentIndex + 1} of ${total}. Showing answer. Press Enter or Space to flip back.`
            : `Flashcard ${currentIndex + 1} of ${total}. Showing question. Press Enter or Space to reveal answer.`
        }
        onClick={toggleFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        <div
          className={`relative w-full min-h-[320px] sm:min-h-[360px] transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front — Question */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div className="flex flex-col items-center justify-center w-full min-h-[320px] sm:min-h-[360px] bg-card rounded-xl shadow-md border border-border p-8 sm:p-12">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-6 border border-primary/20">
                Question
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-foreground text-center leading-relaxed max-w-lg">
                {card.question}
              </p>
              <p className="mt-8 text-xs text-foreground/30 flex items-center gap-1.5">
                <RotateCcw size={12} />
                Click or press Space to reveal the answer
              </p>
            </div>
          </div>

          {/* Back — Answer */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex flex-col items-center justify-center w-full min-h-[320px] sm:min-h-[360px] bg-card rounded-xl shadow-md border border-border p-8 sm:p-12">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 mb-6 border border-emerald-200">
                Answer
              </span>
              <p className="text-base sm:text-lg text-foreground/85 text-center leading-relaxed max-w-xl">
                {card.answer}
              </p>
              <p className="mt-8 text-xs text-foreground/30 flex items-center gap-1.5">
                <RotateCcw size={12} />
                Click or press Space to flip back
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          size="md"
          disabled={!hasPrev}
          onClick={goPrev}
        >
          <ArrowLeft size={16} />
          Previous
        </Button>

        <Button
          variant="outline"
          size="md"
          disabled={!hasNext}
          onClick={goNext}
        >
          Next
          <ArrowRight size={16} />
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={() => (onBack ? onBack() : navigate(isDemo ? "/demo/workspace" : "/workspace"))}
        >
          <ArrowLeft size={16} />
          Back to Learning Workspace
        </Button>
      </div>
    </PageContainer>
  );
}