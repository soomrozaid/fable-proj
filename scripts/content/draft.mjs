// Draft a queued post with an LLM, grounded strictly in content/facts.md.
// Provider-flexible, zero-dep:
//   - ANTHROPIC_API_KEY  -> Anthropic Messages API (claude-sonnet-5)
//   - AI_GATEWAY_API_KEY -> Vercel AI Gateway (anthropic/claude-sonnet-5)
//
// Usage:
//   node scripts/content/draft.mjs [--slug <slug>] [--dry-run] [--count N]
// With no --slug it drafts the next N "queued" items (default 1).

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  DRAFTS_DIR,
  loadQueue,
  saveQueue,
  readFacts,
  BANNED_PHRASES,
  log,
  die,
} from "./lib.mjs";

const MODEL = "claude-sonnet-5";

function systemPrompt(facts) {
  return `You are the staff writer for Scanstone, a QR code company whose entire promise is honesty. Voice: "Straight answers" — plain, exact, a little literary, empathetic to someone who got burned. Never salesy.

HARD RULES:
- Output ONLY the article body as GitHub-flavored Markdown. No title/H1 (the title is rendered separately). No frontmatter. No preamble.
- The FIRST sentence must directly answer the query. No throat-clearing.
- Use ## for section headings (at least two). Short paragraphs.
- Every factual, numeric, or comparative claim MUST come from the FACTS below. Invent nothing — no made-up statistics, prices, or ratings. If a fact isn't below, don't claim it.
- Include the primary keyword naturally in the body (once or twice, never stuffed).
- Include the given internal links as Markdown links, in context, where they genuinely help.
- Include at least one real external citation (a source URL that appears in the FACTS).
- Mention the Scanstone product at most once, near the end, as the honest resolution — not the premise.
- End with a one-line "*Sources: ...*" italic note linking the external sources you used, with "verified July 2026".
- 700–1300 words. Banned phrases (never use): ${BANNED_PHRASES.slice(0, 10).join("; ")}.

FACTS (your only source of truth):
${facts}`;
}

function userPrompt(item) {
  return `Write the article.

Title (rendered separately, do not repeat as H1): ${item.title}
Primary keyword: ${item.primaryKeyword}
Search intent: ${item.intent}
Internal links to weave in: ${(item.internalLinks || []).join(", ")}

Outline to follow (adapt as needed, keep it tight):
${(item.outline || []).map((o) => `- ${o}`).join("\n")}`;
}

async function callAnthropic(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${JSON.stringify(j)}`);
  return j.content.map((b) => b.text || "").join("");
}

async function callGateway(system, user) {
  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: `anthropic/${MODEL}`,
      max_tokens: 4000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`Gateway ${res.status}: ${JSON.stringify(j)}`);
  return j.choices[0].message.content;
}

function generate(system, user) {
  if (process.env.ANTHROPIC_API_KEY) return callAnthropic(system, user);
  if (process.env.AI_GATEWAY_API_KEY) return callGateway(system, user);
  die(
    "No LLM key. Set ANTHROPIC_API_KEY (Anthropic) or AI_GATEWAY_API_KEY (Vercel AI Gateway).",
  );
}

async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
  const dryRun = args.includes("--dry-run");
  const count = args.includes("--count")
    ? Number(args[args.indexOf("--count") + 1])
    : 1;

  const queue = await loadQueue();
  const facts = await readFacts();
  const system = systemPrompt(facts);

  let targets;
  if (slugArg) {
    const item = queue.find((q) => q.slug === slugArg);
    if (!item) die(`no queue item for slug "${slugArg}"`);
    targets = [item];
  } else {
    targets = queue.filter((q) => q.status === "queued").slice(0, count);
  }
  if (!targets.length) die("nothing to draft (no queued items)");

  await fs.mkdir(DRAFTS_DIR, { recursive: true });
  for (const item of targets) {
    const user = userPrompt(item);
    if (dryRun) {
      log(`\n===== DRY RUN: ${item.slug} =====\n${system}\n\n---\n${user}\n`);
      continue;
    }
    log(`drafting ${item.slug} …`);
    const body = (await generate(system, user)).trim() + "\n";
    await fs.writeFile(path.join(DRAFTS_DIR, `${item.slug}.md`), body);
    item.status = "drafted";
    await saveQueue(queue);
    log(`  wrote content/_drafts/${item.slug}.md (${body.split(/\s+/).length} words)`);
  }
}

main().catch((e) => die(e.stack || String(e)));
