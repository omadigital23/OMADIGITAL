import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { BUSINESS } from '@/lib/constants';

type PageMetadataInput = {
  locale: string;
  path?: string;
  title: string;
  description?: Metadata['description'];
  keywords?: Metadata['keywords'];
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
    type?: string;
  };
};

type LocalizedPageMetadataInput = Omit<PageMetadataInput, 'path'> & {
  pathsByLocale: Partial<Record<string, string>>;
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

export function buildAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  return `${BUSINESS.siteUrl}${normalizePath(pathOrUrl)}`;
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

export function buildLocalizedAlternatesFromPaths(
  locale: string,
  pathsByLocale: Partial<Record<string, string>>
): Metadata['alternates'] {
  const currentPath = pathsByLocale[locale] ?? pathsByLocale[routing.defaultLocale] ?? '';
  const languages = Object.fromEntries(
    routing.locales.map((availableLocale) => [
      availableLocale,
      `${BUSINESS.siteUrl}/${availableLocale}${normalizePath(pathsByLocale[availableLocale] ?? currentPath)}`,
    ])
  );

  return {
    canonical: `${BUSINESS.siteUrl}/${locale}${normalizePath(currentPath)}`,
    languages: {
      ...languages,
      'x-default': `${BUSINESS.siteUrl}/${routing.defaultLocale}${normalizePath(
        pathsByLocale[routing.defaultLocale] ?? currentPath
      )}`,
    },
  };
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  image,
}: PageMetadataInput): Metadata {
  const url = buildLocalizedUrl(locale, path);
  const normalizedDescription = description ?? undefined;
  const openGraphImages = image
    ? [
        {
          url: buildAbsoluteUrl(image.url),
          width: image.width ?? 1200,
          height: image.height ?? 630,
          alt: image.alt,
          type: image.type ?? 'image/webp',
        },
      ]
    : undefined;

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
      ...(openGraphImages ? { images: openGraphImages } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: normalizedDescription,
      ...(openGraphImages ? { images: openGraphImages.map((item) => item.url) } : {}),
    },
  };
}

export function buildLocalizedPageMetadata({
  locale,
  pathsByLocale,
  title,
  description,
  keywords,
}: LocalizedPageMetadataInput): Metadata {
  const currentPath = pathsByLocale[locale] ?? pathsByLocale[routing.defaultLocale] ?? '';
  const url = buildLocalizedUrl(locale, currentPath);
  const normalizedDescription = description ?? undefined;

  return {
    title,
    description: normalizedDescription,
    keywords,
    alternates: buildLocalizedAlternatesFromPaths(locale, pathsByLocale),
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
