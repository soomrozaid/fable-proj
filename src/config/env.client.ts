import { z } from "zod";

/**
 * Allowlisted public configuration. Values are inlined at build time from the
 * canonical env vars via the adapter block in next.config.ts. Only values that
 * are safe to ship to every browser belong here.
 */
const clientSchema = z.object({
  APP_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
});

const parsed = clientSchema.safeParse({
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(`Invalid public environment — ${missing}`);
}

export const envClient = parsed.data;
