import { Distribution } from "@/lib/budgetary";

/**
 * Visualizes the p10–p90 token range with a p50 marker. This only renders the
 * three numbers the API returned — it does not compute or infer anything.
 */
export function RangeBar({ distribution }: { distribution: Distribution }) {
  const { p10, p50, p90 } = distribution;
  const span = p90 - p10;
  const fraction = span > 0 ? Math.min(1, Math.max(0, (p50 - p10) / span)) : 0.5;
  const pct = `${(fraction * 100).toFixed(1)}%`;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-2 rounded-full bg-surface-2">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-accent-strong/20 via-accent-strong/40 to-accent-strong/20" />
        <div
          className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: pct }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span className="tabular">p10 · {p10.toLocaleString()}</span>
        <span className="tabular text-accent">p50 · {p50.toLocaleString()}</span>
        <span className="tabular">p90 · {p90.toLocaleString()}</span>
      </div>
    </div>
  );
}
