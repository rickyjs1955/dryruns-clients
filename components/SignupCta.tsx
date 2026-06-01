import { BUDGETARY_SIGNUP_URL } from "@/lib/links";

/** Persistent signup CTA shown alongside the report. */
export function SignupCta() {
  return (
    <section className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
      <div>
        <p className="font-medium text-fg">
          Want estimates like this for your own repo?
        </p>
        <p className="text-sm text-muted">
          budgetary.tools estimates token spend before you run the task.
        </p>
      </div>
      <a
        href={BUDGETARY_SIGNUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-md bg-accent-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent"
      >
        Sign up at budgetary.tools →
      </a>
    </section>
  );
}
