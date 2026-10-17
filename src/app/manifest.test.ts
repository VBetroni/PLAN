import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("manifest de la PWA", () => {
  const m = manifest();

  it("se abre como app independiente (sin barra del navegador)", () => {
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
  });

  it("declara íconos de 192 y 512 px", () => {
    const sizes = (m.icons ?? []).map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });
});
