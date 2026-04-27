import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BlogArticleClient from '@/components/BlogArticleClient';
import { blogPosts } from '@/data/blog-posts';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: locale === 'fr' ? post.titleFr : post.titleEn,
    description: locale === 'fr' ? post.excerptFr : post.excerptEn,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <BlogArticleClient post={post} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
