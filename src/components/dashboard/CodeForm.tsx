"use client";

import { useActionState, useState } from "react";
import {
  createCode,
  updateCode,
  type CodeActionState,
} from "@/app/(app)/dashboard/actions";
import { Button, Input, Label, FieldError, Card } from "@/components/ui";
import { QRPreview } from "@/components/qr/QRPreview";
import { DesignControls } from "@/components/qr/DesignControls";
import { envClient } from "@/config/env.client";
import type { QRDesign } from "@/lib/validate";

const DEFAULT_DESIGN: QRDesign = {
  fg: "#1c1917",
  bg: "#ffffff",
  shape: "square",
};

export function CodeForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    destination_url: string;
    design: QRDesign;
    slug: string;
  };
}) {
  const [design, setDesign] = useState<QRDesign>(
    initial?.design ?? DEFAULT_DESIGN,
  );
  const [state, action, pending] = useActionState<CodeActionState, FormData>(
    mode === "create" ? createCode : updateCode,
    null,
  );

  // Preview target: real slug when editing, a representative one when creating.
  const previewData = `${envClient.APP_URL}/r/${initial?.slug ?? "yourcode1"}`;

  return (
    <form action={action} className="grid gap-8 md:grid-cols-[1fr_300px]">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="fg" value={design.fg} />
      <input type="hidden" name="bg" value={design.bg} />
      <input type="hidden" name="shape" value={design.shape} />

      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initial?.name}
            placeholder="Spring menu — table tents"
            maxLength={80}
            required
          />
          <p className="mt-1.5 text-xs text-ink-faint">Only you see this.</p>
        </div>

        <div>
          <Label htmlFor="destination_url">Destination URL</Label>
          <Input
            id="destination_url"
            name="destination_url"
            type="url"
            inputMode="url"
            defaultValue={initial?.destination_url}
            placeholder="https://example.com/menu"
            required
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            Where scanners land. Change it any time — the printed code stays
            valid.
          </p>
        </div>

        <DesignControls design={design} onChange={setDesign} />

        <FieldError>{state?.error}</FieldError>
        {state?.ok && !pending ? (
          <p role="status" className="text-sm text-verdigris-deep">
            Saved. Scanners now land on the new destination.
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Carving…"
              : "Saving…"
            : mode === "create"
              ? "Create code"
              : "Save changes"}
        </Button>
      </div>

      <div>
        <Card className="p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
            Preview
          </p>
          <QRPreview data={previewData} options={design} />
          {mode === "create" ? (
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Your code gets its own permanent short address when you create it.
            </p>
          ) : (
            <p className="mt-3 font-mono text-xs text-ink-soft">
              /r/{initial?.slug}
            </p>
          )}
        </Card>
      </div>
    </form>
  );
}
