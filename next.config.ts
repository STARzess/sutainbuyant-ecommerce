import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_API_URL ? [new URL("/storage/**", process.env.NEXT_PUBLIC_API_URL)] : [],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: process.env.NEXT_TEST_WORKSPACE_ROOT || process.cwd(),
  turbopack: {
    root: process.env.NEXT_TEST_WORKSPACE_ROOT || process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
