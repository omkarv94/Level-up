// ─── RANKS ───────────────────────────────────────────────────────────────────
export const RANKS = [
  { rank: 'E', min: 1,  max: 10,   color: '#94a3b8', shadow: 'rgba(148,163,184,.35)', title: 'Awakened Hunter', bg: 'rgba(148,163,184,.06)' },
  { rank: 'D', min: 11, max: 20,   color: '#4ade80', shadow: 'rgba(74,222,128,.35)',  title: 'Iron Hunter',     bg: 'rgba(74,222,128,.06)'  },
  { rank: 'C', min: 21, max: 30,   color: '#60a5fa', shadow: 'rgba(96,165,250,.35)',  title: 'Steel Hunter',    bg: 'rgba(96,165,250,.06)'  },
  { rank: 'B', min: 31, max: 40,   color: '#c084fc', shadow: 'rgba(192,132,252,.35)', title: 'Shadow Knight',   bg: 'rgba(192,132,252,.06)' },
  { rank: 'A', min: 41, max: 50,   color: '#fbbf24', shadow: 'rgba(251,191,36,.35)',  title: "Monarch's Vessel",bg: 'rgba(251,191,36,.06)'  },
  { rank: 'S', min: 51, max: 9999, color: '#f87171', shadow: 'rgba(248,113,113,.35)', title: 'Shadow Monarch',  bg: 'rgba(248,113,113,.06)' },
];

export const getRank = (lvl) =>
  RANKS.find((r) => lvl >= r.min && lvl <= r.max) || RANKS[5];

// ─── XP NEEDED PER LEVEL ─────────────────────────────────────────────────────
export const XP_NEEDED = (lvl) => {
  if (lvl <= 10) return 100;
  if (lvl <= 20) return 250;
  if (lvl <= 30) return 500;
  if (lvl <= 40) return 800;
  if (lvl <= 50) return 1200;
  return 2000;
};

// ─── DIFFICULTIES ─────────────────────────────────────────────────────────────
export const DIFFS = {
  Daily:  { xp: 30,  color: '#34d399', hp: 8,  icon: '◎' },
  Easy:   { xp: 60,  color: '#60a5fa', hp: 12, icon: '◈' },
  Medium: { xp: 130, color: '#fbbf24', hp: 20, icon: '◆' },
  Hard:   { xp: 280, color: '#f97316', hp: 30, icon: '⬟' },
  Boss:   { xp: 650, color: '#e879f9', hp: 50, icon: '☠' },
};

// ─── PUNISHMENT MESSAGES ──────────────────────────────────────────────────────
export const PUNISH_MSGS = [
  '"Weakness is not something the System forgives."',
  '"You have disappointed the Shadow Monarch."',
  '"Arise... but you must first prove your worth."',
  '"The dungeon does not wait for the unprepared."',
  '"Your failure has been recorded, Hunter."',
  '"Even shadows demand discipline."',
];