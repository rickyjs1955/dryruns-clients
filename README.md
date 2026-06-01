# dryruns.tools

**See what an AI coding task costs — on a repo you know.**

A free demo by **[budgetary.tools](https://budgetary.tools)**. Pick a realistic
coding task against a familiar public codebase ([Open WebUI](https://github.com/open-webui/open-webui)),
and dryruns.tools shows you what that task would *cost in tokens* before you run
it — a p10/p50/p90 range, a scenario label, and a confidence value. Then run the
same task in your own Claude Code or Codex and compare the estimate to the real
spend.

This repository (`dryruns-clients`) collects clients of the hosted
budgetary.tools token-estimate API. The first is the **dryruns.tools** web demo
described here; see [Modes](#modes) for the two ways a client talks to the API.

> The button verb is **Dry-run it →**.

## What this is (and isn't)

- It's a **thin client**. Every estimate comes from the hosted budgetary.tools
  API. There is **no local estimation logic, no heuristics, and no fallback that
  makes up a number** — if the API declines or errors, the app says so honestly.
- It **references** Open WebUI tasks by description only. No Open WebUI source is
  copied, hosted, forked, or rebranded here.
- It stores nothing. No telemetry, no saved prompts, no saved results.

> **Not affiliated with Open WebUI.** Task descriptions reference the Open WebUI
> project for realism only. Catalog pinned to Open WebUI **v0.9.5**
> (commit `3660bc0`).

## How it works

```
browser ──{ query, model? }──▶  /api/estimate  ──Bearer key──▶  budgetary.tools API
                                  (server route,                  POST /v1/estimate
                                   key-holding proxy)
```

The API key is a **server-side secret**. The browser only ever talks to the
local `/api/estimate` route, which adds the `Authorization` header and forwards
the request. The key is never shipped in the client bundle and never logged.

The report renders **only** what the API returns: the scenario label, the
p10/p50/p90 token numbers, the confidence value, and the echoed model.

## Modes

A client can reach the hosted estimate API two ways. The switch lives in one
place — [`lib/mode.ts`](lib/mode.ts) — and defaults to **demo**. A single typed
entry point, `fetchEstimate` in [`lib/budgetary.ts`](lib/budgetary.ts), returns
the same result in both.

| Mode | Base | Endpoint | Auth | When |
| --- | --- | --- | --- | --- |
| **demo** (default) | `https://dryruns.tools` | `POST /api/estimate` | none — keyless | Zero-config trial. The server route holds the key and rate-limits per IP. |
| **real** | `https://api.budgetary.tools` | `POST /v1/estimate` | `Authorization: Bearer <your key>` | Production, bring-your-own-key. Runs server-side. |

**Request body (both):** `{ "query": string, "model"?: string }`. In demo mode
the proxy injects `context` (`host`, `project_id`) server-side; in real mode you
may pass your own `context`.

**Response (both):** the frozen public shape — consume only these fields:

```json
{
  "scenario": "confident | uncertain | sparse_evidence | out_of_domain",
  "void": false,
  "distribution": { "p10": 0, "p50": 0, "p90": 0 },
  "confidence": 0.0,
  "model": "..."
}
```

When `void` is `true`, `distribution` is `null`. On void or any error a client
shows the honest state — never a fabricated number.

### Try the demo

No setup needed — open **[https://dryruns.tools](https://dryruns.tools)**. Or
call the keyless proxy directly:

```bash
curl -s https://dryruns.tools/api/estimate \
  -H 'content-type: application/json' \
  -d '{"query":"add github oauth login to open webui","model":"claude-sonnet-4-6"}'
```

In code, demo mode is the default and is safe in the browser:

```ts
import { fetchEstimate } from "@/lib/budgetary";

// demo (default): keyless, same-origin proxy
const result = await fetchEstimate({ query, model });
```

### Real mode (bring your own key)

Real mode calls the hosted API directly with your key. **The key is server-side
only** — set it in the environment, never prefix it `NEXT_PUBLIC_`, and never
commit it:

```bash
# .env.local — server-side, gitignored
BUDGETARY_API_KEY=<your budgetary.tools key>
# optional: override the base (defaults to https://api.budgetary.tools)
BUDGETARY_API_BASE=https://api.budgetary.tools
```

```ts
// Server-side only (route handler, server action, server component).
// fetchEstimate reads BUDGETARY_API_KEY from the environment; the browser
// never sees it. Called client-side, real mode refuses to run.
const result = await fetchEstimate(
  { query, model },
  { mode: "real", context: { team: "acme" } },
);
```

## Project structure

```
app/
  layout.tsx              Root layout + metadata
  page.tsx                Home (TopBar + DryrunApp + SiteFooter)
  not-found.tsx           Custom 404
  icon.svg                Favicon
  api/estimate/route.ts   Key-holding proxy → budgetary.tools /v1/estimate
components/               Presentational + the DryrunApp client controller
lib/
  mode.ts                 Mode switch (demo|real): base / endpoint / auth
  budgetary.ts            API contract types, parseEstimate, fetchEstimate
  rateLimit.ts            Per-IP in-memory limiter (proxy only)
  catalog.ts              Catalog loader + Open WebUI pin constants
  models.ts               Model options forwarded as `model`
  links.ts                External URLs
data/openwebui-tasks.json Static catalog (task descriptions only)
```

## Security posture

- The API key lives only in `BUDGETARY_API_KEY`, read **server-side** in the
  proxy route. It is never prefixed `NEXT_PUBLIC_`, never sent to the browser,
  and never logged. (CI/verification scans the built `.next` output to confirm
  the key string is absent.)
- In demo mode the browser only ever calls the same-origin `/api/estimate`
  route. Real mode runs server-side only — `fetchEstimate` refuses to attach a
  key in the browser, and the key string is absent from the client bundle.
- The proxy rate-limits per IP and honors a `DRYRUNS_DISABLED` kill switch.
- No prompts or results are stored anywhere — no telemetry in the MVP.

## Run locally

Requires Node 20+.

```bash
# 1. Install
npm install

# 2. Configure — copy the example and fill in your values
cp .env.example .env.local
#   BUDGETARY_API_BASE=https://api.budgetary.tools
#   BUDGETARY_API_KEY=<your budgetary.tools API key>

# 3. Dev server
npm run dev
# open http://localhost:3000
```

Without a valid `BUDGETARY_API_KEY`, the catalog and UI still render, but
estimate requests will return an error state (by design — there is no fallback
number).

### Scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | Production build                      |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | ESLint (`next lint`)                  |
| `npm run typecheck` | `tsc --noEmit`                        |

## Environment variables

| Name                         | Required | Purpose                                                        |
| ---------------------------- | -------- | -------------------------------------------------------------- |
| `BUDGETARY_API_BASE`         | yes      | Base URL of the hosted API, e.g. `https://api.budgetary.tools` |
| `BUDGETARY_API_KEY`          | yes      | Server-side bearer token. Never exposed to the browser.        |
| `BUDGETARY_PROJECT_ID`       | no       | Free-text label for grouping estimates (`context.project_id`). Defaults to `openwebui-demo`. Not a codebase selector. |
| `DRYRUNS_DISABLED`           | no       | Kill switch — `1`/`true` makes the proxy return a 503.         |
| `DRYRUNS_RATE_LIMIT_PER_MIN` | no       | Per-IP request cap per minute (default `12`).                  |

`.env.example` lists the variable **names** only. Never commit real secrets.

## Deploy

Deployable to **Vercel** or **Railway** as a standard Next.js app. Set
`BUDGETARY_API_BASE` and `BUDGETARY_API_KEY` as environment variables in the
host's dashboard (not in the repo). See [docs at the bottom of this README](#deploy-notes).

## License

[Apache-2.0](./LICENSE). © budgetary.tools.

---

### Deploy notes

**Vercel**

1. Import the repo. Framework preset: **Next.js** (auto-detected).
2. Project → Settings → Environment Variables: add `BUDGETARY_API_BASE` and
   `BUDGETARY_API_KEY` (and optionally `DRYRUNS_DISABLED`,
   `DRYRUNS_RATE_LIMIT_PER_MIN`).
3. Deploy. The proxy route runs as a serverless function.

**Railway**

1. New project → Deploy from repo.
2. Add the same environment variables under the service's Variables tab.
3. Build command `npm run build`, start command `npm run start`.

> Note: per-IP rate limiting is best-effort in-memory and is per-instance. For
> multi-instance deployments, front it with a shared limiter (e.g. an edge
> middleware or a Redis-backed limiter) if abuse becomes a concern.
