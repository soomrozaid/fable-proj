// Quality gate. A draft must pass before it can be published. Deterministic,
// zero-dep — this is what keeps auto-generated content out of Google's
// scaled-content-abuse bucket and honest to facts.md.
//
// Usage:
//   node scripts/content/lint.mjs <slug>                 lint a drafted queue item
//   node scripts/content/lint.mjs --all                  lint every drafted item
//   node scripts/content/lint.mjs --path <f> --keyword "kw" [--links a,b]

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BANNED_PHRASES,
  CONTENT_DIR,
  DRAFTS_DIR,
  loadQueue,
  loadRegistry,
  readBody,
  words,
  log,
  die,
} from "./lib.mjs";

const MIN_WORDS = 600;
const MAX_WORDS = 2600;
const MAX_KEYWORD_DENSITY = 0.025; // 2.5%
const MAX_SIMILARITY = 0.4; // trigram Jaccard vs any existing post

function trigrams(text) {
  const w = words(text.toLowerCase().replace(/[^a-z0-9\s]/g, ""));
  const set = new Set();
  for (let i = 0; i < w.length - 2; i++) set.add(w.slice(i, i + 3).join(" "));
  return set;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const g of a) if (b.has(g)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Extract concrete figures ($130, £130, 1.6 stars, 14-day) worth fact-checking. */
function figures(text) {
  return (text.match(/[£$]\s?\d[\d,.]*|\b\d+(?:\.\d+)?\s?(?:star|stars|\/\s?5)\b|\b\d+[- ]day\b/gi) || []).map((s) =>
    s.replace(/\s+/g, " ").trim(),
  );
}

export function lintDoc({ body, title = "", primaryKeyword, internalLinks = [], facts = "", otherBodies = [] }) {
  const errors = [];
  const warnings = [];
  const wordList = words(body);
  const wc = wordList.length;
  const lower = body.toLowerCase();

  // length
  if (wc < MIN_WORDS) errors.push(`too short: ${wc} words (min ${MIN_WORDS})`);
  if (wc > MAX_WORDS) errors.push(`too long: ${wc} words (max ${MAX_WORDS})`);

  // banned phrases
  for (const p of BANNED_PHRASES) {
    if (new RegExp(`\\b${p}\\b`, "i").test(lower))
      errors.push(`banned phrase: "${p}"`);
  }

  // primary keyword present (title or body), not stuffed in body
  if (primaryKeyword) {
    const kw = primaryKeyword.toLowerCase();
    const count = lower.split(kw).length - 1;
    const inTitle = title.toLowerCase().includes(kw);
    if (count === 0 && !inTitle)
      errors.push(`primary keyword missing from title and body: "${primaryKeyword}"`);
    else if (count === 0)
      warnings.push(`primary keyword only in title, not body: "${primaryKeyword}"`);
    const density = (count * kw.split(/\s+/).length) / Math.max(wc, 1);
    if (density > MAX_KEYWORD_DENSITY)
      errors.push(
        `keyword stuffed: "${primaryKeyword}" density ${(density * 100).toFixed(1)}%`,
      );
    // first paragraph should answer the query
    const firstPara = body.trim().split(/\n\n/)[0].toLowerCase();
    if (!firstPara.includes(kw.split(/\s+/)[0]))
      warnings.push("first paragraph may not answer the query up front");
  }

  // structure: needs section headings
  const h2s = (body.match(/^##\s+/gm) || []).length;
  if (h2s < 2) errors.push(`too few section headings (${h2s}, need >= 2)`);

  // internal links present
  const linkedInternally = internalLinks.filter((l) => body.includes(`(${l}`));
  if (internalLinks.length && linkedInternally.length === 0)
    errors.push(`no internal links (expected some of: ${internalLinks.join(", ")})`);

  // at least one external citation (GEO/credibility)
  if (!/\]\(https?:\/\//.test(body))
    warnings.push("no external citation link — add a real source");

  // fact-check heuristic: concrete figures should trace to facts.md
  if (facts) {
    const factsLower = facts.toLowerCase();
    for (const f of new Set(figures(body))) {
      const norm = f.toLowerCase().replace(/\s+/g, "");
      const inFacts = figures(facts).some(
        (g) => g.toLowerCase().replace(/\s+/g, "") === norm,
      );
      if (!inFacts && !factsLower.includes(norm))
        warnings.push(`figure "${f}" not found in facts.md — verify or add it`);
    }
  }

  // dedupe vs existing posts
  const t = trigrams(body);
  let maxSim = 0;
  for (const b of otherBodies) {
    if (b === body) continue; // never compare a doc to itself
    maxSim = Math.max(maxSim, jaccard(t, trigrams(b)));
  }
  if (maxSim > MAX_SIMILARITY)
    errors.push(`too similar to an existing post (${(maxSim * 100).toFixed(0)}%)`);

  return { errors, warnings, wordCount: wc };
}

async function existingBodies(excludeSlug) {
  const reg = await loadRegistry();
  const out = [];
  for (const d of reg) {
    if (d.slug === excludeSlug) continue;
    try {
      out.push(await readBody(d.collection, d.slug));
    } catch {
      /* body not present yet */
    }
  }
  return out;
}

async function factsText() {
  try {
    return await fs.readFile(path.join(CONTENT_DIR, "facts.md"), "utf8");
  } catch {
    return "";
  }
}

async function lintSlug(slug) {
  const queue = await loadQueue();
  const item = queue.find((q) => q.slug === slug);
  if (!item) die(`no queue item for slug "${slug}"`);
  const body = await fs.readFile(path.join(DRAFTS_DIR, `${slug}.md`), "utf8");
  return report(slug, lintDoc({
    body,
    title: item.title,
    primaryKeyword: item.primaryKeyword,
    internalLinks: item.internalLinks,
    facts: await factsText(),
    otherBodies: await existingBodies(slug),
  }));
}

function report(name, { errors, warnings, wordCount }) {
  log(`\n${name}  (${wordCount} words)`);
  for (const w of warnings) log(`  ⚠ ${w}`);
  for (const e of errors) log(`  ✗ ${e}`);
  if (!errors.length) log(`  ✓ passed${warnings.length ? " (with warnings)" : ""}`);
  return errors.length === 0;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--path") {
    const idx = args.indexOf("--path");
    const kwi = args.indexOf("--keyword");
    const lki = args.indexOf("--links");
    const tti = args.indexOf("--title");
    const body = await fs.readFile(args[idx + 1], "utf8");
    const ok = report(args[idx + 1], lintDoc({
      body,
      title: tti > -1 ? args[tti + 1] : "",
      primaryKeyword: kwi > -1 ? args[kwi + 1] : "",
      internalLinks: lki > -1 ? args[lki + 1].split(",") : [],
      facts: await factsText(),
      otherBodies: await existingBodies("__none__"),
    }));
    process.exit(ok ? 0 : 1);
  }

  let slugs = args.filter((a) => !a.startsWith("--"));
  if (args.includes("--all")) {
    const queue = await loadQueue();
    slugs = queue.filter((q) => q.status === "drafted").map((q) => q.slug);
  }
  if (!slugs.length) die("usage: lint.mjs <slug> | --all | --path <f> --keyword <kw>");

  let allOk = true;
  for (const s of slugs) allOk = (await lintSlug(s)) && allOk;
  process.exit(allOk ? 0 : 1);
}

// Only run the CLI when executed directly, so publish.mjs can import lintDoc.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => die(e.stack || String(e)));
}
