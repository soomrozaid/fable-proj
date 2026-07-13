import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/log";

/**
 * Account deletion: cancels any active subscription, then removes the auth
 * user — profiles/codes/scans cascade via foreign keys.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id, {
          prorate: false,
        });
      } catch (e) {
        // Already-cancelled subscriptions shouldn't block account deletion.
        log("warn", "subscription_cancel_on_delete_failed", {
          error: String(e),
        });
      }
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    log("info", "account_deleted", { user: user.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    log("error", "account_delete_failed", { error: String(e) });
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
