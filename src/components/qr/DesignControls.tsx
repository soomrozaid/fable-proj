"use client";

import type { QRDesign } from "@/lib/validate";
import { isScannableCombo } from "@/lib/qr/contrast";

export const PALETTES: Array<{ name: string; fg: string; bg: string }> = [
  { name: "Iron on paper", fg: "#1c1917", bg: "#ffffff" },
  { name: "Verdigris", fg: "#1f5248", bg: "#f2efe6" },
  { name: "Indigo plate", fg: "#22304a", bg: "#f4f2ec" },
  { name: "Oxblood", fg: "#5c2320", bg: "#f5efe4" },
  { name: "Slate", fg: "#2f3437", bg: "#eef0ef" },
  { name: "Copper etch", fg: "#6b3a16", bg: "#f7f0e3" },
];

const SHAPES: Array<{ id: QRDesign["shape"]; label: string }> = [
  { id: "square", label: "Cut" },
  { id: "rounded", label: "Worn" },
  { id: "dot", label: "Pebble" },
];

export function DesignControls({
  design,
  onChange,
}: {
  design: QRDesign;
  onChange: (d: QRDesign) => void;
}) {
  const scannable = isScannableCombo(design.fg, design.bg);

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
          Ink
        </legend>
        <div className="flex flex-wrap gap-2">
          {PALETTES.map((p) => {
            const active = p.fg === design.fg && p.bg === design.bg;
            return (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={`Palette: ${p.name}`}
                aria-pressed={active}
                onClick={() => onChange({ ...design, fg: p.fg, bg: p.bg })}
                className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                  active ? "border-verdigris" : "border-line"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`,
                }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink-soft">
          <label className="flex items-center gap-2">
            Ink
            <input
              type="color"
              value={design.fg}
              onChange={(e) => onChange({ ...design, fg: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border border-line bg-transparent"
              aria-label="Foreground color"
            />
          </label>
          <label className="flex items-center gap-2">
            Paper
            <input
              type="color"
              value={design.bg}
              onChange={(e) => onChange({ ...design, bg: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border border-line bg-transparent"
              aria-label="Background color"
            />
          </label>
        </div>
        {!scannable ? (
          <p role="alert" className="mt-2 text-xs text-danger">
            Low contrast — scanners need dark ink on light paper. Adjust the
            colors.
          </p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
          Carving
        </legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Module shape">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={design.shape === s.id}
              onClick={() => onChange({ ...design, shape: s.id })}
              className={`rounded-md border px-3.5 py-1.5 text-sm ${
                design.shape === s.id
                  ? "border-verdigris bg-verdigris/10 text-verdigris-deep"
                  : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
