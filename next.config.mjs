import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "assets.meshy.ai",
      },
    ],
  },
};

export default nextConfig;
