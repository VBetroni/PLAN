"use client";

import { Plus } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/es-AR";
import { createItemAction } from "../actions";

// Always-visible capture field. One line, Enter or "+" saves it to the Inbox.
export function QuickAdd() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const title = String(formData.get("title") ?? "");
    if (title.trim() === "") return;
    setError(null);

    startTransition(async () => {
      const result = await createItemAction({ title });
      if (result.ok) {
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setError(t.items.errors[result.error]);
      }
      inputRef.current?.focus();
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-1 px-3 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          name="title"
          type="text"
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="send"
          maxLength={200}
          aria-label={t.quickAdd.label}
          placeholder={t.quickAdd.placeholder}
          className="h-11 flex-1 rounded-full bg-background px-4"
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={isPending}
          aria-label={t.quickAdd.submit}
          className="size-11 shrink-0 rounded-full"
        >
          <Plus className="size-5" aria-hidden />
        </Button>
      </div>
      {error && (
        <p role="alert" className="px-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
