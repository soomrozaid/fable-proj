// Daily usage digest — the "someone actually used it" ping.
// Counts real activity in Supabase (signups, dynamic codes, scans) over the last
// 24h / 7d and emails it via Resend. This makes the "get a few real users"
// milestone observable the instant it happens, instead of guessed.
//
// Env: SUPABASE_URL, SUPABASE_SECRET_KEY (service key — bypasses RLS),
//      RESEND_API_KEY, RESEND_EMAIL_DOMAIN, DIGEST_TO (all optional except the
//      first two; without Resend it just prints).
//
// Anonymous free-tool downloads are tracked separately as Vercel Analytics
// custom events (qr_downloaded) — see the Vercel dashboard.

import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(ROOT, ".env.local")); // local dev; no-op in CI
} catch {}

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!URL_BASE || !KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY");
  process.exit(1);
}

const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString();
const DAY = 864e5;

async function count(table, filter) {
  const url = `${URL_BASE}/rest/v1/${table}?select=id${filter ? `&${filter}` : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: KEY,
      authorization: `Bearer ${KEY}`,
      prefer: "count=exact",
      range: "0-0",
    },
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  const cr = res.headers.get("content-range") || "*/0";
  return Number(cr.split("/")[1] || 0);
}

async function main() {
  const since1 = iso(DAY);
  const since7 = iso(7 * DAY);

  const [
    users1, users7, usersAll,
    codes1, codes7, codesAll,
    scans1, scans7, scansAll,
  ] = await Promise.all([
    count("profiles", `created_at=gte.${since1}`),
    count("profiles", `created_at=gte.${since7}`),
    count("profiles"),
    count("qr_codes", `created_at=gte.${since1}`),
    count("qr_codes", `created_at=gte.${since7}`),
    count("qr_codes"),
    count("scans", `scanned_at=gte.${since1}`),
    count("scans", `scanned_at=gte.${since7}`),
    count("scans"),
  ]);

  const active24 = users1 + codes1 + scans1 > 0;
  const lines = [
    `Scanstone usage — ${new Date().toISOString().slice(0, 10)}`,
    ``,
    active24
      ? `🎉 Real activity in the last 24h — someone is using Scanstone.`
      : `Quiet 24h (no new signups, codes, or scans).`,
    ``,
    `                 last 24h   last 7d   all-time`,
    `  signups        ${pad(users1)}   ${pad(users7)}   ${pad(usersAll)}`,
    `  dynamic codes  ${pad(codes1)}   ${pad(codes7)}   ${pad(codesAll)}`,
    `  scans          ${pad(scans1)}   ${pad(scans7)}   ${pad(scansAll)}`,
    ``,
    `Anonymous free-tool downloads (qr_downloaded) are in the Vercel Analytics dashboard.`,
    `Dashboard: https://www.scanstone.ca/dashboard`,
  ];

  console.log(lines.join("\n"));
  await email(active24, lines);
}

function pad(n) {
  return String(n).padStart(8);
}

async function email(active24, lines) {
  const to = process.env.DIGEST_TO;
  const key = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_EMAIL_DOMAIN || "scanstone.ca";
  if (!to || !key) {
    console.log(`\n(no RESEND_API_KEY/DIGEST_TO — printed above, not emailed)`);
    return;
  }
  const subject = active24
    ? `Scanstone: real activity today 🎉`
    : `Scanstone usage — quiet day`;
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
  console.log(res.ok ? "digest emailed" : `email failed: ${res.status}`);
}

main().catch((e) => {
  console.error(e.stack || String(e));
  process.exit(1);
});
