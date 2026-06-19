import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  // Allow mobile/LAN devices to load dev assets without breaking hydration
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ...(process.env.DEV_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? []),
  ],
};

export default nextConfig;
