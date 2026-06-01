import tasks from "@/data/openwebui-tasks.json";

/**
 * The curated Open WebUI task catalog.
 *
 * These are task *descriptions* only. No Open WebUI source is included,
 * hosted, or redistributed here. The catalog is pinned to a specific Open
 * WebUI release so the realism of the prompts is anchored to a known version.
 */

export const OPENWEBUI_VERSION = "v0.9.5";
export const OPENWEBUI_COMMIT = "3660bc0";
export const OPENWEBUI_REPO_URL = "https://github.com/open-webui/open-webui";
export const OPENWEBUI_RELEASE_URL =
  "https://github.com/open-webui/open-webui/releases/tag/v0.9.5";

export type TierHint = "small" | "medium" | "large" | "xlarge";

export interface CatalogTask {
  id: string;
  label: string;
  /** Natural-language prompt sent to the estimate API. */
  query: string;
  tier_hint: TierHint;
}

export const CATALOG: CatalogTask[] = tasks as CatalogTask[];

/** Human-friendly label for a tier hint, used as a card badge. */
export const TIER_LABELS: Record<TierHint, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  xlarge: "X-Large",
};
