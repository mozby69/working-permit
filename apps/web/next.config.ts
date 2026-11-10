import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.251', '192.168.1.251:3001', '191.168.1.251:5001', '172.17.197.155'],
  poweredByHeader: false,

  // Allows importing TypeScript directly from @repo/shared without rebuilding.

  transpilePackages: ["@repo/shared"],

};

export default nextConfig;
