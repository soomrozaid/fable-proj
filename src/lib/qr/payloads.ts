/** Payload builders for the free static tools. */

function escapeWifi(v: string): string {
  return v.replace(/([\\;,":])/g, "\\$1");
}

export function wifiPayload(opts: {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}): string {
  const { ssid, password, security, hidden } = opts;
  const parts = [
    `T:${security}`,
    `S:${escapeWifi(ssid)}`,
    security !== "nopass" ? `P:${escapeWifi(password)}` : "",
    hidden ? "H:true" : "",
  ].filter(Boolean);
  return `WIFI:${parts.join(";")};;`;
}

function escapeVcard(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

export function vcardPayload(opts: {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(opts.lastName)};${escapeVcard(opts.firstName)};;;`,
    `FN:${escapeVcard([opts.firstName, opts.lastName].filter(Boolean).join(" "))}`,
    opts.organization ? `ORG:${escapeVcard(opts.organization)}` : "",
    opts.title ? `TITLE:${escapeVcard(opts.title)}` : "",
    opts.phone ? `TEL;TYPE=CELL:${escapeVcard(opts.phone)}` : "",
    opts.email ? `EMAIL:${escapeVcard(opts.email)}` : "",
    opts.website ? `URL:${escapeVcard(opts.website)}` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}
