/**
 * Blog Index Page
 * Displays all blog articles with filtering and search
 * Uses ISR (Incremental Static Regeneration) for optimal performance
 * @module pages/blog/index
 */

import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { SocialMediaLinks } from '../../src/components/SocialMediaLinks';
import type { BlogArticles, BlogFilter } from '../../src/types/blog';

interface BlogIndexProps {
  locale: string;
}

/**
 * Blog Index Page Component
 * 
 * Features:
 * - Search functionality
 * - Category filtering
 * - Responsive grid layout
 * - SEO optimized
 * - Accessible (WCAG 2.1 AA)
 */
export default function BlogIndex({ locale }: BlogIndexProps) {
  const { t } = useTranslation('blog');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BlogFilter>('all');

  // Get articles from translations
  const articles = t('articles', { returnObjects: true }) as BlogArticles;
  const articleEntries = Object.entries(articles);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    return articleEntries.filter(([slug, article]) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = activeFilter === 'all' || 
        (activeFilter === 'ai' && article.category.toLowerCase().includes('intelligence')) ||
        (activeFilter === 'whatsapp' && article.category.toLowerCase().includes('whatsapp')) ||
        (activeFilter === 'web' && article.category.toLowerCase().includes('web')) ||
        (activeFilter === 'case_study' && article.category.toLowerCase().includes('cas') || article.category.toLowerCase().includes('case')) ||
        (activeFilter === 'guides' && article.category.toLowerCase().includes('guide'));

      return matchesSearch && matchesCategory;
    });
  }, [articleEntries, searchQuery, activeFilter]);

  const filters: { key: BlogFilter; label: string }[] = [
    { key: 'all', label: t('filter_all') },
    { key: 'ai', label: t('filter_ai') },
    { key: 'whatsapp', label: t('filter_whatsapp') },
    { key: 'web', label: t('filter_web') },
    { key: 'case_study', label: t('filter_case_study') },
    { key: 'guides', label: t('filter_guides') },
  ];

  return (
    <>
      <Head>
        <title>{t('page_title')}</title>
        <meta name="description" content={t('page_description')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.omadigital.net/${locale}/blog`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('page_title')} />
        <meta property="og:description" content={t('page_description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.omadigital.net/${locale}/blog`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('page_title')} />
        <meta name="twitter:description" content={t('page_description')} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {t('hero_title')}
                </h1>
                <p className="text-xl md:text-2xl text-orange-100 mb-8">
                  {t('hero_subtitle')}
                </p>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="search"
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    aria-label={t('search_placeholder')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-30">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeFilter === filter.key
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={activeFilter === filter.key}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Articles Grid */}
          <section className="container mx-auto px-4 py-12 md:py-16">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-2xl font-semibold text-gray-900 mb-2">
                  {t('no_results')}
                </p>
                <p className="text-gray-600">
                  {t('no_results_description')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map(([slug, article]) => (
                  <article
                    key={slug}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
                          {article.category}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock size={16} className="mr-1" />
                          {article.reading_time} {t('reading_time')}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar size={16} className="mr-1" />
                        <time dateTime={article.published_date}>
                          {new Date(article.published_date).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Read More Link */}
                      <Link
                        href={`/blog/${slug}`}
                        className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                      >
                        {t('read_more')}
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

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
                  href="tel:+221701193811"
                  className="inline-block px-8 py-4 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition-colors"
                >
                  {t('cta_section.button_secondary')}
                </a>
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-white py-12">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Suivez-nous sur les réseaux sociaux
              </h3>
              <SocialMediaLinks variant="horizontal" showLabels={true} className="justify-center" />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

/**
 * Static Props with ISR
 * Regenerates page every hour for fresh content
 */
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'blog'])),
      locale: locale ?? 'fr',
    },
    // ISR: Regenerate page every hour
    revalidate: 3600,
  };
};
