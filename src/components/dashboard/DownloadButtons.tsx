"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { downloadPng, downloadSvg } from "@/components/qr/download";
import type { QRDesign } from "@/lib/validate";

export function DownloadButtons({
  data,
  design,
  filename,
  svgAllowed,
}: {
  data: string;
  design: QRDesign;
  filename: string;
  svgAllowed: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="primary"
          onClick={async () => {
            setError(null);
            try {
              await downloadPng(data, design, filename);
            } catch {
              setError("Download failed — try a different browser.");
            }
          }}
        >
          Download PNG
        </Button>
        {svgAllowed ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setError(null);
              try {
                downloadSvg(data, design, filename);
              } catch {
                setError("Download failed — try a different browser.");
              }
            }}
          >
            SVG
          </Button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-center text-xs text-danger">
          {error}
        </p>
      ) : null}
      <p className="text-center text-xs text-ink-faint">
        PNG is 2048px — sharp up to poster size.
      </p>
    </div>
  );
}
