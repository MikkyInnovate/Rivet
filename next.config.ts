import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, Next can misdetect the
  // root from a stray lockfile in a parent directory (e.g. ~/package-lock.json),
  // which breaks type resolution during `next build`.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
