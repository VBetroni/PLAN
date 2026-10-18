import { describe, expect, it } from "vitest";
import { dueInfo, groupForToday } from "./today";

const item = (id: string, due_date: string | null) => ({ id, due_date });
const TODAY = "2026-10-17";

describe("groupForToday", () => {
  const items = [
    item("later", "2026-12-01"),
    item("overdue-old", "2026-10-01"),
    item("today", "2026-10-17"),
    item("week-edge", "2026-10-24"),
    item("undated", null),
    item("overdue-recent", "2026-10-16"),
    item("tomorrow", "2026-10-18"),
    item("after-week", "2026-10-25"),
  ];
  const groups = groupForToday(items, TODAY);
  const ids = (list: { id: string }[]) => list.map((i) => i.id);

  it("separa atrasados, hoy, próximos 7 días, más adelante y sin fecha", () => {
    expect(ids(groups.overdue)).toEqual(["overdue-old", "overdue-recent"]);
    expect(ids(groups.today)).toEqual(["today"]);
    expect(ids(groups.upcoming)).toEqual(["tomorrow", "week-edge"]);
    expect(ids(groups.later)).toEqual(["after-week", "later"]);
    expect(ids(groups.undated)).toEqual(["undated"]);
  });

  it("los próximos 7 días incluyen el día 7 pero no el 8", () => {
    expect(ids(groups.upcoming)).toContain("week-edge");
    expect(ids(groups.later)).toContain("after-week");
  });

  it("no pierde ningún item", () => {
    const total = Object.values(groups).reduce((n, g) => n + g.length, 0);
    expect(total).toBe(items.length);
  });

  it("con una lista vacía devuelve todo vacío", () => {
    expect(groupForToday([], TODAY)).toEqual({
      overdue: [],
      today: [],
      upcoming: [],
      later: [],
      undated: [],
    });
  });
});

describe("dueInfo", () => {
  it("sin fecha no hay nada que mostrar", () => {
    expect(dueInfo(null, TODAY)).toBeNull();
  });

  it("distingue hoy, mañana y ayer", () => {
    expect(dueInfo("2026-10-17", TODAY)).toEqual({ kind: "today", days: 0 });
    expect(dueInfo("2026-10-18", TODAY)).toEqual({ kind: "tomorrow", days: 1 });
    expect(dueInfo("2026-10-16", TODAY)).toEqual({ kind: "overdue", days: 1 });
  });

  it("cuenta los días de atraso", () => {
    expect(dueInfo("2026-10-10", TODAY)).toEqual({ kind: "overdue", days: 7 });
  });

  it("para fechas lejanas informa los días que faltan", () => {
    expect(dueInfo("2026-10-22", TODAY)).toEqual({ kind: "future", days: 5 });
  });
});
