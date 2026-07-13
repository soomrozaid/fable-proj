# Scanstone — Product Specification

**One sentence:** Create QR codes that keep working forever — and change where they point after they're printed.

## Demand evidence (2026-07-12)
- Bitly's qr-code-generator.com: 1.5/5 on Trustpilot (349 reviews). Pattern: hidden 14-day trial silently kills printed codes; surprise ~$119.88 annual renewals; refunds refused.
- "free qr code generator no expiration" is a high-intent search cluster large enough that ~10 competitors publish SEO pages targeting it (kode.link, qrtrac, qrcodekit, makebranded, etc.).
- Willingness to pay proven: IMQRScan $2.99/mo, Scanova $5/mo, QR Tiger $7/mo, Bitly $8/mo, Beaconstac $15/mo.
- Adjacent pain: marketers juggle "a spreadsheet for UTMs, a shortener, and a separate QR tool — nothing connected."

## Customer & trigger
- **Customer:** small business owners, restaurant operators, marketers, event organizers, freelancers producing print material.
- **Trigger:** (a) about to send something to print, (b) a printed code just died or a redirect provider burned them, (c) needs to know if anyone actually scans their print material.

## Value proposition
- **Free static codes, actually free:** unlimited, no signup, no expiry — the codes contain the URL itself; we couldn't turn them off if we wanted to. (Acquisition tool.)
- **Dynamic codes with a covenant:** short-URL redirect codes whose destination is editable and whose scans are counted. **The covenant: redirects never stop working — not on downgrade, not over limits, not on cancellation.** Analytics pause; redirects don't.

## Core workflow
1. Sign up (email+password or magic link).
2. Create a dynamic code: name + destination URL → get slug `scanstone.../r/{slug}` rendered as customizable QR (colors, corner style) → download SVG/PNG at print resolution.
3. Print it. Scans 302-redirect in <100ms and log {time, country, device, OS, referrer} — no cookies, no IP stored.
4. Edit destination anytime; analytics dashboard per code; CSV export (Pro).

## Plans
- **Free:** 3 active dynamic codes, 30-day analytics window, PNG download, all static tools.
- **Pro ($9/mo or $79/yr):** 500 dynamic codes, full analytics history, SVG/vector download for dynamic codes, CSV export.
- Entitlements enforced server-side at creation/display; **redirects are never entitlement-gated** (the covenant).

## Distribution (built into product)
1. Free static generator pages (no signup): `/qr-code-generator`, `/wifi-qr-code-generator`, `/vcard-qr-code-generator` — target the burned-user search cluster with honest copy + FAQ structured data.
2. Every downloaded free code is genuine value delivered before any ask.
3. Public `/demo` analytics page — shareable proof of the paid product.
4. The covenant itself is the story communities repost (anti-subscription-trap positioning).

## Explicit non-goals (v1)
Bulk CSV import, team seats, custom domains for redirects, API access, logo-in-QR upload (design presets only), UTM manager. Listed for v2 consideration.

## Brand
- Name: **Scanstone** ("set in stone"). Metaphor: permanence, engraving, ink on stone.
- Look: engraved/lithograph aesthetic — warm paper & ink-black, one accent (verdigris/copper), serif display type, tactile texture. NOT purple-gradient SaaS.
- 3D: hero shows an actual scannable extruded QR code (pointing at the production URL) — the stone stays fixed while its destination swaps, dramatizing "edit after print."
