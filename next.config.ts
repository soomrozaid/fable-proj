import type { NextConfig } from "next";

/**
 * Framework adapter: the canonical (framework-neutral) env vars are the source
 * of truth. Next.js requires NEXT_PUBLIC_* names to inline values into browser
 * bundles, so we alias ONLY the allowlisted public values here.
 * Never add secret values to this block.
 */
const publicEnv = {
  NEXT_PUBLIC_APP_URL: process.env.APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
};

const nextConfig: NextConfig = {
  env: publicEnv,
  poweredByHeader: false,
  // The blog article route reads content/<collection>/<slug>.md via fs at request
  // time (the marketing segment is dynamic because SiteNav reads auth cookies).
  // Next can't trace the dynamic path, so force the content dir into the bundle.
  outputFileTracingIncludes: {
    "/blog/[slug]": ["./content/**/*.md"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
