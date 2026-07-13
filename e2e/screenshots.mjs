/** Visual review: captures desktop + mobile screenshots of key pages. */
import { chromium } from "@playwright/test";
import fs from "node:fs";

const OUT = process.argv[2] ?? "shots";
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  ["landing", "/"],
  ["free-tool", "/qr-code-generator"],
  ["wifi-tool", "/wifi-qr-code-generator"],
  ["pricing", "/pricing"],
  ["demo", "/demo"],
  ["signup", "/signup"],
  ["login", "/login"],
];

const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

const browser = await chromium.launch();
for (const [vpName, viewport] of viewports) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(name === "landing" ? 2500 : 600);
    await page.screenshot({ path: `${OUT}/${name}-${vpName}.png`, fullPage: true });
    console.log(`${name}-${vpName}.png`);
  }
  await ctx.close();
}
await browser.close();
