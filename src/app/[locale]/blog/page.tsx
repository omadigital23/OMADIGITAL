import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BlogListClient from '@/components/BlogListClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('pageTitle'), description: t('pageSubtitle') };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <BlogListClient />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
