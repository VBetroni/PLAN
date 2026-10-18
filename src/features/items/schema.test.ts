import { describe, expect, it } from "vitest";
import { createItemSchema, itemIdSchema, updateItemSchema } from "./schema";

const id = "3f2b8c1e-5d4a-4b7e-9c1a-2e6f7a8b9c0d";

describe("createItemSchema", () => {
  it("acepta un título y le saca los espacios sobrantes", () => {
    expect(createItemSchema.parse({ title: "  Llamar al plomero  " })).toEqual({
      title: "Llamar al plomero",
    });
  });

  it("rechaza títulos vacíos o de solo espacios", () => {
    expect(createItemSchema.safeParse({ title: "" }).success).toBe(false);
    expect(createItemSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("rechaza títulos de más de 200 caracteres", () => {
    expect(createItemSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false);
    expect(createItemSchema.safeParse({ title: "a".repeat(200) }).success).toBe(true);
  });

  it("ignora campos que no corresponden (no se puede inyectar user_id ni estado)", () => {
    const parsed = createItemSchema.parse({ title: "x", user_id: id, status: "done" });
    expect(parsed).toEqual({ title: "x" });
  });
});

describe("updateItemSchema", () => {
  it("acepta una edición parcial", () => {
    expect(updateItemSchema.safeParse({ id, due_date: "2026-11-02" }).success).toBe(true);
    expect(updateItemSchema.safeParse({ id, context: null, due_date: null }).success).toBe(true);
  });

  it("exige un id válido", () => {
    expect(updateItemSchema.safeParse({ id: "123", title: "x" }).success).toBe(false);
  });

  it("rechaza fechas inexistentes o mal escritas", () => {
    expect(updateItemSchema.safeParse({ id, due_date: "2026-02-30" }).success).toBe(false);
    expect(updateItemSchema.safeParse({ id, due_date: "02/11/2026" }).success).toBe(false);
  });

  it("solo permite contextos y estados conocidos", () => {
    expect(updateItemSchema.safeParse({ id, context: "hobby" }).success).toBe(false);
    expect(updateItemSchema.safeParse({ id, status: "done" }).success).toBe(false);
    expect(updateItemSchema.safeParse({ id, status: "doing" }).success).toBe(true);
  });

  it("solo permite editar entre tarea y nota", () => {
    expect(updateItemSchema.safeParse({ id, type: "bill" }).success).toBe(false);
    expect(updateItemSchema.safeParse({ id, type: "note" }).success).toBe(true);
  });
});

describe("itemIdSchema", () => {
  it("valida UUIDs", () => {
    expect(itemIdSchema.safeParse(id).success).toBe(true);
    expect(itemIdSchema.safeParse("nope").success).toBe(false);
  });
});
