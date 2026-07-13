function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h as string, 16));
  return (
    0.2126 * channel(r ?? 0) +
    0.7152 * channel(g ?? 0) +
    0.0722 * channel(b ?? 0)
  );
}

/**
 * Scanners need dark modules on a light background. Returns true when the
 * combination is safe to print (contrast ≥ 3:1 and fg darker than bg).
 */
export function isScannableCombo(fg: string, bg: string): boolean {
  const lf = luminance(fg);
  const lb = luminance(bg);
  if (lf >= lb) return false;
  const ratio = (lb + 0.05) / (lf + 0.05);
  return ratio >= 3;
}
