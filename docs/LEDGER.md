# Task Ledger

Status: ✅ done · ⛔ blocked (see HUMAN_ACTIONS.md)

## Research & strategy
- ✅ Demand research (QR trap complaints, burned-user search cluster, competitor pricing)
- ✅ Product selection: Scanstone · spec / architecture / decisions recorded

## Build
- ✅ Next.js 16 scaffold, typed env modules (zod, server-only guard), canonical env contract
- ✅ Supabase migration `20260712000001_init`: profiles, qr_codes, scans, stripe_events,
     rate_limits, RLS on all, `record_scan` + `hit_rate_limit` (definer, anon-revoked), triggers
- ✅ Auth: signup (autoconfirm), login, magic link, password reset, callback, signout, route guards
- ✅ QR engine: matrix → themed SVG (3 shapes, 6 palettes, safe finder eyes), PNG@2048 export,
     decode-verified in tests (incl. UTF-8, WiFi, vCard payloads, XSS-safety)
- ✅ Dashboard: list/create/edit/delete codes, live preview, contrast guard, entitlement caps
- ✅ Redirect fast path `/r/[slug]` + fire-and-forget scan logging (geo, coarse UA, no PII)
- ✅ Analytics: day series chart, country/device/source breakdowns, CSV export (Pro)
- ✅ Stripe: products+prices in TEST and LIVE, checkout, customer portal (default configs in
     both modes), signature-verified idempotent webhook, entitlement sync
- ✅ Account: plan management, data export (JSON), account deletion (cancels subscription)
- ✅ Marketing: landing w/ R3F stone hero (scannable, reduced-motion + no-WebGL fallbacks),
     3 free-tool SEO pages, pricing, live demo, privacy, terms
- ✅ SEO: sitemap, robots, OG image, icons, manifest, FAQ/WebApplication JSON-LD
- ✅ Analytics/logging: Vercel Web Analytics + structured JSON logs

## Verify
- ✅ Vitest: 35 tests (QR decode-verification, validation, slugs, plans, UA)
- ✅ Playwright local: 27 tests incl. full billing cycle (4242 checkout → webhook → pro →
     cancel → free), isolation, entitlements, mobile (WebKit), reduced motion, keyboard
- ✅ Visual review loop: 2 iterations (font pipeline fix, CTA contrast fix, hero camera fix)
- ✅ Security review: webhook idempotency hardening, secret scan, RLS probes, header set,
     SSRF/XSS/CSRF walkthrough (see DECISIONS #12, KNOWN_ISSUES)
- ✅ Lint, typecheck, prod build clean

## Ship
- ✅ Vercel production env (9 canonical vars), framework preset, deploy
- ✅ Domain `scanstone.vercel.app` pinned to project
- ✅ Supabase auth site_url + redirect allowlist → production URL
- ✅ LIVE Stripe webhook endpoint `we_1Tsci52LwqRiisrsyDmoWEBn` → production URL
- ✅ Production tests: 26 e2e green against https://scanstone.vercel.app, live checkout
     page reached (no charge), unsigned webhook 400, real geo scan recorded (CA/SK)
- ✅ Demo seeded (`/demo`, code `cafemenu`, ~1000 scans, future rows pruned)
- ✅ README / OPERATIONS docs
- ✅ Repo pushed
- ✅ Launch assets & distribution prep (see docs/LAUNCH.md)

## Delegation log
| Task | Agent/model | Outcome |
|------|-------------|---------|
| All tasks executed inline by orchestrator | — | Cold-start context transfer for bounded subtasks cost more than inline execution in every case evaluated; no delegation used. |
