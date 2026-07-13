import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/marketing/Wordmark";
import { Badge, ButtonLink } from "@/components/ui";
import { signOut } from "@/app/(auth)/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const plan = profile?.plan === "pro" ? "pro" : "free";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" aria-label="Dashboard home">
              <Wordmark size={20} />
            </Link>
            <nav
              aria-label="App"
              className="hidden items-center gap-4 text-sm text-ink-soft sm:flex"
            >
              <Link href="/dashboard" className="hover:text-ink">
                Codes
              </Link>
              <Link href="/account" className="hover:text-ink">
                Account
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={plan === "pro" ? "green" : "neutral"}>
              {plan === "pro" ? "Pro" : "Free"}
            </Badge>
            {plan === "free" ? (
              <ButtonLink
                href="/account#upgrade"
                variant="accent"
                className="hidden sm:inline-flex"
              >
                Upgrade
              </ButtonLink>
            ) : null}
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-ink-faint underline-offset-2 hover:text-ink hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav
          aria-label="App mobile"
          className="flex gap-4 border-t border-line/60 px-4 py-2 text-sm text-ink-soft sm:hidden"
        >
          <Link href="/dashboard" className="hover:text-ink">
            Codes
          </Link>
          <Link href="/account" className="hover:text-ink">
            Account
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
