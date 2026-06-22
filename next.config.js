/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress build errors from ESLint during Vercel deploy
  // (lint separately in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors surface in dev; don't block the Vercel build
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
