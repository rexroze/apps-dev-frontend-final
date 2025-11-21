import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allowed images url to be loaded
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
};

export default nextConfig;