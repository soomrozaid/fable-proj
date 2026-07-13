import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../AuthShell";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      footer={
        <Link
          href="/login"
          className="font-medium text-verdigris-deep underline"
        >
          Back to log in
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
