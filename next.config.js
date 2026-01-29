const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver les avertissements React 19 pendant la transition
  reactStrictMode: true,

  // Normalize URLs without trailing slashes for SEO consistency
  trailingSlash: false,

  // Redirects removed - middleware.ts handles locale detection without HTTP redirects
  // This prevents double redirections that block Google indexation
  async rewrites() {
    return [
      {
        source: '/fr/googlef63348e45be4ab3f.html',
        destination: '/googlef63348e45be4ab3f.html',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Scripts: self + Google Analytics + Sentry + inline (for Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://browser.sentry-cdn.com",
              // Styles: self + inline (for Tailwind CSS)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + HTTPS
              "img-src 'self' data: https: blob:",
              // Fonts: self + data URIs
              "font-src 'self' data:",
              // Connections: self + Supabase + Google Analytics + Sentry
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://sentry.io https://*.sentry.io",
              // Frames: none (clickjacking protection)
              "frame-ancestors 'none'",
              // Objects: none (protection against Flash, etc.)
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form actions: self only
              "form-action 'self'",
              // Upgrade insecure requests
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ]
  },
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Suppress source map upload logs in CI
  silent: true,
  // Organisation and project in Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Disable source map upload in development
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
};

// Export with Sentry wrapper (only if SENTRY_DSN is configured)
module.exports = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;