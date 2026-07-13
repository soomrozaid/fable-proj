import type { Metadata } from "next";
import Link from "next/link";
import { StaticGenerator } from "@/components/free-tool/StaticGenerator";

export const metadata: Metadata = {
  title: "Free WiFi QR Code Generator — Guests Scan and Join, No Typing",
  description:
    "Create a free WiFi QR code: guests point their camera and join your network instantly. No account, no expiration, password never leaves your device. PNG & SVG.",
  alternates: { canonical: "/wifi-qr-code-generator" },
};

const FAQS = [
  {
    q: "How does a WiFi QR code work?",
    a: "The code embeds your network name and password in a standard format (WIFI:). iPhones and Android phones recognize it natively: point the camera, tap the prompt, and the device joins — no typing, no app.",
  },
  {
    q: "Is my WiFi password sent to your servers?",
    a: "No. This generator runs entirely in your browser. The password is encoded into the image on your device and never transmitted to us.",
  },
  {
    q: "Does the code stop working if I change my password?",
    a: "The printed code always contains the credentials it was made with — so if you change your password, print a new code. (Codes never expire on their own.)",
  },
  {
    q: "Where do people put these?",
    a: "Table tents and menus in cafés, guest-room welcome cards, waiting rooms, coworking desks, Airbnb binders — anywhere guests ask 'what's the WiFi?'",
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

export default function WifiQRPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd />
      <div className="max-w-2xl">
        <h1 className="engraved text-3xl font-semibold sm:text-4xl">
          WiFi QR code generator — free, private, permanent
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Stop spelling out your WiFi password. Guests scan, tap, and
          they&apos;re on. Generated entirely in your browser — the password
          never touches our servers — and like every static code, it never
          expires.
        </p>
      </div>

      <div className="mt-10">
        <StaticGenerator initialMode="wifi" />
      </div>

      <section className="mt-16 max-w-2xl" aria-labelledby="wifi-faq">
        <h2 id="wifi-faq" className="engraved text-2xl font-semibold">
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
          Also useful: the{" "}
          <Link
            href="/qr-code-generator"
            className="text-verdigris-deep underline"
          >
            general QR generator
          </Link>{" "}
          for links and text, or{" "}
          <Link
            href="/vcard-qr-code-generator"
            className="text-verdigris-deep underline"
          >
            contact-card codes
          </Link>{" "}
          for business cards.
        </p>
      </section>
    </main>
  );
}
