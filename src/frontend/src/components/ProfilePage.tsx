import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  LogOut,
  MessageSquare,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import type { UserProfile } from "../types";
import {
  ACHIEVEMENTS,
  buildStats,
  checkNewAchievements,
} from "../utils/achievements";
import { RANKS, getNextRank, getRank, getRankProgress } from "../utils/ranks";
import { loadHistory, loadXP } from "../utils/storage";
import { loadStreaks } from "../utils/streaks";

interface Props {
  user?: UserProfile;
  onBack: () => void;
  onLogout?: () => void;
}

const PROVIDER_STYLES: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  google: {
    label: "Google",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  facebook: {
    label: "Facebook",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  guest: {
    label: "Guest",
    color: "text-white/60",
    bg: "bg-white/5",
    border: "border-white/20",
  },
};

const RARITY_STYLES: Record<string, string> = {
  common: "border-white/20 bg-white/5 text-white/70",
  rare: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  epic: "border-purple-400/40 bg-purple-500/10 text-purple-300",
  legendary: "border-yellow-400/50 bg-yellow-500/10 text-yellow-300",
};

function openFeedback() {
  const mailtoLink =
    "mailto:khushalvyas249@gmail.com?subject=QuizzoAI%20Feedback&body=Hi%20QuizzoAI%20Team%2C%0A%0AFeedback%3A%20%0A%0AYour%20Name%3A%20%0AClass%3A%20%0ABoard%3A%20";
  window.open(mailtoLink);
}

export function ProfilePage({ user, onBack, onLogout }: Props) {
  const history = useMemo(() => loadHistory(), []);
  const xp = useMemo(() => loadXP(), []);
  const streaks = useMemo(() => loadStreaks(), []);
  const rank = getRank(xp);
  const nextRank = getNextRank(xp);
  const rankProgress = getRankProgress(xp);

  const stats = useMemo(
    () => buildStats(history, xp, streaks),
    [history, xp, streaks],
  );
  const earnedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.condition(stats)),
    [stats],
  );

  const totalTests = history.length;
  const bestScore =
    totalTests > 0
      ? Math.max(...history.map((h) => Math.round((h.score / h.total) * 100)))
      : 0;
  const avgScore =
    totalTests > 0
      ? Math.round(
          history.reduce((acc, h) => acc + (h.score / h.total) * 100, 0) /
            totalTests,
        )
      : 0;

  const providerKey = user?.provider ?? "guest";
  const providerStyle = PROVIDER_STYLES[providerKey] ?? PROVIDER_STYLES.guest;

  const displayName =
    user?.name || (providerKey === "guest" ? "Guest User" : "Student");
  const displayEmail =
    user?.email || (providerKey === "guest" ? null : "No email");
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const currentRankIndex = RANKS.findIndex((r) => r.name === rank.name);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="border-white/20 text-white/80 bg-white/5 hover:bg-white/15 hover:text-white"
              data-ocid="profile.cancel_button"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openFeedback}
              className="border-white/20 text-white/70 bg-white/5 hover:bg-white/15 hover:text-white"
              data-ocid="profile.feedback.button"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Feedback
            </Button>
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-white/20 text-white/80 bg-white/5 hover:bg-white/15 hover:text-white"
                data-ocid="profile.secondary_button"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Log Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* User Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl flex-shrink-0"
              style={{
                background:
                  providerKey === "google"
                    ? "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.55 0.25 15))"
                    : providerKey === "facebook"
                      ? "linear-gradient(135deg, oklch(0.55 0.2 250), oklch(0.45 0.22 260))"
                      : "linear-gradient(135deg, oklch(0.55 0.2 280), oklch(0.45 0.22 290))",
              }}
            >
              {avatarLetter}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${providerStyle.color} ${providerStyle.bg} ${providerStyle.border}`}
                >
                  {providerStyle.label}
                </span>
              </div>
              {displayEmail && (
                <p className="text-sm text-white/60">{displayEmail}</p>
              )}
              {providerKey === "guest" && (
                <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 inline-block">
                  🔒 Sign in with Google or Facebook to earn achievements
                </p>
              )}
            </div>

            {/* Rank badge */}
            <div
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border ${rank.bgColor} ${rank.borderColor}`}
            >
              <span className="text-2xl">{rank.emoji}</span>
              <span className={`text-sm font-bold ${rank.color}`}>
                {rank.name}
              </span>
              <span className="text-xs text-white/40">{xp} XP</span>
            </div>
          </div>

          {/* Rank progress */}
          {nextRank && (
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs text-white/50">
                <span>{rank.name}</span>
                <span>
                  {nextRank.name} — {nextRank.minXP - xp} XP to go
                </span>
              </div>
              <Progress value={rankProgress} className="h-2 bg-white/10" />
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Tests Taken",
              value: totalTests,
              icon: <BookOpen className="w-4 h-4" />,
              color: "text-blue-400",
            },
            {
              label: "Avg Score",
              value: `${avgScore}%`,
              icon: <Star className="w-4 h-4" />,
              color: "text-yellow-400",
            },
            {
              label: "Best Score",
              value: `${bestScore}%`,
              icon: <Trophy className="w-4 h-4" />,
              color: "text-green-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className={`flex justify-center mb-1 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Streaks */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Streaks
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {streaks.dailyStreak}
              </p>
              <p className="text-sm text-white/60 mt-1">Day Streak 🔥</p>
              <p className="text-xs text-white/35 mt-0.5">
                Study every day to maintain
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <p className="text-3xl font-bold text-purple-400">
                {streaks.lessonStreak}
              </p>
              <p className="text-sm text-white/60 mt-1">Lesson Streak 📖</p>
              <p className="text-xs text-white/35 mt-0.5">
                Try different chapters
              </p>
            </div>
          </div>
        </div>

        {/* Rank progression */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Rank Progression
          </h2>
          <div className="flex flex-wrap gap-2">
            {RANKS.map((r, i) => (
              <div
                key={r.name}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  i <= currentRankIndex
                    ? `${r.bgColor} ${r.borderColor} ${r.color}`
                    : "bg-white/3 border-white/10 text-white/25"
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.name}</span>
                {i === currentRankIndex && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Achievements
          </h2>
          <p className="text-xs text-white/30 mb-4">
            {earnedAchievements.length} / {ACHIEVEMENTS.length} unlocked
          </p>

          {providerKey === "guest" ? (
            <div
              className="text-center py-8 text-white/40 border border-white/10 rounded-xl bg-white/3"
              data-ocid="profile.achievements.empty_state"
            >
              <p className="text-4xl mb-2">🔒</p>
              <p className="font-semibold text-white/60">Achievements locked</p>
              <p className="text-sm mt-1">
                Sign in with Google or Facebook to earn achievements
              </p>
            </div>
          ) : earnedAchievements.length === 0 ? (
            <div
              className="text-center py-8 text-white/40 border border-white/10 rounded-xl bg-white/3"
              data-ocid="profile.achievements.empty_state"
            >
              <p className="text-4xl mb-2">🎯</p>
              <p className="font-semibold text-white/60">No achievements yet</p>
              <p className="text-sm mt-1">
                Complete tests to earn achievements!
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              data-ocid="profile.achievements.list"
            >
              {earnedAchievements.map((achievement, idx) => (
                <div
                  key={achievement.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${RARITY_STYLES[achievement.rarity]}`}
                  data-ocid={`profile.achievements.item.${idx + 1}`}
                >
                  <span className="text-2xl flex-shrink-0">
                    {achievement.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {achievement.name}
                      {achievement.nameHindi && (
                        <span className="ml-1 font-normal opacity-60">
                          ({achievement.nameHindi})
                        </span>
                      )}
                    </p>
                    <p className="text-xs opacity-70 mt-0.5">
                      {achievement.description}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs capitalize border-current opacity-60 px-1.5 py-0"
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locked achievements preview */}
        {providerKey !== "guest" &&
          ACHIEVEMENTS.filter((a) => !a.condition(stats)).length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40" />
                Coming Up
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACHIEVEMENTS.filter((a) => !a.condition(stats))
                  .slice(0, 6)
                  .map((achievement, idx) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/3 opacity-50"
                      data-ocid={`profile.locked.item.${idx + 1}`}
                    >
                      <span className="text-2xl flex-shrink-0 grayscale">
                        {achievement.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white/50">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-white/35 mt-0.5">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
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
