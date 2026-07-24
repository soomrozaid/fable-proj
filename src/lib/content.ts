import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import registry from "../../content/registry.json";

/**
 * Content registry. The source of truth for published editorial content lives in
 * content/registry.json (so the automation pipeline can append to it without
 * parsing TypeScript). Each entry has a matching markdown body at
 *   content/<collection>/<slug>.md
 * Everything else (routing, sitemap, indexes, JSON-LD) derives from this list.
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

export const DOCS: DocMeta[] = registry as DocMeta[];

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
