import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ✅ remotePatterns replaces the deprecated `domains` array
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",   // Cloudinary images used for properties
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;