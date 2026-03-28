import { ChevronDown, ChevronUp, LogOut, Star, Trophy } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../types";
import {
  ACHIEVEMENTS,
  type Achievement,
  buildStats,
  loadEarnedIds,
} from "../utils/achievements";
import { getNextRank, getRank, getRankProgress } from "../utils/ranks";
import { loadHistory as getHistory, loadXP } from "../utils/storage";
import { loadStreaks } from "../utils/streaks";

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

const PROVIDER_COLORS: Record<UserProfile["provider"], string> = {
  google: "oklch(0.6 0.2 250)",
  facebook: "oklch(0.55 0.22 270)",
  guest: "oklch(0.5 0.05 280)",
};

const PROVIDER_LABELS: Record<UserProfile["provider"], string> = {
  google: "Google",
  facebook: "Facebook",
  guest: "Guest",
};

const RARITY_STYLES: Record<Achievement["rarity"], string> = {
  common: "border-white/20 bg-white/5 text-white/60",
  rare: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  epic: "border-purple-400/40 bg-purple-500/10 text-purple-300",
  legendary: "border-yellow-400/50 bg-yellow-500/10 text-yellow-300",
};

export function ProfileChip({ user, onLogout }: Props) {
  const isGuest = user.provider === "guest";
  const [showAchievements, setShowAchievements] = useState(false);

  const history = getHistory();
  const testsTaken = history.length;
  const bestScore =
    testsTaken > 0
      ? Math.max(...history.map((h) => Math.round((h.score / h.total) * 100)))
      : 0;
  const avgScore =
    testsTaken > 0
      ? Math.round(
          history.reduce((acc, h) => acc + (h.score / h.total) * 100, 0) /
            testsTaken,
        )
      : 0;

  const xp = !isGuest ? loadXP() : 0;
  const rank = !isGuest ? getRank(xp) : null;
  const nextRank = !isGuest ? getNextRank(xp) : null;
  const progress = !isGuest ? getRankProgress(xp) : 0;
  const streaks = !isGuest
    ? loadStreaks()
    : { dailyStreak: 0, lessonStreak: 0 };
  const earnedIds = !isGuest ? loadEarnedIds() : [];
  const earnedAchievements = !isGuest
    ? ACHIEVEMENTS.filter((a) => earnedIds.includes(a.id))
    : [];

  // Also compute from current stats in case IDs aren't saved yet
  const computedStats = !isGuest ? buildStats(history, xp, streaks) : null;
  const allEarned =
    !isGuest && computedStats
      ? ACHIEVEMENTS.filter((a) => a.condition(computedStats))
      : earnedAchievements;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="glass-card rounded-xl p-4 flex flex-col gap-4"
      data-ocid="profile.card"
    >
      {/* Top row: avatar + info + logout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg"
            style={{ background: PROVIDER_COLORS[user.provider] }}
          >
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-black truncate">
                {user.name}
              </p>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/15 flex-shrink-0">
                {PROVIDER_LABELS[user.provider]}
              </span>
            </div>
            {user.email ? (
              <p className="text-xs text-black truncate">{user.email}</p>
            ) : (
              <p className="text-xs text-white/30 italic">
                No email (guest mode)
              </p>
            )}
          </div>
        </div>

        {/* Rank badge + stats or guest prompt */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {isGuest ? (
            <p className="text-xs text-white/30 italic max-w-[200px] leading-relaxed">
              Sign in with Google or Facebook to unlock achievements.
            </p>
          ) : (
            <>
              {rank && (
                <div
                  className={`flex flex-col gap-1.5 px-3 py-2 rounded-lg border ${rank.bgColor} ${rank.borderColor}`}
                  data-ocid="profile.rank.panel"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">{rank.emoji}</span>
                    <span className={`text-sm font-bold ${rank.color}`}>
                      {rank.name}
                    </span>
                    <span className="text-xs text-white/40 ml-1">
                      {xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        rank.name === "Grand Master"
                          ? "bg-gradient-to-r from-yellow-400 to-rose-400"
                          : rank.color.replace("text-", "bg-")
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {nextRank && (
                    <p className="text-[10px] text-white/30">
                      Next: {nextRank.emoji} {nextRank.name} at{" "}
                      {nextRank.minXP.toLocaleString()} XP
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-xs text-white/40 uppercase tracking-wide">
                    Tests
                  </p>
                  <p className="text-sm font-bold text-primary">{testsTaken}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-white/40 uppercase tracking-wide flex items-center gap-0.5">
                    <Trophy className="w-2.5 h-2.5" />
                    Best
                  </p>
                  <p className="text-sm font-bold text-yellow-400">
                    {bestScore}%
                  </p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-white/40 uppercase tracking-wide flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" />
                    Avg
                  </p>
                  <p className="text-sm font-bold text-green-400">
                    {avgScore}%
                  </p>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/25"
            data-ocid="profile.secondary_button"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>

      {/* Streaks row */}
      {!isGuest && (
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-400/35 bg-orange-500/10 text-orange-300">
            🔥 {streaks.dailyStreak} day{streaks.dailyStreak !== 1 ? "s" : ""}{" "}
            streak
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-cyan-400/35 bg-cyan-500/10 text-cyan-300">
            📖 {streaks.lessonStreak} lesson
            {streaks.lessonStreak !== 1 ? "s" : ""} streak
          </span>
        </div>
      )}

      {/* Achievements section */}
      {!isGuest && (
        <div>
          <button
            type="button"
            onClick={() => setShowAchievements((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white/90 transition-colors"
            data-ocid="profile.achievements.toggle"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Achievements ({allEarned.length}/{ACHIEVEMENTS.length})
            {showAchievements ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAchievements && (
            <div className="mt-3">
              {allEarned.length === 0 ? (
                <p className="text-xs text-white/30 italic">
                  Complete tests to earn achievements!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allEarned.map((a) => (
                    <div
                      key={a.id}
                      title={a.description}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${RARITY_STYLES[a.rarity]}`}
                      data-ocid="profile.achievements.item"
                    >
                      <span>{a.emoji}</span>
                      <div>
                        <p className="font-semibold leading-tight">{a.name}</p>
                        {a.nameHindi && (
                          <p className="text-[9px] opacity-60 leading-tight">
                            {a.nameHindi}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
