import "server-only";
import Stripe from "stripe";
import { envServer } from "@/config/env.server";

export const stripe = new Stripe(envServer.STRIPE_SECRET_KEY, {
  typescript: true,
});

export function isLiveMode(): boolean {
  return envServer.STRIPE_SECRET_KEY.includes("_live_");
}
