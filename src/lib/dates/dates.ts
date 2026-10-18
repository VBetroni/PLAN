// Date helpers for "date-only" values (due dates). They are strings like "2026-10-17" with no time
// and no timezone, so all arithmetic is done in UTC to avoid daylight-saving surprises.
export const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";

const MS_PER_DAY = 86_400_000;

function toUtcMs(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

// "Today" as the user sees it on the wall clock, as YYYY-MM-DD.
export function todayInZone(now: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  return new Date(toUtcMs(isoDate) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

// Whole days from `from` to `to` (negative if `to` is earlier).
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}
