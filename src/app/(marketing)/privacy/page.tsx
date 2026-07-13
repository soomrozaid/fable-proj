import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Scanstone handles your data — and the data of people who scan your codes.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="engraved text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-faint">Effective July 12, 2026</p>

      <div className="prose-scanstone mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-lg font-semibold text-ink">The short version</h2>
          <p className="mt-2">
            We store what we need to run your account and count scans of your
            codes — nothing more. We don&apos;t sell data, we don&apos;t run ad
            trackers, and we deliberately avoid collecting anything about the
            people who scan your codes beyond anonymous, aggregate-friendly
            fields.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            Data we hold about you (account holders)
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Email address and a hashed password (or magic-link login) — via
              Supabase Auth.
            </li>
            <li>
              The QR codes you create: name, destination URL, design settings.
            </li>
            <li>
              Plan and billing status. Card details are held by Stripe, never by
              us.
            </li>
            <li>
              Standard server logs (kept briefly for security and debugging).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            Data recorded when someone scans a code
          </h2>
          <p className="mt-2">For each scan of a dynamic code we record:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Timestamp</li>
            <li>
              Country and region (derived from the network by our host; the IP
              itself is not stored)
            </li>
            <li>
              Coarse device class (mobile / tablet / desktop) and operating
              system family
            </li>
            <li>Referring page, when the browser sends one</li>
          </ul>
          <p className="mt-2">
            We do not store IP addresses in scan records, set cookies on
            scanners, or fingerprint devices. Scanners are never identified
            individuals to us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            Free generator tools
          </h2>
          <p className="mt-2">
            Static QR codes (link, text, WiFi, vCard) are generated entirely in
            your browser. The content you type — including WiFi passwords —
            never reaches our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            Processors we rely on
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Supabase — database and authentication (US region)</li>
            <li>Stripe — payments and invoices</li>
            <li>
              Vercel — hosting and privacy-friendly, cookieless site analytics
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Your controls</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Export everything (codes + scan data) from your account page, any
              time.
            </li>
            <li>
              Delete your account from the account page — codes, scan history,
              and login are removed immediately and permanently.
            </li>
            <li>Cancel billing self-serve via the billing portal.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Contact</h2>
          <p className="mt-2">
            Privacy questions: email{" "}
            <a
              href="mailto:soomrozaid@gmail.com"
              className="text-verdigris-deep underline"
            >
              soomrozaid@gmail.com
            </a>
            . We&apos;ll answer plainly.
          </p>
        </section>
      </div>
    </main>
  );
}
