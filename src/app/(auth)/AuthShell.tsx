import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/marketing/Wordmark";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8" aria-label="Scanstone home">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-line bg-white/60 p-7 shadow-[var(--shadow-card)]">
        <h1 className="engraved text-2xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <div className="mt-5 text-sm text-ink-soft">{footer}</div>
      ) : null}
    </main>
  );
}
