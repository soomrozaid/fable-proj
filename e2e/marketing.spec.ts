import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

// Vercel Analytics 404s locally (no /_vercel/insights); ignore benign noise.
function realErrors(errors: string[]): string[] {
  return errors.filter(
    (e) =>
      !e.includes("_vercel/insights") &&
      !e.includes("Failed to load resource") &&
      !e.includes("Download the React DevTools"),
  );
}

test("landing page communicates the value proposition @smoke", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Print it once/i }),
  ).toBeVisible();
  await expect(page.getByText(/never stops working/i).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Start free/i }).first(),
  ).toBeVisible();
  // hero visual mounts (canvas or fallback)
  await expect(page.getByTestId("hero-visual")).toBeVisible();
  await page.waitForTimeout(1500);
  expect(realErrors(errors)).toEqual([]);
});

test("landing renders FAQ structured data @smoke", async ({ page }) => {
  await page.goto("/");
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(jsonLd).toContain("FAQPage");
});

test("free generator produces a QR and downloads PNG @smoke", async ({
  page,
}) => {
  await page.goto("/qr-code-generator");
  await expect(
    page.getByRole("heading", { name: /Free QR code generator/i }),
  ).toBeVisible();
  await page.getByLabel("Destination link").fill("https://example.com/menu");
  // preview should render an SVG QR
  await expect(
    page.locator("svg[role='img'][aria-label='QR code']").first(),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("scanstone-qr.png");
});

test("wifi generator encodes without sending password anywhere @smoke", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") requests.push(r.url());
  });
  await page.goto("/wifi-qr-code-generator");
  await page.getByLabel(/Network name/).fill("CafeGuest");
  await page.getByLabel("Password", { exact: true }).fill("supersecret");
  await expect(
    page.locator("svg[role='img'][aria-label='QR code']").first(),
  ).toBeVisible();
  expect(requests).toEqual([]);
});

test("pricing page states the covenant @smoke", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  await expect(page.getByText(/never stops working/i).first()).toBeVisible();
  await expect(page.getByText("$9").first()).toBeVisible();
});

test("demo page shows live analytics @smoke", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: /This is a real code/i }),
  ).toBeVisible();
  await expect(page.getByText(/scans all-time/i)).toBeVisible();
});

test("legal pages exist @smoke", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible();
  await page.goto("/terms");
  await expect(
    page.getByRole("heading", { name: "Terms of Service" }),
  ).toBeVisible();
  await expect(page.getByText(/redirect covenant/i).first()).toBeVisible();
});

test("seo plumbing responds @smoke", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("qr-code-generator");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("sitemap");
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("landing is usable on mobile @mobile @smoke", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Print it once/i }),
  ).toBeVisible();
  // no horizontal overflow
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole("link", { name: /Start free/i }).first(),
  ).toBeVisible();
  await page.waitForTimeout(1200);
  expect(realErrors(errors)).toEqual([]);
});

test("free tool is usable on mobile @mobile", async ({ page }) => {
  await page.goto("/qr-code-generator");
  await page.getByLabel("Destination link").fill("https://example.com");
  await expect(
    page.locator("svg[role='img'][aria-label='QR code']").first(),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("reduced motion falls back gracefully", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Print it once/i }),
  ).toBeVisible();
  await expect(page.getByTestId("hero-visual")).toBeVisible();
  await context.close();
});

test("keyboard navigation reaches primary CTA", async ({ page }) => {
  await page.goto("/");
  // Tab through header links to the CTA
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(
      () => document.activeElement?.textContent ?? "",
    );
    if (/Start free/.test(focused)) return;
  }
  throw new Error("CTA not reachable by keyboard");
});
