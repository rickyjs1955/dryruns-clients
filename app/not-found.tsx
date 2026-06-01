import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm uppercase tracking-wide text-muted">404</p>
        <h1 className="text-2xl font-semibold">This page isn&apos;t here</h1>
        <p className="text-muted">
          But the catalog of dry-runnable tasks is.
        </p>
        <Link
          href="/"
          className="rounded-md bg-accent-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent"
        >
          Back to dryruns.tools
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
