/** Coarse, privacy-preserving device classification. No fingerprinting. */
export function classifyUserAgent(ua: string | null): {
  device: string;
  os: string;
} {
  if (!ua) return { device: "unknown", os: "unknown" };
  const s = ua.toLowerCase();

  let os = "other";
  if (/iphone|ipad|ipod/.test(s)) os = "ios";
  else if (/android/.test(s)) os = "android";
  else if (/windows/.test(s)) os = "windows";
  else if (/mac os x|macintosh/.test(s)) os = "macos";
  else if (/linux/.test(s)) os = "linux";

  let device = "desktop";
  if (/bot|crawler|spider|preview|fetch|curl|wget/.test(s)) device = "bot";
  else if (/ipad|tablet|(android(?!.*mobile))/.test(s)) device = "tablet";
  else if (/mobile|iphone|ipod|android/.test(s)) device = "mobile";

  return { device, os };
}
