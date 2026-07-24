import type { Metadata } from "next";
import Link from "next/link";
import { docsIn } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog — straight answers about QR codes",
  description:
    "Investigations and comparisons about QR codes: what expires, what doesn't, and how to never lose a printed code to a paywall. No fluff, no sales pitch.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndex() {
  const docs = docsIn("blog");
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="max-w-xl">
        <h1 className="engraved text-3xl font-semibold sm:text-4xl">Blog</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Straight answers about QR codes — what expires, what doesn&apos;t, and
          how to keep your printed codes working without paying anyone forever.
        </p>
      </header>

      <ul className="mt-10 space-y-8">
        {docs.map((doc) => (
          <li key={doc.slug} className="border-b border-line pb-8">
            <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
              {doc.category}
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              <Link
                href={`/blog/${doc.slug}`}
                className="engraved hover:text-verdigris-deep"
              >
                {doc.title}
              </Link>
            </h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              {doc.description}
            </p>
            <p className="mt-3 text-sm text-ink-faint">
              <time dateTime={doc.date}>{formatDate(doc.date)}</time>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
