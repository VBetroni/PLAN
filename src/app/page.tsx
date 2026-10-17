import { io } from "next/cache";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { t } from "@/lib/i18n/es-AR";
import { createClient } from "@/lib/supabase/server";

async function Greeting() {
  // Per-visitor work (session + database read): never part of the static shell.
  await io();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("display_name").maybeSingle();
  const name = profile?.display_name?.split(" ")[0];

  return (
    <h1 className="text-3xl font-semibold tracking-tight">
      {name ? t.auth.greeting(name) : t.auth.greetingAnonymous}
    </h1>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Suspense fallback={<h1 className="text-3xl font-semibold tracking-tight">{t.app.name}</h1>}>
        <Greeting />
      </Suspense>
      <p className="text-zinc-600 dark:text-zinc-400">{t.app.tagline}</p>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          {t.auth.signOut}
        </Button>
      </form>
    </main>
  );
}
