import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { envServer } from "@/config/env.server";

/** Exchanges the Supabase auth code (email confirm, magic link, reset) for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${envServer.APP_URL}${next}`);
    }
  }

  return NextResponse.redirect(
    `${envServer.APP_URL}/login?error=Your+link+expired+or+was+already+used.+Try+again.`,
  );
}
