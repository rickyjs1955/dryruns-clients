import { BudgetaryMark } from "./BudgetaryMark";
import {
  OPENWEBUI_VERSION,
  OPENWEBUI_COMMIT,
  OPENWEBUI_RELEASE_URL,
} from "@/lib/catalog";

/**
 * Footer with the required Open WebUI non-affiliation disclosure, the pinned
 * catalog version, license, and the budgetary.tools mark.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-muted">
        <p>
          <span className="font-semibold text-fg">
            Not affiliated with Open WebUI.
          </span>{" "}
          Task descriptions reference the{" "}
          <a
            href={OPENWEBUI_RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-2 hover:text-fg"
          >
            Open WebUI
          </a>{" "}
          project for realism only — no Open WebUI software is hosted,
          redistributed, or rebranded here. Catalog pinned to{" "}
          <span className="font-medium text-fg">{OPENWEBUI_VERSION}</span>{" "}
          (commit <code className="text-fg">{OPENWEBUI_COMMIT}</code>).
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BudgetaryMark />
          <p>
            Apache-2.0 · Estimates are provided by the budgetary.tools API. No
            prompts or results are stored.
          </p>
        </div>
      </div>
    </footer>
  );
}
