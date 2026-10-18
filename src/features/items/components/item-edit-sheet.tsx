"use client";

import { useState, useTransition } from "react";
import { useKeyboardInset } from "@/components/app/keyboard-inset";
import { ContextChip, type Context } from "@/components/app/context-chip";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n/es-AR";
import { cn } from "@/lib/utils";
import { deleteItemAction, updateItemAction } from "../actions";
import type { ItemRow } from "../service";

const CONTEXTS: Context[] = ["work", "personal", "health", "finance"];
type EditableStatus = "todo" | "doing";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-4 text-sm transition-colors",
        selected ? "border-primary bg-brand-soft font-semibold text-primary" : "border-input text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// The form is mounted only while the sheet is open, so it always starts from the saved item.
function EditForm({ item, onClose }: { item: ItemRow; onClose: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.body_md ?? "");
  const [type, setType] = useState<"task" | "note">(item.type === "note" ? "note" : "task");
  const [context, setContext] = useState<Context | null>(item.context);
  const [dueDate, setDueDate] = useState(item.due_date ?? "");
  const [status, setStatus] = useState<EditableStatus | null>(
    item.status === "todo" || item.status === "doing" ? item.status : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateItemAction({
        id: item.id,
        title,
        body_md: notes.trim() === "" ? null : notes,
        type,
        context,
        due_date: dueDate === "" ? null : dueDate,
        ...(status ? { status } : {}),
      });
      if (result.ok) onClose();
      else setError(t.items.errors[result.error]);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteItemAction(item.id);
      if (result.ok) onClose();
      else {
        setConfirmingDelete(false);
        setError(t.items.errors[result.error]);
      }
    });
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Field label={t.items.sheet.titleLabel}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className="h-11 rounded-xl px-3"
        />
      </Field>

      <Field label={t.items.sheet.notesLabel}>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={10000}
          className="min-h-24 rounded-xl px-3 py-2 text-base"
        />
      </Field>

      <Field label={t.items.sheet.typeLabel}>
        <div className="flex flex-wrap gap-2">
          <Choice selected={type === "task"} onClick={() => setType("task")}>
            {t.items.sheet.types.task}
          </Choice>
          <Choice selected={type === "note"} onClick={() => setType("note")}>
            {t.items.sheet.types.note}
          </Choice>
        </div>
      </Field>

      <Field label={t.items.sheet.contextLabel}>
        <div className="flex flex-wrap gap-2">
          <Choice selected={context === null} onClick={() => setContext(null)}>
            {t.items.sheet.noContext}
          </Choice>
          {CONTEXTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={context === c}
              onClick={() => setContext(c)}
              className={cn(
                "min-h-11 rounded-full px-1 ring-offset-2 ring-offset-popover transition-shadow",
                context === c && "ring-2 ring-primary",
              )}
            >
              <ContextChip context={c} className="px-3.5 py-2 text-sm" />
            </button>
          ))}
        </div>
      </Field>

      <Field label={t.items.sheet.dueLabel}>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11 flex-1 rounded-xl px-3"
          />
          {dueDate !== "" && (
            <Button type="button" variant="ghost" className="h-11" onClick={() => setDueDate("")}>
              {t.items.sheet.clearDue}
            </Button>
          )}
        </div>
      </Field>

      <Field label={t.items.sheet.statusLabel}>
        <div className="flex flex-wrap gap-2">
          <Choice selected={status === "todo"} onClick={() => setStatus("todo")}>
            {t.items.sheet.statuses.todo}
          </Choice>
          <Choice selected={status === "doing"} onClick={() => setStatus("doing")}>
            {t.items.sheet.statuses.doing}
          </Choice>
        </div>
      </Field>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || title.trim() === ""} className="h-11 flex-1 rounded-xl">
          {isPending ? t.items.sheet.saving : t.items.sheet.save}
        </Button>
        <Button type="button" variant="secondary" className="h-11 flex-1 rounded-xl" onClick={onClose}>
          {t.items.sheet.cancel}
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-11 text-destructive"
        disabled={isPending}
        onClick={() => setConfirmingDelete(true)}
      >
        {t.items.sheet.delete}
      </Button>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.items.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{t.items.deleteDialog.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.items.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              {t.items.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

export function ItemEditSheet({
  item,
  open,
  onOpenChange,
}: {
  item: ItemRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const keyboardInset = useKeyboardInset();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-md overflow-y-auto rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        // Lifts the sheet above the on-screen keyboard and keeps it from growing taller than the free space.
        style={{ bottom: keyboardInset, maxHeight: `calc(92dvh - ${keyboardInset}px)` }}
      >
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-xl">{t.items.sheet.title}</SheetTitle>
        </SheetHeader>
        <EditForm item={item} onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
