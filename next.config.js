/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Enable for production — v2.0 enforces lint checks
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable for production — v2.0 enforces type safety
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
}

module.exports = nextConfig
