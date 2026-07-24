// Shared helpers for the content pipeline (draft -> lint -> publish -> loop).
// Zero runtime deps. All paths are resolved from the repo root.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const CONTENT_DIR = path.join(ROOT, "content");
export const DRAFTS_DIR = path.join(CONTENT_DIR, "_drafts");
export const REGISTRY_PATH = path.join(CONTENT_DIR, "registry.json");
export const QUEUE_PATH = path.join(CONTENT_DIR, "queue.json");
export const FACTS_PATH = path.join(CONTENT_DIR, "facts.md");

export const SITE = "https://www.scanstone.ca";

// Phrases that mark generic, AI-slop, or salesy prose. Kept in sync with
// content/facts.md. A draft containing any of these fails the quality gate.
export const BANNED_PHRASES = [
  "in today's digital world",
  "in today's fast-paced",
  "in the digital age",
  "unlock the power",
  "look no further",
  "game-changer",
  "game changer",
  "revolutionize",
  "seamless",
  "in conclusion",
  "elevate your",
  "when it comes to",
  "at the end of the day",
  "harness the power",
  "take your .* to the next level",
];

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT" && fallback !== undefined) return fallback;
    throw e;
  }
}

export async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

export const loadRegistry = () => readJson(REGISTRY_PATH, []);
export const saveRegistry = (r) => writeJson(REGISTRY_PATH, r);
export const loadQueue = () => readJson(QUEUE_PATH, []);
export const saveQueue = (q) => writeJson(QUEUE_PATH, q);
export const readFacts = () => fs.readFile(FACTS_PATH, "utf8");

export async function readBody(collection, slug) {
  return fs.readFile(path.join(CONTENT_DIR, collection, `${slug}.md`), "utf8");
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['"'".,:;!?()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function words(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function log(...args) {
  process.stdout.write(args.join(" ") + "\n");
}

export function die(msg) {
  process.stderr.write(msg + "\n");
  process.exit(1);
}
