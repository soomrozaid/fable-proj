import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui";
import { Wordmark } from "./Wordmark";

export async function SiteNav() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Scanstone home"
        >
          <Wordmark />
        </Link>
        <div className="hidden items-center gap-6 text-sm text-ink-soft sm:flex">
          <Link href="/qr-code-generator" className="hover:text-ink">
            Free generator
          </Link>
          <Link href="/demo" className="hover:text-ink">
            Live demo
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          {user ? (
            <ButtonLink href="/dashboard" variant="primary">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" variant="primary">
                Get started
              </ButtonLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
