import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envServer } from "@/config/env.server";

/** Cookie-scoped Supabase client for the current request (RLS applies). */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    envServer.SUPABASE_URL,
    envServer.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — session refresh is handled in proxy.ts.
          }
        },
      },
    },
  );
}

/** Convenience: current authenticated user or null (verified with the auth server). */
export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
