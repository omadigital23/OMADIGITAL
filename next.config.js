/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Performance-optimized configuration
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  
  // Temporarily disable ESLint and TypeScript for performance testing
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Redirect legacy "/fr" URLs to root (FR served at /)
  async redirects() {
    return [
      // Consolidate old FR-prefixed URLs to root FR
      { source: '/fr', destination: '/', permanent: true },
      { source: '/fr/:path*', destination: '/:path*', permanent: true },

      // Keep English localized
      // No change required for '/en/*'

      // Optional legacy normalizations (if you had historic non-localized pages with other slugs)
      { source: '/conditions-generales', destination: '/terms-conditions', permanent: true },
      { source: '/gdpr-compliance', destination: '/privacy-policy', permanent: true },
    ];
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Performance experimental features
  experimental: {
    // Enable modern bundling
    esmExternals: true,
    // Optimize server components
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Enable optimized packages
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Optimized images configuration
  images: {
    domains: [
      'images.unsplash.com', 
      'kvwhpymdhgdavcgfdjsu.supabase.co',
      'localhost',
      '127.0.0.1'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Enable compression
  compress: true,
  poweredByHeader: false,
  
  // Optimized headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Exclude test pages from production build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => {
    if (process.env.NODE_ENV === 'production') {
      return ext;
    }
    return ext;
  }),
  
  // Webpack optimizations
  webpack: (config, { isServer, webpack }) => {
    // Exclude test files from build
    config.module.rules.push({
      test: /test-.*\.(tsx|ts|jsx|js)$/,
      loader: 'ignore-loader',
    });
    
    // Reduce bundle size - handle Node.js modules for client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        'node:buffer': false,
        'node:fs': false,
        'node:https': false,
        'node:http': false,
        'node:stream': false,
        'node:crypto': false,
      };
    } else {
      // Server-side: keep Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    
    // Optimize chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000, // 244KB max vendor chunk
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            maxSize: 244000,
          },
        },
      };
    }
    
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 5,
        })
      );
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);