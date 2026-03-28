const DAILY_KEY = "quizzo_streak";
const LESSON_KEY = "quizzo_lesson_streak";

export interface StreakData {
  dailyStreak: number;
  lessonStreak: number;
}

interface DailyStreakStore {
  current: number;
  lastDate: string;
}

interface LessonStreakStore {
  current: number;
  lastChapter: string;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

export function loadStreaks(): StreakData {
  let dailyStreak = 0;
  let lessonStreak = 0;
  try {
    const ds: DailyStreakStore = JSON.parse(
      localStorage.getItem(DAILY_KEY) || "{}",
    );
    dailyStreak = ds.current || 0;
  } catch {
    dailyStreak = 0;
  }
  try {
    const ls: LessonStreakStore = JSON.parse(
      localStorage.getItem(LESSON_KEY) || "{}",
    );
    lessonStreak = ls.current || 0;
  } catch {
    lessonStreak = 0;
  }
  return { dailyStreak, lessonStreak };
}

export function updateStreaks(chapter: string): StreakData {
  const today = toDateStr(new Date());
  const yest = yesterday();

  // Daily streak
  let ds: DailyStreakStore = { current: 0, lastDate: "" };
  try {
    ds = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  } catch {
    ds = { current: 0, lastDate: "" };
  }

  if (ds.lastDate === today) {
    // already counted today
  } else if (ds.lastDate === yest) {
    ds.current = (ds.current || 0) + 1;
    ds.lastDate = today;
  } else {
    ds.current = 1;
    ds.lastDate = today;
  }
  localStorage.setItem(DAILY_KEY, JSON.stringify(ds));

  // Lesson streak
  let ls: LessonStreakStore = { current: 0, lastChapter: "" };
  try {
    ls = JSON.parse(localStorage.getItem(LESSON_KEY) || "{}");
  } catch {
    ls = { current: 0, lastChapter: "" };
  }

  if (!ls.lastChapter) {
    ls.current = 1;
    ls.lastChapter = chapter;
  } else if (ls.lastChapter !== chapter) {
    ls.current = (ls.current || 0) + 1;
    ls.lastChapter = chapter;
  }
  // same chapter → no change
  localStorage.setItem(LESSON_KEY, JSON.stringify(ls));

  return { dailyStreak: ds.current, lessonStreak: ls.current };
}
