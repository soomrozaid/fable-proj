import { buildMatrix, type ECC } from "./matrix";

export type ModuleShape = "square" | "rounded" | "dot";

export interface QRRenderOptions {
  fg?: string;
  bg?: string;
  shape?: ModuleShape;
  ecc?: ECC;
  /** Quiet zone width in modules (spec minimum is 4). */
  quietZone?: number;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function inFinder(row: number, col: number, size: number): boolean {
  const near = (v: number) => v < 7;
  const far = (v: number) => v >= size - 7;
  return (
    (near(row) && near(col)) ||
    (near(row) && far(col)) ||
    (far(row) && near(col))
  );
}

/** Classic concentric finder eye, drawn once per corner so styled modules never break detection. */
function finderEye(
  x: number,
  y: number,
  fg: string,
  shape: ModuleShape,
): string {
  const r = shape === "square" ? 0 : shape === "rounded" ? 1.75 : 3.5;
  const ri = shape === "square" ? 0 : shape === "rounded" ? 0.9 : 1.5;
  return (
    `<path fill="${fg}" fill-rule="evenodd" d="` +
    roundedRectPath(x, y, 7, 7, r) +
    roundedRectPath(x + 1, y + 1, 5, 5, Math.max(0, r - 0.75)) +
    `"/>` +
    `<path fill="${fg}" d="${roundedRectPath(x + 2, y + 2, 3, 3, ri)}"/>`
  );
}

function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  if (r <= 0) return `M${x} ${y}h${w}v${h}h${-w}z`;
  const c = Math.min(r, w / 2, h / 2);
  return (
    `M${x + c} ${y}h${w - 2 * c}a${c} ${c} 0 0 1 ${c} ${c}v${h - 2 * c}` +
    `a${c} ${c} 0 0 1 ${-c} ${c}h${-(w - 2 * c)}a${c} ${c} 0 0 1 ${-c} ${-c}` +
    `v${-(h - 2 * c)}a${c} ${c} 0 0 1 ${c} ${-c}z`
  );
}

/**
 * Render a QR code as a standalone SVG string. Deterministic, dependency-free
 * output — safe to use server-side (previews, OG images) and client-side
 * (downloads). Inputs are validated; colors must be #rrggbb.
 */
export function renderQRSvg(data: string, opts: QRRenderOptions = {}): string {
  const fg = HEX.test(opts.fg ?? "") ? (opts.fg as string) : "#1c1917";
  const bg = HEX.test(opts.bg ?? "") ? (opts.bg as string) : "#ffffff";
  const shape: ModuleShape = opts.shape ?? "square";
  const quiet = Math.max(2, Math.min(8, opts.quietZone ?? 4));

  const m = buildMatrix(data, opts.ecc ?? "M");
  const total = m.size + quiet * 2;

  let modules = "";
  for (let row = 0; row < m.size; row++) {
    for (let col = 0; col < m.size; col++) {
      if (!m.get(row, col) || inFinder(row, col, m.size)) continue;
      const x = col + quiet;
      const y = row + quiet;
      if (shape === "dot") {
        // d=0.95: verified largest-dot look that still decodes under strict binarization
        modules += `M${x + 0.5} ${y + 0.025}a0.475 0.475 0 1 0 0 0.95a0.475 0.475 0 1 0 0 -0.95z`;
      } else if (shape === "rounded") {
        modules += roundedRectPath(x + 0.04, y + 0.04, 0.92, 0.92, 0.28);
      } else {
        modules += `M${x} ${y}h1v1h-1z`;
      }
    }
  }

  const eyes =
    finderEye(quiet, quiet, fg, shape) +
    finderEye(quiet + m.size - 7, quiet, fg, shape) +
    finderEye(quiet, quiet + m.size - 7, fg, shape);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" ` +
    `shape-rendering="geometricPrecision" role="img" aria-label="QR code">` +
    `<rect width="${total}" height="${total}" fill="${bg}"/>` +
    `<path fill="${fg}" d="${modules}"/>` +
    eyes +
    `</svg>`
  );
}
