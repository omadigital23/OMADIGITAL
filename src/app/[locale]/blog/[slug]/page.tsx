import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BlogArticleClient from '@/components/BlogArticleClient';
import BlogListClient from '@/components/BlogListClient';
import { blogCategoryLabelKeys, blogCategorySlugs, blogPosts, isBlogCategorySlug } from '@/data/blog-posts';
import { buildPageMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  return [
    ...blogPosts.map((post) => ({ slug: post.slug })),
    ...blogCategorySlugs.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post && !isBlogCategorySlug(slug)) return {};

  if (isBlogCategorySlug(slug)) {
    const t = await getTranslations({ locale, namespace: 'blog' });
    const categoryLabel = t(blogCategoryLabelKeys[slug]);
    return buildPageMetadata({
      locale,
      path: `/blog/${slug}`,
      title: `${categoryLabel} | Blog`,
      description: locale === 'fr'
        ? `Articles OMA Digital sur ${categoryLabel}, tendances, opportunites et impacts business.`
        : `OMA Digital articles about ${categoryLabel}, trends, opportunities, and business impact.`,
    });
  }

  if (!post) return {};

  return buildPageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: locale === 'fr' ? post.titleFr : post.titleEn,
    description: locale === 'fr' ? post.excerptFr : post.excerptEn,
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = blogPosts.find((p) => p.slug === slug);
  const category = isBlogCategorySlug(slug) ? slug : null;
  if (!post && !category) notFound();

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        {post ? <BlogArticleClient post={post} /> : <BlogListClient initialCategory={category ?? 'all'} />}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
