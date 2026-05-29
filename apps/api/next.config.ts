import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  transpilePackages: ["@taskflow/shared", "@taskflow/db"],
};

export default nextConfig;
