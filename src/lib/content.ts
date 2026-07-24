import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Content registry. The source of truth for published editorial content.
 *
 * Each entry has a matching markdown body at
 *   content/<collection>/<slug>.md
 * The automation pipeline appends an entry here and drops the markdown file;
 * everything else (routing, sitemap, indexes, JSON-LD) derives from this list.
 */

export type Collection = "blog" | "guides";

export interface DocMeta {
  slug: string;
  collection: Collection;
  title: string;
  /** ~150 char meta description; also the index-card summary. */
  description: string;
  /** ISO date first published. */
  date: string;
  /** ISO date last materially updated (defaults to `date`). */
  updated?: string;
  /** Human label shown as a kicker/badge, e.g. "Investigation", "Guide". */
  category: string;
  /** Surfaces on collection index above the fold. */
  featured?: boolean;
}

export const DOCS: DocMeta[] = [
  {
    slug: "qr-code-subscription-trap",
    collection: "blog",
    title: "The QR code subscription trap: an investigation",
    description:
      "The most-marketed QR generators are rated 1–2 stars. The reason is a single design choice — and it costs people who print their codes hundreds of dollars. Here's how it works, and how to never fall for it.",
    date: "2026-07-24",
    category: "Investigation",
    featured: true,
  },
];

export function docsIn(collection: Collection): DocMeta[] {
  return DOCS.filter((d) => d.collection === collection).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
}

export function findDoc(
  collection: Collection,
  slug: string,
): DocMeta | undefined {
  return DOCS.find((d) => d.collection === collection && d.slug === slug);
}

export async function readDocBody(
  collection: Collection,
  slug: string,
): Promise<string> {
  const file = path.join(process.cwd(), "content", collection, `${slug}.md`);
  return fs.readFile(file, "utf8");
}

/** Rough reading time from word count (~220 wpm), min 1. */
export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
