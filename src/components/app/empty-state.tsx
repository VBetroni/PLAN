import { t } from "@/lib/i18n/es-AR";

type Variant = "inbox" | "today";

// Friendly empty screens. The art uses theme colors, so it follows the chosen direction.
function Art({ variant }: { variant: Variant }) {
  return (
    <svg
      viewBox="0 0 120 96"
      className="h-24 w-30 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {variant === "inbox" ? (
        <>
          <path d="M18 56 30 24h60l12 32v22a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V56Z" className="fill-brand-soft" />
          <path d="M18 56h28a14 14 0 0 0 28 0h28" />
          <path d="m50 36 8 8 14-16" />
        </>
      ) : (
        <>
          <circle cx="60" cy="48" r="18" className="fill-brand-soft" />
          <path d="M60 14v8M60 74v8M26 48h8M86 48h8M36 24l6 6M78 66l6 6M84 24l-6 6M42 66l-6 6" />
        </>
      )}
    </svg>
  );
}

export function EmptyState({ variant }: { variant: Variant }) {
  const copy = variant === "inbox" ? t.inbox : t.today;
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-12 text-center">
      <Art variant={variant} />
      <h2 className="text-xl font-semibold">{copy.emptyTitle}</h2>
      <p className="max-w-64 text-sm text-muted-foreground">{copy.emptyBody}</p>
    </div>
  );
}
