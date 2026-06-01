interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/** Free-text task entry with the "Dry-run it →" submit verb. */
export function PromptBox({ value, onChange, onSubmit, disabled }: PromptBoxProps) {
  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <label htmlFor="custom-task" className="text-sm font-medium text-fg">
        …or describe your own task
      </label>
      <textarea
        id="custom-task"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="e.g. add a per-user API rate limit to the chat completions endpoint"
        className="w-full resize-y rounded-lg border border-border bg-ink px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/70 focus:border-accent disabled:opacity-60"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted">⌘/Ctrl + Enter to run</span>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-accent-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Dry-run it →
        </button>
      </div>
    </form>
  );
}
