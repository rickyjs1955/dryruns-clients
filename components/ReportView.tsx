import { Estimate, EstimateResult } from "@/lib/budgetary";
import { modelLabel } from "@/lib/models";
import {
  OPENWEBUI_VERSION,
  OPENWEBUI_RELEASE_URL,
} from "@/lib/catalog";
import { ScenarioBadge } from "./ScenarioBadge";
import { RangeBar } from "./RangeBar";
import { DryRunCta } from "./DryRunCta";
import { SignupCta } from "./SignupCta";
import type { ActiveRun } from "./DryrunApp";

interface ReportViewProps {
  active: ActiveRun;
  result: EstimateResult | null;
  loading: boolean;
  onBack: () => void;
  onRetry: () => void;
}

function formatConfidence(c: number): string {
  if (c >= 0 && c <= 1) return `${Math.round(c * 100)}%`;
  return c.toLocaleString();
}

function confidenceWidth(c: number): string {
  const clamped = Math.min(1, Math.max(0, c));
  return `${(clamped * 100).toFixed(0)}%`;
}

/** A labeled fact in the report. Only ever renders values the API returned. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="text-sm text-fg">{children}</span>
    </div>
  );
}

/** The estimate body for a non-void, successful result. */
function EstimateBody({ estimate }: { estimate: Estimate }) {
  const dist = estimate.distribution!;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="tabular text-4xl font-semibold text-fg sm:text-5xl">
            {dist.p50.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted">
            estimated tokens (p50) · combined input + output
          </p>
        </div>
        <ScenarioBadge scenario={estimate.scenario} />
      </div>

      <RangeBar distribution={dist} />

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
        <Field label="Confidence">
          <span className="flex items-center gap-2">
            <span className="tabular">{formatConfidence(estimate.confidence)}</span>
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
              <span
                className="block h-full bg-accent"
                style={{ width: confidenceWidth(estimate.confidence) }}
              />
            </span>
          </span>
        </Field>
        <Field label="Scenario">
          <ScenarioBadge scenario={estimate.scenario} />
        </Field>
        <Field label="Model (echoed)">
          <span className="tabular text-xs">{estimate.model || "—"}</span>
        </Field>
      </div>
    </div>
  );
}

/** Void: the API explicitly declined to estimate. Show it honestly. */
function VoidBody({ estimate }: { estimate: Estimate }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-medium text-fg">
          Not enough signal to estimate this one.
        </p>
        <ScenarioBadge scenario={estimate.scenario} />
      </div>
      <p className="text-sm text-muted">
        The budgetary.tools API declined to produce a range for this task. No
        number is shown because none was returned — dryruns never makes one up.
      </p>
      <div className="border-t border-border pt-4">
        <Field label="Model (echoed)">
          <span className="tabular text-xs">{estimate.model || "—"}</span>
        </Field>
      </div>
    </div>
  );
}

/** Error: the request failed. Be honest; offer a retry. */
function ErrorBody({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium text-fg">Couldn&apos;t get an estimate</p>
      <p className="text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="self-start rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-accent"
      >
        Try again
      </button>
    </div>
  );
}

function LoadingBody() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="h-12 w-40 animate-pulse rounded-md bg-surface-2" />
      <div className="h-2 w-full animate-pulse rounded-full bg-surface-2" />
      <div className="h-8 w-full animate-pulse rounded-md bg-surface-2" />
      <p className="text-sm text-muted">Asking budgetary.tools for an estimate…</p>
    </div>
  );
}

export function ReportView({
  active,
  result,
  loading,
  onBack,
  onRetry,
}: ReportViewProps) {
  const showCompareCtas =
    !loading && (result?.status === "ok" || result?.status === "void");

  return (
    <div className="flex flex-col gap-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-muted transition-colors hover:text-fg"
      >
        ← Back to catalog
      </button>

      {/* Task context */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-fg">{active.label}</h2>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
            {modelLabel(active.model)}
          </span>
        </div>
        <p className="text-sm text-muted">{active.query}</p>
      </div>

      {/* The report card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {loading && <LoadingBody />}
        {!loading && result?.status === "ok" && (
          <EstimateBody estimate={result.estimate} />
        )}
        {!loading && result?.status === "void" && (
          <VoidBody estimate={result.estimate} />
        )}
        {!loading && result?.status === "error" && (
          <ErrorBody message={result.message} onRetry={onRetry} />
        )}
      </div>

      {showCompareCtas && (
        <DryRunCta
          query={active.query}
          model={active.model}
          compareToEstimate={result?.status === "ok"}
        />
      )}

      <SignupCta />

      {/* Inline Open WebUI disclosure, near the report. */}
      <p className="text-xs text-muted">
        <span className="font-medium text-fg">Not affiliated with Open WebUI.</span>{" "}
        This task description references{" "}
        <a
          href={OPENWEBUI_RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border underline-offset-2 hover:text-fg"
        >
          Open WebUI {OPENWEBUI_VERSION}
        </a>{" "}
        for realism only.
      </p>
    </div>
  );
}
