import { Scenario } from "@/lib/budgetary";

/**
 * A calm badge for the scenario label the API returns. We render the label
 * plainly — no explanation of how the estimate was produced, no invented
 * internals. Styling is purely cosmetic tinting.
 */

const LABELS: Record<Scenario, string> = {
  confident: "Confident",
  uncertain: "Uncertain",
  sparse_evidence: "Sparse evidence",
  out_of_domain: "Out of domain",
};

const STYLES: Record<Scenario, string> = {
  confident: "border-accent-strong/40 bg-accent-strong/10 text-accent",
  uncertain: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  sparse_evidence: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  out_of_domain: "border-border bg-surface-2 text-muted",
};

export function ScenarioBadge({ scenario }: { scenario: Scenario }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STYLES[scenario]}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[scenario]}
    </span>
  );
}
