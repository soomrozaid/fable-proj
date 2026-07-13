import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { envServer } from "@/config/env.server";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook: signature-verified and idempotent (stripe_events table).
 * Plan state is derived from the subscription object — the single source of
 * truth for entitlements.
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      envServer.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    log("warn", "webhook_bad_signature", {});
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Idempotency: first writer wins; replays ack immediately. Any other insert
  // failure must NOT ack, or Stripe would never retry a lost event.
  const { error: insertError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (insertError?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (insertError) {
    log("error", "webhook_idempotency_write_failed", {
      error: insertError.message,
    });
    return NextResponse.json({ error: "Storage failure" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            String(session.subscription),
          );
          await applySubscription(admin, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await applySubscription(admin, event.data.object);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    // Surface a 500 so Stripe retries; remove the idempotency marker first.
    await admin.from("stripe_events").delete().eq("id", event.id);
    log("error", "webhook_processing_failed", {
      type: event.type,
      error: String(e),
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

async function applySubscription(admin: AdminClient, sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const active = sub.status === "active" || sub.status === "trialing";
  const item = sub.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  const update = {
    plan: active ? "pro" : "free",
    stripe_subscription_id: active ? sub.id : null,
    current_period_end: active ? periodEnd : null,
  };

  // Prefer the explicit user mapping; fall back to customer id.
  const query = admin.from("profiles").update(update);
  const { data, error } = userId
    ? await query.eq("id", userId).select("id")
    : await query.eq("stripe_customer_id", customerId).select("id");

  if (error || !data?.length) {
    throw new Error(
      `No profile matched subscription ${sub.id} (user=${userId ?? "n/a"}, customer=${customerId})`,
    );
  }
  log("info", "plan_updated", { plan: update.plan, sub_status: sub.status });
}
