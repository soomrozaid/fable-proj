// Publish drafted posts that pass the quality gate: move the markdown into
// content/<collection>/, append content/registry.json, mark the queue item
// published, and notify search engines (IndexNow now; Google via sitemap).
//
// Publishing = a reviewable git diff. In CI, commit + push -> Vercel deploys.
//
// Usage:
//   node scripts/content/publish.mjs <slug> [--dry-run]
//   node scripts/content/publish.mjs --all   [--dry-run]   (all drafted + passing)

import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  ROOT,
  CONTENT_DIR,
  DRAFTS_DIR,
  SITE,
  loadQueue,
  saveQueue,
  loadRegistry,
  saveRegistry,
  readFacts,
  readBody,
  todayISO,
  log,
  die,
} from "./lib.mjs";
import { lintDoc } from "./lint.mjs";

const exec = promisify(execFile);

async function existingBodies(excludeSlug) {
  const reg = await loadRegistry();
  const out = [];
  for (const d of reg) {
    if (d.slug === excludeSlug) continue;
    try {
      out.push(await readBody(d.collection, d.slug));
    } catch {}
  }
  return out;
}

async function indexNowKey() {
  const pub = path.join(ROOT, "public");
  const files = await fs.readdir(pub);
  const keyFile = files.find((f) => /^[a-f0-9]{8,}\.txt$/i.test(f));
  if (!keyFile) return null;
  const key = keyFile.replace(/\.txt$/, "");
  return { key, keyLocation: `${SITE}/${keyFile}` };
}

async function pingIndexNow(urls) {
  const k = await indexNowKey();
  if (!k) return log("  IndexNow: no key file, skipped");
  const host = new URL(SITE).host;
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: k.key, keyLocation: k.keyLocation, urlList: urls }),
  });
  log(`  IndexNow: ${res.status} for ${urls.length} url(s)`);
}

async function resubmitSitemapToGoogle() {
  try {
    await exec(
      "node",
      [
        path.join(ROOT, "scripts/gsc.mjs"),
        "submit",
        "sc-domain:scanstone.ca",
        `${SITE}/sitemap.xml`,
      ],
      { cwd: ROOT },
    );
    log("  GSC: sitemap resubmitted");
  } catch (e) {
    log(`  GSC: sitemap resubmit skipped (${e.code || "error"})`);
  }
}

async function publishItem(item, { dryRun }) {
  const draftPath = path.join(DRAFTS_DIR, `${item.slug}.md`);
  let body;
  try {
    body = await fs.readFile(draftPath, "utf8");
  } catch {
    log(`skip ${item.slug}: no draft at content/_drafts/${item.slug}.md`);
    return null;
  }

  const facts = await readFacts();
  const { errors } = lintDoc({
    body,
    title: item.title,
    primaryKeyword: item.primaryKeyword,
    internalLinks: item.internalLinks,
    facts,
    otherBodies: await existingBodies(item.slug),
  });
  if (errors.length) {
    log(`BLOCKED ${item.slug}: quality gate failed:`);
    for (const e of errors) log(`  ✗ ${e}`);
    return null;
  }

  const url = `${SITE}/${item.collection}/${item.slug}`;
  if (dryRun) {
    log(`would publish ${item.slug} -> content/${item.collection}/${item.slug}.md`);
    log(`  would ping: ${url}`);
    return url;
  }

  await fs.mkdir(path.join(CONTENT_DIR, item.collection), { recursive: true });
  await fs.rename(draftPath, path.join(CONTENT_DIR, item.collection, `${item.slug}.md`));

  const reg = await loadRegistry();
  reg.push({
    slug: item.slug,
    collection: item.collection,
    title: item.title,
    description: item.description,
    date: todayISO(),
    category: item.category,
    ...(item.featured ? { featured: true } : {}),
  });
  await saveRegistry(reg);

  const queue = await loadQueue();
  const q = queue.find((x) => x.slug === item.slug);
  if (q) q.status = "published";
  await saveQueue(queue);

  log(`published ${item.slug}`);
  await pingIndexNow([url, `${SITE}/${item.collection}`, `${SITE}/sitemap.xml`]);
  await resubmitSitemapToGoogle();
  return url;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const queue = await loadQueue();

  let targets;
  if (args.includes("--all")) {
    targets = queue.filter((q) => q.status === "drafted");
  } else {
    const slug = args.find((a) => !a.startsWith("--"));
    if (!slug) die("usage: publish.mjs <slug> | --all  [--dry-run]");
    const item = queue.find((q) => q.slug === slug);
    if (!item) die(`no queue item for slug "${slug}"`);
    targets = [item];
  }
  if (!targets.length) die("nothing to publish (no drafted items)");

  for (const item of targets) await publishItem(item, { dryRun });
}

main().catch((e) => die(e.stack || String(e)));
