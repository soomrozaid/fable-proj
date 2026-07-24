// Weekly self-driving loop: pull Search Console performance, surface
// striking-distance queries (position 8–20 = a nudge from page 1) and
// impression-but-no-page gaps, file them as candidates in the queue, and email
// a digest via Resend. This is the machine's brain — it replaces guessing about
// what to write next with the site's own data.
//
// Usage: node scripts/content/loop.mjs [--property "sc-domain:scanstone.ca"] [--days 28]

import { accessToken, api } from "../gsc.mjs";
import {
  SITE,
  loadQueue,
  saveQueue,
  loadRegistry,
  slugify,
  todayISO,
  log,
} from "./lib.mjs";

const enc = encodeURIComponent;

async function topQueries(property, days) {
  const token = await accessToken();
  const end = new Date();
  const start = new Date(Date.now() - days * 864e5);
  const iso = (d) => d.toISOString().slice(0, 10);
  const r = await api(`/sites/${enc(property)}/searchAnalytics/query`, {
    method: "POST",
    token,
    body: {
      startDate: iso(start),
      endDate: iso(end),
      dimensions: ["query"],
      rowLimit: 200,
    },
  });
  return (r.rows ?? []).map((row) => ({
    query: row.keys[0],
    position: row.position,
    impressions: row.impressions,
    clicks: row.clicks,
  }));
}

/** Does an existing queue item / published post already target this query? */
function alreadyCovered(query, queue, registry) {
  const q = query.toLowerCase();
  const inQueue = queue.some(
    (i) => (i.primaryKeyword || "").toLowerCase() === q || i.slug === slugify(query),
  );
  const inReg = registry.some((d) => d.slug === slugify(query));
  return inQueue || inReg;
}

async function sendDigest(subject, lines) {
  const to = process.env.DIGEST_TO;
  const key = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_EMAIL_DOMAIN || "scanstone.ca";
  if (!to || !key) {
    log(`(no RESEND_API_KEY/DIGEST_TO set — digest printed above, not emailed)`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: `Scanstone <noreply@${domain}>`,
      to: [to],
      subject,
      text: lines.join("\n"),
    }),
  });
  log(res.ok ? "digest emailed" : `digest email failed: ${res.status}`);
}

async function main() {
  const args = process.argv.slice(2);
  const property = args.includes("--property")
    ? args[args.indexOf("--property") + 1]
    : "sc-domain:scanstone.ca";
  const days = args.includes("--days") ? Number(args[args.indexOf("--days") + 1]) : 28;

  const rows = await topQueries(property, days);
  const queue = await loadQueue();
  const registry = await loadRegistry();

  // Striking distance: within reach of page 1, with real impressions.
  const striking = rows
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 2)
    .sort((a, b) => b.impressions - a.impressions);

  // Gaps: getting impressions but nothing targets them yet.
  const gaps = rows
    .filter((r) => r.impressions >= 3 && !alreadyCovered(r.query, queue, registry))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  let added = 0;
  for (const g of gaps) {
    if (alreadyCovered(g.query, queue, registry)) continue;
    queue.push({
      slug: slugify(g.query),
      collection: "blog",
      title: g.query,
      description: "",
      category: "Explainer",
      primaryKeyword: g.query,
      intent: "informational",
      outline: [],
      internalLinks: ["/qr-code-generator", "/blog/qr-code-subscription-trap"],
      autonomy: "review",
      status: "candidate",
      source: "gsc",
      metrics: { position: Math.round(g.position), impressions: g.impressions },
      discovered: todayISO(),
    });
    added++;
  }
  if (added) await saveQueue(queue);

  const lines = [
    `Scanstone content loop — ${todayISO()} (${property}, ${days}d)`,
    ``,
    `Queries seen: ${rows.length} · striking-distance (pos 8–20): ${striking.length} · new candidates filed: ${added}`,
    ``,
    `Top striking-distance (a nudge from page 1):`,
    ...striking.slice(0, 12).map((r) => `  p${Math.round(r.position)}  imp ${r.impressions}  clk ${r.clicks}  ${r.query}`),
    striking.length ? `` : `  (none yet — indexing is still ramping)`,
    ``,
    `New candidates filed to queue.json (promote to "queued" to draft):`,
    ...gaps.slice(0, 10).map((g) => `  imp ${g.impressions}  p${Math.round(g.position)}  ${g.query}`),
    gaps.length ? `` : `  (none)`,
    ``,
    `Review queue: ${SITE}  ·  ${queue.filter((q) => q.status === "queued").length} queued, ${queue.filter((q) => q.status === "candidate").length} candidates`,
  ];

  log(lines.join("\n"));
  await sendDigest(`Scanstone content loop — ${added} new, ${striking.length} striking`, lines);
}

main().catch((e) => {
  process.stderr.write((e.stack || String(e)) + "\n");
  process.exit(1);
});
