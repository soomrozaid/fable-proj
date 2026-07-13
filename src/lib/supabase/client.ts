"use client";

import { createBrowserClient } from "@supabase/ssr";
import { envClient } from "@/config/env.client";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    envClient.SUPABASE_URL,
    envClient.SUPABASE_PUBLISHABLE_KEY,
  );
}
