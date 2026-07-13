import "server-only";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/config/env.server";

/**
 * Service-role client. Bypasses RLS — use only for: redirect slug lookup,
 * scan recording, Stripe webhook plan updates, account deletion.
 * Never derive authorization from client input when using this client.
 */
export function createSupabaseAdminClient() {
  return createClient(envServer.SUPABASE_URL, envServer.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
