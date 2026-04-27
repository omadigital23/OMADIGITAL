import { permanentRedirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildSearch(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (typeof value === 'string') {
      query.set(key, value);
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export default async function LocaleRedirectPage({ params, searchParams }: PageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const pathname = slug.join('/');

  permanentRedirect(
    `/${routing.defaultLocale}/${pathname}${buildSearch(resolvedSearchParams)}`
  );
}
