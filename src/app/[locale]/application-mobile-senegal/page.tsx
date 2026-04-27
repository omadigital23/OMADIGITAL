import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import SEOPageClient from '@/components/SEOPageClient';
import { getServicePageContent } from '@/data/service-pages';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getServicePageContent('mobile-senegal', locale);

  return {
    title: content.title,
    description: content.metadata.description,
    keywords: content.metadata.keywords,
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getServicePageContent('mobile-senegal', locale);

  return (
    <SEOPageClient
      serviceEmoji={content.serviceEmoji}
      title={content.title}
      subtitle={content.subtitle}
      description={content.description}
      localContext={content.localContext}
      pricingInfo={content.pricingInfo}
      faqs={content.faqs}
    />
  );
}
