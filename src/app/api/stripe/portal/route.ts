import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { envServer } from "@/config/env.server";
import { log } from "@/lib/log";

/** Opens the Stripe customer portal (cancel, change plan, update card, invoices). */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(`${envServer.APP_URL}/account`, 303);
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${envServer.APP_URL}/account`,
    });
    return NextResponse.redirect(session.url, 303);
  } catch (e) {
    log("error", "portal_create_failed", { error: String(e) });
    return NextResponse.redirect(
      `${envServer.APP_URL}/account?billing_error=1`,
      303,
    );
  }
}
