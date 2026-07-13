import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  bucketByDay,
  breakdown,
  countryName,
  type ScanRow,
} from "@/lib/analytics";
import { designSchema } from "@/lib/validate";
import { renderQRSvg } from "@/lib/qr/svg";
import { envClient } from "@/config/env.client";
import { Card, Badge, ButtonLink } from "@/components/ui";
import { ScanChart } from "@/components/analytics/ScanChart";
import { BreakdownList } from "@/components/analytics/BreakdownList";

export const metadata: Metadata = {
  title: "Live demo — a real dynamic QR code and its analytics",
  description:
    "A real Scanstone dynamic QR code with live scan analytics. Scan it yourself and watch the dashboard move.",
  alternates: { canonical: "/demo" },
};

export const revalidate = 60;

/** Public, read-only view of the seeded demo code. Slug is fixed server-side. */
const DEMO_SLUG = "cafemenu";

export default async function DemoPage() {
  const admin = createSupabaseAdminClient();
  const { data: code } = await admin
    .from("qr_codes")
    .select("id, slug, name, destination_url, design, scan_count")
    .eq("slug", DEMO_SLUG)
    .single();

  if (!code) {
    return (
      <main
        id="main"
        className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"
      >
        <h1 className="engraved text-3xl font-semibold">Demo warming up</h1>
        <p className="mt-3 text-ink-soft">
          The demo code is being prepared. Meanwhile, the free generator works
          right now.
        </p>
        <ButtonLink href="/qr-code-generator" className="mt-6">
          Open the free generator
        </ButtonLink>
      </main>
    );
  }

  const { data: scans } = await admin
    .from("scans")
    .select("scanned_at, country, device, os, referer")
    .eq("code_id", code.id)
    .order("scanned_at", { ascending: false })
    .limit(5000);

  const rows: ScanRow[] = (scans ?? []) as ScanRow[];
  const series = bucketByDay(rows, 30);
  const design = designSchema.parse(code.design ?? {});
  const shortUrl = `${envClient.APP_URL}/r/${code.slug}`;
  const svg = renderQRSvg(shortUrl, design);
  const countries = breakdown(rows, "country").map((b) => ({
    ...b,
    label: countryName(b.label),
  }));

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <Badge tone="copper">Live demo — public</Badge>
        <h1 className="engraved mt-3 text-3xl font-semibold sm:text-4xl">
          This is a real code. Scan it.
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Below is an actual dynamic code from a Scanstone account, with its
          actual analytics. Scan it with your phone and refresh — your scan
          appears in the counts. (Seeded history is marked; new scans are real.)
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit p-5">
          <div
            className="overflow-hidden rounded-md border border-line bg-white"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <p className="mt-3 break-all text-center font-mono text-sm text-ink-soft">
            {shortUrl}
          </p>
          <p className="mt-2 text-center text-xs text-ink-faint">
            Currently pointing at: {new URL(code.destination_url).hostname}
          </p>
        </Card>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="engraved text-xl font-semibold">{code.name}</h2>
            <Badge tone="green">{code.scan_count} scans all-time</Badge>
          </div>
          <div className="mt-4">
            <ScanChart series={series} title="Last 30 days" />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <BreakdownList title="Countries" items={countries} />
            <BreakdownList title="Devices" items={breakdown(rows, "device")} />
            <BreakdownList
              title="Operating systems"
              items={breakdown(rows, "os")}
            />
          </div>
        </div>
      </div>

      <Card className="mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
          Your own dashboard looks exactly like this — three dynamic codes free,
          no card required, and the covenant applies from day one.
        </p>
        <ButtonLink href="/signup" variant="accent">
          Make one like it
        </ButtonLink>
      </Card>
    </main>
  );
}
