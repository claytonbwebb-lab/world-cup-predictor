// Season start: Tuesday 2026-07-14 00:00 UTC
export const SEASON_START = new Date('2026-07-14T00:00:00Z');

// Season months — Premier League 2026/27 runs Aug 2026 → May 2027
export const SEASON_MONTHS: { year: number; month: number; label: string }[] = [
  { year: 2026, month: 7,  label: "Aug '26" },   // August 2026 (JS month=7)
  { year: 2026, month: 8,  label: "Sep '26" },
  { year: 2026, month: 9,  label: "Oct '26" },
  { year: 2026, month: 10, label: "Nov '26" },
  { year: 2026, month: 11, label: "Dec '26" },
  { year: 2027, month: 0,  label: "Jan '27" },
  { year: 2027, month: 1,  label: "Feb '27" },
  { year: 2027, month: 2,  label: "Mar '27" },
  { year: 2027, month: 3,  label: "Apr '27" },
  { year: 2027, month: 4,  label: "May '27" },
];

export function getWeekNumber(date: Date = new Date()): number {
  const diffMs = date.getTime() - SEASON_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, 1 + Math.floor(diffDays / 7));
}

export function getWeekLabel(weekNumber: number): string {
  return `Week ${weekNumber}`;
}

export function getWeekRange(weekNumber: number): string {
  const start = new Date(SEASON_START);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function getWeekDropdownLabel(weekNumber: number): string {
  const currentWeek = getWeekNumber(new Date());
  const nextWeek = currentWeek + 1;
  if (weekNumber === currentWeek) {
    return `This Week — ${getWeekRange(weekNumber)}`;
  }
  if (weekNumber === nextWeek) {
    return `Next Week — ${getWeekRange(weekNumber)}`;
  }
  return getWeekRange(weekNumber);
}

// ─── Monthly helpers ─────────────────────────────────────────────────────────

export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

export function getMonthRange(year: number, month: number): string {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month + 1, 0);
  const fmt   = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function getCurrentSeasonMonth(): { year: number; month: number } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  // Check if current month is in our season range
  const inSeason = SEASON_MONTHS.some(sm => sm.year === y && sm.month === m);
  return inSeason ? { year: y, month: m } : SEASON_MONTHS[0];
}
