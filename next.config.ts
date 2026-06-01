import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The estimate proxy must never be cached or statically optimized — it
  // forwards live requests to the budgetary.tools API on every call.
  experimental: {},
};

export default nextConfig;
