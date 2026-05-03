export const DEFAULT_SITE_URL = 'https://www.omadigital.net';

export function getSiteUrl(): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

  return siteUrl === 'https://omadigital.net' ? DEFAULT_SITE_URL : siteUrl;
}
