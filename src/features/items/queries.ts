import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ItemRow } from "./service";

type Client = SupabaseClient<Database>;

// Newest first: whatever you just jotted down is on top.
export async function listInbox(client: Client): Promise<ItemRow[]> {
  const { data } = await client
    .from("items")
    .select("*")
    .eq("status", "inbox")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// Finished in the last 24 hours, latest first: lets the user undo an accidental tap.
export async function listRecentlyDone(client: Client, now: Date = new Date()): Promise<ItemRow[]> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await client
    .from("items")
    .select("*")
    .eq("status", "done")
    .gte("completed_at", since)
    .order("completed_at", { ascending: false });
  return data ?? [];
}

// Organized, not finished yet. Items with a due date come first, soonest first.
export async function listOpenItems(client: Client): Promise<ItemRow[]> {
  const { data } = await client
    .from("items")
    .select("*")
    .in("status", ["todo", "doing"])
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}
