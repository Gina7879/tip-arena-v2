import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore - eslint config may not be in type definition but is supported
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
