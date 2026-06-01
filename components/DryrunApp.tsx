"use client";

import { useCallback, useRef, useState } from "react";
import { CATALOG, CatalogTask } from "@/lib/catalog";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { EstimateResult, fetchEstimate } from "@/lib/budgetary";
import { Hero } from "./Hero";
import { ModelSelector } from "./ModelSelector";
import { TaskCard } from "./TaskCard";
import { PromptBox } from "./PromptBox";

export interface ActiveRun {
  query: string;
  label: string;
  model: string;
}

/**
 * Top-level interactive controller. Owns the selected model, the active
 * dry-run, and the estimate result. The browser only ever calls the local
 * proxy via fetchEstimate — no estimation happens here.
 *
 * Stage 3 renders the catalog/home experience and a minimal result area;
 * Stage 4 replaces the result area with the full report view.
 */
export function DryrunApp() {
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);
  const [customQuery, setCustomQuery] = useState("");
  const [active, setActive] = useState<ActiveRun | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (query: string, label: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setActive({ query, label, model });
      setResult(null);
      setLoading(true);

      const res = await fetchEstimate({ query, model }, controller.signal);
      if (controller.signal.aborted) return;
      setResult(res);
      setLoading(false);
    },
    [model],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setActive(null);
    setResult(null);
    setLoading(false);
  }, []);

  const onSelectTask = useCallback(
    (task: CatalogTask) => run(task.query, task.label),
    [run],
  );

  const onSubmitCustom = useCallback(() => {
    const q = customQuery.trim();
    if (q) run(q, "Your custom task");
  }, [customQuery, run]);

  // --- Report screen (minimal in Stage 3) ---
  if (active) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <button
          type="button"
          onClick={reset}
          className="self-start text-sm text-muted transition-colors hover:text-fg"
        >
          ← Back to catalog
        </button>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">
            Dry-run · {active.model}
          </p>
          <p className="mt-2 text-lg font-medium">{active.label}</p>
          <p className="mt-1 text-sm text-muted">{active.query}</p>

          <div className="mt-6 border-t border-border pt-6">
            {loading && <p className="text-muted">Estimating…</p>}

            {!loading && result?.status === "ok" && (
              <p className="tabular text-2xl">
                {result.estimate.distribution!.p50.toLocaleString()}{" "}
                <span className="text-sm text-muted">tokens (p50)</span>
              </p>
            )}

            {!loading && result?.status === "void" && (
              <p className="text-muted">Not enough signal to estimate this one.</p>
            )}

            {!loading && result?.status === "error" && (
              <p className="text-muted">{result.message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Home screen ---
  return (
    <div className="flex flex-col gap-8">
      <Hero />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Pick a task</h2>
        <ModelSelector value={model} onChange={setModel} disabled={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelect={onSelectTask}
            disabled={loading}
          />
        ))}
      </div>

      <PromptBox
        value={customQuery}
        onChange={setCustomQuery}
        onSubmit={onSubmitCustom}
        disabled={loading}
      />
    </div>
  );
}
