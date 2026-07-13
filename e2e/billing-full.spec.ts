import { test, expect } from "@playwright/test";
import Stripe from "stripe";
import {
  adminClient,
  createConfirmedUser,
  deleteUser,
  login,
  type TestUser,
} from "./helpers";

/**
 * Full billing cycle in Stripe TEST MODE against the local server:
 * checkout with the 4242 test card → webhook (via `stripe listen`) → plan
 * flips to pro → cancel via API → webhook → plan back to free.
 *
 * Requires: dev server + `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 * and STRIPE_SECRET_KEY (test mode) in the environment.
 */
test.describe("billing full cycle @billing-full", () => {
  let user: TestUser;

  test.beforeAll(async () => {
    test.skip(
      !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
      "needs test mode",
    );
    user = await createConfirmedUser("fullbilling");
  });
  test.afterAll(async () => {
    if (user) await deleteUser(user.id);
  });

  test("checkout → pro → cancel → free", async ({ page }) => {
    test.setTimeout(180_000);
    await login(page, user);
    await page.goto("/account");
    await page.getByRole("button", { name: /Go Pro/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });

    // Stripe hosted checkout (test mode)
    await page
      .getByRole("textbox", { name: /Card number/i })
      .fill("4242 4242 4242 4242");
    await page.getByRole("textbox", { name: /Expiration/i }).fill("12 / 34");
    await page.getByRole("textbox", { name: "CVC" }).fill("123");
    await page
      .getByRole("textbox", { name: /Cardholder name/i })
      .fill("E2E Tester");
    const zip = page.getByRole("textbox", { name: /ZIP/i });
    if (await zip.isVisible().catch(() => false)) await zip.fill("42424");
    await page.getByTestId("hosted-payment-submit-button").click();

    await page.waitForURL("**/account?upgraded=1", { timeout: 60000 });

    // Webhook lands async — poll the plan.
    const admin = adminClient();
    await expect
      .poll(
        async () => {
          const { data } = await admin
            .from("profiles")
            .select("plan, stripe_subscription_id")
            .eq("id", user.id)
            .single();
          return data?.plan;
        },
        { timeout: 30000, intervals: [1000] },
      )
      .toBe("pro");

    // Pro UI visible
    await page.reload();
    await expect(
      page.getByRole("button", { name: /Manage billing/ }),
    ).toBeVisible();

    // Cancel immediately via API (portal UI belongs to Stripe; the webhook path
    // is what we own) and verify the downgrade propagates.
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();
    expect(profile?.stripe_subscription_id).toBeTruthy();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    await stripe.subscriptions.cancel(
      profile!.stripe_subscription_id as string,
    );

    await expect
      .poll(
        async () => {
          const { data } = await admin
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();
          return data?.plan;
        },
        { timeout: 30000, intervals: [1000] },
      )
      .toBe("free");
  });
});
