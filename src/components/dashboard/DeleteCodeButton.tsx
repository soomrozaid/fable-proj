"use client";

import { useState } from "react";
import { deleteCode } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui";

export function DeleteCodeButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="danger"
        onClick={() => setConfirming(true)}
      >
        Delete this code
      </Button>
    );
  }

  return (
    <div className="rounded-md border border-danger/40 bg-danger/5 p-4">
      <p className="text-sm text-ink">
        Delete <strong>{name}</strong>? Anything already printed with this code
        will stop working — permanently. This is the only way a Scanstone code
        dies.
      </p>
      <div className="mt-3 flex gap-2">
        <form action={deleteCode}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="danger">
            Yes, delete forever
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirming(false)}
        >
          Keep it
        </Button>
      </div>
    </div>
  );
}
