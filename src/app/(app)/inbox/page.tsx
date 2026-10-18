import { io } from "next/cache";
import { Suspense } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { ItemSection } from "@/features/items/components/item-section";
import { listInbox } from "@/features/items/queries";
import { t } from "@/lib/i18n/es-AR";
import { createClient } from "@/lib/supabase/server";

function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header className="flex flex-col gap-1 pb-5">
      <h1 className="text-3xl font-semibold tracking-tight">{t.inbox.title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

async function InboxContent() {
  await io();
  const supabase = await createClient();
  const items = await listInbox(supabase);

  return (
    <>
      <Header subtitle={items.length > 0 ? t.inbox.count(items.length) : undefined} />
      {items.length === 0 ? (
        <div className="rounded-3xl border bg-card">
          <EmptyState variant="inbox" />
        </div>
      ) : (
        <ItemSection title={t.inbox.title} items={items} />
      )}
    </>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<Header />}>
      <InboxContent />
    </Suspense>
  );
}
