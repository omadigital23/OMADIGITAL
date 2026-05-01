'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';
import { ServiceMockup, type ServiceVariant } from '@/components/VisualMockups';

const previewArticles = [
  {
    slug: 'creer-site-web-professionnel-senegal',
    categoryKey: 'categoryWebsite',
    readTime: 8,
    emoji: '🌐',
    variant: 'website' as ServiceVariant,
    titleKey: 'preview1Title',
    excerptKey: 'preview1Excerpt',
  },
  {
    slug: 'automatisation-ia-guide-entreprises-senegalaises',
    categoryKey: 'categoryAI',
    readTime: 10,
    emoji: '🤖',
    variant: 'ai' as ServiceVariant,
    titleKey: 'preview2Title',
    excerptKey: 'preview2Excerpt',
  },
  {
    slug: 'application-mobile-entreprise-senegal',
    categoryKey: 'categoryMobile',
    readTime: 7,
    emoji: '📱',
    variant: 'mobile' as ServiceVariant,
    titleKey: 'preview3Title',
    excerptKey: 'preview3Excerpt',
  },
] as const;

export default function BlogPreview() {
  const t = useTranslations('blogPreview');
  const tBlog = useTranslations('blog');
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
            {t('sectionTitle')}{' '}
            <span className="gradient-text">{t('sectionTitleAccent')}</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">{t('sectionSubtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {previewArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.15 }}
            >
              <Link href={`/blog/${article.slug}`}>
                <Card className="h-full flex flex-col cursor-pointer p-0">
                  <ServiceMockup variant={article.variant} locale={locale} compact className="m-4 mb-0" />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-2xl" aria-hidden="true">{article.emoji}</span>
                      <div className="text-xs text-accent-violet uppercase tracking-wide">
                        {tBlog(article.categoryKey)}
                      </div>
                    </div>
                    <h3 className="font-heading font-semibold text-text-primary mb-3 line-clamp-2">
                      {tBlog(article.titleKey)}
                    </h3>
                    <p className="text-sm text-text-muted mb-4 line-clamp-3 flex-grow">
                      {tBlog(article.excerptKey)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{article.readTime} {t('minRead')}</span>
                      <span className="text-accent-violet hover:underline">
                        {t('readMore')}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-accent-violet hover:text-accent-blue transition-colors font-medium"
          >
            {t('viewAll')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
