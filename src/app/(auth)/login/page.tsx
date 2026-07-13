import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your codes."
      footer={
        <>
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-verdigris-deep underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={params.next} urlError={params.error} />
    </AuthShell>
  );
}
