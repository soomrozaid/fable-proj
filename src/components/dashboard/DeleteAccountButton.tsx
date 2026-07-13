"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="danger"
        onClick={() => setConfirming(true)}
      >
        Delete my account
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink">
        Type <strong>delete forever</strong> to confirm. Every printed code you
        own will permanently stop working.
      </p>
      <Input
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder="delete forever"
        aria-label="Confirmation phrase"
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          disabled={phrase !== "delete forever" || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              const res = await fetch("/api/account/delete", {
                method: "POST",
              });
              if (!res.ok) throw new Error();
              window.location.href = "/?account-deleted=1";
            } catch {
              setError("Deletion failed. Try again or contact support.");
              setBusy(false);
            }
          }}
        >
          {busy ? "Deleting…" : "Delete everything"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
