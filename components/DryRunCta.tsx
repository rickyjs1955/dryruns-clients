"use client";

import { useState } from "react";
import { modelTool } from "@/lib/models";

interface DryRunCtaProps {
  query: string;
  model: string;
}

/**
 * The "Dry-run it →" invitation: run this exact task in your own coding agent
 * and compare your real spend to the estimate above. The copy button keeps the
 * prompt on the client — nothing is sent anywhere.
 */
export function DryRunCta({ query, model }: DryRunCtaProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); fail quietly.
    }
  };

  return (
    <section className="rounded-xl border border-accent-strong/30 bg-accent-strong/5 p-5">
      <h3 className="text-base font-semibold text-fg">Dry-run it →</h3>
      <p className="mt-1 text-sm text-muted">
        Run this exact task in your own {modelTool(model)} (or any agent), then
        compare your real token spend to the estimate above.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-accent"
        >
          {copied ? "Copied ✓" : "Copy task prompt"}
        </button>
        <span className="text-xs text-muted">
          Then check the actual usage your agent reports.
        </span>
      </div>
    </section>
  );
}
