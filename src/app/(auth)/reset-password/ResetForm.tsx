"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { Button, Input, Label, FieldError } from "@/components/ui";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
