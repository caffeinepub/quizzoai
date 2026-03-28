export interface RankInfo {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minXP: number;
}

export const RANKS: RankInfo[] = [
  {
    name: "Plastic",
    emoji: "🪨",
    color: "text-gray-400",
    bgColor: "bg-gray-500/15",
    borderColor: "border-gray-500/40",
    minXP: 0,
  },
  {
    name: "Bronze",
    emoji: "🥉",
    color: "text-amber-600",
    bgColor: "bg-amber-600/15",
    borderColor: "border-amber-600/40",
    minXP: 100,
  },
  {
    name: "Steel",
    emoji: "⚙️",
    color: "text-slate-400",
    bgColor: "bg-slate-400/15",
    borderColor: "border-slate-400/40",
    minXP: 300,
  },
  {
    name: "Iron",
    emoji: "🔩",
    color: "text-stone-400",
    bgColor: "bg-stone-500/15",
    borderColor: "border-stone-500/40",
    minXP: 600,
  },
  {
    name: "Copper",
    emoji: "🟤",
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/40",
    minXP: 1000,
  },
  {
    name: "Platinum",
    emoji: "🔘",
    color: "text-cyan-300",
    bgColor: "bg-cyan-300/15",
    borderColor: "border-cyan-300/40",
    minXP: 1500,
  },
  {
    name: "Gold",
    emoji: "🥇",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15",
    borderColor: "border-yellow-400/40",
    minXP: 2200,
  },
  {
    name: "Diamond",
    emoji: "💎",
    color: "text-sky-400",
    bgColor: "bg-sky-400/15",
    borderColor: "border-sky-400/40",
    minXP: 3200,
  },
  {
    name: "Elite",
    emoji: "⚡",
    color: "text-violet-400",
    bgColor: "bg-violet-500/15",
    borderColor: "border-violet-500/40",
    minXP: 4500,
  },
  {
    name: "Master",
    emoji: "👑",
    color: "text-rose-400",
    bgColor: "bg-rose-500/15",
    borderColor: "border-rose-500/40",
    minXP: 6500,
  },
  {
    name: "Grand Master",
    emoji: "🌟",
    color: "text-yellow-300",
    bgColor: "bg-gradient-to-r from-yellow-500/20 to-rose-500/20",
    borderColor: "border-yellow-400/50",
    minXP: 9000,
  },
];

export function getRank(xp: number): RankInfo {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
    else break;
  }
  return rank;
}

export function getNextRank(xp: number): RankInfo | null {
  for (let i = 0; i < RANKS.length; i++) {
    if (xp < RANKS[i].minXP) return RANKS[i];
  }
  return null;
}

export function getRankProgress(xp: number): number {
  const current = getRank(xp);
  const next = getNextRank(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}
