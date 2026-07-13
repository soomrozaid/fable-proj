"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, sendMagicLink, type AuthState } from "../actions";
import { Button, Input, Label, FieldError } from "@/components/ui";

export function LoginForm({
  next,
  urlError,
}: {
  next?: string;
  urlError?: string;
}) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction, pwPending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  );
  const [mgState, mgAction, mgPending] = useActionState<AuthState, FormData>(
    sendMagicLink,
    null,
  );

  return (
    <div>
      {urlError ? <FieldError>{urlError}</FieldError> : null}
      {mode === "password" ? (
        <form action={pwAction} className="space-y-4">
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-ink-faint underline hover:text-ink"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <FieldError>{pwState?.error}</FieldError>
          <Button type="submit" className="w-full" disabled={pwPending}>
            {pwPending ? "Logging in…" : "Log in"}
          </Button>
        </form>
      ) : (
        <form action={mgAction} className="space-y-4">
          <div>
            <Label htmlFor="email-magic">Email</Label>
            <Input
              id="email-magic"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <FieldError>{mgState?.error}</FieldError>
          {mgState?.message ? (
            <p className="text-sm text-verdigris-deep">{mgState.message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={mgPending}>
            {mgPending ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </form>
      )}
      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
        className="mt-4 w-full text-center text-xs text-ink-faint underline hover:text-ink"
      >
        {mode === "password"
          ? "Use a sign-in link instead"
          : "Use a password instead"}
      </button>
    </div>
  );
}
