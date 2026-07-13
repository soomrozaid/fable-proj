import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRICING } from "@/lib/plans";
import { Card, Button, Badge } from "@/components/ui";
import { DeleteAccountButton } from "@/components/dashboard/DeleteAccountButton";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; billing_error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, current_period_end, stripe_customer_id")
    .eq("id", user.id)
    .single();
  const isPro = profile?.plan === "pro";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="engraved text-3xl font-semibold">Account</h1>

      {params.upgraded ? (
        <Card className="border-verdigris/40 bg-verdigris/5 p-4">
          <p className="text-sm text-verdigris-deep">
            <strong>Welcome to Pro.</strong> Your full scan history and vector
            downloads are unlocked. (If this still shows Free, give it a few
            seconds and refresh — the payment confirmation is on its way.)
          </p>
        </Card>
      ) : null}
      {params.billing_error ? (
        <Card className="border-danger/40 bg-danger/5 p-4">
          <p className="text-sm text-danger">
            Something went wrong talking to billing. Nothing was charged — try
            again in a minute.
          </p>
        </Card>
      ) : null}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Signed in as</h2>
            <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
          </div>
          <Badge tone={isPro ? "green" : "neutral"}>
            {isPro ? "Pro" : "Free"}
          </Badge>
        </div>
      </Card>

      <Card className="p-6">
        <h2 id="upgrade" className="scroll-mt-24 font-medium">
          Plan
        </h2>
        {isPro ? (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-ink-soft">
              You&apos;re on <strong>Pro</strong>
              {profile?.current_period_end
                ? ` — renews ${new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : ""}
              . Manage billing, change between monthly and yearly, download
              invoices, or cancel below. If you cancel,{" "}
              <strong>every code keeps redirecting</strong> — you only lose the
              Pro extras.
            </p>
            <form action="/api/stripe/portal" method="POST">
              <Button type="submit" variant="ghost">
                Manage billing
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-ink-soft">
              Free: 3 dynamic codes, 30-day analytics. Pro: up to 500 codes,
              full history, vector downloads, CSV export.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <form action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="interval" value="monthly" />
                <Button type="submit" variant="accent" className="w-full">
                  Go Pro — {PRICING.monthly.label}
                </Button>
              </form>
              <form action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="interval" value="yearly" />
                <Button type="submit" variant="ghost" className="w-full">
                  {PRICING.yearly.label} ({PRICING.yearly.note})
                </Button>
              </form>
            </div>
            <p className="text-xs text-ink-faint">
              Cancel anytime from this page. Your codes keep working regardless
              — that&apos;s the covenant.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-medium">Your data</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Download everything we hold about your codes and scans as JSON.
        </p>
        <a
          href="/api/account/export"
          className="mt-3 inline-block text-sm text-verdigris-deep underline"
        >
          Export my data
        </a>
      </Card>

      <Card className="border-danger/30 p-6">
        <h2 className="font-medium text-danger">Delete account</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Deletes your account, codes, and scan history permanently. Printed
          codes stop redirecting. Active subscriptions are cancelled.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </Card>
    </div>
  );
}
