// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16+ default bundler)
  // face-api.js uses browser APIs — it's only called from client components,
  // but we mark it external on the server side to avoid SSR import errors.
  turbopack: {},

  webpack: (config, { isServer }) => {
    if (isServer) {
      // face-api.js uses browser APIs — exclude from server bundle
      config.externals = [...(config.externals || []), 'face-api.js'];
    }
    return config;
  },
};

export default nextConfig;
