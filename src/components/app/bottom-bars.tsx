"use client";

import { Inbox, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useKeyboardInset } from "./keyboard-inset";
import { t } from "@/lib/i18n/es-AR";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/hoy", label: t.nav.today, Icon: Sun },
  { href: "/inbox", label: t.nav.inbox, Icon: Inbox },
] as const;

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label={t.nav.label} className="flex">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
          >
            <span
              className={cn(
                "flex h-8 w-16 items-center justify-center rounded-full transition-colors",
                active ? "bg-brand-soft text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className={cn("text-xs", active ? "font-semibold" : "text-muted-foreground")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Sticky bottom area: quick-add field on top, tab bar below.
// - Respects the iPhone home indicator (safe-area-inset-bottom).
// - When the keyboard opens it lifts above it, and the tab bar steps aside so it never covers
//   or gets covered by anything.
export function BottomBars({ children }: { children: ReactNode }) {
  const keyboardInset = useKeyboardInset();
  const keyboardOpen = keyboardInset > 80;

  return (
    <div
      className="sticky bottom-0 z-40 border-t bg-card/95 backdrop-blur"
      style={{ transform: keyboardInset ? `translateY(-${keyboardInset}px)` : undefined }}
    >
      {children}
      <div className={cn(keyboardOpen && "hidden")}>
        <BottomNav />
      </div>
      <div
        className={cn(keyboardOpen && "hidden")}
        style={{ height: "env(safe-area-inset-bottom)" }}
        aria-hidden
      />
    </div>
  );
}
