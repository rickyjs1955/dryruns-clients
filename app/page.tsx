import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { DryrunApp } from "@/components/DryrunApp";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <DryrunApp />
      </main>
      <SiteFooter />
    </div>
  );
}
