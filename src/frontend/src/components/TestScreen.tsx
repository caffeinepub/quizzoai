import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, BookOpen, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Question, QuizConfig, TestState } from "../types";

interface Props {
  testState: TestState;
  onAnswerChange: (questionId: number, value: string) => void;
  onSubmit: () => void;
  onLogout?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTimerSeconds(config: QuizConfig): number {
  const perQ =
    config.marksType === "1mark"
      ? 60
      : config.marksType === "2mark"
        ? 120
        : 300;
  return config.numQuestions * perQ;
}

function QuestionItem({
  question,
  index,
  answer,
  onChange,
  submitted,
}: {
  question: Question;
  index: number;
  answer: string;
  onChange: (val: string) => void;
  submitted: boolean;
}) {
  const isCorrect =
    submitted &&
    answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  const isPartialMCQ = submitted && question.type === "1mark";

  return (
    <div
      id={`question-${question.id}`}
      className={`glass-card rounded-xl p-5 transition-colors ${
        submitted
          ? isPartialMCQ
            ? isCorrect
              ? "border-green-500/40"
              : "border-red-400/30"
            : ""
          : ""
      }`}
      data-ocid={`test.question.item.${index + 1}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 leading-relaxed mb-3">
            {question.question}
          </p>

          {question.type === "1mark" && question.options ? (
            <div className="space-y-2">
              {question.options.map((opt) => {
                const isSelected = answer === opt;
                const isCorrectOpt =
                  submitted && opt === question.correctAnswer;
                const isWrongSelected =
                  submitted && isSelected && opt !== question.correctAnswer;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      submitted
                        ? isCorrectOpt
                          ? "border-green-500/50 bg-green-500/10"
                          : isWrongSelected
                            ? "border-red-400/50 bg-red-500/10"
                            : "border-white/10"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-white/10 hover:border-primary/40 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => !submitted && onChange(opt)}
                      disabled={submitted}
                      className="text-primary accent-primary"
                      data-ocid={`test.question.radio.${index + 1}`}
                    />
                    <span
                      className={`text-sm ${
                        submitted
                          ? isCorrectOpt
                            ? "text-green-400 font-medium"
                            : isWrongSelected
                              ? "text-red-400"
                              : "text-white/70"
                          : isSelected
                            ? "text-primary font-medium"
                            : "text-white/80"
                      }`}
                    >
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <Textarea
              value={answer}
              onChange={(e) => !submitted && onChange(e.target.value)}
              disabled={submitted}
              placeholder={
                question.type === "2mark"
                  ? "Write your short answer here... (2–3 sentences)"
                  : "Write your detailed answer here... (5–8 sentences)"
              }
              className={`text-sm resize-none bg-white/5 border-white/15 text-white/90 placeholder:text-white/30 ${
                question.type === "5mark" ? "min-h-[120px]" : "min-h-[72px]"
              }`}
              data-ocid={`test.question.textarea.${index + 1}`}
            />
          )}

          {submitted && question.type === "1mark" && (
            <p
              className={`text-xs mt-2 font-medium ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {isCorrect
                ? "✓ Correct!"
                : `✗ Correct answer: ${question.correctAnswer}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TestScreen({
  testState,
  onAnswerChange,
  onSubmit,
  onLogout,
}: Props) {
  const { config, questions, answers, submitted } = testState;
  const totalSecs = getTimerSeconds(config);
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [submitError, setSubmitError] = useState("");
  const [currentQ, setCurrentQ] = useState(1);

  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onSubmitRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  function handleSubmit() {
    const answered = Object.values(answers).filter(
      (a) => a.trim().length > 0,
    ).length;
    if (answered === 0) {
      setSubmitError("Please answer at least one question before submitting.");
      return;
    }
    setSubmitError("");
    onSubmit();
  }

  function scrollToQuestion(qId: number) {
    setCurrentQ(qId);
    document
      .getElementById(`question-${qId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const answeredCount = Object.values(answers).filter(
    (a) => a.trim().length > 0,
  ).length;
  const isWarning = timeLeft < 300 && !submitted;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white">QuizzoAI</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <span className="text-white/50">{config.className}</span>
            <span className="text-white/30 mx-1">·</span>
            <span className="text-white/50">{config.board}</span>
            <span className="text-white/30 mx-1">·</span>
            <span className="font-medium text-white/80 truncate max-w-[200px]">
              {config.chapter}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-white/20 text-white/80 bg-white/5 hover:bg-white/15"
            data-ocid="nav.secondary_button"
          >
            Log Out
          </Button>
        </div>
      </header>

      <div className="glass-header border-b border-white/10 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div
            className={`flex items-center gap-2 font-mono font-bold text-lg ${
              isWarning ? "text-red-400" : "text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span data-ocid="test.timer.panel">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-sm text-white/50">
            <span className="font-semibold text-white">{answeredCount}</span>/
            {questions.length} answered
          </div>
          {!submitted && (
            <Button
              onClick={handleSubmit}
              className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30"
              data-ocid="test.submit.primary_button"
            >
              Submit Test
            </Button>
          )}
          {submitted && (
            <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
              ✓ Submitted
            </span>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {submitError && (
          <div
            className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4"
            data-ocid="test.error_state"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {submitError}
          </div>
        )}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                question={q}
                index={i}
                answer={answers[q.id] ?? ""}
                onChange={(val) => onAnswerChange(q.id, val)}
                submitted={submitted}
              />
            ))}
          </div>

          <aside className="w-44 flex-shrink-0 sticky top-32">
            <div
              className="glass-card rounded-xl p-4"
              data-ocid="test.navigation.panel"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-white/40 mb-3">
                Questions
              </p>
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {questions.map((q) => {
                  const isAnswered = (answers[q.id] ?? "").trim().length > 0;
                  const isCurrent = currentQ === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => scrollToQuestion(q.id)}
                      className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isAnswered
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                      data-ocid={`test.question.button.${q.id}`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
                  <span className="text-white/40">
                    Answered ({answeredCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                  <span className="text-white/40">
                    Pending ({questions.length - answeredCount})
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="glass-header border-t border-white/10 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-white/30">
            Developed by Khushal Vyas and Amman Manwani · Class 10 · Satguru
            International School, Ajmer
          </p>
        </div>
      </footer>
    </div>
  );
}
