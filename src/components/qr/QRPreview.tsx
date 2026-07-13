"use client";

import { useMemo } from "react";
import { renderQRSvg, type QRRenderOptions } from "@/lib/qr/svg";

/**
 * Live QR preview. The SVG string comes from our own renderer, which escapes
 * nothing user-controlled except validated #rrggbb colors — safe to inline.
 */
export function QRPreview({
  data,
  options,
  className,
}: {
  data: string;
  options?: QRRenderOptions;
  className?: string;
}) {
  const svg = useMemo(() => {
    if (!data) return null;
    try {
      return renderQRSvg(data, options);
    } catch {
      return null;
    }
  }, [data, options]);

  if (!svg) {
    return (
      <div
        className={`flex aspect-square items-center justify-center rounded-md border border-dashed border-line text-sm text-ink-faint ${className ?? ""}`}
      >
        Preview appears here
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-md border border-line bg-white ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
