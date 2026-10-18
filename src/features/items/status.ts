// Pure rules for how an item's status changes. No database or UI here, so it is easy to test.

export type ItemStatus = "inbox" | "todo" | "doing" | "done" | "cancelled" | "skipped";
export type ItemContext = "work" | "personal" | "health" | "finance";

type Organization = {
  due_date: string | null;
  context: ItemContext | null;
  project_id: string | null;
};

// An item is "classified" once the user gave it any organizing data.
export function isClassified(item: Organization): boolean {
  return item.due_date !== null || item.context !== null || item.project_id !== null;
}

export function completionPatch(now: Date): { status: "done"; completed_at: string } {
  return { status: "done", completed_at: now.toISOString() };
}

// Undoing "done" returns the item to where it was: Inbox if it was never organized.
export function reopenPatch(item: Organization): {
  status: "inbox" | "todo";
  completed_at: null;
} {
  return { status: isClassified(item) ? "todo" : "inbox", completed_at: null };
}

// Only an item still in the Inbox leaves it when the user organizes it.
export function statusAfterEdit(
  current: ItemStatus,
  edit: { status?: "todo" | "doing"; due_date?: string | null; context?: ItemContext | null },
): ItemStatus {
  if (edit.status) return edit.status;
  if (current === "inbox" && (edit.due_date || edit.context)) return "todo";
  return current;
}
