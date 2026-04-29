import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Pricing from '@/components/sections/Pricing';
import CTASection from '@/components/sections/CTASection';
import WhatsAppButton from '@/components/WhatsAppButton';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });
  return buildPageMetadata({
    locale,
    path: '/pricing',
    title: t('pageTitle'),
    description: t('pageSubtitle'),
  });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="pt-20">
        <Pricing />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
