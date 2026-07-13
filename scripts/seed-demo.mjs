/**
 * Seeds the public demo: a demo user, the `cafemenu` dynamic code, and ~45
 * days of plausible scan history. Idempotent — safe to re-run.
 *
 * Usage: set -a; source .env.local; set +a; node scripts/seed-demo.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY");
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@scanstone.app";
const DEMO_SLUG = "cafemenu";

async function main() {
  // 1. Demo user (idempotent)
  let userId;
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users?.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    userId = existing.id;
    console.log("demo user exists");
  } else {
    const password = crypto.randomUUID() + crypto.randomUUID();
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log("demo user created");
  }

  // 2. Demo code (idempotent)
  let codeId;
  const { data: code } = await admin
    .from("qr_codes")
    .select("id")
    .eq("slug", DEMO_SLUG)
    .maybeSingle();
  if (code) {
    codeId = code.id;
    console.log("demo code exists");
  } else {
    const { data: created, error } = await admin
      .from("qr_codes")
      .insert({
        user_id: userId,
        slug: DEMO_SLUG,
        name: "Café menu — table tents",
        destination_url: "https://en.wikipedia.org/wiki/Menu",
        design: { fg: "#1f5248", bg: "#f2efe6", shape: "rounded" },
      })
      .select("id")
      .single();
    if (error) throw error;
    codeId = created.id;
    console.log("demo code created");
  }

  // 3. Scan history (only if sparse)
  const { count } = await admin
    .from("scans")
    .select("id", { count: "exact", head: true })
    .eq("code_id", codeId);
  if ((count ?? 0) > 100) {
    console.log(`scan history present (${count} rows) — skipping`);
    return;
  }

  const countries = ["US", "US", "US", "US", "US", "CA", "CA", "GB", "DE", "AU"];
  const regions = { US: ["CA", "NY", "TX", "WA", "IL"], CA: ["ON", "BC"], GB: [""], DE: [""], AU: [""] };
  const devices = ["mobile", "mobile", "mobile", "mobile", "mobile", "mobile", "mobile", "tablet", "desktop"];
  const osByDevice = { mobile: ["ios", "ios", "android"], tablet: ["ios", "android"], desktop: ["macos", "windows"] };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const rows = [];
  const now = Date.now();
  for (let day = 45; day >= 0; day--) {
    // gently rising trend + weekend bump
    const date = new Date(now - day * 86400_000);
    const dow = date.getUTCDay();
    const base = 6 + Math.round((45 - day) * 0.55);
    const dayCount = Math.max(
      1,
      Math.round(base * (dow === 5 || dow === 6 ? 1.6 : 1) * (0.7 + Math.random() * 0.6)),
    );
    for (let i = 0; i < dayCount; i++) {
      const country = pick(countries);
      const device = pick(devices);
      // meals cluster: 11-14h and 17-21h local-ish
      const hour = Math.random() < 0.5 ? 11 + Math.floor(Math.random() * 3) : 17 + Math.floor(Math.random() * 4);
      const ts = new Date(date);
      ts.setUTCHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      if (ts.getTime() > now) continue; // never seed into the future
      rows.push({
        code_id: codeId,
        scanned_at: ts.toISOString(),
        country,
        region: pick(regions[country] ?? [""]),
        device,
        os: pick(osByDevice[device]),
        referer: "",
      });
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin.from("scans").insert(rows.slice(i, i + 500));
    if (error) throw error;
  }
  await admin
    .from("qr_codes")
    .update({ scan_count: (count ?? 0) + rows.length })
    .eq("id", codeId);
  console.log(`seeded ${rows.length} scans`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
