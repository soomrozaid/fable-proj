import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Full user data export (GDPR-style). RLS scopes every query to the caller. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: codes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, plan, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("qr_codes")
      .select(
        "id, slug, name, destination_url, design, scan_count, created_at, updated_at",
      ),
  ]);

  const codeIds = (codes ?? []).map((c) => c.id);
  const { data: scans } = codeIds.length
    ? await supabase
        .from("scans")
        .select("code_id, scanned_at, country, region, device, os, referer")
        .in("code_id", codeIds)
        .order("scanned_at", { ascending: false })
        .limit(100000)
    : { data: [] };

  return NextResponse.json(
    {
      exported_at: new Date().toISOString(),
      account: { id: user.id, ...profile },
      codes: codes ?? [],
      scans: scans ?? [],
    },
    {
      headers: {
        "content-disposition": 'attachment; filename="scanstone-export.json"',
      },
    },
  );
}
