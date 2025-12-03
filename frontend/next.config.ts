import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize for production
  poweredByHeader: false,
  // Configure image optimization if needed
  images: {
    remotePatterns: [],
  },
  // Configure Turbopack root for monorepo
  turbopack: {
    root: '/Applications/MAMP/htdocs/level-2-gym',
  },
}

export default nextConfig
