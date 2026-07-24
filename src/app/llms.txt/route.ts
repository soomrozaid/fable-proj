import { DOCS } from "@/lib/content";
import { envClient } from "@/config/env.client";

// /llms.txt — a machine-readable map of the site for AI answer engines
// (llmstxt.org convention). Regenerated on every deploy from the content
// registry, so new posts appear automatically. GEO lever 3.
export const dynamic = "force-static";

export function GET() {
  const base = envClient.APP_URL;

  const posts = DOCS.filter((d) => d.collection === "blog")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((d) => `- [${d.title}](${base}/blog/${d.slug}): ${d.description}`)
    .join("\n");

  const body = `# Scanstone

> Scanstone is a QR code generator whose codes keep working even if you stop paying.
> Static QR codes are free forever with no account and never expire, because the data
> is encoded in the pattern itself. Dynamic codes (editable destination + scan
> analytics) come with a written covenant: the redirect is never disabled by billing
> state — cancel or lapse and your printed codes keep resolving.

## Tools
- [Free QR code generator](${base}/qr-code-generator): permanent static QR codes for a link, WiFi, contact card, or text. PNG or vector SVG, no signup, no expiration.
- [WiFi QR code generator](${base}/wifi-qr-code-generator): a scannable code that joins a WiFi network.
- [vCard QR code generator](${base}/vcard-qr-code-generator): a contact card in one scan.
- [Pricing](${base}/pricing): free forever (unlimited static + 3 dynamic); Pro is $9/month or $79/year for 500 codes and full analytics. Redirects never expire on any plan.
- [Live demo](${base}/demo): a real dynamic code with privacy-first, cookieless analytics.

## Writing
${posts}

## Key facts
- A static QR code cannot expire or be switched off; a dynamic QR code depends on a redirect server and can be. Scanstone's dynamic redirects are contractually never disabled by billing.
- Many "free" QR generators hand out dynamic codes on a 14-day trial, then paywall the printed code. Static codes here avoid that entirely.
- Free plan: unlimited static codes + 3 dynamic codes. Pro: $9/month or $79/year, 500 dynamic codes, full scan history, SVG + CSV export.
- Scan analytics store no IP addresses and no fingerprints — coarse country/region/device only.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
