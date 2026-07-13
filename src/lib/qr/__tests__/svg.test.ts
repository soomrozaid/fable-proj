import { describe, expect, it } from "vitest";
import { Resvg } from "@resvg/resvg-js";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { renderQRSvg } from "../svg";
import { buildMatrix } from "../matrix";
import { wifiPayload, vcardPayload } from "../payloads";

function decodeSvg(svg: string): string | null {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 512 } })
    .render()
    .asPng();
  const { data, width, height } = PNG.sync.read(Buffer.from(png));
  const result = jsQR(new Uint8ClampedArray(data), width, height);
  return result?.data ?? null;
}

describe("QR engine", () => {
  it("builds a valid matrix", () => {
    const m = buildMatrix("https://example.com");
    expect(m.size).toBeGreaterThanOrEqual(21);
    // Finder pattern corner is always dark
    expect(m.get(0, 0)).toBe(true);
  });

  const url = "https://scanstone.example/r/abc23456";

  for (const shape of ["square", "rounded", "dot"] as const) {
    it(`renders a scannable ${shape} QR`, () => {
      const svg = renderQRSvg(url, { shape });
      expect(svg).toContain("<svg");
      expect(decodeSvg(svg)).toBe(url);
    });
  }

  it("scans with custom colors", () => {
    const svg = renderQRSvg(url, {
      fg: "#233937",
      bg: "#f5f1e8",
      shape: "rounded",
    });
    expect(decodeSvg(svg)).toBe(url);
  });

  it("rejects invalid colors safely (falls back)", () => {
    const svg = renderQRSvg(url, { fg: '"/><script>x</script>' as string });
    expect(svg).not.toContain("script");
    expect(decodeSvg(svg)).toBe(url);
  });

  it("encodes wifi payloads scannably", () => {
    const payload = wifiPayload({
      ssid: 'Cafe "Ost"; 5G',
      password: "p;a,s:s",
      security: "WPA",
    });
    expect(decodeSvg(renderQRSvg(payload))).toBe(payload);
  });

  it("encodes vcard payloads scannably", () => {
    const payload = vcardPayload({
      firstName: "Ada",
      lastName: "Lovelace",
      organization: "Analytical, Engines; Ltd",
      email: "ada@example.com",
    });
    expect(decodeSvg(renderQRSvg(payload))).toBe(payload);
  });

  it("encodes UTF-8 content scannably", () => {
    const text = "Café Zürich — メニュー";
    expect(decodeSvg(renderQRSvg(text))).toBe(text);
  });
});
