import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { limitsFor } from "@/lib/plans";
import { envClient } from "@/config/env.client";
import { Card, ButtonLink, Badge } from "@/components/ui";
import { QRPreview } from "@/components/qr/QRPreview";
import { designSchema } from "@/lib/validate";

export const metadata: Metadata = {
  title: "Your codes",
  robots: { index: false },
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: codes }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("qr_codes")
      .select("id, slug, name, destination_url, design, scan_count, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const limits = limitsFor(profile?.plan);
  const used = codes?.length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="engraved text-3xl font-semibold">Your codes</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {used} of {limits.maxCodes} dynamic codes ·{" "}
            <span className="text-verdigris-deep">
              redirects never expire, whatever your plan
            </span>
          </p>
        </div>
        <ButtonLink href="/dashboard/new" variant="accent">
          + New dynamic code
        </ButtonLink>
      </div>

      {used === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="engraved text-xl font-semibold">
              Carve your first code
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              A dynamic code prints once and redirects forever. Point it at a
              menu, a booking page, a portfolio — then change the destination
              any time without reprinting.
            </p>
            <ButtonLink href="/dashboard/new" className="mt-5">
              Create a dynamic code
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {codes?.map((code) => {
            const design = designSchema.parse(code.design ?? {});
            return (
              <li key={code.id}>
                <Link href={`/dashboard/codes/${code.id}`} className="block">
                  <Card className="flex gap-4 p-4 transition-shadow hover:shadow-lg">
                    <div className="w-20 shrink-0">
                      <QRPreview
                        data={`${envClient.APP_URL}/r/${code.slug}`}
                        options={design}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{code.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">
                        {code.destination_url}
                      </p>
                      <p className="mt-2 font-mono text-xs text-ink-soft">
                        /r/{code.slug}
                      </p>
                      <div className="mt-2">
                        <Badge tone="green">{code.scan_count} scans</Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {used >= limits.maxCodes && limits.maxCodes <= 3 ? (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 border-copper/40 bg-copper/5 p-5">
          <p className="text-sm text-ink-soft">
            You&apos;ve used all {limits.maxCodes} free codes. Pro raises the
            limit to 500 — and your existing codes keep working either way.
          </p>
          <ButtonLink href="/account#upgrade" variant="accent">
            Upgrade to Pro
          </ButtonLink>
        </Card>
      ) : null}
    </div>
  );
}
