import { CatalogTask, TIER_LABELS } from "@/lib/catalog";

interface TaskCardProps {
  task: CatalogTask;
  onSelect: (task: CatalogTask) => void;
  disabled?: boolean;
}

/** A single catalog task, rendered as a clickable card that kicks off a dry-run. */
export function TaskCard({ task, onSelect, disabled }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      disabled={disabled}
      className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent/60 hover:bg-surface-2 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug text-fg">{task.label}</h3>
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
          {TIER_LABELS[task.tier_hint]}
        </span>
      </div>
      <p className="line-clamp-3 text-sm text-muted">{task.query}</p>
      <span className="mt-auto pt-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Dry-run it →
      </span>
    </button>
  );
}
