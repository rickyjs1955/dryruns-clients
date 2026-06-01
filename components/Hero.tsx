import { OPENWEBUI_VERSION } from "@/lib/catalog";

/** Home hero: the one-line pitch and a short explainer of the dry-run idea. */
export function Hero() {
  return (
    <section className="flex flex-col gap-4 py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        See what an AI coding task costs —{" "}
        <span className="text-accent">on a repo you know.</span>
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted">
        Pick a realistic{" "}
        <span className="font-medium text-fg">Open WebUI</span> coding task (or
        type your own), and get a token-spend estimate before you run it — a
        p10/p50/p90 range, a scenario, and a confidence value. Then dry-run the
        same task in your own coding agent and compare.
      </p>
      <p className="text-sm text-muted">
        Estimates come from the{" "}
        <span className="font-medium text-fg">budgetary.tools</span> API. Catalog
        pinned to Open WebUI {OPENWEBUI_VERSION}.
      </p>
    </section>
  );
}
