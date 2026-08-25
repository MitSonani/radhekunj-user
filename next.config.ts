import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow product images served from S3 / CDN (configure specific hostname in production)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
