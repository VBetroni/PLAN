import { describe, expect, it } from "vitest";
import { addDays, daysBetween, todayInZone } from "./dates";

describe("todayInZone", () => {
  it("usa la fecha de Buenos Aires, no la de UTC", () => {
    // 01:30 UTC del 18/10 son las 22:30 del 17/10 en Buenos Aires (UTC-3).
    expect(todayInZone(new Date("2026-10-18T01:30:00Z"))).toBe("2026-10-17");
  });

  it("cambia de día a la medianoche local", () => {
    expect(todayInZone(new Date("2026-10-18T02:59:59Z"))).toBe("2026-10-17");
    expect(todayInZone(new Date("2026-10-18T03:00:00Z"))).toBe("2026-10-18");
  });

  it("respeta otra zona horaria si el usuario la configuró", () => {
    expect(todayInZone(new Date("2026-10-18T01:30:00Z"), "Europe/Madrid")).toBe("2026-10-18");
  });
});

describe("addDays", () => {
  it("suma días cruzando fin de mes y de año", () => {
    expect(addDays("2026-10-28", 5)).toBe("2026-11-02");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("maneja el 29 de febrero de un año bisiesto", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("resta con números negativos", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("daysBetween", () => {
  it("cuenta días entre dos fechas", () => {
    expect(daysBetween("2026-10-17", "2026-10-20")).toBe(3);
    expect(daysBetween("2026-10-20", "2026-10-17")).toBe(-3);
    expect(daysBetween("2026-10-17", "2026-10-17")).toBe(0);
  });

  it("no se confunde con cambios de horario de verano", () => {
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
  });
});
