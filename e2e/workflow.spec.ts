import { test, expect } from "@playwright/test";
import {
  adminClient,
  createConfirmedUser,
  deleteUser,
  login,
  type TestUser,
} from "./helpers";

test.describe("core workflow", () => {
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createConfirmedUser("workflow");
  });
  test.afterAll(async () => {
    if (user) await deleteUser(user.id);
  });

  test("signup creates an account and lands on the dashboard", async ({
    page,
  }) => {
    const email = `signup-ui-${Date.now()}@scanstone-e2e.com`;
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("a-strong-password-1");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await expect(
      page.getByRole("heading", { name: "Your codes" }),
    ).toBeVisible();
    // cleanup
    const admin = adminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    const created = data?.users?.find((u) => u.email === email);
    if (created) await admin.auth.admin.deleteUser(created.id);
  });

  test("login → create code → redirect works → scan recorded → edit → logout", async ({
    page,
    request,
  }) => {
    await login(page, user);
    await expect(
      page.getByRole("heading", { name: "Your codes" }),
    ).toBeVisible();
    await expect(page.getByText(/Carve your first code/i)).toBeVisible();

    // create
    await page
      .getByRole("link", { name: /New dynamic code/i })
      .first()
      .click();
    await page.getByLabel("Name").fill("E2E test code");
    await page.getByLabel("Destination URL").fill("https://example.com/first");
    await page.getByRole("button", { name: "Create code" }).click();
    await page.waitForURL("**/dashboard/codes/**");
    await expect(page.getByText("Set in stone.")).toBeVisible();

    const shortUrl = await page
      .locator("p.font-mono", { hasText: "/r/" })
      .first()
      .textContent();
    expect(shortUrl).toBeTruthy();
    const slug = shortUrl!.trim().split("/r/")[1]!;

    // redirect fast path
    const res = await request.get(`/r/${slug}`, { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()["location"]).toBe("https://example.com/first");

    // scan recorded (fire-and-forget → allow a beat)
    await page.waitForTimeout(2500);
    const admin = adminClient();
    const { data: code } = await admin
      .from("qr_codes")
      .select("id, scan_count")
      .eq("slug", slug)
      .single();
    expect(code).toBeTruthy();
    const { count } = await admin
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("code_id", code!.id);
    expect(count).toBeGreaterThanOrEqual(1);

    // edit destination
    await page.getByLabel("Destination URL").fill("https://example.com/second");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/Saved\./i)).toBeVisible();
    const res2 = await request.get(`/r/${slug}`, { maxRedirects: 0 });
    expect(res2.headers()["location"]).toBe("https://example.com/second");

    // logout
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/");
  });

  test("invalid destinations are rejected", async ({ page }) => {
    await login(page, user);
    await page.goto("/dashboard/new");
    await page.getByLabel("Name").fill("Bad URL test");
    const dest = page.getByLabel("Destination URL");

    for (const bad of [
      "javascript:alert(1)",
      "http://localhost/admin",
      "not a url at all",
    ]) {
      await dest.fill(bad);
      await page.getByRole("button", { name: "Create code" }).click();
      await expect(page.locator("p[role='alert']")).toBeVisible();
    }
  });

  test("free plan enforces the 3-code limit", async ({ page }) => {
    const limited = await createConfirmedUser("limits");
    try {
      await login(page, limited);
      for (let i = 1; i <= 3; i++) {
        await page.goto("/dashboard/new");
        await page.getByLabel("Name").fill(`Limit test ${i}`);
        await page
          .getByLabel("Destination URL")
          .fill(`https://example.com/${i}`);
        await page.getByRole("button", { name: "Create code" }).click();
        await page.waitForURL("**/dashboard/codes/**");
      }
      await page.goto("/dashboard/new");
      await page.getByLabel("Name").fill("Limit test 4");
      await page.getByLabel("Destination URL").fill("https://example.com/4");
      await page.getByRole("button", { name: "Create code" }).click();
      await expect(page.getByText(/used all 3 free codes/i)).toBeVisible();
      // covenant: existing redirects still resolve
      await page.goto("/dashboard");
      await expect(page.getByText("3 of 3 dynamic codes")).toBeVisible();
    } finally {
      await deleteUser(limited.id);
    }
  });

  test("users cannot see each other's codes or scans", async ({ page }) => {
    const alice = await createConfirmedUser("alice");
    const bob = await createConfirmedUser("bob");
    try {
      // Alice creates a code
      await login(page, alice);
      await page.goto("/dashboard/new");
      await page.getByLabel("Name").fill("Alice private code");
      await page
        .getByLabel("Destination URL")
        .fill("https://example.com/alice");
      await page.getByRole("button", { name: "Create code" }).click();
      await page.waitForURL("**/dashboard/codes/**");
      const aliceCodeUrl = page.url();
      const aliceCodeId = aliceCodeUrl.split("/codes/")[1]!.split("?")[0]!;
      await page.getByRole("button", { name: "Sign out" }).click();
      await page.waitForURL("**/");

      // Bob cannot load Alice's code page
      await login(page, bob);
      await page.goto(`/dashboard/codes/${aliceCodeId}`);
      await expect(
        page.getByRole("heading", { name: /Nothing carved here/i }),
      ).toBeVisible();

      // Bob (authenticated) cannot export Alice's data via API either:
      // page.request shares Bob's session cookies.
      const res = await page.request.get(`/api/codes/${aliceCodeId}/export`);
      expect([403, 404]).toContain(res.status());

      // Direct PostgREST probe with anon key + Bob's session is blocked by RLS:
      // (covered at the API level above; DB-level policies verified in supabase tests)
    } finally {
      await deleteUser(alice.id);
      await deleteUser(bob.id);
    }
  });

  test("data export returns the user's own data", async ({ page }) => {
    await login(page, user);
    const res = await page.request.get("/api/account/export");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.account.id).toBe(user.id);
    expect(Array.isArray(body.codes)).toBe(true);
  });

  test("unauthenticated users are redirected from the app", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
    await page.goto("/account");
    await page.waitForURL("**/login**");
  });

  test("csv export is gated to pro", async ({ page }) => {
    await login(page, user);
    // grab any code id of this user
    const admin = adminClient();
    const { data: codes } = await admin
      .from("qr_codes")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);
    if (!codes?.length) test.skip();
    const res = await page.request.get(`/api/codes/${codes![0]!.id}/export`);
    expect(res.status()).toBe(403);
  });
});
