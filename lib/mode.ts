/**
 * The two ways a dryruns client can reach the hosted token-estimate API.
 * Centralized here so every client selects base / endpoint / auth from one
 * place. Both modes speak the same request and response contract
 * (see lib/budgetary.ts).
 *
 *   demo (default) — keyless, same-origin trial via the public dryruns.tools
 *                    proxy. The proxy holds the key and rate-limits per IP, so
 *                    the caller sends no credentials.
 *   real           — production, bring-your-own-key. Calls the hosted API
 *                    directly with `Authorization: Bearer <key>`, server-side.
 */

export type ApiMode = "demo" | "real";

export interface ModeDescriptor {
  mode: ApiMode;
  /** Canonical public base URL for this mode. */
  base: string;
  /** Path appended to the base. */
  endpoint: string;
  /** Whether the caller attaches an Authorization header (real mode only). */
  requiresAuth: boolean;
}

export const MODES: Record<ApiMode, ModeDescriptor> = {
  demo: {
    mode: "demo",
    base: "https://dryruns.tools",
    endpoint: "/api/estimate",
    requiresAuth: false,
  },
  real: {
    mode: "real",
    base: "https://api.budgetary.tools",
    endpoint: "/v1/estimate",
    requiresAuth: true,
  },
};

export const DEFAULT_MODE: ApiMode = "demo";

/** Resolve a mode from an env/config string, defaulting to demo. */
export function resolveMode(raw?: string | null): ApiMode {
  return raw?.trim().toLowerCase() === "real" ? "real" : "demo";
}
