/**
 * Typed client + contract for the budgetary.tools hosted estimate API.
 *
 * This module is the single source of truth for the API shape. It is
 * dependency-free and contains NO secrets, so it is safe to import from both
 * server (the proxy route) and client (the report UI) code.
 *
 * Hard rule: dryruns is a thin client. Nothing here estimates, approximates,
 * caches, or fabricates a number. We only describe, transport, and validate
 * what the hosted API returns.
 */

export const SCENARIOS = [
  "confident",
  "uncertain",
  "sparse_evidence",
  "out_of_domain",
] as const;

export type Scenario = (typeof SCENARIOS)[number];

export interface Distribution {
  p10: number;
  p50: number;
  p90: number;
  /** Always combined input + output tokens, per the API contract. */
  unit: string;
}

export interface Estimate {
  estimate_id: string;
  scenario: Scenario;
  void: boolean;
  /** Null when `void` is true — the API declined to estimate. */
  distribution: Distribution | null;
  confidence: number;
  model: string;
  expires_at: string;
}

/** Any unknown/unexpected scenario value is treated as "uncertain". */
export function normalizeScenario(raw: unknown): Scenario {
  return (SCENARIOS as readonly string[]).includes(raw as string)
    ? (raw as Scenario)
    : "uncertain";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseDistribution(raw: unknown): Distribution | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (!isFiniteNumber(d.p10) || !isFiniteNumber(d.p50) || !isFiniteNumber(d.p90)) {
    return null;
  }
  return {
    p10: d.p10,
    p50: d.p50,
    p90: d.p90,
    unit: typeof d.unit === "string" ? d.unit : "tokens",
  };
}

/**
 * Validate and normalize an unknown payload (as returned by the proxy) into a
 * typed Estimate. Returns null if the payload is too malformed to render
 * honestly — callers should surface an error state, never invent values.
 */
export function parseEstimate(raw: unknown): Estimate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.estimate_id !== "string") return null;

  const isVoid = r.void === true;
  const distribution = isVoid ? null : parseDistribution(r.distribution);

  // A non-void estimate with no usable distribution is not renderable.
  if (!isVoid && distribution === null) return null;

  return {
    estimate_id: r.estimate_id,
    scenario: normalizeScenario(r.scenario),
    void: isVoid,
    distribution,
    confidence: isFiniteNumber(r.confidence) ? r.confidence : 0,
    model: typeof r.model === "string" ? r.model : "",
    expires_at: typeof r.expires_at === "string" ? r.expires_at : "",
  };
}

/** Input the browser sends to our own /api/estimate proxy. */
export interface EstimateInput {
  query: string;
  model?: string;
}

/**
 * Result of asking for an estimate, as consumed by the UI. A discriminated
 * union so the report view can render exactly three honest states.
 */
export type EstimateResult =
  | { status: "ok"; estimate: Estimate }
  | { status: "void"; estimate: Estimate }
  | { status: "error"; message: string; code?: string };

const ERROR_MESSAGES: Record<string, string> = {
  disabled: "Dry-runs are temporarily turned off. Check back soon.",
  rate_limited:
    "You've sent a lot of dry-runs in a short window. Give it a minute and try again.",
  misconfigured:
    "This demo isn't configured to reach the estimate API right now.",
  bad_request: "That task couldn't be sent — try rephrasing it.",
  upstream_error:
    "The estimate service couldn't be reached. Please try again shortly.",
};

function friendlyError(code: string | undefined, fallback: string): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return fallback;
}

/**
 * Browser-side: ask the local proxy for an estimate. Never talks to the
 * hosted API directly — that path holds the secret key server-side only.
 */
export async function fetchEstimate(
  input: EstimateInput,
  signal?: AbortSignal,
): Promise<EstimateResult> {
  let res: Response;
  try {
    res = await fetch("/api/estimate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
  } catch {
    return {
      status: "error",
      message: friendlyError("upstream_error", ERROR_MESSAGES.upstream_error),
    };
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const code =
      payload && typeof payload === "object"
        ? ((payload as Record<string, unknown>).error as string | undefined)
        : undefined;
    return {
      status: "error",
      code,
      message: friendlyError(code, ERROR_MESSAGES.upstream_error),
    };
  }

  const estimate = parseEstimate(payload);
  if (!estimate) {
    return {
      status: "error",
      message: friendlyError("upstream_error", ERROR_MESSAGES.upstream_error),
    };
  }

  return estimate.void
    ? { status: "void", estimate }
    : { status: "ok", estimate };
}
