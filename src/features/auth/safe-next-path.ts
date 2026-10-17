// After login we may redirect to a "next" path. Only allow paths inside this app
// (never "//evil.com" or "https://evil.com"), to avoid open-redirect attacks.
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/";
  }
  return next;
}
