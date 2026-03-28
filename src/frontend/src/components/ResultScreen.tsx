import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Question, TestState } from "../types";
import {
  type Achievement,
  buildStats,
  checkNewAchievements,
} from "../utils/achievements";
import { getNextRank, getRank, getRankProgress } from "../utils/ranks";
import { addXP, loadHistory, loadXP } from "../utils/storage";
import { type StreakData, updateStreaks } from "../utils/streaks";

interface Props {
  testState: TestState;
  onTryAgain: () => void;
  onLogout?: () => void;
  onFeedback?: () => void;
}

function scoreQuestions(
  questions: Question[],
  answers: Record<number, string>,
): number {
  let correct = 0;
  for (const q of questions) {
    const ans = (answers[q.id] ?? "").trim().toLowerCase();
    if (q.type === "1mark") {
      if (ans === q.correctAnswer.trim().toLowerCase()) correct++;
    } else {
      if (ans.length > 10) correct++;
    }
  }
  return correct;
}

function isGuestUser(): boolean {
  try {
    const raw = localStorage.getItem("quizzo_user");
    if (!raw) return true;
    const user = JSON.parse(raw);
    return user?.provider === "guest";
  } catch {
    return true;
  }
}

const STUDY_BUDDY_URL = "https://study-buddy-AIr--rockyy123321.replit.app";

function redirectToStudyBuddy() {
  try {
    // Try to navigate the top-level window first (works when inside iframe)
    if (window.top && window.top !== window) {
      window.top.location.href = STUDY_BUDDY_URL;
      return;
    }
  } catch {
    // Cross-origin iframe — fall through
  }
  // Open in new tab as reliable fallback
  window.open(STUDY_BUDDY_URL, "_blank", "noopener,noreferrer");
}

const RARITY_STYLES: Record<Achievement["rarity"], string> = {
  common: "border-white/20 bg-white/5 text-white/70",
  rare: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  epic: "border-purple-400/40 bg-purple-500/10 text-purple-300",
  legendary: "border-yellow-400/50 bg-yellow-500/10 text-yellow-300",
};

export function ResultScreen({
  testState,
  onTryAgain,
  onLogout,
  onFeedback,
}: Props) {
  const { questions, answers } = testState;
  const score = scoreQuestions(questions, answers);
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isGood = percentage >= 70;
  const [showAnswers, setShowAnswers] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const hasRedirected = useRef(false);
  const xpAdded = useRef(false);
  const postTestDone = useRef(false);

  const guest = isGuestUser();
  const [currentXP, setCurrentXP] = useState(() => loadXP());
  const [streaks, setStreaks] = useState<StreakData>({
    dailyStreak: 0,
    lessonStreak: 0,
  });
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Award XP + update streaks + check achievements once
  useEffect(() => {
    if (guest || postTestDone.current) return;
    postTestDone.current = true;

    if (!xpAdded.current) {
      xpAdded.current = true;
      const newXP = addXP(percentage);
      setCurrentXP(newXP);

      const chapter = testState.config.chapter;
      const updatedStreaks = updateStreaks(chapter);
      setStreaks(updatedStreaks);

      const history = loadHistory();
      const stats = buildStats(history, newXP, updatedStreaks);
      const newOnes = checkNewAchievements(stats);
      setNewAchievements(newOnes);
    }
  }, [guest, percentage, testState.config.chapter]);

  useEffect(() => {
    if (isGood) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1 && !hasRedirected.current) {
          hasRedirected.current = true;
          redirectToStudyBuddy();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGood]);

  const rank = !guest ? getRank(currentXP) : null;
  const nextRank = !guest ? getNextRank(currentXP) : null;
  const progress = !guest ? getRankProgress(currentXP) : 0;

  const badge =
    percentage >= 90
      ? {
          label: "Excellent!",
          colorClass:
            "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        }
      : percentage >= 70
        ? {
            label: "Good Performance!",
            colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
          }
        : {
            label: "Needs Improvement",
            colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/30",
          };

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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div
          className="glass-card rounded-xl p-8 text-center space-y-5 animate-fade-in"
          data-ocid="result.panel"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-extrabold border-4 ${
                isGood
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-orange-500/30 bg-orange-500/10 text-orange-400"
              }`}
            >
              {percentage}%
            </div>
            <span
              className={`inline-block px-4 py-1.5 rounded-full border text-sm font-bold ${badge.colorClass}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-xs text-white/40 mt-0.5">Total</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">{score}</p>
              <p className="text-xs text-white/40 mt-0.5">Correct</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{total - score}</p>
              <p className="text-xs text-white/40 mt-0.5">Incorrect</p>
            </div>
          </div>

          {/* XP & Rank section for signed-in users */}
          {!guest && rank && (
            <div
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${rank.bgColor} ${rank.borderColor}`}
              data-ocid="result.rank.panel"
            >
              <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                XP Earned
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-yellow-300">
                  +{percentage}
                </span>
                <span className="text-sm text-white/60">XP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{rank.emoji}</span>
                <span className={`text-base font-bold ${rank.color}`}>
                  {rank.name}
                </span>
                <span className="text-xs text-white/40">
                  {currentXP.toLocaleString()} XP total
                </span>
              </div>
              <div className="w-full max-w-xs space-y-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rank.name === "Grand Master"
                        ? "bg-gradient-to-r from-yellow-400 to-rose-400"
                        : rank.color.replace("text-", "bg-")
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {nextRank ? (
                  <p className="text-[10px] text-white/30 text-center">
                    {nextRank.emoji} Next: {nextRank.name} at{" "}
                    {nextRank.minXP.toLocaleString()} XP
                  </p>
                ) : (
                  <p className="text-[10px] text-yellow-300/60 text-center">
                    🌟 Max rank achieved!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Streak mini card */}
          {!guest && (streaks.dailyStreak > 0 || streaks.lessonStreak > 0) && (
            <div
              className="flex items-center justify-center gap-4 px-5 py-3 rounded-xl border border-orange-400/30 bg-orange-500/8"
              data-ocid="result.streak.panel"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🔥</span>
                <div className="text-left">
                  <p className="text-xs text-white/40 uppercase tracking-wide">
                    Daily Streak
                  </p>
                  <p className="text-sm font-bold text-orange-300">
                    {streaks.dailyStreak} day
                    {streaks.dailyStreak !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📖</span>
                <div className="text-left">
                  <p className="text-xs text-white/40 uppercase tracking-wide">
                    Lesson Streak
                  </p>
                  <p className="text-sm font-bold text-cyan-300">
                    {streaks.lessonStreak} chapter
                    {streaks.lessonStreak !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New achievements */}
          {!guest && newAchievements.length > 0 && (
            <div
              className="space-y-2 rounded-xl border border-yellow-400/40 bg-yellow-500/8 p-4"
              data-ocid="result.achievements.panel"
            >
              <p className="text-sm font-bold text-yellow-300 text-center">
                🏆 Achievement{newAchievements.length > 1 ? "s" : ""} Unlocked!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {newAchievements.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${RARITY_STYLES[a.rarity]}`}
                  >
                    <span className="text-base">{a.emoji}</span>
                    <div className="text-left">
                      <p className="font-bold">{a.name}</p>
                      {a.nameHindi && (
                        <p className="text-[10px] opacity-70">{a.nameHindi}</p>
                      )}
                      <p className="opacity-60 text-[10px] max-w-[160px]">
                        {a.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isGood ? (
            <p className="text-sm text-green-400 font-medium">
              ✔️ Great work! Keep pushing your limits.
            </p>
          ) : (
            <div className="space-y-2" data-ocid="result.redirect.panel">
              <p className="text-sm text-orange-400 font-medium">
                ❌ You need more practice.
              </p>
              <p className="text-xs text-white/40">
                Redirecting to Study Buddy in{" "}
                <span className="font-bold text-white">{countdown}</span> second
                {countdown !== 1 ? "s" : ""}...
              </p>
              <button
                type="button"
                onClick={() => {
                  hasRedirected.current = true;
                  redirectToStudyBuddy();
                }}
                className="text-xs text-blue-400 underline hover:text-blue-300"
              >
                Go now →
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAnswers((s) => !s)}
              className="border-white/20 text-white/80 bg-white/5 hover:bg-white/10"
              data-ocid="result.answers.toggle"
            >
              {showAnswers ? "Hide" : "Show"} Correct Answers
            </Button>
            {onFeedback && (
              <Button
                variant="outline"
                onClick={onFeedback}
                className="border-white/20 text-white/70 bg-white/5 hover:bg-white/15 hover:text-white"
                data-ocid="result.feedback.button"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Feedback
              </Button>
            )}
            <Button
              onClick={onTryAgain}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
              data-ocid="result.retry.primary_button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>

        {showAnswers && (
          <div className="space-y-3 animate-slide-up">
            <h3 className="text-base font-semibold text-white">Answer Key</h3>
            {questions.map((q, i) => {
              const userAns = (answers[q.id] ?? "").trim();
              const isCorrect =
                q.type === "1mark"
                  ? userAns.toLowerCase() ===
                    q.correctAnswer.trim().toLowerCase()
                  : userAns.length > 10;
              return (
                <div
                  key={q.id}
                  className={`glass-card rounded-xl p-4 ${
                    isCorrect ? "border-green-500/30" : "border-red-400/20"
                  }`}
                  data-ocid={`result.answer.item.${i + 1}`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-medium text-white/90">
                        {i + 1}. {q.question}
                      </p>
                      {userAns ? (
                        <p className="text-xs text-white/50">
                          <span className="font-semibold">Your answer:</span>{" "}
                          {userAns}
                        </p>
                      ) : (
                        <p className="text-xs text-red-400 italic">
                          Not answered
                        </p>
                      )}
                      {!isCorrect && (
                        <p className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                          <span className="font-semibold">Correct:</span>{" "}
                          {q.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="glass-header border-t border-white/10 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-1">
          <p className="text-xs text-white/30">
            Developed by{" "}
            <span className="font-semibold text-white/60">Khushal Vyas</span>{" "}
            and{" "}
            <span className="font-semibold text-white/60">Amman Manwani</span> ·
            Class 10 Students · Satguru International School, Ajmer
          </p>
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
