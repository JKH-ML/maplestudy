import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "open.api.nexon.com",
      },
      {
        protocol: "https",
        hostname: "upload3.inven.co.kr",
      },
      {
        protocol: "https",
        hostname: "upload2.inven.co.kr",
      },
    ],
  },
};

export default nextConfig;
