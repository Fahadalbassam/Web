import type { NextConfig } from "next";

const phpOrigin = process.env.PHP_BACKEND_URL ?? "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${phpOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
