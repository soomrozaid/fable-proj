import type { Metadata } from "next";
import Link from "next/link";
import { StaticGenerator } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: "Free vCard QR Code Generator — Scan to Save Your Contact",
  description:
    "Create a free contact (vCard) QR code for business cards, email signatures, and booths. One scan saves your name, phone, email, and company. No expiration, PNG & SVG.",
  alternates: { canonical: "/vcard-qr-code-generator" },
};

const FAQS = [
  {
    q: "What does a vCard QR code do?",
    a: "It encodes a standard vCard (VERSION 3.0) with your name, company, phone, email, and website. When someone scans it, their phone offers to save you as a contact — every field filled in, no typos.",
  },
  {
    q: "Does it work on iPhone and Android?",
    a: "Yes. Both camera apps recognize vCard codes natively and open the 'add contact' screen directly.",
  },
  {
    q: "Will the code expire?",
    a: "Never. Your details are embedded in the pattern itself. It keeps working as long as the print exists.",
  },
  {
    q: "What if my phone number changes?",
    a: "A static vCard code can't be edited after printing. If your details change often, a Scanstone dynamic code pointing at a personal page may serve you better — you can re-point it anytime, free.",
  },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function VcardQRPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd />
      <div className="max-w-2xl">
        <h1 className="engraved text-3xl font-semibold sm:text-4xl">
          vCard QR code generator — one scan, saved contact
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Put it on your business card, badge, booth banner, or email signature.
          One scan opens &ldquo;add contact&rdquo; with everything filled in.
          Free, no account, and it never expires.
        </p>
      </div>

      <div className="mt-10">
        <StaticGenerator initialMode="vcard" />
      </div>

      <section className="mt-16 max-w-2xl" aria-labelledby="vcard-faq">
        <h2 id="vcard-faq" className="engraved text-2xl font-semibold">
          Straight answers
        </h2>
        <dl className="mt-6 space-y-5">
          {FAQS.map((f) => (
            <div key={f.q} className="border-b border-line pb-5">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-ink-soft">
          More free tools: the{" "}
          <Link
            href="/qr-code-generator"
            className="text-verdigris-deep underline"
          >
            QR code generator
          </Link>{" "}
          and the{" "}
          <Link
            href="/wifi-qr-code-generator"
            className="text-verdigris-deep underline"
          >
            WiFi QR generator
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
