import { BudgetaryMark } from "./BudgetaryMark";
import { BUDGETARY_SIGNUP_URL } from "@/lib/links";

/** Persistent top bar: budgetary.tools mark + a signup CTA. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-base font-semibold tracking-tight">
            dryruns<span className="text-accent">.tools</span>
          </span>
          <BudgetaryMark className="hidden sm:inline-flex" />
        </div>
        <a
          href={BUDGETARY_SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-accent-strong px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-accent"
        >
          Sign up
        </a>
      </div>
    </header>
  );
}
