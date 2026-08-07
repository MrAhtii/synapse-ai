import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, RotateCcw, CheckCircle2, XCircle, Award, Upload } from "lucide-react";
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

const questions: Question[] = [
  {
    id: 1,
    question: "What is the difference between == and === in JavaScript?",
    options: [
      "== compares values, === compares types",
      "== compares values with type coercion, === compares values and types without coercion",
      "They are interchangeable",
      "=== is only for numbers",
    ],
    correctIndex: 1,
    explanation:
      "== performs type coercion before comparing (e.g., 1 == '1' is true), while === compares both value and type without coercion (1 === '1' is false). Always prefer === to avoid unexpected results.",
  },
  {
    id: 2,
    question: "What does the .map() method return?",
    options: [
      "A new array with transformed elements",
      "The original array modified in place",
      "A boolean indicating success",
      "A single reduced value",
    ],
    correctIndex: 0,
    explanation:
      ".map() creates a new array populated with the results of calling a provided function on every element in the original array. It does not mutate the original array — it's pure.",
  },
  {
    id: 3,
    question: "How do you create a promise in JavaScript?",
    options: [
      "new Promise(function(resolve, reject) { ... })",
      "Promise.create(function(resolve, reject) { ... })",
      "new Promise(resolve, reject => { ... })",
      "Promise.new((resolve, reject) => { ... })",
    ],
    correctIndex: 0,
    explanation:
      "A Promise is created with the 'new' keyword and receives an executor function with two parameters: resolve and reject. The executor runs immediately when the Promise is constructed.",
  },
  {
    id: 4,
    question: "Which of the following is NOT a valid JavaScript data type?",
    options: [
      "Symbol",
      "BigInt",
      "Integer",
      "Undefined",
    ],
    correctIndex: 2,
    explanation:
      'JavaScript has dynamic typing with types such as Number, String, Boolean, Object, Symbol, BigInt, Undefined, and Null. "Integer" is not a separate type — all numbers are either Number or BigInt.',
  },
  {
    id: 5,
    question: "What does the 'this' keyword refer to inside a regular function in the browser?",
    options: [
      "The function itself",
      "The global object (window)",
      "The parent object",
      "undefined",
    ],
    correctIndex: 1,
    explanation:
      "In a regular function (not an arrow function) called in the global execution context, 'this' refers to the global object — which in browsers is the window object. Arrow functions inherit 'this' from the enclosing scope instead.",
  },
];

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function Quiz({ onBack }: QuizProps) {
  const navigate = useNavigate();
  const { isDemo } = useDemoMode();
  const { user } = useAuth();
  const { documents } = useDocuments(isDemo ? null : user);
  const hasDocs = documents.length > 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checkedSet, setCheckedSet] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);

  // If authenticated with no documents, show empty state
  if (!isDemo && !hasDocs) {
    return (
      <PageContainer>
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            AI Quiz
          </h1>
          <p className="mt-2 text-foreground/60 text-base sm:text-lg max-w-2xl">
            AI-generated quizzes to test your knowledge — coming soon.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Brain size={28} />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            AI Quiz generation is coming soon
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mb-6">
            Your uploaded notes will automatically generate personalized quizzes
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

  const question = questions[currentIndex];
  const total = questions.length;
  const hasPrev = currentIndex > 0;
  const isLast = currentIndex === total - 1;
  const selectedAnswer = answers[question.id] ?? null;
  const isChecked = checkedSet.has(question.id);
  const checkedCount = checkedSet.size;

  const score = questions.reduce(
    (sum, q) => (checkedSet.has(q.id) && answers[q.id] === q.correctIndex ? sum + 1 : sum),
    0
  );

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (isChecked) return;
      setAnswers((prev) => ({
        ...prev,
        [question.id]: optionIndex,
      }));
    },
    [isChecked, question.id]
  );

  const checkAnswer = useCallback(() => {
    if (selectedAnswer === null) return;
    setCheckedSet((prev) => {
      const next = new Set(prev);
      next.add(question.id);
      return next;
    });
  }, [selectedAnswer, question.id]);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  const submitQuiz = useCallback(async () => {
    setShowResults(true);
    if (!isDemo) {
      const percentage = Math.round((score / questions.length) * 100);
      await recordQuizCompleted(percentage);
      // Fire-and-forget notification
      if (user) {
        createNotification(user.id, "Quiz completed", {
          body: `You scored ${percentage}% on the JavaScript quiz.`,
          icon: "Brain",
          link: "/quiz",
        });
      }
    }
  }, [isDemo, score, user]);

  const retake = useCallback(() => {
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
          <p className="text-2xl font-semibold text-primary mt-1">{percentage}%</p>
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
                    Q{idx + 1}: {q.question.length > 50 ? q.question.slice(0, 50) + "…" : q.question}
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
  const isCorrect = isChecked && selectedAnswer === question.correctIndex;

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

            let optionBorder = "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02]";
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
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
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
          <Button
            variant="primary"
            size="md"
            onClick={goNext}
          >
            Next Question
          </Button>
        )}

        {isChecked && isLast && (
          <Button
            variant="primary"
            size="md"
            onClick={submitQuiz}
          >
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