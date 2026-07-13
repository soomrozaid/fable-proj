"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { envServer } from "@/config/env.server";
import { log } from "@/lib/log";

export type AuthState = { error?: string; message?: string } | null;

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

async function checkAuthRateLimit(action: string): Promise<boolean> {
  try {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("hit_rate_limit", {
      p_key: `${action}:${ip}`,
      p_max: 20,
      p_window_seconds: 600,
    });
    if (error) {
      log("warn", "rate_limit_check_failed", { action, error: error.message });
      return true; // fail open — availability over strictness for auth
    }
    return data === true;
  } catch {
    return true;
  }
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!(await checkAuthRateLimit("signup"))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${envServer.APP_URL}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    log("warn", "signup_failed", { code: error.code });
    return { error: error.message };
  }
  // With autoconfirm enabled a session is returned — go straight to work.
  if (data.session) redirect("/dashboard");
  return {
    message:
      "Check your inbox — we sent a confirmation link. Click it to finish creating your account.",
  };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!(await checkAuthRateLimit("login"))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Wrong email or password." };

  const next = formData.get("next");
  redirect(
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard",
  );
}

export async function sendMagicLink(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  if (!(await checkAuthRateLimit("magic"))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      emailRedirectTo: `${envServer.APP_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };
  return { message: "Check your inbox — we sent you a sign-in link." };
}

export async function sendPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  if (!(await checkAuthRateLimit("reset"))) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${envServer.APP_URL}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };
  return {
    message: "If that address has an account, a reset link is on its way.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .safeParse(formData.get("password"));
  if (!password.success) return { error: password.error.issues[0]?.message };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
