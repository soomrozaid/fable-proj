import Link from "next/link";
import { envClient } from "@/config/env.client";
import { Prose } from "./Prose";
import { readingMinutes, type DocMeta } from "@/lib/content";

const COLLECTION_LABEL: Record<DocMeta["collection"], string> = {
  blog: "Blog",
  guides: "Guides",
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function JsonLd({ doc, body }: { doc: DocMeta; body: string }) {
  const base = envClient.APP_URL;
  const url = `${base}/${doc.collection}/${doc.slug}`;
  const collLabel = COLLECTION_LABEL[doc.collection];
  const data = [
    {
      "@context": "https://schema.org",
      "@type": doc.collection === "guides" ? "HowTo" : "Article",
      headline: doc.title,
      description: doc.description,
      datePublished: doc.date,
      dateModified: doc.updated ?? doc.date,
      wordCount: body.trim().split(/\s+/).filter(Boolean).length,
      author: { "@type": "Organization", name: "Scanstone", url: base },
      publisher: {
        "@type": "Organization",
        name: "Scanstone",
        url: base,
        logo: { "@type": "ImageObject", url: `${base}/icon` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        {
          "@type": "ListItem",
          position: 2,
          name: collLabel,
          item: `${base}/${doc.collection}`,
        },
        { "@type": "ListItem", position: 3, name: doc.title, item: url },
      ],
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticlePage({ doc, body }: { doc: DocMeta; body: string }) {
  const minutes = readingMinutes(body);
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <JsonLd doc={doc} body={body} />

      <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
        <Link href={`/${doc.collection}`} className="hover:text-ink">
          {COLLECTION_LABEL[doc.collection]}
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-ink-soft">{doc.category}</span>
      </nav>

      <header className="mt-6">
        <h1 className="engraved text-3xl font-semibold leading-tight sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          {doc.description}
        </p>
        <p className="mt-5 text-sm text-ink-faint">
          <time dateTime={doc.date}>{formatDate(doc.date)}</time>
          <span aria-hidden className="mx-2">
            ·
          </span>
          {minutes} min read
        </p>
      </header>

      <hr className="hairline mt-8 border-0" />

      <article className="mt-8">
        <Prose>{body}</Prose>
      </article>

      <aside className="mt-14 rounded-lg border border-line bg-paper-deep/40 p-6">
        <p className="engraved text-lg font-semibold text-ink">
          Make a QR code that can&apos;t be switched off
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Static codes are free forever — no account, no expiration, because the
          content lives in the pattern itself. Dynamic codes come with a written
          covenant: the redirect never turns off, even if you stop paying.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/qr-code-generator"
            className="btn-press rounded-md bg-verdigris px-4 py-2 text-sm font-medium text-paper"
          >
            Free QR generator
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-4 py-2 text-sm font-medium text-verdigris-deep underline underline-offset-2"
          >
            See pricing
          </Link>
        </div>
      </aside>
    </main>
  );
}
