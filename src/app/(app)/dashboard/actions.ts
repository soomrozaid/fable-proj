"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { limitsFor } from "@/lib/plans";
import { generateSlug } from "@/lib/slug";
import {
  validateDestinationUrl,
  codeNameSchema,
  designSchema,
} from "@/lib/validate";
import { log } from "@/lib/log";

export type CodeActionState = { error?: string; ok?: boolean } | null;

async function requireUserAndPlan() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  return { supabase, user, limits: limitsFor(profile?.plan) };
}

export async function createCode(
  _prev: CodeActionState,
  formData: FormData,
): Promise<CodeActionState> {
  const { supabase, user, limits } = await requireUserAndPlan();

  const name = codeNameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0]?.message };

  const dest = validateDestinationUrl(
    String(formData.get("destination_url") ?? ""),
  );
  if (!dest.ok) return { error: dest.error };

  let design;
  try {
    design = designSchema.parse({
      fg: formData.get("fg") || undefined,
      bg: formData.get("bg") || undefined,
      shape: formData.get("shape") || undefined,
    });
  } catch {
    return { error: "Invalid design settings." };
  }

  // Entitlement: active code count (server-side; RLS scopes the count to the user).
  const { count } = await supabase
    .from("qr_codes")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) >= limits.maxCodes) {
    return {
      error:
        limits.maxCodes <= 3
          ? "You've used all 3 free codes. Upgrade to Pro for up to 500 — your existing codes keep working either way."
          : "You've reached the 500-code limit. Contact us if you need more.",
    };
  }

  // Insert with slug-collision retry.
  let codeId: string | null = null;
  for (let attempt = 0; attempt < 3 && !codeId; attempt++) {
    const slug = generateSlug();
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        user_id: user.id,
        slug,
        name: name.data,
        destination_url: dest.url,
        design,
      })
      .select("id")
      .single();
    if (data) codeId = data.id;
    else if (error && error.code !== "23505") {
      log("error", "code_create_failed", { code: error.code });
      return { error: "Couldn't create the code. Try again." };
    }
  }
  if (!codeId) return { error: "Couldn't create the code. Try again." };

  log("info", "code_created", { user: user.id });
  revalidatePath("/dashboard");
  redirect(`/dashboard/codes/${codeId}?created=1`);
}

export async function updateCode(
  _prev: CodeActionState,
  formData: FormData,
): Promise<CodeActionState> {
  const { supabase } = await requireUserAndPlan();

  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Unknown code." };

  const name = codeNameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0]?.message };

  const dest = validateDestinationUrl(
    String(formData.get("destination_url") ?? ""),
  );
  if (!dest.ok) return { error: dest.error };

  let design;
  try {
    design = designSchema.parse({
      fg: formData.get("fg") || undefined,
      bg: formData.get("bg") || undefined,
      shape: formData.get("shape") || undefined,
    });
  } catch {
    return { error: "Invalid design settings." };
  }

  // RLS restricts the update to rows owned by the current user.
  const { error, data } = await supabase
    .from("qr_codes")
    .update({ name: name.data, destination_url: dest.url, design })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { error: "Couldn't save changes." };

  revalidatePath(`/dashboard/codes/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteCode(formData: FormData): Promise<void> {
  const { supabase } = await requireUserAndPlan();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  await supabase.from("qr_codes").delete().eq("id", id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
