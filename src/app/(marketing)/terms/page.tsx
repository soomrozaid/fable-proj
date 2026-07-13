import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Scanstone's terms — including the redirect covenant, in writing.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="engraved text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-faint">Effective July 12, 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-lg font-semibold text-ink">1. The service</h2>
          <p className="mt-2">
            Scanstone provides QR code generation (static and dynamic), redirect
            hosting for dynamic codes, and scan analytics. Free static codes are
            provided as-is, without an account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            2. The redirect covenant
          </h2>
          <p className="mt-2">
            We commit to keeping dynamic-code redirects operational regardless
            of your plan status: cancelling, downgrading, or exceeding plan
            limits will not disable existing redirects. Redirects end only if
            (a) you delete the code or your account, (b) the code violates
            section 4, or (c) Scanstone permanently shuts down — in which case
            we commit to at least 90 days&apos; email notice and a data-export
            window.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            3. Plans and billing
          </h2>
          <p className="mt-2">
            Pro is billed monthly or yearly via Stripe and renews automatically
            until cancelled. Cancel anytime from the billing portal; Pro
            features remain active until the end of the paid period. Limits
            (number of dynamic codes, analytics history, export features) are
            enforced at creation and display time — never at scan time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">4. Acceptable use</h2>
          <p className="mt-2">
            You may not use Scanstone codes to link to or distribute:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>malware, phishing pages, or credential-harvesting forms;</li>
            <li>content that is illegal in the United States;</li>
            <li>deceptive redirects that misrepresent their destination.</li>
          </ul>
          <p className="mt-2">
            We may disable codes that violate these rules — this is the sole
            service-side exception to the covenant — and will notify the account
            email when we do.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">5. Your content</h2>
          <p className="mt-2">
            You retain all rights to your destination URLs and content. You
            grant us only the technical license needed to store them and serve
            the redirects you configured.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">
            6. Warranty & liability
          </h2>
          <p className="mt-2">
            The service is provided &ldquo;as is.&rdquo; To the maximum extent
            permitted by law, our aggregate liability is limited to the amounts
            you paid us in the twelve months before a claim. We are not liable
            for the content of destination pages you or others configure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">7. Changes</h2>
          <p className="mt-2">
            We may update these terms; material changes will be announced to
            account emails at least 14 days in advance. Continued use after the
            effective date constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">8. Contact</h2>
          <p className="mt-2">
            Questions:{" "}
            <a
              href="mailto:soomrozaid@gmail.com"
              className="text-verdigris-deep underline"
            >
              soomrozaid@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
