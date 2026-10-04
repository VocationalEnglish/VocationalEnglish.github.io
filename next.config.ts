import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server listens on 0.0.0.0; browsers open it as 127.0.0.1.
  // Without this, Next blocks the HMR socket and the page never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
