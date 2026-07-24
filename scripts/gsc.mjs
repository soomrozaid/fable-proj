#!/usr/bin/env node
// Google Search Console CLI — zero external deps (Node 24: global fetch + crypto).
// Auth: service-account JWT -> OAuth2 access token -> Search Console API.
//
// Usage:
//   node scripts/gsc.mjs sites                       list properties the SA can see
//   node scripts/gsc.mjs sitemaps <siteUrl>          list submitted sitemaps
//   node scripts/gsc.mjs submit <siteUrl> <feed>     submit a sitemap
//   node scripts/gsc.mjs top <siteUrl> [days]        top queries+pages (default 28d)
//   node scripts/gsc.mjs inspect <siteUrl> <pageUrl> URL inspection (index status)
//
// siteUrl is exactly as GSC lists it, e.g. "sc-domain:scanstone.ca" or
// "https://scanstone.ca/". Credentials: GOOGLE_APPLICATION_CREDENTIALS or the
// default key file below.

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

const KEY_FILE =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  new URL("../scanstone-503008-96ce486f79f4.json", import.meta.url).pathname;

const SCOPE = "https://www.googleapis.com/auth/webmasters";
const API = "https://www.googleapis.com/webmasters/v3";

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function accessToken() {
  const key = JSON.parse(readFileSync(KEY_FILE, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: key.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signature = b64url(
    createSign("RSA-SHA256").update(signingInput).sign(key.private_key),
  );
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  return json;
}

const enc = (s) => encodeURIComponent(s);

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const token = await accessToken();

  switch (cmd) {
    case "sites": {
      const { siteEntry = [] } = await api("/sites", { token });
      if (!siteEntry.length) {
        console.log(
          "No properties visible to this service account.\n" +
            "Add search-console-api@scanstone-503008.iam.gserviceaccount.com as a\n" +
            "user in Search Console (Settings -> Users and permissions) for the property.",
        );
      }
      for (const s of siteEntry)
        console.log(`${s.permissionLevel.padEnd(18)} ${s.siteUrl}`);
      break;
    }
    case "sitemaps": {
      const { sitemap = [] } = await api(`/sites/${enc(args[0])}/sitemaps`, {
        token,
      });
      for (const s of sitemap)
        console.log(
          `${s.path}  submitted=${s.lastSubmitted ?? "?"}  errors=${s.errors ?? 0}  warnings=${s.warnings ?? 0}  indexed-contents=${(s.contents ?? []).map((c) => c.indexed).join(",")}`,
        );
      if (!sitemap.length) console.log("(no sitemaps submitted)");
      break;
    }
    case "submit": {
      await api(`/sites/${enc(args[0])}/sitemaps/${enc(args[1])}`, {
        method: "PUT",
        token,
      });
      console.log(`submitted: ${args[1]}`);
      break;
    }
    case "top": {
      const days = Number(args[1] || 28);
      const end = new Date();
      const start = new Date(Date.now() - days * 864e5);
      const iso = (d) => d.toISOString().slice(0, 10);
      for (const dim of ["query", "page"]) {
        const r = await api(`/sites/${enc(args[0])}/searchAnalytics/query`, {
          method: "POST",
          token,
          body: {
            startDate: iso(start),
            endDate: iso(end),
            dimensions: [dim],
            rowLimit: 25,
          },
        });
        console.log(`\n=== top ${dim} (last ${days}d) ===`);
        for (const row of r.rows ?? [])
          console.log(
            `${String(Math.round(row.position)).padStart(3)}  imp=${String(row.impressions).padStart(5)}  clk=${String(row.clicks).padStart(4)}  ${row.keys[0]}`,
          );
        if (!(r.rows ?? []).length) console.log("(no data yet)");
      }
      break;
    }
    case "inspect": {
      const r = await api(`/urlInspection/index:inspect`, {
        method: "POST",
        token,
        body: { inspectionUrl: args[1], siteUrl: args[0] },
      }).catch((e) => ({ error: String(e) }));
      console.log(JSON.stringify(r, null, 2));
      break;
    }
    default:
      console.log(
        "commands: sites | sitemaps <siteUrl> | submit <siteUrl> <feed> | top <siteUrl> [days] | inspect <siteUrl> <pageUrl>",
      );
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
