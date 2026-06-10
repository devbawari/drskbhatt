import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.png',
      },
    ];
  },
};

export default nextConfig;
