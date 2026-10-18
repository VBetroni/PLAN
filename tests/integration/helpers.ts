import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { Database } from "@/lib/supabase/database.types";

config({ path: ".env.local", quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

// Database tests only run on a developer machine that opted in, against the DEV project.
export const dbTestsEnabled =
  process.env.RUN_DB_TESTS === "true" && !!url && !!publishableKey && !!secretKey;

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

export type TestUser = { id: string; client: SupabaseClient<Database> };

export function createAdminClient() {
  return createClient<Database>(url!, secretKey!, noSession);
}

// Creates a throwaway confirmed user and returns a client logged in as them.
export async function createTestUser(
  admin: SupabaseClient<Database>,
  label: string,
): Promise<TestUser> {
  const email = `test-${label}-${randomUUID()}@example.test`;
  const password = randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Test ${label}` },
  });
  if (error || !data.user) throw error ?? new Error("no se pudo crear el usuario");

  const client = createClient<Database>(url!, publishableKey!, noSession);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, client };
}
