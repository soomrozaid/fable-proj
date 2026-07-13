export function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number; share: number }>;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink-faint">No scans yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.label} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-ink">{item.label}</span>
                <span className="shrink-0 tabular-nums text-ink-faint">
                  {item.count}
                </span>
              </div>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-paper-dim">
                <div
                  className="h-full rounded-full bg-verdigris/70"
                  style={{
                    width: `${Math.max(2, Math.round(item.share * 100))}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
