import { t } from "@/lib/i18n/es-AR";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t.app.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{t.app.tagline}</p>
    </main>
  );
}
