/**
 * Blog Article Page
 * Displays individual blog article with full content
 * Uses ISR for optimal performance and SEO
 * @module pages/blog/[slug]
 */

import { GetStaticProps, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Calendar, Clock, Tag, ArrowLeft, User } from 'lucide-react';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { SocialShareButtons } from '../../src/components/SocialMediaLinks';
import type { BlogArticle, BlogArticles } from '../../src/types/blog';

interface BlogArticlePageProps {
  slug: string;
  locale: string;
}

/**
 * Blog Article Page Component
 * 
 * Features:
 * - Full article content
 * - Social sharing
 * - Related articles
 * - SEO optimized with structured data
 * - Accessible (WCAG 2.1 AA)
 */
export default function BlogArticlePage({ slug, locale }: BlogArticlePageProps) {
  const { t } = useTranslation('blog');
  const router = useRouter();

  // Get article data
  const articles = t('articles', { returnObjects: true }) as BlogArticles;
  const article = articles[slug] as BlogArticle;

  // Handle article not found
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link href="/blog" className="text-orange-600 hover:text-orange-700">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const articleUrl = `https://www.omadigital.net/${locale}/blog/${slug}`;

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'OMA Digital',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.omadigital.net/images/logo.webp',
      },
    },
    datePublished: article.published_date,
    dateModified: article.updated_date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    keywords: article.tags.join(', '),
  };

  return (
    <>
      <Head>
        <title>{`${article.title} | OMA Digital Blog`}</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.tags.join(', ')} />
        <meta name="author" content={article.author} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={articleUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="article:published_time" content={article.published_date} />
        <meta property="article:modified_time" content={article.updated_date} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.category} />
        {article.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 md:pt-24">
          {/* Breadcrumb */}
          <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
            <div className="container mx-auto px-4 py-4">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-orange-600">
                    Accueil
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-orange-600">
                    Blog
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium truncate max-w-xs" aria-current="page">
                  {article.title}
                </li>
              </ol>
            </div>
          </nav>

          {/* Article Header */}
          <article className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="mb-12">
              {/* Back to Blog */}
              <Link
                href="/blog"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 font-medium"
              >
                <ArrowLeft size={20} className="mr-2" />
                {t('back_to_blog')}
              </Link>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 font-medium rounded-full">
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <User size={20} className="mr-2" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2" />
                  <time dateTime={article.published_date}>
                    {new Date(article.published_date).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  <span>{article.reading_time} {t('reading_time')}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    <Tag size={14} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share Buttons */}
              <div className="border-t border-b border-gray-200 py-4">
                <p className="text-sm font-medium text-gray-700 mb-3">{t('share_article')}</p>
                <SocialShareButtons url={articleUrl} title={article.title} description={article.excerpt} />
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {article.content.intro}
              </p>

              {/* Sections */}
              {article.content.sections.map((section, index) => (
                <section key={index} className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </section>
              ))}

              {/* CTA */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-8 my-12">
                <h3 className="text-2xl font-bold mb-4">{article.content.cta}</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/#contact"
                    className="inline-block px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    {t('cta_section.button_primary')}
                  </a>
                  <a
                    href="tel:+212701193811"
                    className="inline-block px-6 py-3 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition-colors text-center"
                  >
                    {t('cta_section.button_secondary')}
                  </a>
                </div>
              </div>
            </div>

            {/* Article Footer */}
            <footer className="border-t border-gray-200 pt-8 mt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-600">
                  {t('updated_on')} {new Date(article.updated_date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <SocialShareButtons url={articleUrl} title={article.title} description={article.excerpt} />
              </div>
            </footer>
          </article>

          {/* CTA Section */}
          <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('cta_section.title')}
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                {t('cta_section.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/#contact"
                  className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {t('cta_section.button_primary')}
                </a>
                <a
                  href="tel:+212701193811"
                  className="inline-block px-8 py-4 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition-colors"
                >
                  {t('cta_section.button_secondary')}
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

/**
 * Generate static paths for all blog articles
 */
export const getStaticPaths: GetStaticPaths = async () => {
  // Import blog translations directly
  const blogFr = require('../../public/locales/fr/blog.json');
  const blogEn = require('../../public/locales/en/blog.json');

  const paths: { params: { slug: string }; locale: string }[] = [];

  // Get French article slugs
  if (blogFr.articles) {
    Object.keys(blogFr.articles).forEach((slug) => {
      paths.push({ params: { slug }, locale: 'fr' });
    });
  }

  // Get English article slugs
  if (blogEn.articles) {
    Object.keys(blogEn.articles).forEach((slug) => {
      paths.push({ params: { slug }, locale: 'en' });
    });
  }

  return {
    paths,
    fallback: 'blocking', // Generate pages on-demand if not pre-built
  };
};

/**
 * Static Props with ISR
 * Regenerates page every hour
 */
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'blog'])),
      slug,
      locale: locale ?? 'fr',
    },
    // ISR: Regenerate page every hour
    revalidate: 3600,
  };
};
