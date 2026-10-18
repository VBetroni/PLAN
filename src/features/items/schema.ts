import { z } from "zod";

// Everything that reaches a Server Action is validated here first.
const title = z
  .string()
  .trim()
  .min(1, "empty_title")
  .max(200, "title_too_long");

export const itemIdSchema = z.uuid();

// Quick capture: only a title. It always lands in the Inbox.
export const createItemSchema = z.object({ title });

export const updateItemSchema = z.object({
  id: z.uuid(),
  title: title.optional(),
  body_md: z.string().max(10_000, "notes_too_long").nullable().optional(),
  type: z.enum(["task", "note"]).optional(),
  context: z.enum(["work", "personal", "health", "finance"]).nullable().optional(),
  due_date: z.iso.date().nullable().optional(), // YYYY-MM-DD, no time
  status: z.enum(["todo", "doing"]).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
