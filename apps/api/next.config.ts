import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@taskflow/shared", "@taskflow/db"],
};

export default nextConfig;
