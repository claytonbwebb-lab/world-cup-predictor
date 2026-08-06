// Season start: Tuesday 2026-07-14 00:00 UTC
export const SEASON_START = new Date('2026-07-14T00:00:00Z');

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
    return `Week ${weekNumber} — ${getWeekRange(weekNumber)}`;
  }
  if (weekNumber === nextWeek) {
    return `Next Week — ${getWeekRange(weekNumber)}`;
  }
  return getWeekRange(weekNumber);
}
