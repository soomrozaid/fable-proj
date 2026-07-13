import { z } from "zod";

/** Hosts that must never be redirect destinations (SSRF/local-network). */
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /\.local$/i,
  /^\[?f[cd][0-9a-f]{2}:/i,
];

export function validateDestinationUrl(
  raw: string,
): { ok: true; url: string } | { ok: false; error: string } {
  const input = raw.trim();
  if (input.length === 0)
    return { ok: false, error: "Enter a destination URL." };
  if (input.length > 2048)
    return { ok: false, error: "URL is too long (2048 max)." };

  // Be forgiving: prepend https:// when the scheme is missing.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(input)
    ? input
    : `https://${input}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return {
      ok: false,
      error: "Only http and https destinations are allowed.",
    };
  }
  if (!url.hostname.includes(".")) {
    return { ok: false, error: "Use a full hostname, e.g. example.com." };
  }
  if (BLOCKED_HOST_PATTERNS.some((p) => p.test(url.hostname))) {
    return { ok: false, error: "That destination isn't allowed." };
  }
  if (url.username || url.password) {
    return {
      ok: false,
      error: "URLs with embedded credentials aren't allowed.",
    };
  }

  return { ok: true, url: url.toString() };
}

export const codeNameSchema = z
  .string()
  .trim()
  .min(1, "Give this code a name.")
  .max(80, "Name is too long (80 max).");

export const designSchema = z.object({
  fg: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#1c1917"),
  bg: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#ffffff"),
  shape: z.enum(["square", "rounded", "dot"]).default("square"),
});

export type QRDesign = z.infer<typeof designSchema>;
