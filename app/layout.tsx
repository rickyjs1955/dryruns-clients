import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dryruns.tools"),
  title: "dryruns.tools — see what an AI coding task costs before you run it",
  description:
    "A free demo by budgetary.tools. Estimate the token spend of a realistic Open WebUI coding task, then dry-run it in your own Claude Code or Codex to compare.",
  openGraph: {
    title: "dryruns.tools",
    description:
      "See what an AI coding task costs — on a repo you know. A budgetary.tools demo.",
    url: "https://dryruns.tools",
    siteName: "dryruns.tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
