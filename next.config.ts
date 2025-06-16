import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/routes/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;