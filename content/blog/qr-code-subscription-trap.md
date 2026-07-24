Search for a QR code generator and the first results are polished, confident, and enormous. They rank at the top of Google, run ads on the term, and call themselves free. Then read their reviews.

The most-marketed QR generator on the internet, [qr-code-generator.com](https://www.trustpilot.com/review/www.qr-code-generator.com), sits at roughly **1.6 out of 5 on Trustpilot** — a "Bad" rating — across thousands of reviews (as of July 2026). That is not the score of a product that doesn't work. The tool works fine. It's the score of a product that surprises people with a bill for something they thought they already had.

The reviews say the same thing over and over: *I made a free QR code, printed it, and two weeks later it stopped working unless I paid.* This isn't a bug or a scattering of unhappy edge cases. It's the design. Once you see how it works, you can't unsee it — and you'll never get caught by it again.

## The one design choice that sets the trap

There are two kinds of QR code, and the difference is the whole story.

A **static** QR code has your information baked directly into the pattern. If the code points to `example.com/menu`, those characters are physically encoded in the black-and-white squares. Nothing sits between the scan and the destination. No server, no account, no company. A static code works because of physics and math, not because someone keeps a subscription alive. It cannot be switched off, because there is nothing to switch off.

A **dynamic** QR code encodes a short link to the generator's server, and *that* server redirects the scan to your real destination. This is genuinely useful: you can change where the code points after it's printed, and you get scan analytics. But it introduces a middleman. Every single scan now depends on that company choosing to forward it. The redirect is a service, and a service can be turned off.

Here is the sleight of hand. Many "free" generators hand you a **dynamic** code by default, wrapped in a **14-day trial** — without making it clear that's what's happening. You see "free," you see a working QR code, you download it, and you print it on 500 menus. On day 15 the trial ends. The middleman stops forwarding. Every scan now lands on a paywall demanding payment to "reactivate" a code you already printed.

You didn't buy a QR code. You rented one, and the rent came due after the ink dried.

## What it actually costs

The trial trap works because the pressure arrives *after* you've committed. Reprinting 500 menus, table tents, flyers, or yard signs costs far more than the subscription — so people pay. Reviewers of qr-code-generator.com report being charged around **£130 (~$165) per year** to keep their printed codes alive, describe accounts that **auto-renew without warning**, and say cancellation and refunds are deliberately difficult.

Run the math on a code you can't afford to reprint:

| Years your printed code is in the wild | Annual "reactivation" fee | Total to keep your own code working |
| --- | --- | --- |
| 1 year | ~$150 | ~$150 |
| 3 years | ~$150 | ~$450 |
| 5 years | ~$150 | ~$750 |

That's the cost of a design decision you never knowingly agreed to. And it's not unique to one company — it's the prevailing model across the category. Dynamic-code subscriptions in 2026 run from about **$7/month (QR Tiger)** to **$10/month (Bitly)**, **$15/month (Uniqode)**, **$60/month (Flowcode Pro)**, and past **$250/month** at the top tiers ([Jotform](https://www.jotform.com/blog/qr-code-cost/), [QR Nova](https://qrcodenova.com/en/blog/qr-code-generator-pricing-comparison), 2026). Many of them start with the same "free" code that quietly needs a plan to keep resolving.

## Why it's built this way

None of these companies are run by villains. They're responding to an incentive. A static QR code is a one-time transaction with no recurring revenue — you make it, you leave, they earn nothing. A dynamic code that can be switched off is a subscription with the strongest retention mechanism ever invented: **your customers' printed materials are the hostage.** You will pay to keep your own menus working, indefinitely, because the alternative is a reprint.

So the product gets optimized in exactly the direction you'd expect. "Free" is placed where it captures the most sign-ups. The trial length is tuned to outlast the moment you print. The distinction between static and dynamic — the one fact that would protect you — is kept quiet. A 1.6-star rating is not a failure of that strategy. It's an acceptable cost of it.

## The 5-second test before you print anything

You can defuse the trap with one question, asked before you commit a code to paper:

1. **Does it require an account or a "trial" to download?** A genuinely static code needs neither. If you must sign up to get your "free" code, you're likely being handed a dynamic one on a timer.
2. **Does the pricing page mention "active" codes, reactivation, or codes that pause?** Those words mean the redirect can be switched off.
3. **Is the code short-and-branded** (like `qrco.de/abc123`) **or does it contain your real content?** You can check: paste the decoded value into any QR reader app. If it shows the generator's domain instead of yours, it's dynamic.
4. **Search the brand name + "expired" or "stopped working."** Thirty seconds of reviews will tell you everything the landing page won't.
5. **Ask directly: "if I stop paying, does my printed code keep working?"** If the answer is no — or if you can't get a straight answer — walk away before you print.

For a link, WiFi network, or contact card that will never change, you want a **static** code, and you should never pay a recurring fee for one. For a destination you'll edit later, a dynamic code is worth it — but only from someone who promises, in writing, that the redirect survives cancellation.

## What "free" should have meant all along

We built [Scanstone](/) because the trap made us angry, and because it doesn't have to be this way.

Static QR codes here are **free forever** — unlimited, no account, no watermark, no expiration. The content lives in the pattern, so there is nothing we could switch off even if we wanted to. That's not generosity; it's just honesty about what a static code is.

For dynamic codes — the editable, analytics-tracked kind that everyone else uses to hold your printing hostage — we made a promise and wrote it into the terms as a covenant: **the redirect is never disabled by billing state.** Cancel your plan, hit a limit, let it lapse entirely — your printed codes keep resolving. You lose the paid extras (longer analytics history, vector export), never the redirect. Three dynamic codes are free; [Pro is $9/month or $79/year](/pricing) if you need scale, and even then, the covenant is the same.

The difference between a 1.6-star category and a trustworthy one isn't better technology. Everyone can build a redirect. It's a single decision about whether the person who printed the code, or the company that hosts it, holds the power. We think it should be you.

Make your code, [download it](/qr-code-generator), print it, and forget about us. That's the whole point.

---

*Sources: [Trustpilot — qr-code-generator.com](https://www.trustpilot.com/review/www.qr-code-generator.com), [Jotform — how much a QR code costs in 2026](https://www.jotform.com/blog/qr-code-cost/), and [QR Nova — 2026 pricing comparison](https://qrcodenova.com/en/blog/qr-code-generator-pricing-comparison). Ratings and prices verified July 2026 and change over time; the mechanism doesn't.*
