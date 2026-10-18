"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as service from "./service";
import type { ItemRow, Result } from "./service";

// Thin Server Action wrappers: build the user's Supabase client, run the operation, refresh the
// screens that show items. All validation lives in the service (Zod).
async function run<T>(operation: (client: Awaited<ReturnType<typeof createClient>>) => Promise<Result<T>>) {
  const client = await createClient();
  const result = await operation(client);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function createItemAction(input: unknown): Promise<Result<ItemRow>> {
  return run((client) => service.createItem(client, input));
}

export async function updateItemAction(input: unknown): Promise<Result<ItemRow>> {
  return run((client) => service.updateItem(client, input));
}

export async function setItemDoneAction(id: unknown, done: boolean): Promise<Result<ItemRow>> {
  return run((client) => service.setItemDone(client, id, done));
}

export async function deleteItemAction(id: unknown): Promise<Result<null>> {
  return run((client) => service.deleteItem(client, id));
}
