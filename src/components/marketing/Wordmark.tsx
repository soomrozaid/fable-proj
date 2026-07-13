/** Logotype: a minimal engraved-stone mark + wordmark. Pure SVG, no asset. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* stone slab with carved QR eye */}
        <path
          d="M4 3.5h16A1.5 1.5 0 0 1 21.5 5v14a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 19V5A1.5 1.5 0 0 1 4 3.5Z"
          fill="#1c1917"
        />
        <path
          d="M6.5 7.5h5v5h-5z"
          stroke="#f7f3ea"
          strokeWidth="1.4"
          fill="none"
        />
        <rect x="8.2" y="9.2" width="1.6" height="1.6" fill="#f7f3ea" />
        <rect x="14.5" y="7.5" width="2" height="2" fill="#2c6e63" />
        <rect x="14.5" y="11" width="2" height="2" fill="#f7f3ea" />
        <rect x="6.5" y="15" width="2" height="2" fill="#f7f3ea" />
        <rect x="10" y="15" width="6.5" height="2" fill="#2c6e63" />
      </svg>
      <span className="engraved text-lg font-semibold text-ink">Scanstone</span>
    </span>
  );
}
