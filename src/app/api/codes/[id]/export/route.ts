import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { limitsFor } from "@/lib/plans";

/** CSV export of scan history. Pro entitlement, owner-only (RLS). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (!limitsFor(profile?.plan).csvExport) {
    return NextResponse.json(
      { error: "CSV export is a Pro feature." },
      { status: 403 },
    );
  }

  // RLS: returns the code only if this user owns it.
  const { data: code } = await supabase
    .from("qr_codes")
    .select("id, slug, name")
    .eq("id", id)
    .single();
  if (!code) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: scans } = await supabase
    .from("scans")
    .select("scanned_at, country, region, device, os, referer")
    .eq("code_id", id)
    .order("scanned_at", { ascending: false })
    .limit(50000);

  const esc = (v: string | null) => `"${(v ?? "").replaceAll('"', '""')}"`;
  const lines = [
    "scanned_at,country,region,device,os,referer",
    ...(scans ?? []).map((s) =>
      [s.scanned_at, s.country, s.region, s.device, s.os, s.referer]
        .map(esc)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="scanstone-${code.slug}-scans.csv"`,
    },
  });
}
