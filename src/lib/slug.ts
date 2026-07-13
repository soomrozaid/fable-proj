/**
 * Short-slug generator for redirect URLs. Unambiguous alphabet (no 0/O, 1/l/I)
 * to stay phone-typeable from print. 8 chars of 31-symbol alphabet ≈ 8.5e11
 * combinations — collision retry handled at insert time via unique index.
 */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function generateSlug(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export const SLUG_PATTERN = /^[23456789abcdefghjkmnpqrstuvwxyz]{4,16}$/;
