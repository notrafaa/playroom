import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.discordapp.com" }] },
  allowedDevOrigins: ["127.0.0.1"],
  typedRoutes: true
};

export default nextConfig;
