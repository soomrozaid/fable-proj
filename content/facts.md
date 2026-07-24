# facts.md — the content pipeline's single source of truth

**Rule for any drafting (human or AI): every factual/numeric/comparative claim in
published content must trace to this file.** No inventing statistics, prices, or
ratings. If a needed fact isn't here, add it here (with a source + date) first, or
don't make the claim. Re-verify dated facts each quarter.

---

## Product facts (Scanstone)

- **Static QR codes:** free forever, unlimited, no account, no watermark, no
  expiration. The content is encoded in the pattern itself — there is nothing to
  switch off. Download PNG (2048px) or vector SVG.
- **Dynamic QR codes:** editable destination after printing + cookieless scan
  analytics (no IPs, no fingerprinting, coarse country/region/device only).
- **The Covenant (verbatim promise):** a Scanstone redirect is **never disabled by
  billing state** — not on downgrade, not on cancel, not on hitting a limit. Cancel
  and your printed codes keep resolving; you only lose paid extras. Enforced in code:
  the `/r/[slug]` redirect path runs zero plan/entitlement checks.
- **Plans:**
  - Free — unlimited static, **3** dynamic codes, 30-day analytics history, PNG.
  - Pro — **$9/month or $79/year** (~2 months free), **500** dynamic codes, full
    analytics history forever, SVG + CSV export.
- **Domain:** `www.scanstone.ca` (canonical). Redirects also resolve on the legacy
  `scanstone.vercel.app` (kept alive permanently for previously printed codes).
- **Tech:** Next.js + Supabase + Stripe on Vercel. Own QR renderer (matrix → styled
  SVG, decode-verified in CI). One-liner: *"Scanstone — a QR code generator whose
  codes keep working even if you stop paying."*

## Static vs dynamic (the mechanism — cite freely)

- **Static:** data lives in the pattern. No server in the scan path. Cannot expire,
  cannot be billed, cannot be switched off. Right choice for fixed links, WiFi,
  vCards, plain text.
- **Dynamic:** the pattern encodes a short link to a redirect server, which forwards
  the scan. Enables editing-after-print + analytics, but introduces a middleman that
  *can* be switched off. Worth paying for only with a no-shutoff guarantee.

## The trap (what competitors do) — sourced, dated

- qr-code-generator.com (`www.qr-code-generator.com`) rated **~1.6 / 5 ("Bad")** on
  Trustpilot; the `my.` subdomain ~2.2/5. Ratings fluctuate 1.5–2.8 across pages.
  Source: <https://www.trustpilot.com/review/www.qr-code-generator.com>. Verified
  2026-07-24.
- Dominant complaint pattern (from those reviews): "free" codes that are actually
  **14-day trials of dynamic codes**; scans hit a paywall after the trial; reviewers
  report **~£130 (~$165)/year** to keep printed codes working; **auto-renewal without
  notice**; difficult cancellation/refunds; minimal support.
- Competitor **dynamic** pricing, 2026 ("starting at"): QR Tiger ~$7/mo · Bitly
  ~$10/mo · Uniqode (ex-Beaconstac) ~$15/mo · Flowcode Pro ~$60/mo · top tiers
  (Flowcode Growth / Uniqode teams) $250+/mo. Range **$7–$250+/mo**.
  Sources: <https://www.jotform.com/blog/qr-code-cost/>,
  <https://qrcodenova.com/en/blog/qr-code-generator-pricing-comparison>. Verified
  2026-07-24.
- Competitors to name in comparisons: qr-code-generator.com, Bitly, Uniqode
  (Beaconstac), QR Tiger (QRTiger), Flowcode, ME-QR.

## Search Console reality (internal, do not publish)

- As of 2026-07: ~10 impressions/90d, avg position 70–90 for the target cluster on
  the old vercel.app property. New domain `scanstone.ca` just made canonical. Wedge
  clusters to win first: never-expire / permanent, code-stopped-working / rescue,
  competitor "is it free", static-vs-dynamic.

## Internal link targets (use where relevant)

- `/qr-code-generator` — free static generator (primary CTA)
- `/wifi-qr-code-generator`, `/vcard-qr-code-generator` — format tools
- `/pricing` — plans + the covenant
- `/demo` — live dynamic code with real analytics
- `/blog/qr-code-subscription-trap` — the cornerstone investigation (hub)

## Voice & guardrails

- Voice: **"Straight answers."** Plain, exact, a little literary; empathetic to the
  burned user; never salesy. Product appears **once**, as the honest resolution.
- Answer the query in the **first sentence**. Include ≥1 concrete number and ≥1 cited
  source per piece. Self-contained FAQ answers (survive being quoted out of context).
- **Banned phrases:** "in today's digital world / fast-paced world", "unlock the
  power of", "look no further", "game-changer", "revolutionize", "seamless",
  "in conclusion", "elevate your". If a sentence could sit on any competitor's blog,
  rewrite it.
