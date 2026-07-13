# Operations Runbook

Production: **https://scanstone.vercel.app** (Vercel project `fable-proj`,
domain pinned to the project — new production deploys keep it).

## Deploy

```bash
npm run lint && npm run typecheck && npm test && npm run build   # gate
vercel deploy --prod --yes
PLAYWRIGHT_BASE_URL=https://scanstone.vercel.app npx playwright test --grep @smoke
```

Rollback: `vercel rollback` (or promote a previous deployment in the Vercel
dashboard). DB migrations are additive; never destructive without a backup.

## Environment

Canonical vars (see `.env.example`) live in Vercel (production) and
`.env.local` (dev, Stripe TEST mode). Change with
`vercel env add NAME production` (pipe the value via stdin; never paste
secrets into commands). After env changes, redeploy.

## Supabase (project `mokpddtzkmaxlbjnejvf`)

- Migrations: add SQL file under `supabase/migrations/`, then
  `supabase db push --linked --yes`.
- Auth config: edit `supabase/config.toml`, then `supabase config push --yes`.
  Site URL + redirect allowlist live there.
- Backups: hosted Supabase keeps daily backups (free tier: 7 days). Before
  risky migrations: Dashboard → Database → Backups.
- Email: confirmations are OFF (autoconfirm) because built-in SMTP allows only
  ~2 emails/hour. Password-reset + magic-link emails share that allowance —
  configure custom SMTP (Dashboard → Auth → SMTP) and re-enable confirmations
  in config.toml when a sending domain exists.

## Stripe (account `acct_1TsaTn2LwqRiisrs`)

- LIVE product `prod_UsMjtazvXeoJ9d`; prices `price_1Tsbzh2LwqRiisrsGbGxrhDt`
  ($9/mo), `price_1Tsbzi2LwqRiisrsRbqHuKcp` ($79/yr).
- TEST product `prod_UsMi8zu1sDxhQ4`; prices `price_1Tsbz82LwqRiisrs2qeZssZd`,
  `price_1Tsbz82LwqRiisrsYQVYc7OD` (used by `.env.local`).
- LIVE webhook endpoint `we_1Tsci52LwqRiisrsyDmoWEBn` →
  `https://scanstone.vercel.app/api/stripe/webhook`
  (events: checkout.session.completed, customer.subscription.created/updated/deleted).
- Entitlements flow exclusively through the webhook → `profiles.plan`. If a
  customer says "I paid but I'm not Pro": Stripe Dashboard → webhook endpoint →
  check delivery attempts; replaying the event is safe (idempotency table
  `stripe_events`).
- Local billing testing: `stripe listen --forward-to
  localhost:3000/api/stripe/webhook` + card 4242 4242 4242 4242.

## Changing the domain (when a custom domain is purchased)

1. `vercel domains add <domain>` (project `fable-proj`).
2. `vercel env` — update `APP_URL` (production) to the new origin; redeploy.
3. `supabase/config.toml` — update `site_url` + `additional_redirect_urls`;
   `supabase config push --yes`.
4. Stripe: `stripe webhook_endpoints update we_1Tsci52LwqRiisrsyDmoWEBn
   --url https://<domain>/api/stripe/webhook` (live key).
5. Re-run prod smoke tests. Note: previously printed dynamic codes embed the
   old origin — keep `scanstone.vercel.app` assigned to the project forever so
   they keep resolving (the covenant).

## Monitoring

- Runtime logs: `vercel logs scanstone.vercel.app` — structured JSON events:
  `scan_record_failed`, `webhook_processing_failed`, `checkout_create_failed`,
  `code_create_failed`, `account_delete_failed` are the ones that matter.
- Traffic: Vercel Analytics tab (cookieless, enabled via `@vercel/analytics`).
- DB health: Supabase Dashboard → Reports.

## Routine tasks

- Demo reseed: `set -a; source .env.local; set +a; node scripts/seed-demo.mjs`
- Delete abusive code (ToS §4): delete the row in `qr_codes` (Dashboard SQL) —
  the only sanctioned service-side redirect removal.
