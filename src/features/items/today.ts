import { addDays, daysBetween } from "@/lib/dates/dates";

// Pure rules for the "Hoy" screen. `today` is a YYYY-MM-DD string already computed in the
// user's timezone (see todayInZone).
type Dated = { due_date: string | null };

export type TodayGroups<T> = {
  overdue: T[];
  today: T[];
  upcoming: T[]; // tomorrow up to 7 days from now
  later: T[]; // further away: kept visible until the Calendar screen exists
  undated: T[];
};

const byDueDate = (a: Dated, b: Dated) => (a.due_date ?? "").localeCompare(b.due_date ?? "");

export function groupForToday<T extends Dated>(items: T[], today: string): TodayGroups<T> {
  const groups: TodayGroups<T> = { overdue: [], today: [], upcoming: [], later: [], undated: [] };
  const weekEnd = addDays(today, 7);

  for (const item of items) {
    const due = item.due_date;
    if (due === null) groups.undated.push(item);
    else if (due < today) groups.overdue.push(item);
    else if (due === today) groups.today.push(item);
    else if (due <= weekEnd) groups.upcoming.push(item);
    else groups.later.push(item);
  }

  groups.overdue.sort(byDueDate);
  groups.upcoming.sort(byDueDate);
  groups.later.sort(byDueDate);
  return groups;
}

export type DueInfo = {
  kind: "overdue" | "today" | "tomorrow" | "future";
  days: number; // overdue: days late; future: days left
};

// What to say about a due date. The UI turns this into text (es-AR) in one place.
export function dueInfo(dueDate: string | null, today: string): DueInfo | null {
  if (dueDate === null) return null;
  const diff = daysBetween(today, dueDate);
  if (diff < 0) return { kind: "overdue", days: -diff };
  if (diff === 0) return { kind: "today", days: 0 };
  if (diff === 1) return { kind: "tomorrow", days: 1 };
  return { kind: "future", days: diff };
}
