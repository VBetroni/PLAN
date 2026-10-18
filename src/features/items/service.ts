import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createItemSchema, itemIdSchema, updateItemSchema } from "./schema";
import { completionPatch, reopenPatch, statusAfterEdit, type ItemStatus } from "./status";

// Database operations for items. They take the Supabase client as a parameter so the same code
// runs in Server Actions and in the integration tests. Row Level Security isolates users:
// a row from another user simply looks like it does not exist.
type Client = SupabaseClient<Database>;
export type ItemRow = Database["public"]["Tables"]["items"]["Row"];

export type ItemError = "invalid" | "not_found" | "failed";
export type Result<T> = { ok: true; data: T } | { ok: false; error: ItemError };

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (error: ItemError): Result<never> => ({ ok: false, error });

async function getItem(client: Client, id: string): Promise<ItemRow | null> {
  const { data } = await client.from("items").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function createItem(client: Client, input: unknown): Promise<Result<ItemRow>> {
  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) return fail("invalid");

  const { data, error } = await client
    .from("items")
    .insert({ title: parsed.data.title, type: "task", status: "inbox" })
    .select()
    .single();
  return error || !data ? fail("failed") : ok(data);
}

export async function updateItem(client: Client, input: unknown): Promise<Result<ItemRow>> {
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) return fail("invalid");
  const { id, status, ...fields } = parsed.data;

  const current = await getItem(client, id);
  if (!current) return fail("not_found");

  const nextStatus = statusAfterEdit(current.status as ItemStatus, {
    status,
    due_date: fields.due_date,
    context: fields.context,
  });

  const { data, error } = await client
    .from("items")
    .update({ ...fields, status: nextStatus })
    .eq("id", id)
    .select()
    .single();
  return error || !data ? fail("failed") : ok(data);
}

export async function setItemDone(
  client: Client,
  id: unknown,
  done: boolean,
  now: Date = new Date(),
): Promise<Result<ItemRow>> {
  const parsedId = itemIdSchema.safeParse(id);
  if (!parsedId.success) return fail("invalid");

  const current = await getItem(client, parsedId.data);
  if (!current) return fail("not_found");

  const patch = done
    ? completionPatch(now)
    : reopenPatch({
        due_date: current.due_date,
        context: current.context,
        project_id: current.project_id,
      });

  const { data, error } = await client
    .from("items")
    .update(patch)
    .eq("id", parsedId.data)
    .select()
    .single();
  return error || !data ? fail("failed") : ok(data);
}

export async function deleteItem(client: Client, id: unknown): Promise<Result<null>> {
  const parsedId = itemIdSchema.safeParse(id);
  if (!parsedId.success) return fail("invalid");

  const { data, error } = await client.from("items").delete().eq("id", parsedId.data).select("id");
  if (error) return fail("failed");
  return data.length === 0 ? fail("not_found") : ok(null);
}
