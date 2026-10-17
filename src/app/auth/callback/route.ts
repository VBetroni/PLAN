import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/features/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

// Google sends the user back here with a one-time code that we exchange for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  let reason = searchParams.get("error_description") ?? searchParams.get("error") ?? "no_code";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const base = forwardedHost && origin.startsWith("https") ? `https://${forwardedHost}` : origin;
      return NextResponse.redirect(`${base}${next}`);
    }
    reason = error.message;
  }

  // Technical reason only (no tokens or personal data), to make login failures diagnosable.
  console.error("auth callback failed:", reason);
  const failure = new URL("/login", origin);
  failure.searchParams.set("error", "oauth");
  failure.searchParams.set("reason", reason.slice(0, 200));
  return NextResponse.redirect(failure);
}
