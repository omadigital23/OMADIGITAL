import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { DefaultSeo } from 'next-seo';
import { useEffect } from 'react';
import seoConfig from '../src/lib/seo-config';
import '../styles/globals.css';

// Import i18n
import '../src/lib/i18n';
import { appWithTranslation } from 'next-i18next';
import { usePerformanceMonitoring } from '../src/hooks/usePerformanceMonitoring';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Language Context
import { LanguageProvider } from '../src/contexts/LanguageContext';

// Toaster for notifications
import { Toaster } from '../src/components/ui/sonner';

// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize performance monitoring
  usePerformanceMonitoring();
  
  // Register service worker
  useEffect(() => {
    // Temporarily disable service worker registration to troubleshoot CORS issues
    /*
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    */
  }, []); // Empty dependency array to run only once

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Component {...pageProps} />
        <Toaster />
        <Analytics />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);