import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/features/auth/actions";
import { t } from "@/lib/i18n/es-AR";

type LoginSearchParams = Promise<{ error?: string; reason?: string }>;

async function LoginError({ searchParams }: { searchParams: LoginSearchParams }) {
  const { error, reason } = await searchParams;
  if (!error) return null;
  return (
    <div role="alert" className="flex flex-col gap-1 text-sm text-red-600">
      <p>{t.auth.error}</p>
      {reason && <p className="break-words text-xs text-zinc-500">{reason.slice(0, 200)}</p>}
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
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
