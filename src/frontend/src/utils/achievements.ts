import type { HistoryEntry } from "../types";
import type { StreakData } from "./streaks";

export interface Achievement {
  id: string;
  name: string;
  nameHindi?: string;
  emoji: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalTests: number;
  bestScore: number;
  avgScore: number;
  xp: number;
  dailyStreak: number;
  lessonStreak: number;
  perfectTests: number;
  failedTests: number;
  chaptersStudied: number;
  comebackDone: boolean;
  ncertChapters: number;
  comebackCount: number;
  highScoreTests: number; // >= 90%
  first10AllPass: boolean; // first 10 tests all >= 70%
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    name: "First Step",
    emoji: "🎯",
    description: "Complete your very first test",
    rarity: "common",
    condition: (s) => s.totalTests >= 1,
  },
  {
    id: "ncert_master",
    name: "NCERT Master",
    emoji: "📚",
    description: "Complete 10+ tests on CBSE board",
    rarity: "epic",
    condition: (s) => s.ncertChapters >= 10,
  },
  {
    id: "test_raja",
    name: "Test Raja",
    emoji: "👑",
    description: "Take 50 tests total",
    rarity: "legendary",
    condition: (s) => s.totalTests >= 50,
  },
  {
    id: "exam_who",
    name: "Exam Who?",
    emoji: "😎",
    description: "Score 100% on any test",
    rarity: "epic",
    condition: (s) => s.perfectTests >= 1,
  },
  {
    id: "hausla_bulund",
    name: "Hausla Bulund",
    nameHindi: "हौसला बुलंद",
    emoji: "💪",
    description: "Score 70%+ after a previous fail",
    rarity: "rare",
    condition: (s) => s.comebackDone,
  },
  {
    id: "chapter_explorer",
    name: "Chapter Explorer",
    emoji: "🗺️",
    description: "Study 5 different chapters",
    rarity: "common",
    condition: (s) => s.chaptersStudied >= 5,
  },
  {
    id: "speed_reader",
    name: "Speed Reader",
    emoji: "⚡",
    description: "Maintain a 5-day daily study streak",
    rarity: "rare",
    condition: (s) => s.dailyStreak >= 5,
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    emoji: "🔥",
    description: "Maintain a 7-day daily streak",
    rarity: "epic",
    condition: (s) => s.dailyStreak >= 7,
  },
  {
    id: "comeback_king",
    name: "Comeback King",
    emoji: "🔄",
    description: "Score 70%+ three times after failing",
    rarity: "rare",
    condition: (s) => s.comebackCount >= 3,
  },
  {
    id: "topper",
    name: "Topper",
    emoji: "🏆",
    description: "Score above 90% on 5 tests",
    rarity: "epic",
    condition: (s) => s.highScoreTests >= 5,
  },
  {
    id: "padhai_ka_keeda",
    name: "Padhai Ka Keeda",
    nameHindi: "पढ़ाई का कीड़ा",
    emoji: "🐛",
    description: "Take 20 tests total",
    rarity: "rare",
    condition: (s) => s.totalTests >= 20,
  },
  {
    id: "lesson_champion",
    name: "Lesson Champion",
    emoji: "📖",
    description: "Study 5 consecutive different chapters",
    rarity: "rare",
    condition: (s) => s.lessonStreak >= 5,
  },
  {
    id: "no_fail",
    name: "Invincible",
    emoji: "🛡️",
    description: "Score 70%+ in all your first 10 tests",
    rarity: "legendary",
    condition: (s) => s.first10AllPass,
  },
  {
    id: "night_grind",
    name: "Night Grinder",
    emoji: "🌙",
    description: "Complete 30 tests total",
    rarity: "rare",
    condition: (s) => s.totalTests >= 30,
  },
  {
    id: "diamond_mind",
    name: "Diamond Mind",
    emoji: "💎",
    description: "Reach 3200 XP",
    rarity: "legendary",
    condition: (s) => s.xp >= 3200,
  },
];

export function buildStats(
  history: HistoryEntry[],
  xp: number,
  streaks: StreakData,
): AchievementStats {
  const totalTests = history.length;
  const scores = history.map((h) => Math.round((h.score / h.total) * 100));
  const bestScore = totalTests > 0 ? Math.max(...scores) : 0;
  const avgScore =
    totalTests > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / totalTests)
      : 0;
  const perfectTests = scores.filter((s) => s === 100).length;
  const failedTests = scores.filter((s) => s < 70).length;
  const chaptersStudied = new Set(history.map((h) => h.chapter)).size;
  const ncertChapters = history.filter((h) => h.board === "CBSE").length;

  // Comeback: scored >=70 after a previous fail
  let comebackDone = false;
  let comebackCount = 0;
  let hadFail = false;
  for (const h of [...history].reverse()) {
    const pct = Math.round((h.score / h.total) * 100);
    if (pct < 70) {
      hadFail = true;
    } else if (hadFail && pct >= 70) {
      comebackDone = true;
      comebackCount++;
      hadFail = false;
    }
  }

  const highScoreTests = scores.filter((s) => s >= 90).length;

  // First 10 tests all pass
  const first10 = [...history].reverse().slice(0, 10);
  const first10AllPass =
    first10.length >= 10 &&
    first10.every((h) => Math.round((h.score / h.total) * 100) >= 70);

  return {
    totalTests,
    bestScore,
    avgScore,
    xp,
    dailyStreak: streaks.dailyStreak,
    lessonStreak: streaks.lessonStreak,
    perfectTests,
    failedTests,
    chaptersStudied,
    comebackDone,
    ncertChapters,
    comebackCount,
    highScoreTests,
    first10AllPass,
  };
}

export function getEarnedAchievements(stats: AchievementStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.condition(stats));
}

const EARNED_KEY = "quizzo_achievements";

export function loadEarnedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(EARNED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEarnedIds(ids: string[]): void {
  localStorage.setItem(EARNED_KEY, JSON.stringify(ids));
}

export function checkNewAchievements(stats: AchievementStats): Achievement[] {
  const earned = getEarnedAchievements(stats);
  const earnedIds = earned.map((a) => a.id);
  const previousIds = loadEarnedIds();
  const newOnes = earned.filter((a) => !previousIds.includes(a.id));
  if (newOnes.length > 0) {
    saveEarnedIds(earnedIds);
  }
  return newOnes;
}
