import type { Metadata } from "next";
import Link from "next/link";
import { StaticGenerator } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: "Free QR Code Generator — No Expiration, No Sign-Up, No Watermark",
  description:
    "Generate a free QR code that never expires. No account, no trial, no watermark — download print-ready PNG or SVG instantly. Static codes are permanent by design.",
  alternates: { canonical: "/qr-code-generator" },
};

const FAQS = [
  {
    q: "Is this QR code generator really free?",
    a: "Yes. Static QR codes made here are free without an account, watermark, scan limit, or expiration — including for commercial use. The code contains your content directly, so there is nothing we could switch off later.",
  },
  {
    q: "Will my QR code expire?",
    a: "No. A static QR code encodes your link or text into the pattern itself. It works for as long as QR codes exist. If a generator's 'free' code stopped working after two weeks, you were given a trial of a dynamic code — a different product.",
  },
  {
    q: "What's the catch?",
    a: "None on static codes. We make money on dynamic codes — ones whose destination you can edit after printing, with scan statistics. If you don't need that, use this page free, forever.",
  },
  {
    q: "PNG or SVG — which should I download?",
    a: "PNG (2048px) is fine for most uses up to poster size. SVG is a vector: infinitely sharp, preferred by print shops, and editable in Illustrator, Figma, or Inkscape. Both are free here.",
  },
  {
    q: "Can I change where the code points after printing?",
    a: "Not with a static code — the destination is carved into the pattern. If you need to re-point a printed code later, create a free Scanstone account and use a dynamic code instead: 3 are included free, and their redirects never expire either.",
  },
];

function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Scanstone Free QR Code Generator",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free QR code generator with no expiration, no sign-up, and no watermark. Download PNG or SVG.",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function FreeQRGeneratorPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd />
      <div className="max-w-2xl">
        <h1 className="engraved text-3xl font-semibold sm:text-4xl">
          Free QR code generator — no expiration, ever
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Make a QR code for a link, WiFi network, contact card, or any text.
          Download it as PNG or vector SVG. No account, no watermark, no 14-day
          surprise: static codes are permanent by design, because the content
          lives inside the pattern itself.
        </p>
      </div>

      <div className="mt-10">
        <StaticGenerator initialMode="url" />
      </div>

      <section className="mt-16 max-w-2xl" aria-labelledby="static-faq">
        <h2 id="static-faq" className="engraved text-2xl font-semibold">
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
          Need WiFi or contact codes specifically? Use the dedicated{" "}
          <Link
            href="/wifi-qr-code-generator"
            className="text-verdigris-deep underline"
          >
            WiFi QR generator
          </Link>{" "}
          or{" "}
          <Link
            href="/vcard-qr-code-generator"
            className="text-verdigris-deep underline"
          >
            vCard QR generator
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
