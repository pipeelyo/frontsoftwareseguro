import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['uuid'],
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
