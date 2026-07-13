import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../AuthShell";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Three dynamic codes free. Your redirects never stop working — that's the covenant."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-verdigris-deep underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
