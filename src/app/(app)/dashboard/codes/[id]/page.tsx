import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { limitsFor } from "@/lib/plans";
import { designSchema } from "@/lib/validate";
import {
  bucketByDay,
  breakdown,
  countryName,
  type ScanRow,
} from "@/lib/analytics";
import { envClient } from "@/config/env.client";
import { Card, Badge } from "@/components/ui";
import { CodeForm } from "@/components/dashboard/CodeForm";
import { DownloadButtons } from "@/components/dashboard/DownloadButtons";
import { DeleteCodeButton } from "@/components/dashboard/DeleteCodeButton";
import { ScanChart } from "@/components/analytics/ScanChart";
import { BreakdownList } from "@/components/analytics/BreakdownList";
import { renderQRSvg } from "@/lib/qr/svg";
import type { QRDesign } from "@/lib/validate";

export const metadata: Metadata = {
  title: "Code details",
  robots: { index: false },
};

const SCAN_FETCH_CAP = 5000;

export default async function CodeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: code }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("qr_codes")
      .select("id, slug, name, destination_url, design, scan_count, created_at")
      .eq("id", id)
      .single(),
  ]);
  if (!code) notFound();

  const limits = limitsFor(profile?.plan);
  const isPro = profile?.plan === "pro";
  const windowDays = Number.isFinite(limits.historyDays)
    ? limits.historyDays
    : 90;
  // Server component: per-request clock read is intentional.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = new Date(Date.now() - windowDays * 86400_000).toISOString();

  const { data: scans } = await supabase
    .from("scans")
    .select("scanned_at, country, device, os, referer")
    .eq("code_id", id)
    .gte("scanned_at", cutoff)
    .order("scanned_at", { ascending: false })
    .limit(SCAN_FETCH_CAP);

  const rows: ScanRow[] = scans ?? [];
  const series = bucketByDay(rows, Math.min(windowDays, 30));
  const design = designSchema.parse(code.design ?? {});
  const shortUrl = `${envClient.APP_URL}/r/${code.slug}`;
  const countries = breakdown(rows, "country").map((b) => ({
    ...b,
    label: countryName(b.label),
  }));

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
        <Link href="/dashboard" className="hover:text-ink">
          Codes
        </Link>{" "}
        / <span className="text-ink-soft">{code.name}</span>
      </nav>

      {created ? (
        <Card className="mt-4 border-verdigris/40 bg-verdigris/5 p-4">
          <p className="text-sm text-verdigris-deep">
            <strong>Set in stone.</strong> Download it below and print with
            confidence — this code will redirect for as long as Scanstone
            exists, whatever happens to your plan.
          </p>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mx-auto max-w-60">
              <div data-testid="code-qr">
                {/* live QR for this code */}
                <CodeQR data={shortUrl} design={design} />
              </div>
            </div>
            <p className="mt-4 break-all text-center font-mono text-sm text-ink-soft">
              {shortUrl}
            </p>
            <div className="mt-4">
              <DownloadButtons
                data={shortUrl}
                design={design}
                filename={`scanstone-${code.slug}`}
                svgAllowed={limits.svgDownload}
              />
            </div>
            {!limits.svgDownload ? (
              <p className="mt-2 text-center text-xs text-ink-faint">
                Vector (SVG) download is a Pro feature.
              </p>
            ) : null}
          </Card>
          <DeleteCodeButton id={code.id} name={code.name} />
        </div>

        <div className="space-y-10">
          <section aria-labelledby="analytics-h">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="analytics-h" className="engraved text-xl font-semibold">
                Scans
              </h2>
              <div className="flex items-center gap-3">
                <Badge tone="green">{code.scan_count} all-time</Badge>
                {isPro ? (
                  <a
                    href={`/api/codes/${code.id}/export`}
                    className="text-sm text-verdigris-deep underline"
                  >
                    Export CSV
                  </a>
                ) : null}
              </div>
            </div>
            <div className="mt-4">
              <ScanChart
                series={series}
                title={`Last ${Math.min(windowDays, 30)} days`}
              />
            </div>
            {!isPro ? (
              <p className="mt-2 text-xs text-ink-faint">
                Free plan shows the last 30 days. Every scan is still being
                recorded —{" "}
                <Link href="/account#upgrade" className="underline">
                  upgrade
                </Link>{" "}
                to unlock your full history and CSV export.
              </p>
            ) : null}
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <BreakdownList title="Countries" items={countries} />
              <BreakdownList
                title="Devices"
                items={breakdown(rows, "device")}
              />
              <BreakdownList
                title="Sources"
                items={breakdown(rows, "referer")}
              />
            </div>
          </section>

          <section aria-labelledby="edit-h">
            <h2 id="edit-h" className="engraved text-xl font-semibold">
              Edit
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Change anything here — the printed code keeps working.
            </p>
            <div className="mt-5">
              <CodeForm
                mode="edit"
                initial={{
                  id: code.id,
                  name: code.name,
                  destination_url: code.destination_url,
                  design,
                  slug: code.slug,
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function CodeQR({ data, design }: { data: string; design: QRDesign }) {
  const svg = renderQRSvg(data, design);
  return (
    <div
      className="overflow-hidden rounded-md border border-line bg-white"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
