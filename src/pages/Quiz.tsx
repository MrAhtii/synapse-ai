import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Upload,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useDemoMode } from "../context/DemoMode";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../hooks/useDocuments";
import { recordQuizCompleted } from "../hooks/useDashboardStats";
import { createNotification } from "../lib/notifications";

interface QuizProps {
  onBack?: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

// Default questions to use in Demo Mode when no uploaded document exists
const DEMO_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the primary function of JavaScript promises?",
    options: [
      "To handle asynchronous operations without blocking thread execution",
      "To optimize CSS animation performance",
      "To compile client-side code directly into machine code",
      "To manipulate DOM elements in synchronous loops"
    ],
    correctIndex: 0,
    explanation: "Promises represent a value that may be available now, in the future, or never, allowing structured async programming."
  },
  {
    id: 2,
    question: "Which keyword is used to declare block-scoped variables in modern JavaScript?",
    options: ["var", "let", "global", "define"],
    correctIndex: 1,
    explanation: "'let' and 'const' are block-scoped, while 'var' is function-scoped."
  },
  {
    id: 3,
    question: "What is the event loop's main role in JavaScript?",
    options: [
      "To manage memory allocation in the heap",
      "To monitor the call stack and message queue to execute async callbacks",
      "To compile JavaScript code into bytecode",
      "To handle HTTP requests directly"
    ],
    correctIndex: 1,
    explanation: "The event loop checks if the call stack is empty and pulls callback functions from the task queue."
  }
];

export default function Quiz({ onBack }: QuizProps) {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const hasDocs = documents.length > 0;
  const latestDocument = documents[0];

  // Extract document questions if available
  const docQuestions = latestDocument?.quiz?.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));

  // Fallback to DEMO_QUESTIONS if in demo mode and no document questions exist
  const questions: Question[] = isDemo
    ? (docQuestions && docQuestions.length > 0 ? docQuestions : DEMO_QUESTIONS)
    : (docQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checkedSet, setCheckedSet] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const hasRecordedResult = useRef(false);
  const question = questions[currentIndex];
  const total = questions.length;
  const hasPrev = currentIndex > 0;
  const isLast = currentIndex === total - 1;
  const selectedAnswer = question ? (answers[question.id] ?? null) : null;
  const isChecked = question ? checkedSet.has(question.id) : false;
  const checkedCount = checkedSet.size;

  const score = questions.reduce(
    (sum, q) =>
      checkedSet.has(q.id) && answers[q.id] === q.correctIndex ? sum + 1 : sum,
    0,
  );
const selectAnswer = useCallback(
  (optionIndex: number) => {
    if (!question || isChecked) return;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));
  },
  [isChecked, question],
);
 
const checkAnswer = useCallback(() => {
  if (!question || selectedAnswer === null) return;

  setCheckedSet((prev) => {
    const next = new Set(prev);
    next.add(question.id);
    return next;
  });
}, [selectedAnswer, question]);
  const goNext = useCallback(() => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);
const submitQuiz = useCallback(async () => {
  setShowResults(true);

  if (isDemo || hasRecordedResult.current) return;

  hasRecordedResult.current = true;

  const percentage = Math.round((score / questions.length) * 100);

  await recordQuizCompleted(percentage);

  if (user) {
    createNotification(user.id, "Quiz completed", {
      body: `You scored ${percentage}% on your AI-generated quiz.`,
      icon: "Brain",
      link: "/quiz",
    });
  }
}, [isDemo, score, questions.length, user]);

const retake = useCallback(() => {
  hasRecordedResult.current = false;

  setAnswers({});
  setCheckedSet(new Set());
  setCurrentIndex(0);
  setShowResults(false);
}, []);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate(isDemo ? "/demo/workspace" : "/workspace");
    }
  }, [onBack, navigate, isDemo]);

  // If authenticated with no documents, show empty state
  if (!isDemo && (!hasDocs || questions.length === 0)) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            AI Quiz
          </h1>
          <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
            AI-generated quizzes to test your knowledge.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Brain size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            No quiz available yet
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mb-6">
            A quiz could not be generated for this document yet. Try uploading
            your notes again.
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
  // ---- Results View ----
  if (showResults) {
    const correctCount = score;
    const percentage = Math.round((correctCount / total) * 100);

    let feedback: string;
    let feedbackIcon: React.ReactNode;
    if (percentage === 100) {
      feedback = "Excellent! Perfect score — you've mastered this material.";
      feedbackIcon = <Award size={32} className="text-amber-500" />;
    } else if (percentage >= 80) {
      feedback = "Excellent! You have a solid understanding.";
      feedbackIcon = <CheckCircle2 size={32} className="text-emerald-500" />;
    } else if (percentage >= 60) {
      feedback = "Good! A little more review and you'll ace it.";
      feedbackIcon = <CheckCircle2 size={32} className="text-sky-500" />;
    } else {
      feedback = "Needs Practice. Review the topics and try again.";
      feedbackIcon = <XCircle size={32} className="text-rose-500" />;
    }

    return (
      <PageContainer>
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            AI Quiz
          </h1>
          <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
            Test your understanding with personalized questions.
          </p>
        </div>

        {/* Results Card */}
        <div className="bg-card rounded-xl shadow-md border border-border p-8 sm:p-12 mb-8 text-center">
          {feedbackIcon}
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mt-4">
            {correctCount}/{total}
          </h2>
          <p className="text-2xl font-semibold text-primary mt-1">
            {percentage}%
          </p>
          <div className="mt-5 w-full bg-muted rounded-full h-2 max-w-xs mx-auto overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-6 text-base font-semibold text-foreground/80">
            {feedback}
          </p>

          {/* Review answers summary */}
          <div className="mt-8 space-y-2 text-left max-w-lg mx-auto">
            {questions.map((q, idx) => {
              const isCorrect = answers[q.id] === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${
                    isCorrect
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : (
                    <XCircle size={16} className="shrink-0" />
                  )}
                  <span>
                    Q{idx + 1}:{" "}
                    {q.question.length > 50
                      ? q.question.slice(0, 50) + "…"
                      : q.question}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={retake}>
            <RotateCcw size={16} />
            Retake Quiz
          </Button>
          <Button variant="ghost" size="md" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Learning Workspace
          </Button>
        </div>
      </PageContainer>
    );
  }

  // ---- Quiz View ----
const isCorrect =
  !!question && isChecked && selectedAnswer === question.correctIndex;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          AI Quiz
        </h1>
        <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
          Test your understanding with personalized questions.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground/60">
            Question {currentIndex + 1} of {total}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {checkedCount > 0 && (
            <span className="text-sm font-semibold text-primary">
              Score: {score}/{checkedCount}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 border ${
              checkedCount === total
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {checkedCount === total
              ? "All checked"
              : `${checkedCount} of ${total} checked`}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card rounded-xl shadow-md border border-border p-6 sm:p-10 mb-6">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-relaxed">
          {question.question}
        </h2>

        {/* Options */}
        <div className="mt-6 sm:mt-8 space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrectOption = idx === question.correctIndex;

            let optionBorder =
              "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02]";
            let optionBadge = "bg-muted text-foreground/50";
            let optionText = "text-foreground/75";

            if (isSelected && !isChecked) {
              optionBorder = "border-primary bg-primary/5 shadow-sm";
              optionBadge = "bg-primary text-on-primary";
              optionText = "text-foreground font-semibold";
            }

            if (isChecked) {
              if (isCorrectOption) {
                optionBorder = "border-emerald-400 bg-emerald-50/80 shadow-sm";
                optionBadge = "bg-emerald-500 text-white";
                optionText = "text-emerald-800 font-semibold";
              } else if (isSelected && !isCorrectOption) {
                optionBorder = "border-rose-400 bg-rose-50/80 shadow-sm";
                optionBadge = "bg-rose-500 text-white";
                optionText = "text-rose-800 font-semibold";
              } else {
                optionBorder = "border-border bg-card/60 opacity-60";
                optionBadge = "bg-muted text-foreground/40";
                optionText = "text-foreground/50";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => selectAnswer(idx)}
                disabled={isChecked}
                className={`w-full flex items-start gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                  isChecked ? "cursor-default" : "cursor-pointer"
                } ${optionBorder}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 ${optionBadge}`}
                >
                  {isChecked && isCorrectOption ? (
                    <CheckCircle2 size={16} />
                  ) : isChecked && isSelected && !isCorrectOption ? (
                    <XCircle size={16} />
                  ) : (
                    OPTION_LABELS[idx]
                  )}
                </span>
                <span
                  className={`pt-0.5 text-base leading-relaxed ${optionText}`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after checking) */}
        {isChecked && (
          <div
            className={`mt-5 rounded-xl border px-5 py-4 text-sm leading-relaxed ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle2
                  size={18}
                  className="shrink-0 mt-0.5 text-emerald-600"
                />
              ) : (
                <XCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              )}
              <span>{question.explanation}</span>
            </div>
          </div>
        )}
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

        {!isChecked && (
          <Button
            variant="primary"
            size="md"
            disabled={selectedAnswer === null}
            onClick={checkAnswer}
          >
            <CheckCircle2 size={16} />
            Check Answer
          </Button>
        )}

        {isChecked && !isLast && (
          <Button variant="primary" size="md" onClick={goNext}>
            Next Question
          </Button>
        )}

        {isChecked && isLast && (
          <Button variant="primary" size="md" onClick={submitQuiz}>
            <Award size={16} />
            See Results
          </Button>
        )}

        <Button variant="ghost" size="md" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back to Learning Workspace
        </Button>
      </div>
    </PageContainer>
  );
}
