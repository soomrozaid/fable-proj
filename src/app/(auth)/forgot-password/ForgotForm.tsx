"use client";

import { useActionState } from "react";
import { sendPasswordReset, type AuthState } from "../actions";
import { Button, Input, Label, FieldError } from "@/components/ui";

export function ForgotForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    sendPasswordReset,
    null,
  );

  if (state?.message) {
    return (
      <p
        role="status"
        className="rounded-md border border-verdigris/30 bg-verdigris/10 p-4 text-sm text-verdigris-deep"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
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
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
