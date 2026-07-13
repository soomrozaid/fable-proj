# Scanstone

**QR codes that keep working. Set in stone.** — https://scanstone.vercel.app

Scanstone is a micro-SaaS for people who put QR codes on printed material:

- **Free static generator** (`/qr-code-generator`, `/wifi-qr-code-generator`,
  `/vcard-qr-code-generator`) — unlimited, no signup, no expiry, generated
  entirely in the browser.
- **Dynamic codes** — a printed code that redirects through
  `scanstone.vercel.app/r/{slug}`; the destination is editable after printing,
  and every scan is counted (time, country, device — no cookies, no IPs).
- **The covenant** — redirects are never disabled by billing state. Downgrade,
  lapse, cancel: printed codes keep working. Only deleting a code stops it.

**Plans:** Free (3 dynamic codes, 30-day analytics) · Pro $9/mo or $79/yr
(500 codes, full history, SVG download, CSV export).

## Stack

Next.js 16 (App Router, TS strict) · Tailwind v4 · React Three Fiber (hero) ·
Supabase (Postgres + Auth, RLS everywhere) · Stripe (Checkout, Portal,
webhooks) · Vercel (hosting + analytics). No other services.

## Development

```bash
npm install
cp .env.example .env.local   # fill in values (see docs/OPERATIONS.md)
npm run dev
# webhooks in a second terminal:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Quality gates

```bash
npm run lint && npm run typecheck   # static checks
npm test                            # vitest (incl. QR decode-verification)
npm run test:e2e                    # Playwright vs localhost:3000
PLAYWRIGHT_BASE_URL=https://scanstone.vercel.app npx playwright test \
  e2e/marketing.spec.ts e2e/workflow.spec.ts e2e/billing.spec.ts   # vs prod
```

E2E suites need `SUPABASE_URL` / `SUPABASE_SECRET_KEY` in the environment
(`set -a; source .env.local; set +a`). The full billing-cycle spec
(`billing-full.spec.ts`) runs only with test-mode Stripe keys + `stripe listen`.

## Repo map

- `docs/SPEC.md` — product spec & demand evidence
- `docs/ARCHITECTURE.md` — system design & env contract
- `docs/DECISIONS.md` — decision log
- `docs/OPERATIONS.md` — runbook (deploys, env, billing, domain changes)
- `docs/LEDGER.md` — build ledger
- `docs/KNOWN_ISSUES.md` — accepted debt
- `HUMAN_ACTIONS.md` — owner-only follow-ups
- `supabase/migrations/` — schema (RLS, record_scan, rate limiting)
- `scripts/seed-demo.mjs` — public demo data
