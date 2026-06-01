/**
 * A small set of well-known coding-agent model ids offered in the UI. The
 * selected id is passed through to the estimate API as `model` and echoed back
 * in the report. dryruns does not interpret or score these — it only forwards.
 */

export interface ModelOption {
  id: string;
  label: string;
  /** The tool a visitor would dry-run this in, for the compare CTA. */
  tool: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", tool: "Claude Code" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", tool: "Claude Code" },
  { id: "gpt-5-codex", label: "GPT-5 Codex", tool: "Codex" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", tool: "Gemini CLI" },
];

export const DEFAULT_MODEL_ID = MODEL_OPTIONS[0].id;

export function modelLabel(id: string): string {
  return MODEL_OPTIONS.find((m) => m.id === id)?.label ?? id;
}

export function modelTool(id: string): string {
  return MODEL_OPTIONS.find((m) => m.id === id)?.tool ?? "your coding agent";
}
