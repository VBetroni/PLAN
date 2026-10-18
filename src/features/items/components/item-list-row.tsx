"use client";

import { Check } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { ContextChip } from "@/components/app/context-chip";
import { t } from "@/lib/i18n/es-AR";
import { cn } from "@/lib/utils";
import { setItemDoneAction } from "../actions";
import type { ItemRow } from "../service";
import { dueInfo, type DueInfo } from "../today";
import { ItemEditSheet } from "./item-edit-sheet";

function dueText(info: DueInfo, dueDate: string): string {
  switch (info.kind) {
    case "today":
      return t.items.due.today;
    case "tomorrow":
      return t.items.due.tomorrow;
    case "overdue":
      return t.items.due.overdue(info.days);
    case "future":
      // e.g. "mié 22/10". The date has no time zone, so it is formatted as UTC on purpose.
      return new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
        timeZone: "UTC",
      })
        .format(new Date(`${dueDate}T00:00:00Z`))
        .replace(",", "");
  }
}

// One item in a list: the circle completes it, the text opens the editor.
export function ItemListRow({ item, today }: { item: ItemRow; today?: string }) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const [done, setDone] = useOptimistic(item.status === "done");

  const info = !done && today && item.due_date ? dueInfo(item.due_date, today) : null;
  const overdue = info?.kind === "overdue";
  const context = item.context;

  function toggle() {
    const next = !done;
    startTransition(async () => {
      setDone(next);
      await setItemDoneAction(item.id, next);
    });
  }

  return (
    <li className="flex items-start rounded-2xl bg-card shadow-card">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={done}
        aria-label={done ? t.items.markTodo : t.items.markDone}
        className="flex size-12 shrink-0 items-center justify-center"
      >
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border-2 transition-colors",
            done ? "border-success bg-success text-primary-foreground" : "border-muted-foreground/40",
          )}
        >
          {done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
        </span>
      </button>

      <button
        type="button"
        disabled={done}
        onClick={() => setEditing(true)}
        aria-label={t.items.edit(item.title)}
        className="flex min-h-12 min-w-0 flex-1 flex-col items-start justify-center gap-1.5 py-2.5 pr-4 text-left disabled:cursor-default"
      >
        <span className={cn("text-base leading-snug break-words", done && "text-muted-foreground line-through")}>
          {item.title}
        </span>
        {!done && (context || info) && (
          <span className="flex flex-wrap items-center gap-2">
            {context && <ContextChip context={context} />}
            {info && item.due_date && (
              <span className={cn("text-xs", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
                {dueText(info, item.due_date)}
              </span>
            )}
          </span>
        )}
      </button>

      {editing && <ItemEditSheet item={item} open={editing} onOpenChange={setEditing} />}
    </li>
  );
}
