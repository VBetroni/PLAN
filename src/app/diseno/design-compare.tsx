"use client";

// TEMPORARY page to compare the two visual directions. Deleted once one is chosen.
import { Check, CalendarDays, Inbox, Plus, Sun } from "lucide-react";
import { useState } from "react";
import { ContextChip, type Context } from "@/components/app/context-chip";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/es-AR";
import { cn } from "@/lib/utils";

type Direction = "a" | "b";

const DIRECTIONS: Record<Direction, { name: string; blurb: string }> = {
  a: { name: "A · Cuaderno", blurb: "Cálida y suave: papel, terracota, títulos con serifa, bordes muy redondeados." },
  b: { name: "B · Tablero", blurb: "Fresca y nítida: gris frío, índigo, una sola tipografía geométrica, bordes más rectos." },
};

function Row({
  title,
  context,
  meta,
  overdue,
  done,
}: {
  title: string;
  context?: Context;
  meta?: string;
  overdue?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-card p-3.5 shadow-card">
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
          done ? "border-success bg-success text-primary-foreground" : "border-muted-foreground/40",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className={cn("text-base leading-snug", done && "text-muted-foreground line-through")}>{title}</span>
        {(context || meta) && (
          <div className="flex flex-wrap items-center gap-2">
            {context && <ContextChip context={context} />}
            {meta && (
              <span className={cn("text-xs", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
                {meta}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAddBar() {
  return (
    <div className="flex items-center gap-2 border-t bg-card p-3">
      <div className="flex-1 rounded-full border bg-background px-4 py-2.5 text-base text-muted-foreground">
        {t.quickAdd.placeholder}
      </div>
      <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Plus className="size-5" />
      </span>
    </div>
  );
}

function BottomNav() {
  const item = (label: string, Icon: typeof Sun, active?: boolean) => (
    <div className="flex flex-1 flex-col items-center gap-1 py-2">
      <span
        className={cn(
          "flex h-8 w-16 items-center justify-center rounded-full",
          active ? "bg-brand-soft text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className={cn("text-xs", active ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
    </div>
  );
  return (
    <div className="flex border-t bg-card pb-2">
      {item(t.nav.today, Sun)}
      {item(t.nav.inbox, Inbox, true)}
      {item("Facturas", CalendarDays)}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>;
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn("size-10 rounded-full border", className)} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function Frame({ direction, dark }: { direction: Direction; dark: boolean }) {
  const contexts: Context[] = ["work", "personal", "health", "finance"];
  return (
    <section
      data-theme={direction}
      className={cn(
        "w-full max-w-[390px] overflow-hidden rounded-[2rem] border bg-background font-sans text-foreground shadow-lg",
        dark && "dark",
      )}
    >
      <div className="flex flex-col gap-5 p-4">
        <header className="flex flex-col gap-1 pt-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t.inbox.title}</h1>
          <p className="text-sm text-muted-foreground">Sábado 17 de octubre</p>
        </header>

        <Label>Inbox con contenido</Label>
        <div className="flex flex-col gap-2.5">
          <Row title="Llamar al plomero" />
          <Row title="Pagar expensas" context="finance" meta="Vence mañana" />
          <Row title="Turno con el dentista" context="health" meta="Hoy · 10:00" />
          <Row title="Mandar informe al cliente" context="work" meta="Venció ayer" overdue />
          <Row title="Elegir regalo para mamá" context="personal" done />
        </div>

        <Label>Captura y navegación</Label>
        <div className="overflow-hidden rounded-2xl border">
          <QuickAddBar />
          <BottomNav />
        </div>

        <Label>Inbox vacío</Label>
        <div className="rounded-2xl border bg-card">
          <EmptyState variant="inbox" />
        </div>

        <Label>Hoy vacío</Label>
        <div className="rounded-2xl border bg-card">
          <EmptyState variant="today" />
        </div>

        <Label>Hoja de edición</Label>
        <div className="flex flex-col gap-3 rounded-t-3xl border bg-card p-4 shadow-card">
          <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30" />
          <h2 className="text-xl font-semibold">Turno con el dentista</h2>
          <div className="rounded-xl border bg-background px-3 py-2.5 text-base text-muted-foreground">
            Llevar estudios previos
          </div>
          <div className="flex flex-wrap gap-2">
            {contexts.map((c) => (
              <span key={c} className={cn("rounded-full", c === "health" && "ring-2 ring-primary ring-offset-2 ring-offset-card")}>
                <ContextChip context={c} className="px-3 py-1 text-sm" />
              </span>
            ))}
          </div>
          <div className="rounded-xl border bg-background px-3 py-2.5 text-base">Hoy · 10:00</div>
          <div className="flex gap-2">
            <Button className="flex-1">Guardar</Button>
            <Button variant="secondary" className="flex-1">
              Cancelar
            </Button>
          </div>
          <Button variant="ghost" className="text-destructive">
            Borrar
          </Button>
        </div>

        <Label>Paleta</Label>
        <div className="grid grid-cols-4 gap-3">
          <Swatch className="bg-primary" label="acento" />
          <Swatch className="bg-brand-soft" label="acento suave" />
          <Swatch className="bg-context-work" label="trabajo" />
          <Swatch className="bg-context-personal" label="personal" />
          <Swatch className="bg-context-health" label="salud" />
          <Swatch className="bg-context-finance" label="finanzas" />
          <Swatch className="bg-destructive" label="vencida" />
          <Swatch className="bg-success" label="hecha" />
        </div>

        <Label>Tipografía</Label>
        <div className="flex flex-col gap-1 pb-4">
          <p className="font-heading text-3xl font-semibold tracking-tight">Tu rutina, en un solo lugar</p>
          <p className="font-heading text-xl font-semibold">Pagar la luz antes del viernes</p>
          <p className="text-base">Texto normal de 16 px: así se leen las notas y los pendientes.</p>
          <p className="text-sm text-muted-foreground">Texto secundario para fechas y detalles.</p>
        </div>
      </div>
    </section>
  );
}

export function DesignCompare() {
  const [view, setView] = useState<Direction | "both">("a");
  const [dark, setDark] = useState(false);
  const shown: Direction[] = view === "both" ? ["a", "b"] : [view];

  const toggle = (active: boolean) => (active ? "default" : "outline");

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="flex w-full max-w-[390px] flex-col gap-3">
        <h1 className="text-2xl font-semibold">Elegí la identidad visual</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={toggle(view === "a")} onClick={() => setView("a")}>
            A · Cuaderno
          </Button>
          <Button size="sm" variant={toggle(view === "b")} onClick={() => setView("b")}>
            B · Tablero
          </Button>
          <Button size="sm" variant={toggle(view === "both")} onClick={() => setView("both")}>
            Ambas
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={toggle(!dark)} onClick={() => setDark(false)}>
            Claro
          </Button>
          <Button size="sm" variant={toggle(dark)} onClick={() => setDark(true)}>
            Oscuro
          </Button>
        </div>
        {shown.map((d) => (
          <p key={d} className="text-sm text-muted-foreground">
            <strong>{DIRECTIONS[d].name}:</strong> {DIRECTIONS[d].blurb}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap items-start justify-center gap-6">
        {shown.map((d) => (
          <Frame key={d} direction={d} dark={dark} />
        ))}
      </div>
    </div>
  );
}
