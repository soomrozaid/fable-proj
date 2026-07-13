type Level = "info" | "warn" | "error";

/** Structured JSON logs — searchable in Vercel runtime logs. Never log secrets or PII. */
export function log(
  level: Level,
  event: string,
  data: Record<string, unknown> = {},
) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
