/** Authenticated visual review: dashboard, new-code, detail, account. */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const OUT = process.argv[2] ?? "shots-app";
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
fs.mkdirSync(OUT, { recursive: true });

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `visual-${Date.now()}@scanstone-e2e.com`;
const password = `Pw!${crypto.randomUUID()}`;
const { data: created, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error) throw error;

await admin.from("rate_limits").delete().like("key", "login:%");

const browser = await chromium.launch();
try {
  for (const [vpName, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("**/dashboard");
    await page.screenshot({ path: `${OUT}/dash-empty-${vpName}.png`, fullPage: true });

    if (vpName === "desktop") {
      await page.goto(`${BASE}/dashboard/new`);
      await page.getByLabel("Name").fill("Spring menu — table tents");
      await page.getByLabel("Destination URL").fill("https://example.com/menu");
      await page.screenshot({ path: `${OUT}/new-code-${vpName}.png`, fullPage: true });
      await page.getByRole("button", { name: "Create code" }).click();
      await page.waitForURL("**/dashboard/codes/**");
      // one scan so analytics show something
      const url = await page.locator("p.font-mono", { hasText: "/r/" }).first().textContent();
      const slug = url.trim().split("/r/")[1];
      await page.request.get(`${BASE}/r/${slug}`, { maxRedirects: 0 });
      await page.waitForTimeout(2000);
      await page.reload();
      await page.screenshot({ path: `${OUT}/code-detail-${vpName}.png`, fullPage: true });
      await page.goto(`${BASE}/account`);
      await page.screenshot({ path: `${OUT}/account-${vpName}.png`, fullPage: true });
    } else {
      const first = page.locator("a[href^='/dashboard/codes/']").first();
      if (await first.isVisible().catch(() => false)) {
        await first.click();
        await page.waitForURL("**/dashboard/codes/**");
        await page.screenshot({ path: `${OUT}/code-detail-${vpName}.png`, fullPage: true });
      }
      await page.goto(`${BASE}/dashboard`);
      await page.screenshot({ path: `${OUT}/dash-${vpName}.png`, fullPage: true });
    }
    await ctx.close();
    console.log(`${vpName} done`);
  }
} finally {
  await browser.close();
  await admin.auth.admin.deleteUser(created.user.id);
}
