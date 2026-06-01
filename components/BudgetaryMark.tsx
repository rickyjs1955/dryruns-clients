import { BUDGETARY_URL } from "@/lib/links";

/** The persistent "by budgetary.tools" attribution mark. */
export function BudgetaryMark({ className }: { className?: string }) {
  return (
    <a
      href={BUDGETARY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg ${className ?? ""}`}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-accent-strong" />
      <span>
        a demo by{" "}
        <span className="font-semibold text-fg group-hover:text-accent">
          budgetary.tools
        </span>
      </span>
    </a>
  );
}
