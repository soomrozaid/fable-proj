export type PlanId = "free" | "pro";

export interface PlanLimits {
  /** Max simultaneously active dynamic codes. */
  maxCodes: number;
  /** Days of scan history shown in analytics. Infinity = full history. */
  historyDays: number;
  /** SVG/vector download for dynamic codes. */
  svgDownload: boolean;
  /** CSV export of scan data. */
  csvExport: boolean;
}

/**
 * Single source of truth for entitlements. Enforced server-side only.
 * THE COVENANT: redirects are never plan-gated. Nothing in this file may be
 * used to decide whether /r/[slug] resolves.
 */
export const PLANS: Record<PlanId, PlanLimits> = {
  free: { maxCodes: 3, historyDays: 30, svgDownload: false, csvExport: false },
  pro: {
    maxCodes: 500,
    historyDays: Infinity,
    svgDownload: true,
    csvExport: true,
  },
};

export const PRICING = {
  monthly: { amount: 9, label: "$9 / month" },
  yearly: { amount: 79, label: "$79 / year", note: "about 2 months free" },
} as const;

export function limitsFor(plan: string | null | undefined): PlanLimits {
  return PLANS[plan === "pro" ? "pro" : "free"];
}
