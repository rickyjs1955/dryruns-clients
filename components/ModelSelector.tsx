import { MODEL_OPTIONS } from "@/lib/models";

interface ModelSelectorProps {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

/** Small model picker. The chosen id is forwarded to the API as `model`. */
export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted">
      <span>Model</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none focus:border-accent disabled:opacity-60"
      >
        {MODEL_OPTIONS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );
}
