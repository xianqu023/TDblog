import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
    forceSwcTransforms: false,
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ];
    return config;
  },
};

export default withNextIntl(nextConfig);
