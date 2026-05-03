// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // face-api.js uses browser APIs — exclude from server bundle.
      // Note: this webpack callback applies to `next build` (production).
      // `next dev` uses Turbopack, but face-api.js is 'use client'-only so no SSR risk there.
      config.externals = [...(config.externals || []), 'face-api.js'];
    }
    return config;
  },
};

export default nextConfig;
