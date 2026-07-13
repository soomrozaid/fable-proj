import { test, expect } from "@playwright/test";
import {
  createConfirmedUser,
  deleteUser,
  login,
  type TestUser,
} from "./helpers";

test.describe("billing", () => {
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createConfirmedUser("billing");
  });
  test.afterAll(async () => {
    if (user) await deleteUser(user.id);
  });

  test("webhook rejects unsigned requests", async ({ request }) => {
    const res = await request.post("/api/stripe/webhook", {
      data: JSON.stringify({ type: "checkout.session.completed" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("checkout requires authentication", async ({ request }) => {
    const res = await request.post("/api/stripe/checkout", {
      form: { interval: "monthly" },
    });
    expect(res.status()).toBe(401);
  });

  test("account page offers both plans and checkout reaches Stripe", async ({
    page,
  }) => {
    await login(page, user);
    await page.goto("/account");
    await expect(page.getByRole("button", { name: /Go Pro/ })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /\$79 \/ year/ }),
    ).toBeVisible();

    // Submitting the upgrade form must land on a live Stripe Checkout page.
    await page.getByRole("button", { name: /Go Pro/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });
    expect(page.url()).toContain("checkout.stripe.com");
  });

  test("portal endpoint responds safely for non-subscribers", async ({
    page,
  }) => {
    await login(page, user);
    const res = await page.request.post("/api/stripe/portal", {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    // No Stripe customer yet → back to /account. Customer without subscription
    // (e.g. after an abandoned checkout) → Stripe-hosted portal. Both are correct.
    expect(res.headers()["location"]).toMatch(/\/account|billing\.stripe\.com/);
  });
});
