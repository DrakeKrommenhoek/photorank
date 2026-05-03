// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Exclude face-api.js from SSR bundle — it uses browser-only APIs.
  // serverExternalPackages works with both Turbopack (next dev/build in Next.js 16)
  // and webpack, so no bundler-specific callbacks needed.
  serverExternalPackages: ['face-api.js'],
};

export default nextConfig;
