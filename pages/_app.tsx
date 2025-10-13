import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { DefaultSeo } from 'next-seo';
import { useEffect } from 'react';
import seoConfig from '../src/lib/seo-config';
import '../styles/globals.css';

import { appWithTranslation } from 'next-i18next';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Language Context
import { LanguageProvider } from '../src/contexts/LanguageContext';

// Toaster for notifications
import { Toaster } from '../src/components/ui/sonner';

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
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Component {...pageProps} />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);