# Known Issues

_(kept current; entries removed when fixed)_

1. **No Content-Security-Policy header yet.** Other hardening headers are in
   place (nosniff, frame-deny, referrer-policy, permissions-policy). A strict
   CSP with Next.js requires per-request nonces; planned post-launch. Risk is
   mitigated by the absence of user-generated HTML anywhere.
2. **npm audit: moderate advisory on postcss** — transitive inside Next.js's
   build tooling only (never serves traffic); npm's suggested "fix" is a
   downgrade to Next 9. Revisit on the next Next.js release.
3. **Analytics aggregation happens in JS** over the last ≤5000 scans per code.
   Fine at launch volume; move to SQL aggregation RPCs when codes routinely
   exceed thousands of scans/month.
4. **Marketing pages are server-rendered per request** (nav reads auth
   cookies). Could go static + client-side auth chip if TTFB matters later.
5. **Supabase built-in SMTP** — email confirmations are disabled (autoconfirm)
   because the built-in allowance (~2 emails/hour) can't carry signups.
   Password-reset and magic-link emails work but share that allowance. Fix:
   custom SMTP (see HUMAN_ACTIONS).
