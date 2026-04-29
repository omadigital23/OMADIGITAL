import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { BUSINESS } from '@/lib/constants';
import { buildLocalizedAlternates } from '@/lib/seo';
import ClientLayoutEnhancements from '@/components/ClientLayoutEnhancements';
import StructuredData from '@/components/StructuredData';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
});

// Viewport séparé de Metadata (Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a12',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const ogImage = `${BUSINESS.siteUrl}/images/og-image.png`;

  return {
    title: {
      default: t('title'),
      template: `%s | ${BUSINESS.name}`,
    },
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: BUSINESS.name, url: BUSINESS.siteUrl }],
    creator: BUSINESS.name,
    publisher: BUSINESS.name,
    metadataBase: new URL(BUSINESS.siteUrl),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: BUSINESS.name,
      locale: locale === 'fr' ? 'fr_SN' : 'en_US',
      type: 'website',
      url: `${BUSINESS.siteUrl}/${locale}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [ogImage],
    },
    alternates: buildLocalizedAlternates(locale),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${outfit.variable}`}
    >
      <head>
        {/* Icons */}
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Structured data */}
        <StructuredData locale={locale} />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        {/* Skip to content — accessibilité clavier */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:gradient-bg focus:text-white focus:font-medium"
        >
          {t('skipToContent')}
        </a>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <div id="main-content">
            {children}
          </div>
          <ClientLayoutEnhancements />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
