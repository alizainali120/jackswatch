import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/jackswatch",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
