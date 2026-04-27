'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';

const previewArticles = [
  {
    slug: 'creer-site-web-professionnel-senegal',
    category: 'website',
    readTime: 8,
    emoji: '🌐',
  },
  {
    slug: 'automatisation-ia-guide-entreprises-senegalaises',
    category: 'ai-automation',
    readTime: 10,
    emoji: '🤖',
  },
  {
    slug: 'application-mobile-entreprise-senegal',
    category: 'mobile',
    readTime: 7,
    emoji: '📱',
  },
] as const;

const articleContent = {
  article1: {
    fr: {
      title: 'Comment creer un site web professionnel au Senegal en 2025',
      excerpt: 'Guide complet pour creer un site web qui convertit vos visiteurs en clients.',
    },
    en: {
      title: 'How to create a professional website in Senegal in 2025',
      excerpt: 'Complete guide to creating a website that converts visitors into clients.',
    },
  },
  article2: {
    fr: {
      title: "L'automatisation IA : guide pour les entreprises senegalaises",
      excerpt: "Decouvrez comment l'IA peut transformer votre entreprise et vous faire gagner du temps.",
    },
    en: {
      title: 'AI automation: guide for Senegalese businesses',
      excerpt: 'Discover how AI can transform your business and save you time.',
    },
  },
  article3: {
    fr: {
      title: 'Application mobile : pourquoi votre entreprise en a besoin',
      excerpt: 'Avec 90% de penetration mobile au Senegal, votre entreprise doit etre sur smartphone.',
    },
    en: {
      title: 'Mobile app: why your business needs one',
      excerpt: 'With 90% mobile penetration in Senegal, your business needs to be on smartphone.',
    },
  },
} as const;

export default function BlogPreview() {
  const locale = useLocale();
  const t = useTranslations('blogPreview');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const contentLocale = locale === 'en' ? 'en' : 'fr';

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
          {previewArticles.map((article, index) => {
            const key = `article${index + 1}` as keyof typeof articleContent;
            const content = articleContent[key][contentLocale];

            return (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.15 }}
              >
                <Link href={`/blog/${article.slug}`}>
                  <Card className="p-6 h-full flex flex-col cursor-pointer">
                    <div className="text-3xl mb-4">{article.emoji}</div>
                    <div className="text-xs text-accent-violet mb-2 uppercase tracking-wide">
                      {article.category.replace('-', ' ')}
                    </div>
                    <h3 className="font-heading font-semibold text-text-primary mb-3 line-clamp-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-text-muted mb-4 line-clamp-3 flex-grow">
                      {content.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{article.readTime} {t('minRead')}</span>
                      <span className="text-accent-violet hover:underline">
                        {t('readMore')} {'->'}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
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
