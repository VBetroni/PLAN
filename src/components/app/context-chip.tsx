import { t } from "@/lib/i18n/es-AR";
import { cn } from "@/lib/utils";

export type Context = "work" | "personal" | "health" | "finance";

// Written out in full so Tailwind can see every class name.
const CHIP_STYLES: Record<Context, string> = {
  work: "bg-context-work-soft text-context-work-ink",
  personal: "bg-context-personal-soft text-context-personal-ink",
  health: "bg-context-health-soft text-context-health-ink",
  finance: "bg-context-finance-soft text-context-finance-ink",
};

const DOT_STYLES: Record<Context, string> = {
  work: "bg-context-work",
  personal: "bg-context-personal",
  health: "bg-context-health",
  finance: "bg-context-finance",
};

export function ContextChip({ context, className }: { context: Context; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        CHIP_STYLES[context],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT_STYLES[context])} />
      {t.contexts[context]}
    </span>
  );
}
