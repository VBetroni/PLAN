import { describe, expect, it } from "vitest";
import { t } from "./es-AR";

describe("textos es-AR", () => {
  it("define el nombre de la app", () => {
    expect(t.app.name).toBe("Rutina");
  });
});
