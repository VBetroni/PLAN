// @vitest-environment node
//
// Integration test of the item lifecycle (create, edit, complete, reopen, delete) against the
// DEV Supabase project. Opt-in with RUN_DB_TESTS=true in .env.local.
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listInbox, listOpenItems, listRecentlyDone } from "@/features/items/queries";
import { createItem, deleteItem, setItemDone, updateItem } from "@/features/items/service";
import type { Database } from "@/lib/supabase/database.types";
import { createAdminClient, createTestUser, dbTestsEnabled, type TestUser } from "./helpers";

describe.skipIf(!dbTestsEnabled)("ciclo de vida de items", () => {
  let admin: SupabaseClient<Database>;
  let alice: TestUser;
  let bob: TestUser;

  beforeAll(async () => {
    admin = createAdminClient();
    alice = await createTestUser(admin, "alice");
    bob = await createTestUser(admin, "bob");
  }, 60_000);

  afterAll(async () => {
    if (alice) await admin.auth.admin.deleteUser(alice.id);
    if (bob) await admin.auth.admin.deleteUser(bob.id);
  }, 60_000);

  async function newItem(client: TestUser["client"], title: string) {
    const result = await createItem(client, { title });
    if (!result.ok) throw new Error(`no se pudo crear: ${result.error}`);
    return result.data;
  }

  it("crea un item en el Inbox como tarea del usuario", async () => {
    const item = await newItem(alice.client, "  Llamar al plomero ");
    expect(item.title).toBe("Llamar al plomero");
    expect(item.type).toBe("task");
    expect(item.status).toBe("inbox");
    expect(item.user_id).toBe(alice.id);
    expect(item.completed_at).toBeNull();
  });

  it("rechaza un título vacío", async () => {
    expect(await createItem(alice.client, { title: "   " })).toEqual({ ok: false, error: "invalid" });
  });

  it("al ponerle fecha sale del Inbox, y la edición guarda notas y contexto", async () => {
    const item = await newItem(alice.client, "Pagar el seguro");
    const result = await updateItem(alice.client, {
      id: item.id,
      due_date: "2026-11-02",
      body_md: "Llevar el DNI",
      context: "finance",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({
      status: "todo",
      due_date: "2026-11-02",
      body_md: "Llevar el DNI",
      context: "finance",
    });
  });

  it("completa y reabre: un item organizado vuelve a 'por hacer'", async () => {
    const item = await newItem(alice.client, "Sacar turno");
    await updateItem(alice.client, { id: item.id, due_date: "2026-11-05" });

    const done = await setItemDone(alice.client, item.id, true);
    expect(done.ok && done.data.status).toBe("done");
    expect(done.ok && done.data.completed_at).not.toBeNull();

    const reopened = await setItemDone(alice.client, item.id, false);
    expect(reopened.ok && reopened.data.status).toBe("todo");
    expect(reopened.ok && reopened.data.completed_at).toBeNull();
  });

  it("completa y reabre: un item sin organizar vuelve al Inbox", async () => {
    const item = await newItem(alice.client, "Idea suelta");
    await setItemDone(alice.client, item.id, true);
    const reopened = await setItemDone(alice.client, item.id, false);
    expect(reopened.ok && reopened.data.status).toBe("inbox");
  });

  it("el Inbox muestra solo lo propio y sin organizar, lo más nuevo primero", async () => {
    const first = await newItem(bob.client, "Primero de Bob");
    const second = await newItem(bob.client, "Segundo de Bob");
    const organized = await newItem(bob.client, "Ya organizado");
    await updateItem(bob.client, { id: organized.id, context: "work" });

    const inbox = await listInbox(bob.client);
    const ids = inbox.map((i) => i.id);
    expect(ids.indexOf(second.id)).toBeLessThan(ids.indexOf(first.id));
    expect(ids).not.toContain(organized.id);
    expect(inbox.every((i) => i.user_id === bob.id)).toBe(true);
  });

  it("los hechos recientes aparecen y desaparecen al reabrirlos", async () => {
    const item = await newItem(alice.client, "Hecho por error");
    await setItemDone(alice.client, item.id, true);

    const recent = await listRecentlyDone(alice.client);
    expect(recent.map((i) => i.id)).toContain(item.id);
    expect(await listRecentlyDone(bob.client)).not.toContainEqual(expect.objectContaining({ id: item.id }));

    // A completion from two days ago is no longer "recent".
    const twoDaysLater = new Date(Date.now() + 48 * 60 * 60 * 1000);
    expect((await listRecentlyDone(alice.client, twoDaysLater)).map((i) => i.id)).not.toContain(item.id);

    await setItemDone(alice.client, item.id, false);
    expect((await listRecentlyDone(alice.client)).map((i) => i.id)).not.toContain(item.id);
  });

  it("los abiertos muestran primero los que tienen fecha más cercana", async () => {
    const later = await newItem(alice.client, "Más adelante");
    const soon = await newItem(alice.client, "Pronto");
    await updateItem(alice.client, { id: later.id, due_date: "2026-12-20" });
    await updateItem(alice.client, { id: soon.id, due_date: "2026-11-01" });

    const ids = (await listOpenItems(alice.client)).map((i) => i.id);
    expect(ids.indexOf(soon.id)).toBeLessThan(ids.indexOf(later.id));
  });

  it("otro usuario no puede editar, completar ni borrar un item ajeno", async () => {
    const item = await newItem(alice.client, "Solo de Alice");

    expect(await updateItem(bob.client, { id: item.id, title: "robado" })).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(await setItemDone(bob.client, item.id, true)).toEqual({ ok: false, error: "not_found" });
    expect(await deleteItem(bob.client, item.id)).toEqual({ ok: false, error: "not_found" });

    const { data } = await alice.client.from("items").select("title, status").eq("id", item.id);
    expect(data).toEqual([{ title: "Solo de Alice", status: "inbox" }]);
  });

  it("borra un item propio", async () => {
    const item = await newItem(alice.client, "Para borrar");
    expect(await deleteItem(alice.client, item.id)).toEqual({ ok: true, data: null });
    const { data } = await alice.client.from("items").select("id").eq("id", item.id);
    expect(data).toEqual([]);
    expect(await deleteItem(alice.client, item.id)).toEqual({ ok: false, error: "not_found" });
  });

  it("rechaza ids que no son UUID", async () => {
    expect(await deleteItem(alice.client, "123")).toEqual({ ok: false, error: "invalid" });
    expect(await setItemDone(alice.client, "123", true)).toEqual({ ok: false, error: "invalid" });
  });
});
