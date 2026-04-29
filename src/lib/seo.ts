import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { BUSINESS } from '@/lib/constants';

type PageMetadataInput = {
  locale: string;
  path?: string;
  title: string;
  description?: Metadata['description'];
  keywords?: Metadata['keywords'];
};

function normalizePath(path: string | undefined): string {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

function buildLocalizedUrl(locale: string, path?: string): string {
  return `${BUSINESS.siteUrl}/${locale}${normalizePath(path)}`;
}

export function buildLocalizedAlternates(locale: string, path?: string): Metadata['alternates'] {
  const normalizedPath = normalizePath(path);
  const languages = Object.fromEntries(
    routing.locales.map((availableLocale) => [
      availableLocale,
      `${BUSINESS.siteUrl}/${availableLocale}${normalizedPath}`,
    ])
  );

  return {
    canonical: buildLocalizedUrl(locale, path),
    languages: {
      ...languages,
      'x-default': `${BUSINESS.siteUrl}/${routing.defaultLocale}${normalizedPath}`,
    },
  };
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
}: PageMetadataInput): Metadata {
  const url = buildLocalizedUrl(locale, path);
  const normalizedDescription = description ?? undefined;

  return {
    title,
    description: normalizedDescription,
    keywords,
    alternates: buildLocalizedAlternates(locale, path),
    openGraph: {
      title,
      description: normalizedDescription,
      url,
      type: 'website',
      locale: locale === 'fr' ? 'fr_SN' : 'en_US',
      siteName: BUSINESS.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: normalizedDescription,
    },
  };
}
