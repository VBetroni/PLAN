"use client";

import { useSyncExternalStore } from "react";

// How many pixels of the screen the on-screen keyboard covers (0 when it is closed).
// iOS keeps `position: fixed/sticky` bars at the bottom of the full screen, behind the keyboard,
// so bars use this value to lift themselves just above it.
function subscribe(onChange: () => void) {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  viewport.addEventListener("resize", onChange);
  viewport.addEventListener("scroll", onChange);
  return () => {
    viewport.removeEventListener("resize", onChange);
    viewport.removeEventListener("scroll", onChange);
  };
}

function getSnapshot() {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
}

export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
