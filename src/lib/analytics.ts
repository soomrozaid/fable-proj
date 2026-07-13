export interface ScanRow {
  scanned_at: string;
  country: string | null;
  device: string | null;
  os: string | null;
  referer: string | null;
}

export interface DaySeries {
  days: Array<{ date: string; count: number }>;
  total: number;
}

/** Bucket scans into calendar days (UTC) over the trailing `windowDays`. */
export function bucketByDay(
  rows: ScanRow[],
  windowDays: number,
  now = new Date(),
): DaySeries {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const day = row.scanned_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const days: DaySeries["days"] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return { days, total: rows.length };
}

export function breakdown(
  rows: ScanRow[],
  field: "country" | "device" | "os" | "referer",
  top = 6,
): Array<{ label: string; count: number; share: number }> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    let label = row[field] ?? "unknown";
    if (field === "referer") {
      if (!label || label === "unknown") label = "direct scan";
      else {
        try {
          label = new URL(label).hostname;
        } catch {
          label = "other";
        }
      }
    }
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({ label, count, share: count / total }));
}

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });
export function countryName(code: string): string {
  if (!code || code === "unknown") return "Unknown";
  try {
    return COUNTRY_NAMES.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
