import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { envServer } from "@/config/env.server";
import { log } from "@/lib/log";

/** Creates a Stripe Checkout session for the Pro subscription. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const interval = form.get("interval") === "yearly" ? "yearly" : "monthly";
  const priceId =
    interval === "yearly"
      ? envServer.STRIPE_YEARLY_PRICE_ID
      : envServer.STRIPE_MONTHLY_PRICE_ID;

  try {
    // Reuse the Stripe customer if one exists.
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan === "pro") {
      return NextResponse.redirect(`${envServer.APP_URL}/account`, 303);
    }

    let customerId = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${envServer.APP_URL}/account?upgraded=1`,
      cancel_url: `${envServer.APP_URL}/account`,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    });

    if (!session.url) throw new Error("Checkout session has no URL");
    return NextResponse.redirect(session.url, 303);
  } catch (e) {
    log("error", "checkout_create_failed", { error: String(e) });
    return NextResponse.redirect(
      `${envServer.APP_URL}/account?billing_error=1`,
      303,
    );
  }
}
