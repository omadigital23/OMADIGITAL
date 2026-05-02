import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SupportPageClient from '@/components/SupportPageClient';
import { getSupportPageContent, supportPageSlugs } from '@/data/support-page';
import { BUSINESS } from '@/lib/constants';
import { buildLocalizedAlternatesFromPaths } from '@/lib/seo';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getSupportPageContent(locale);

  return {
    title: {
      absolute: content.metadata.title,
    },
    description: content.metadata.description,
    keywords: content.metadata.keywords,
    alternates: buildLocalizedAlternatesFromPaths(locale, supportPageSlugs),
    openGraph: {
      title: content.metadata.title,
      description: content.metadata.description,
      url: `${BUSINESS.siteUrl}/${locale}${content.slug}`,
      type: 'website',
      locale: locale === 'fr' ? 'fr_SN' : 'en_US',
      siteName: BUSINESS.name,
      images: [
        {
          url: `${BUSINESS.siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: content.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metadata.title,
      description: content.metadata.description,
      images: [`${BUSINESS.siteUrl}/og-image.png`],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'en') {
    permanentRedirect(`/fr${supportPageSlugs.fr}`);
  }

  setRequestLocale(locale);
  const content = getSupportPageContent(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: content.title,
    description: content.metadata.description,
    serviceType: 'Software troubleshooting and device setup',
    provider: {
      '@type': 'ProfessionalService',
      name: BUSINESS.name,
      url: BUSINESS.siteUrl,
      telephone: BUSINESS.phone,
      email: BUSINESS.email,
    },
    url: `${BUSINESS.siteUrl}/${locale}${content.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SupportPageClient content={content} locale={locale} />
    </>
  );
}
