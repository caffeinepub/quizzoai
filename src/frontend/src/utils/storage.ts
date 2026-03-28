import type { HistoryEntry } from "../types";

const HISTORY_KEY = "quizzo_history";
const XP_KEY = "quizzo_xp";

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  const history = loadHistory();
  const updated = [entry, ...history].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadXP(): number {
  try {
    return Number(localStorage.getItem(XP_KEY) || "0");
  } catch {
    return 0;
  }
}

export function addXP(amount: number): number {
  const current = loadXP();
  const next = current + amount;
  localStorage.setItem(XP_KEY, String(next));
  return next;
}
