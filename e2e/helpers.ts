import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

export function adminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret)
    throw new Error("Tests need SUPABASE_URL / SUPABASE_SECRET_KEY");
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

/** Creates a pre-confirmed user directly (email confirmation can't be automated). */
export async function createConfirmedUser(prefix: string): Promise<TestUser> {
  const admin = adminClient();
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e5)}@scanstone-e2e.com`;
  const password = `Pw!${crypto.randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("user create failed");
  return { id: data.user.id, email, password };
}

export async function deleteUser(id: string) {
  const admin = adminClient();
  await admin.auth.admin.deleteUser(id);
}

export async function login(page: Page, user: TestUser) {
  // E2E runs hammer auth from one IP; clear our app-level rate limiter so the
  // limiter (tested implicitly by existing) doesn't fail unrelated tests.
  await adminClient().from("rate_limits").delete().like("key", "login:%");
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
}
