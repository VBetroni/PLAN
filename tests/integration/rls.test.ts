// @vitest-environment node
//
// Integration tests: prove that one user cannot read or modify another user's data (RLS).
// They run against the DEVELOPMENT Supabase project only, and only when RUN_DB_TESTS=true
// is set in .env.local. They create two temporary users and delete them at the end.
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

config({ path: ".env.local", quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const enabled =
  process.env.RUN_DB_TESTS === "true" && !!url && !!publishableKey && !!secretKey;

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

type TestUser = { id: string; client: SupabaseClient };

describe.skipIf(!enabled)("aislamiento entre usuarios (RLS)", () => {
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  let alice: TestUser;
  let bob: TestUser;

  async function createUser(label: string): Promise<TestUser> {
    const email = `rls-${label}-${randomUUID()}@example.test`;
    const password = randomUUID();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `Test ${label}` },
    });
    if (error || !data.user) throw error ?? new Error("no se pudo crear el usuario");
    const client = createClient(url!, publishableKey!, noSession);
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    return { id: data.user.id, client };
  }

  beforeAll(async () => {
    admin = createClient(url!, secretKey!, noSession);
    anon = createClient(url!, publishableKey!, noSession);
    alice = await createUser("alice");
    bob = await createUser("bob");
  }, 60_000);

  afterAll(async () => {
    // Deleting the auth user cascades to every row they own.
    if (alice) await admin.auth.admin.deleteUser(alice.id);
    if (bob) await admin.auth.admin.deleteUser(bob.id);
  }, 60_000);

  it("crea el perfil automáticamente al registrarse", async () => {
    const { data, error } = await alice.client.from("profiles").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(alice.id);
    expect(data![0].timezone).toBe("America/Argentina/Buenos_Aires");
  });

  it("no deja leer ni modificar el perfil de otro", async () => {
    const { data: seen } = await bob.client.from("profiles").select("*").eq("id", alice.id);
    expect(seen).toEqual([]);

    const { data: updated } = await bob.client
      .from("profiles")
      .update({ display_name: "hackeado" })
      .eq("id", alice.id)
      .select();
    expect(updated).toEqual([]);
  });

  it("no deja ver, editar ni borrar ítems de otro usuario", async () => {
    const { data: item, error } = await alice.client
      .from("items")
      .insert({ type: "task", title: "Tarea privada de Alice" })
      .select()
      .single();
    expect(error).toBeNull();

    const { data: seen } = await bob.client.from("items").select("*");
    expect(seen).toEqual([]);

    const { data: updated } = await bob.client
      .from("items")
      .update({ title: "robada" })
      .eq("id", item!.id)
      .select();
    expect(updated).toEqual([]);

    const { data: deleted } = await bob.client
      .from("items")
      .delete()
      .eq("id", item!.id)
      .select();
    expect(deleted).toEqual([]);

    const { data: stillThere } = await alice.client.from("items").select("title").eq("id", item!.id);
    expect(stillThere).toEqual([{ title: "Tarea privada de Alice" }]);
  });

  it("no deja crear filas a nombre de otro usuario", async () => {
    const { error } = await bob.client
      .from("items")
      .insert({ user_id: alice.id, type: "task", title: "suplantación" });
    expect(error).not.toBeNull();
  });

  it("no deja reasignar una fila propia a otro usuario", async () => {
    const { data: mine } = await bob.client
      .from("items")
      .insert({ type: "note", title: "nota de Bob" })
      .select()
      .single();
    const { error } = await bob.client
      .from("items")
      .update({ user_id: alice.id })
      .eq("id", mine!.id);
    expect(error).not.toBeNull();
  });

  it("no deja colgar un ítem de un proyecto ajeno", async () => {
    const { data: project } = await alice.client
      .from("projects")
      .insert({ name: "Proyecto de Alice" })
      .select()
      .single();
    const { error } = await bob.client
      .from("items")
      .insert({ type: "task", title: "intruso", project_id: project!.id });
    expect(error).not.toBeNull();

    const { data: seen } = await bob.client.from("projects").select("*");
    expect(seen).toEqual([]);
  });

  it("aísla servicios y facturas, y no mezcla planes de otro usuario", async () => {
    const { data: plan } = await alice.client
      .from("bill_plans")
      .insert({ provider: "Edenor", category: "luz", typical_amount_cents: 1250000 })
      .select()
      .single();
    expect(plan).not.toBeNull();

    const { data: seenPlans } = await bob.client.from("bill_plans").select("*");
    expect(seenPlans).toEqual([]);

    const { data: bobItem } = await bob.client
      .from("items")
      .insert({ type: "bill", title: "Factura de Bob", status: "todo" })
      .select()
      .single();
    const { error } = await bob.client
      .from("bill_details")
      .insert({ item_id: bobItem!.id, plan_id: plan!.id, period: "2026-11-01" });
    expect(error).not.toBeNull();
  });

  it("aísla las tareas de checklist", async () => {
    const { data: item } = await alice.client
      .from("items")
      .insert({ type: "task", title: "Con checklist" })
      .select()
      .single();
    await alice.client.from("checklist_items").insert({ item_id: item!.id, text: "paso 1" });

    const { data: seen } = await bob.client.from("checklist_items").select("*");
    expect(seen).toEqual([]);

    const { error } = await bob.client
      .from("checklist_items")
      .insert({ item_id: item!.id, text: "paso intruso" });
    expect(error).not.toBeNull();
  });

  it("no deja acceder a nadie sin sesión", async () => {
    for (const table of ["profiles", "items", "projects", "bill_plans", "bill_details", "checklist_items"]) {
      const { data, error } = await anon.from(table).select("*");
      expect(error !== null || (data ?? []).length === 0, `anon leyó ${table}`).toBe(true);
    }
    const { error } = await anon.from("items").insert({ type: "task", title: "anónimo" });
    expect(error).not.toBeNull();
  });
});
