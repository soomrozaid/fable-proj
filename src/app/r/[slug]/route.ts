import { NextResponse, after } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SLUG_PATTERN } from "@/lib/slug";
import { classifyUserAgent } from "@/lib/ua";
import { log } from "@/lib/log";
import { envServer } from "@/config/env.server";

export const dynamic = "force-dynamic";

/**
 * THE COVENANT LIVES HERE. This is the redirect fast path: look up the slug,
 * 302, and record the scan after the response is sent. No plan checks, no
 * entitlement gates, no cookies — a Scanstone redirect must never be blocked
 * by billing state.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.redirect(`${envServer.APP_URL}/?missing-code=1`, 302);
  }

  const admin = createSupabaseAdminClient();
  const { data: code, error } = await admin
    .from("qr_codes")
    .select("id, destination_url")
    .eq("slug", slug)
    .single();

  if (error || !code) {
    return NextResponse.redirect(`${envServer.APP_URL}/?missing-code=1`, 302);
  }

  // Fire-and-forget scan recording — never blocks or breaks the redirect.
  const headers = request.headers;
  after(async () => {
    try {
      const { device, os } = classifyUserAgent(headers.get("user-agent"));
      if (device === "bot") return;
      const { error: rpcError } = await admin.rpc("record_scan", {
        p_code_id: code.id,
        p_country: headers.get("x-vercel-ip-country") ?? "unknown",
        p_region: headers.get("x-vercel-ip-country-region") ?? "",
        p_device: device,
        p_os: os,
        p_referer: headers.get("referer") ?? "",
      });
      if (rpcError)
        log("error", "scan_record_failed", { slug, error: rpcError.message });
    } catch (e) {
      log("error", "scan_record_threw", { slug, error: String(e) });
    }
  });

  return NextResponse.redirect(code.destination_url, {
    status: 302,
    headers: { "cache-control": "no-store", "referrer-policy": "no-referrer" },
  });
}
