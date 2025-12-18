// Sentry configuration for client-side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring
    tracesSampleRate: 1.0,

    // Session replay for debugging
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Filtering
    ignoreErrors: [
        // Ignore common browser errors
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
    ],
});
