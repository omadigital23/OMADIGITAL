import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SEOPageClient from '@/components/SEOPageClient';
import { getServicePageContent } from '@/data/service-pages';
import { buildLocalizedPageMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ locale: string }>;
};

const paths = {
  fr: '/automatisation-ia-campbell-river',
  en: '/ai-automation-campbell-river',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getServicePageContent('ai-campbell-river', locale);

  return buildLocalizedPageMetadata({
    locale,
    pathsByLocale: paths,
    title: content.metadata.title,
    description: content.metadata.description,
    keywords: content.metadata.keywords,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  if (locale === 'en') {
    permanentRedirect(`/en${paths.en}`);
  }

  setRequestLocale(locale);
  const content = getServicePageContent('ai-campbell-river', locale);

  return (
    <SEOPageClient
      serviceEmoji={content.serviceEmoji}
      serviceVariant="ai"
      title={content.title}
      subtitle={content.subtitle}
      description={content.description}
      localContext={content.localContext}
      pricingInfo={content.pricingInfo}
      faqs={content.faqs}
    />
  );
}
