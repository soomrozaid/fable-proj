import type { Metadata } from "next";
import { HeroVisual } from "@/components/hero/Hero";
import { ButtonLink, Card, Badge } from "@/components/ui";
import { ScanChart } from "@/components/analytics/ScanChart";
import { BreakdownList } from "@/components/analytics/BreakdownList";
import { PRICING } from "@/lib/plans";
import { envClient } from "@/config/env.client";

export const metadata: Metadata = {
  title: { absolute: "Scanstone — QR codes that keep working. Set in stone." },
  description:
    "Free QR codes with no expiration, no trial, no trap — plus dynamic QR codes you can re-point after printing, with scan analytics. Redirects keep working even if you stop paying.",
  alternates: { canonical: "/" },
};

const FAQS = [
  {
    q: "Do Scanstone QR codes expire?",
    a: "No. Free static codes contain your content directly — we couldn't turn them off if we wanted to. Dynamic codes redirect through Scanstone, and we commit to keeping every redirect alive: downgrading, exceeding limits, or cancelling never breaks a code. Only deleting a code yourself does.",
  },
  {
    q: "What happens to my codes if I stop paying?",
    a: "They keep redirecting. You lose the Pro extras — full analytics history, vector downloads, CSV export — but every printed code keeps working. We think anything else is holding your print materials hostage.",
  },
  {
    q: "Can I change where a printed QR code points?",
    a: "Yes — that's what a dynamic code is for. The printed pattern encodes a permanent short link; you change its destination from the dashboard any time, and every existing print instantly points to the new page.",
  },
  {
    q: "What's the difference between static and dynamic codes?",
    a: "A static code embeds the content itself (URL, WiFi login, contact card) — free, unlimited, and permanent, but not editable after printing. A dynamic code embeds a short redirect link, so you can edit the destination later and see scan counts, locations, and devices.",
  },
  {
    q: "Do you track the people who scan?",
    a: "Minimally and anonymously. We record the scan's country, device type, and time — no cookies, no IP addresses stored, no fingerprinting, no consent banner needed. Enough for you to know what's working; nothing that follows anyone around.",
  },
];

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const DEMO_SERIES = {
  days: [
    3, 5, 4, 9, 12, 8, 14, 11, 17, 13, 21, 18, 16, 24, 19, 26, 22, 31, 27, 25,
    34, 29, 38, 33, 30, 41, 36, 44, 39, 47,
  ].map((count, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400_000)
      .toISOString()
      .slice(0, 10),
    count,
  })),
  total: 731,
};

export default function LandingPage() {
  return (
    <main id="main">
      <FaqJsonLd />

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
        <div>
          <Badge tone="copper">No trials · No expiring codes · No traps</Badge>
          <h1 className="engraved mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            Print it once.
            <br />
            Change it forever.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            Scanstone makes QR codes that outlive the paper they&apos;re printed
            on: free static codes that never expire, and dynamic codes you can
            re-point after printing — with scan analytics that tell you
            what&apos;s actually working.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="/signup"
              variant="accent"
              className="px-6 py-3 text-base"
            >
              Start free — 3 dynamic codes
            </ButtonLink>
            <ButtonLink
              href="/qr-code-generator"
              variant="ghost"
              className="px-6 py-3 text-base"
            >
              Just need a quick QR? It&apos;s free
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-ink-faint">
            No credit card. And if you ever cancel, your codes keep redirecting.
          </p>
        </div>
        <HeroVisual />
      </section>

      <div className="hairline mx-auto max-w-5xl" />

      {/* THE PROBLEM */}
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
        aria-labelledby="problem-h"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
            The day-15 problem
          </p>
          <h2
            id="problem-h"
            className="engraved mt-3 text-3xl font-semibold sm:text-4xl"
          >
            You printed 500 menus. Then the &ldquo;free&rdquo; QR code died.
          </h2>
          <p className="mt-5 leading-relaxed text-ink-soft">
            It&apos;s the most common story in QR codes: a generator hands you a
            &ldquo;free&rdquo; code that is quietly a 14-day trial. The trial
            lapses, every scan hits a paywall page, and the fix costs $10–15 a
            month — forever — because the code is already on your tables, your
            flyers, your packaging. The largest provider in the space holds a{" "}
            <strong>1.5-star rating</strong> from exactly this pattern.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            We built Scanstone the other way around. Print is permanent, so the
            code has to be too.
          </p>
        </div>
      </section>

      {/* THE COVENANT */}
      <section className="bg-ink text-paper" aria-labelledby="covenant-h">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
              The covenant
            </p>
            <h2
              id="covenant-h"
              className="engraved mt-3 text-3xl font-semibold sm:text-4xl"
            >
              A Scanstone redirect never stops working.
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-3">
              <li className="border-l-2 border-verdigris pl-4">
                <h3 className="font-medium">Cancel your plan</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/70">
                  Your codes keep redirecting. You lose the extras, not the
                  code.
                </p>
              </li>
              <li className="border-l-2 border-verdigris pl-4">
                <h3 className="font-medium">Blow past your limits</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/70">
                  Scans never get blocked. Limits gate creating codes, never
                  scanning them.
                </p>
              </li>
              <li className="border-l-2 border-verdigris pl-4">
                <h3 className="font-medium">Never log in again</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/70">
                  Codes don&apos;t rot with inactivity. Print it and forget it.
                </p>
              </li>
            </ul>
            <p className="mt-8 text-sm text-paper/60">
              The only way a Scanstone code dies is if you delete it yourself.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
        aria-labelledby="how-h"
      >
        <h2 id="how-h" className="engraved text-3xl font-semibold sm:text-4xl">
          Three steps, one stone
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Carve",
              body: "Name your code, point it anywhere, pick the ink and carving style. Download print-ready PNG or vector SVG.",
            },
            {
              n: "02",
              title: "Print",
              body: "Menus, table tents, packaging, posters, business cards — the pattern is permanent, so print as many as you like.",
            },
            {
              n: "03",
              title: "Re-point, anytime",
              body: "New menu? Event over? Edit the destination in seconds. Every printed code follows. Watch scans roll in by day, country, and device.",
            },
          ].map((step) => (
            <li key={step.n}>
              <Card className="h-full p-6">
                <span className="font-mono text-sm text-copper">{step.n}</span>
                <h3 className="engraved mt-2 text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ANALYTICS PREVIEW */}
      <section
        className="mx-auto max-w-6xl px-4 pb-20 sm:px-6"
        aria-labelledby="analytics-h"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
              Know what the paper is doing
            </p>
            <h2
              id="analytics-h"
              className="engraved mt-3 text-3xl font-semibold sm:text-4xl"
            >
              Print, finally measurable
            </h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Every scan is counted the moment it happens — when, where, what
              device. Compare the poster by the door against the table tents.
              Know the flyer campaign worked before you reorder it.
            </p>
            <p className="mt-4 text-sm text-ink-faint">
              No cookies, no stored IPs, no consent banners — anonymous counts,
              not surveillance.
            </p>
            <div className="mt-6">
              <ButtonLink href="/demo" variant="ghost">
                Explore the live demo →
              </ButtonLink>
            </div>
          </div>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-medium">Spring menu — table tents</span>
              <Badge tone="green">731 scans</Badge>
            </div>
            <ScanChart series={DEMO_SERIES} title="Last 30 days (demo data)" />
            <div className="mt-5 grid grid-cols-2 gap-6">
              <BreakdownList
                title="Devices"
                items={[
                  { label: "mobile", count: 655, share: 0.9 },
                  { label: "tablet", count: 47, share: 0.06 },
                  { label: "desktop", count: 29, share: 0.04 },
                ]}
              />
              <BreakdownList
                title="Countries"
                items={[
                  { label: "United States", count: 587, share: 0.8 },
                  { label: "Canada", count: 96, share: 0.13 },
                  { label: "United Kingdom", count: 48, share: 0.07 },
                ]}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-paper-deep/60" aria-labelledby="who-h">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2
            id="who-h"
            className="engraved text-3xl font-semibold sm:text-4xl"
          >
            Made for things that get printed
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                who: "Restaurants & cafés",
                what: "One code on every table, re-pointed each time the menu changes. No reprints, no laminating day.",
              },
              {
                who: "Marketers & agencies",
                what: "Track scans per placement, export CSVs for the client report, swap landing pages mid-campaign.",
              },
              {
                who: "Event organizers",
                what: "Posters go up weeks early. Point the code at ticketing now, the schedule on the day, photos after.",
              },
              {
                who: "Makers & retail",
                what: "A code on the packaging that always leads to current instructions, manuals, or reorder pages.",
              },
            ].map((seg) => (
              <div key={seg.who}>
                <h3 className="font-medium">{seg.who}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {seg.what}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
        aria-labelledby="pricing-h"
      >
        <h2
          id="pricing-h"
          className="engraved text-3xl font-semibold sm:text-4xl"
        >
          Honest pricing, stated plainly
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="p-7">
            <h3 className="engraved text-xl font-semibold">Free</h3>
            <p className="mt-1 text-3xl font-semibold">$0</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-soft">
              <li>✓ Unlimited static QR codes — link, WiFi, contact, text</li>
              <li>✓ 3 dynamic codes with editable destinations</li>
              <li>✓ Scan counts with 30 days of history</li>
              <li>✓ Print-ready 2048px PNG downloads</li>
              <li>✓ The covenant: redirects never expire</li>
            </ul>
            <ButtonLink href="/signup" variant="ghost" className="mt-6 w-full">
              Start free
            </ButtonLink>
          </Card>
          <Card className="border-verdigris/50 p-7 ring-1 ring-verdigris/30">
            <div className="flex items-center justify-between">
              <h3 className="engraved text-xl font-semibold">Pro</h3>
              <Badge tone="green">For working print</Badge>
            </div>
            <p className="mt-1 text-3xl font-semibold">
              $9
              <span className="text-base font-normal text-ink-faint">
                /month
              </span>
            </p>
            <p className="text-sm text-ink-faint">
              or {PRICING.yearly.label} — {PRICING.yearly.note}
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-soft">
              <li>✓ Everything in Free</li>
              <li>✓ Up to 500 dynamic codes</li>
              <li>✓ Full scan history — every scan you&apos;ve ever had</li>
              <li>✓ Vector SVG downloads for professional printing</li>
              <li>✓ CSV export for reports</li>
            </ul>
            <ButtonLink href="/signup" variant="accent" className="mt-6 w-full">
              Go Pro
            </ButtonLink>
          </Card>
        </div>
        <p className="mt-6 text-center text-sm text-ink-faint">
          Cancel anytime, self-serve, from your account page. Codes keep working
          after — see the covenant above.
        </p>
      </section>

      {/* FAQ */}
      <section
        className="mx-auto max-w-3xl px-4 pb-20 sm:px-6"
        aria-labelledby="faq-h"
      >
        <h2 id="faq-h" className="engraved text-3xl font-semibold">
          Questions, answered straight
        </h2>
        <dl className="mt-8 space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="border-b border-line pb-6">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-lg border border-ink bg-ink p-10 text-center text-paper shadow-[var(--shadow-card)] sm:p-14">
          <h2 className="engraved text-3xl font-semibold sm:text-4xl">
            The next thing you print deserves a code that lasts.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-paper/70">
            Three dynamic codes free. Unlimited static codes free.{" "}
            <span className="text-paper">
              {envClient.APP_URL.replace(/^https?:\/\//, "")}
            </span>{" "}
            will keep them alive.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink
              href="/signup"
              variant="accent"
              className="px-6 py-3 text-base"
            >
              Create your first code
            </ButtonLink>
            <ButtonLink
              href="/qr-code-generator"
              className="border-paper/30 bg-transparent px-6 py-3 text-base text-paper hover:bg-paper/10"
              variant="ghost"
            >
              Use the free generator
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
