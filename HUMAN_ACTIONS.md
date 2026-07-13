# Human Actions

Everything else has been completed autonomously. The product is launched,
live, tested, and can take a paying customer today. These items are the
remainder — each blocked only by identity, accounts, or purchases that require
the owner personally.

## Recommended within days
1. **Post the prepared launch content.** Ready-to-paste posts (Show HN,
   r/SideProject, Indie Hackers, Product Hunt, X thread) are in
   `docs/LAUNCH.md`. Blocked by: platform accounts/CAPTCHA. Smallest action:
   copy, paste, submit.
2. **Google Search Console + Bing Webmaster.** Verify
   https://scanstone.vercel.app (DNS or meta verification), submit
   `https://scanstone.vercel.app/sitemap.xml`. Blocked by: Google/Microsoft
   account login. (~5 min)
3. **Custom SMTP for Supabase Auth** (Dashboard → Auth → SMTP; e.g. Resend
   free tier). Built-in SMTP allows only ~2 emails/hour, so password-reset and
   magic-link emails are effectively rate-limited until this is set. After
   configuring, optionally re-enable signup confirmations in
   `supabase/config.toml` (`enable_confirmations = true`) and
   `supabase config push --yes`. Blocked by: creating the SMTP account. (~15 min)

## Recommended within weeks
4. **Custom domain** (e.g. scanstone.com). Purchase, then follow
   `docs/OPERATIONS.md → "Changing the domain"` (5 steps, ~15 min). Never
   unassign `scanstone.vercel.app` — printed codes embed it.
5. **Stripe live-mode business profile.** Confirm public business name,
   support email, and statement descriptor in the Stripe Dashboard so live
   receipts/invoices look right (Settings → Public details). Also enable
   "Email customers about successful payments" (Settings → Emails) for
   automatic receipts. Blocked by: Stripe Dashboard login. (~5 min)
6. **First live payment sanity check.** The full billing cycle is verified in
   test mode and the live checkout page is verified reachable; completing one
   real $9 charge (and refunding it) end-to-end requires a real card. (~5 min)

## Notes
- No other blockers exist. Free signup → code creation → printing → scanning →
  analytics → upgrade → cancellation all run unattended.
