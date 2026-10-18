import { describe, expect, it } from "vitest";
import { completionPatch, isClassified, reopenPatch, statusAfterEdit } from "./status";

describe("isClassified", () => {
  it("un item sin fecha, contexto ni proyecto sigue sin clasificar", () => {
    expect(isClassified({ due_date: null, context: null, project_id: null })).toBe(false);
  });

  it("cualquier dato de organización lo clasifica", () => {
    expect(isClassified({ due_date: "2026-11-02", context: null, project_id: null })).toBe(true);
    expect(isClassified({ due_date: null, context: "work", project_id: null })).toBe(true);
    expect(isClassified({ due_date: null, context: null, project_id: "p1" })).toBe(true);
  });
});

describe("completionPatch", () => {
  it("marca como hecho y guarda cuándo, en UTC", () => {
    const now = new Date("2026-10-17T15:30:00-03:00");
    expect(completionPatch(now)).toEqual({
      status: "done",
      completed_at: "2026-10-17T18:30:00.000Z",
    });
  });
});

describe("reopenPatch", () => {
  it("vuelve al Inbox si nunca se clasificó", () => {
    expect(reopenPatch({ due_date: null, context: null, project_id: null })).toEqual({
      status: "inbox",
      completed_at: null,
    });
  });

  it("vuelve a 'por hacer' si ya estaba clasificado", () => {
    expect(reopenPatch({ due_date: "2026-11-02", context: null, project_id: null })).toEqual({
      status: "todo",
      completed_at: null,
    });
  });
});

describe("statusAfterEdit", () => {
  it("sale del Inbox al ponerle fecha", () => {
    expect(statusAfterEdit("inbox", { due_date: "2026-11-02" })).toBe("todo");
  });

  it("sale del Inbox al ponerle contexto", () => {
    expect(statusAfterEdit("inbox", { context: "health" })).toBe("todo");
  });

  it("se queda en el Inbox si solo se edita el texto", () => {
    expect(statusAfterEdit("inbox", {})).toBe("inbox");
  });

  it("respeta el estado elegido a mano", () => {
    expect(statusAfterEdit("inbox", { status: "doing" })).toBe("doing");
    expect(statusAfterEdit("todo", { status: "doing" })).toBe("doing");
  });

  it("no reabre un item hecho por editar su texto o fecha", () => {
    expect(statusAfterEdit("done", { due_date: "2026-11-02" })).toBe("done");
  });

  it("quitar la fecha no devuelve un item al Inbox", () => {
    expect(statusAfterEdit("todo", { due_date: null })).toBe("todo");
  });
});
