import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/features/auth/actions";
import { t } from "@/lib/i18n/es-AR";

async function LoginError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-red-600">
      {t.auth.error}
    </p>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t.app.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t.app.tagline}</p>
      </div>
      <form action={signInWithGoogle} className="w-full max-w-xs">
        <Button type="submit" size="lg" className="w-full">
          {t.auth.signInWithGoogle}
        </Button>
      </form>
      <Suspense>
        <LoginError searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
