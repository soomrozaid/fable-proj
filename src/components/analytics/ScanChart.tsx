import type { DaySeries } from "@/lib/analytics";

/** Server-rendered SVG bar chart — no client JS, prints cleanly. */
export function ScanChart({
  series,
  title,
}: {
  series: DaySeries;
  title: string;
}) {
  const { days } = series;
  const max = Math.max(1, ...days.map((d) => d.count));
  const w = 640;
  const h = 160;
  const pad = 4;
  const bw = (w - pad * 2) / days.length;

  return (
    <figure>
      <figcaption className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
          {title}
        </span>
        <span className="text-xs text-ink-faint">peak {max}/day</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full rounded-md border border-line bg-white/60"
        role="img"
        aria-label={`Bar chart: ${title}. Peak ${max} scans in a day.`}
      >
        <line
          x1={pad}
          x2={w - pad}
          y1={h - 18.5}
          y2={h - 18.5}
          stroke="#d9d0bc"
        />
        {days.map((d, i) => {
          const barH = Math.round((d.count / max) * (h - 40));
          return (
            <g key={d.date}>
              <rect
                x={pad + i * bw + bw * 0.15}
                y={h - 19 - barH}
                width={bw * 0.7}
                height={Math.max(barH, d.count > 0 ? 2 : 0)}
                rx={1.5}
                fill="#2c6e63"
              >
                <title>{`${d.date}: ${d.count} scans`}</title>
              </rect>
              {i === 0 || i === days.length - 1 ? (
                <text
                  x={pad + i * bw + bw / 2}
                  y={h - 5}
                  textAnchor={i === 0 ? "start" : "end"}
                  fontSize="10"
                  fill="#7d766a"
                >
                  {d.date.slice(5)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
