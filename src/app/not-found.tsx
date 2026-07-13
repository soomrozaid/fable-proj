import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { Wordmark } from "@/components/marketing/Wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Link href="/" aria-label="Scanstone home">
        <Wordmark />
      </Link>
      <h1 className="engraved mt-8 text-4xl font-semibold">
        Nothing carved here
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        This page doesn&apos;t exist. If you scanned a printed code and landed
        here, the code&apos;s owner may have deleted it.
      </p>
      <ButtonLink href="/" className="mt-6">
        Back to Scanstone
      </ButtonLink>
    </main>
  );
}
