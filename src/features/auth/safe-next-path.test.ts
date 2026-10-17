import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("permite rutas internas", () => {
    expect(safeNextPath("/facturas")).toBe("/facturas");
    expect(safeNextPath("/hoy?x=1")).toBe("/hoy?x=1");
  });

  it("vuelve al inicio si no hay destino", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("rechaza destinos externos o engañosos", () => {
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
    expect(safeNextPath("evil.com")).toBe("/");
  });
});
