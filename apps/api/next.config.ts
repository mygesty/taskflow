import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname, "..", ".."),
  transpilePackages: ["@taskflow/shared", "@taskflow/db"],
};

export default nextConfig;
