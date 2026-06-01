import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Key-holding proxy for the budgetary.tools estimate API.
 *
 * Responsibilities:
 *  - Hold the bearer key server-side; never expose or log it.
 *  - Forward { query, model? } to {BASE}/v1/estimate with context.host="dryruns".
 *  - Return the upstream JSON response unchanged (status + body).
 *  - Best-effort per-IP rate limiting (a shared key is being spent).
 *  - Honor the DRYRUNS_DISABLED kill switch.
 *
 * Never logs full prompts or the key.
 */

export const runtime = "nodejs";
// This route must run per-request: it forwards live calls and reads secrets.
export const dynamic = "force-dynamic";

const MAX_QUERY_LEN = 4000;
const MAX_MODEL_LEN = 128;
const UPSTREAM_TIMEOUT_MS = 20_000;
const DEFAULT_RATE_LIMIT_PER_MIN = 12;

function truthy(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimitPerMin(): number {
  const raw = process.env.DRYRUNS_RATE_LIMIT_PER_MIN;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_RATE_LIMIT_PER_MIN;
  return Math.min(parsed, 600);
}

function jsonError(
  code: string,
  message: string,
  status: number,
  extraHeaders?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    { error: code, message },
    { status, headers: extraHeaders },
  );
}

/**
 * Build the EstimateContext the proxy attaches to every request. `host` is
 * always "dryruns". `project_id` and `depth_budget` are optional server-side
 * config (env) — the API needs a project_id that identifies an indexed
 * codebase to return a real distribution; without it the API replies
 * out_of_domain/void. These are deployment config, not browser input.
 */
function buildContext(): Record<string, unknown> {
  const context: Record<string, unknown> = { host: "dryruns" };

  const projectId = process.env.BUDGETARY_PROJECT_ID?.trim();
  if (projectId) context.project_id = projectId;

  const depthRaw = process.env.BUDGETARY_DEPTH_BUDGET;
  if (depthRaw) {
    const depth = Number.parseInt(depthRaw, 10);
    if (Number.isFinite(depth) && depth >= 0) context.depth_budget = depth;
  }

  return context;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Kill switch.
  if (truthy(process.env.DRYRUNS_DISABLED)) {
    return jsonError(
      "disabled",
      "Dry-runs are temporarily disabled.",
      503,
    );
  }

  // 2. Per-IP rate limit.
  const limit = rateLimitPerMin();
  const result = rateLimit(clientIp(req), limit, Date.now());
  if (!result.ok) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    return jsonError(
      "rate_limited",
      "Too many estimate requests. Please slow down.",
      429,
      { "retry-after": String(retryAfter) },
    );
  }

  // 3. Parse and validate the browser's request.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", "Expected a JSON body.", 400);
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const query = typeof b.query === "string" ? b.query.trim() : "";
  if (!query) {
    return jsonError("bad_request", "A non-empty `query` is required.", 400);
  }
  if (query.length > MAX_QUERY_LEN) {
    return jsonError(
      "bad_request",
      `Task is too long (max ${MAX_QUERY_LEN} characters).`,
      400,
    );
  }

  let model: string | undefined;
  if (typeof b.model === "string" && b.model.trim()) {
    model = b.model.trim().slice(0, MAX_MODEL_LEN);
  }

  // 4. Server-side config. Missing config is a misconfiguration, not a number.
  const base = process.env.BUDGETARY_API_BASE?.replace(/\/+$/, "");
  const key = process.env.BUDGETARY_API_KEY;
  if (!base || !key) {
    // Note: we log that config is missing, but never the key itself.
    console.error("[estimate] missing BUDGETARY_API_BASE or BUDGETARY_API_KEY");
    return jsonError(
      "misconfigured",
      "The estimate service is not configured.",
      500,
    );
  }

  // 5. Forward to the hosted API.
  const upstreamBody = {
    query,
    ...(model ? { model } : {}),
    context: buildContext(),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/v1/estimate`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(upstreamBody),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    // Network failure or timeout. Never include the prompt or key in logs.
    console.error("[estimate] upstream request failed (network/timeout)");
    return jsonError(
      "upstream_error",
      "The estimate service could not be reached.",
      502,
    );
  } finally {
    clearTimeout(timer);
  }

  // 6. Return the upstream JSON response unchanged (status + parsed body).
  const text = await upstream.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    console.error(`[estimate] upstream returned non-JSON (status ${upstream.status})`);
    return jsonError(
      "upstream_error",
      "The estimate service returned an unexpected response.",
      502,
    );
  }

  return NextResponse.json(parsed, {
    status: upstream.status,
    headers: { "cache-control": "no-store" },
  });
}

// Anything other than POST is not supported on this route.
export function GET(): NextResponse {
  return jsonError("method_not_allowed", "Use POST.", 405);
}
