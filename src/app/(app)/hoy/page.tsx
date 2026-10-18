import { LogOut } from "lucide-react";
import { io } from "next/cache";
import { Suspense } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { ItemSection } from "@/features/items/components/item-section";
import { listOpenItems, listRecentlyDone } from "@/features/items/queries";
import { groupForToday } from "@/features/items/today";
import { DEFAULT_TIMEZONE, todayInZone } from "@/lib/dates/dates";
import { t } from "@/lib/i18n/es-AR";
import { createClient } from "@/lib/supabase/server";

function Header({ name, subtitle }: { name?: string; subtitle?: string }) {
  return (
    <header className="flex items-start justify-between gap-3 pb-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {name ? t.auth.greeting(name) : t.today.title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground first-letter:uppercase">{subtitle}</p>}
      </div>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="icon-lg" aria-label={t.auth.signOut} className="size-11">
          <LogOut className="size-5" aria-hidden />
        </Button>
      </form>
    </header>
  );
}

async function TodayContent() {
  // Everything here depends on the visitor and on the current time: never part of the static shell.
  await io();
  const supabase = await createClient();
  const [{ data: profile }, open, recentlyDone] = await Promise.all([
    supabase.from("profiles").select("display_name, timezone").maybeSingle(),
    listOpenItems(supabase),
    listRecentlyDone(supabase),
  ]);

  const timeZone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const now = new Date();
  const today = todayInZone(now, timeZone);
  const groups = groupForToday(open, today);
  const subtitle = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(now);
  const name = profile?.display_name?.split(" ")[0];
  const nothingOpen = open.length === 0;

  return (
    <>
      <Header name={name} subtitle={subtitle} />
      <div className="flex flex-col gap-6">
        {nothingOpen && (
          <div className="rounded-3xl border bg-card">
            <EmptyState variant="today" />
          </div>
        )}
        <ItemSection title={t.today.sections.overdue} items={groups.overdue} today={today} tone="alert" />
        <ItemSection title={t.today.sections.today} items={groups.today} today={today} />
        <ItemSection title={t.today.sections.upcoming} items={groups.upcoming} today={today} />
        <ItemSection title={t.today.sections.later} items={groups.later} today={today} />
        <ItemSection title={t.today.sections.undated} items={groups.undated} today={today} />
        <ItemSection title={t.today.sections.recentlyDone} items={recentlyDone} today={today} />
      </div>
    </>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={<Header />}>
      <TodayContent />
    </Suspense>
  );
}
