import type { ItemRow } from "../service";
import { ItemListRow } from "./item-list-row";

export function ItemSection({
  title,
  items,
  today,
  tone = "default",
}: {
  title: string;
  items: ItemRow[];
  today?: string;
  tone?: "default" | "alert";
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <h2
        className={
          tone === "alert"
            ? "px-1 font-sans text-xs font-semibold tracking-wide text-destructive uppercase"
            : "px-1 font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        }
      >
        {title} · {items.length}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <ItemListRow key={item.id} item={item} today={today} />
        ))}
      </ul>
    </section>
  );
}
