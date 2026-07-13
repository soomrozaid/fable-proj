# Decision Log

| # | Date | Decision | Why |
|---|------|----------|-----|
| 1 | 07-12 | Product: Scanstone (dynamic QR + honest free static tool) | Strongest demand evidence of researched spaces: hated incumbent (1.5/5), high-intent burned-user search cluster, proven $3–15/mo WTP, zero third-party APIs, structural retention (printed codes need live redirects). Rejected: testimonial tools (loved incumbents), UTM managers (weaker free-tool wedge; partial overlap anyway), invoice/form/signature spaces (dominant free incumbents or OAuth-verification blockers). |
| 2 | 07-12 | The Covenant: redirects never gated by plan/limits/cancellation | It IS the differentiator vs. the subscription-trap incumbent; also near-zero marginal cost. Analytics/creation are the paid surface. |
| 3 | 07-12 | Stack: Next.js App Router + TS strict + Tailwind v4 + Supabase + Stripe + R3F | Boring, reliable, first-class on Vercel; strong Supabase/Stripe patterns; R3F for the mandated purposeful WebGL. |
| 4 | 07-12 | QR rendering: `qrcode-generator` matrix + our own SVG renderer | Full design control (module shapes, palettes, quiet zone), deterministic, works server+client, no native deps, no external API. PNG via client canvas. |
| 5 | 07-12 | Redirect `/r/[slug]`: route handler + service-role lookup, 302, fire-and-forget scan log via `waitUntil` | Fast path; scan logging must never block or break the redirect. |
| 6 | 07-12 | Privacy: no cookies on redirect, no IP stored; country from Vercel geo headers, coarse UA class only | Avoids consent-banner burden; is itself a selling point; lowers regulatory risk. |
| 7 | 07-12 | Pricing: Free (3 codes) / Pro $9 mo / $79 yr | Mid-market vs competitors ($3–15); simple two-tier freemium matches "free utility + paid workflow" evidence. |
| 8 | 07-12 | Stripe LIVE mode in production (live keys exist); full flow tested in TEST mode locally | Instruction: bill at highest mode credentials allow. No real charges made by me; live checkout verified up to the payment page. |
| 9 | 07-12 | Auth emails via Supabase built-in SMTP for launch | Zero extra deps; custom SMTP noted in HUMAN_ACTIONS for deliverability upgrade. Stripe sends receipts. |
| 10 | 07-12 | Entitlements enforced in server actions/route handlers + RLS as backstop | Never client-only. |
| 11 | 07-12 | Scan counts always recorded; free plan limits the *display window* (30d), not collection | Honest UX; upgrade unlocks history retroactively — a natural upsell moment. |
| 12 | 07-12 | Destination URLs restricted to http/https, blocklist checks, length caps | XSS/abuse control on the open-redirect surface. |
| 13 | 07-12 | Brand: engraved-lithograph aesthetic (paper/ink/verdigris), serif display | Derived from permanence metaphor; deliberately unlike generic SaaS gradients. |
| 14 | 07-12 | Analytics: Vercel Web Analytics + structured JSON logs | Zero-config on Vercel, free tier, enough to see failures + usage. |
| 15 | 07-12 | Hand-scaffold Next.js (no create-next-app) | Non-empty repo dir; full control over config; avoids generator conflicts. |
