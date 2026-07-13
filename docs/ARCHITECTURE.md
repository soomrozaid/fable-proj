# Architecture

## System
- **Next.js App Router (TS strict)** on Vercel (Fluid Compute, Node runtime).
- **Supabase**: Postgres + Auth (email/password + magic link). Project `mokpddtzkmaxlbjnejvf` (us-east-2).
- **Stripe**: subscriptions (Pro monthly/yearly), Checkout + Customer Portal + webhooks.
- No other external services.

## Environment contract (canonical, framework-neutral)
Canonical vars: `APP_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID`.
- `src/config/env.server.ts` — zod-validated, server-only (throws if missing; imports `server-only`).
- `src/config/env.client.ts` — zod-validated allowlist: APP_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, STRIPE_PUBLISHABLE_KEY.
- `next.config.ts` maps canonical → `NEXT_PUBLIC_*` build-time aliases (adapter layer only; canonical names remain source of truth in Vercel/local env).

## Data model (all tables RLS-enabled)
- `profiles` (id = auth.users.id, plan free|pro, stripe_customer_id, stripe_subscription_id, current_period_end) — user reads own; plan/stripe cols writable only by service role.
- `qr_codes` (id, user_id, slug unique, name, destination_url, design jsonb, scan_count, created/updated) — owner CRUD via RLS; slug lookup for redirect via service role.
- `scans` (id, code_id, scanned_at, country, region, device, os, referer) — insert service-role only (SECURITY DEFINER `record_scan`), owner SELECT via join policy.
- `stripe_events` (id, processed_at) — webhook idempotency; service-role only.
- Trigger creates `profiles` row on auth.users insert.

## Key routes
- `/` landing (R3F hero: scannable extruded QR, destination-swap animation; SVG fallback).
- `/qr-code-generator`, `/wifi-qr-code-generator`, `/vcard-qr-code-generator` — free static tools (client-side generation, SEO + FAQ JSON-LD).
- `/pricing`, `/demo` (public seeded analytics), `/privacy`, `/terms`.
- `/login /signup /forgot-password /reset-password /auth/callback /auth/confirm`.
- `/dashboard` (list/create), `/dashboard/codes/[id]` (edit, design, analytics, export), `/account` (plan, billing portal, data export, delete account).
- `GET /r/[slug]` — redirect fast path: service-role lookup → 302 → `waitUntil(record_scan)`. Never gated.
- `POST /api/stripe/checkout`, `POST /api/stripe/portal`, `POST /api/stripe/webhook` (sig verify + idempotent), `GET /api/account/export`.
- `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `manifest.ts`.

## QR pipeline
`qrcode-generator` → boolean matrix → `src/lib/qr/svg.ts` renders themed SVG (module shape presets, palette presets, quiet zone, ECC M/Q). PNG export client-side (canvas rasterize at chosen px). Server renders SVG for dashboard previews and og images.

## Entitlements
`src/lib/plans.ts` — single source: FREE {codes:3, historyDays:30, svgDynamic:false, csv:false}, PRO {codes:500, historyDays:∞, svgDynamic:true, csv:true}. Checked in server actions; RLS prevents cross-user access regardless.

## Security posture
- Secrets only in env.server (server-only module guard). Webhook sig verification. RLS everywhere. Zod on every input. Destinations http/https only, ≤2048 chars, private-network hosts rejected. Per-user create rate caps + per-IP auth-route rate limit (Postgres counter). No PII in scans. CSRF: mutations via server actions (origin-checked) + auth'd route handlers.

## Testing
- Vitest: qr svg renderer, slug, validation, plans, webhook idempotency (mocked).
- Playwright: marketing pages, free tool download, auth flows, code CRUD, redirect+scan, entitlement caps, checkout session creation (test mode), portal, isolation (user A cannot read user B via API), mobile viewport, reduced-motion, console-error checks. Post-deploy smoke suite runs against production URL.
