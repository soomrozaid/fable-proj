import qrcode from "qrcode-generator";

export type ECC = "L" | "M" | "Q" | "H";

export interface QRMatrix {
  size: number;
  /** get(row, col) — true = dark module */
  get: (row: number, col: number) => boolean;
}

/**
 * Encode text into a QR module matrix. UTF-8 byte mode, automatic version.
 * Throws if the payload exceeds QR capacity for the chosen ECC.
 */
export function buildMatrix(data: string, ecc: ECC = "M"): QRMatrix {
  // The library's byte mode takes charCode & 0xff per character, so pre-encode
  // to UTF-8 and hand it one char per byte — international text scans correctly.
  const utf8 = new TextEncoder().encode(data);
  let byteString = "";
  for (const b of utf8) byteString += String.fromCharCode(b);
  const qr = qrcode(0, ecc);
  qr.addData(byteString, "Byte");
  qr.make();
  const size = qr.getModuleCount();
  return { size, get: (row, col) => qr.isDark(row, col) };
}

/** Max payload guard (rough, ECC M byte mode v40 ≈ 2331 bytes). */
export const MAX_QR_BYTES = 2300;
