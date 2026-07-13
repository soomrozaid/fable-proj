import { describe, expect, it } from "vitest";
import { validateDestinationUrl, designSchema } from "../validate";
import { generateSlug, SLUG_PATTERN } from "../slug";
import { limitsFor, PLANS } from "../plans";
import { classifyUserAgent } from "../ua";

describe("validateDestinationUrl", () => {
  it("accepts normal https URLs", () => {
    const r = validateDestinationUrl("https://example.com/menu?x=1");
    expect(r.ok).toBe(true);
  });
  it("prepends https:// when scheme is missing", () => {
    const r = validateDestinationUrl("example.com/menu");
    expect(r).toEqual({ ok: true, url: "https://example.com/menu" });
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,x",
    "file:///etc/passwd",
    "ftp://example.com",
  ])("rejects non-http schemes: %s", (bad) => {
    expect(validateDestinationUrl(bad).ok).toBe(false);
  });
  it.each([
    "http://localhost/x",
    "http://127.0.0.1/x",
    "http://10.1.2.3/x",
    "http://192.168.1.1/x",
    "http://172.16.0.1/x",
    "http://169.254.169.254/latest/meta-data",
    "http://server.local/x",
  ])("rejects private/local destinations: %s", (bad) => {
    expect(validateDestinationUrl(bad).ok).toBe(false);
  });
  it("rejects embedded credentials", () => {
    expect(validateDestinationUrl("https://user:pass@example.com").ok).toBe(
      false,
    );
  });
  it("rejects over-long URLs", () => {
    expect(
      validateDestinationUrl(`https://example.com/${"a".repeat(2100)}`).ok,
    ).toBe(false);
  });
  it("rejects empty and garbage", () => {
    expect(validateDestinationUrl("").ok).toBe(false);
    expect(validateDestinationUrl("not a url").ok).toBe(false);
  });
});

describe("designSchema", () => {
  it("applies defaults", () => {
    expect(designSchema.parse({})).toEqual({
      fg: "#1c1917",
      bg: "#ffffff",
      shape: "square",
    });
  });
  it("rejects non-hex colors", () => {
    expect(() => designSchema.parse({ fg: "red" })).toThrow();
    expect(() => designSchema.parse({ fg: "#fff" })).toThrow();
  });
});

describe("slug", () => {
  it("generates valid, unambiguous slugs", () => {
    for (let i = 0; i < 200; i++) {
      const s = generateSlug();
      expect(s).toMatch(SLUG_PATTERN);
      expect(s).not.toMatch(/[01loiLOI]/);
    }
  });
  it("generates distinct slugs", () => {
    const set = new Set(Array.from({ length: 1000 }, () => generateSlug()));
    expect(set.size).toBe(1000);
  });
});

describe("plans", () => {
  it("falls back to free for unknown plans", () => {
    expect(limitsFor(null)).toEqual(PLANS.free);
    expect(limitsFor("enterprise")).toEqual(PLANS.free);
  });
  it("free never gates redirects (covenant guard)", () => {
    // The PlanLimits type must not contain any redirect-related gate.
    const keys = Object.keys(PLANS.free);
    expect(keys.every((k) => !/redirect|scan/i.test(k))).toBe(true);
  });
});

describe("classifyUserAgent", () => {
  it("classifies iPhone", () => {
    expect(
      classifyUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      ),
    ).toEqual({ device: "mobile", os: "ios" });
  });
  it("classifies Android tablet", () => {
    expect(
      classifyUserAgent("Mozilla/5.0 (Linux; Android 14; SM-X910)"),
    ).toEqual({
      device: "tablet",
      os: "android",
    });
  });
  it("classifies bots", () => {
    expect(classifyUserAgent("Googlebot/2.1").device).toBe("bot");
    expect(classifyUserAgent("curl/8.0").device).toBe("bot");
  });
  it("handles null", () => {
    expect(classifyUserAgent(null)).toEqual({
      device: "unknown",
      os: "unknown",
    });
  });
});
