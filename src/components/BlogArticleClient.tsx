'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { BlogPostData } from '@/data/blog-posts';
import { blogPosts } from '@/data/blog-posts';
import { getWhatsAppUrl } from '@/lib/constants';

const categoryLabelMap: Record<string, string> = {
  website: 'categoryWebsite',
  ecommerce: 'categoryEcommerce',
  mobile: 'categoryMobile',
  'ai-automation': 'categoryAI',
};

export default function BlogArticleClient({ post }: { post: BlogPostData }) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const whatsappUrl = getWhatsAppUrl(locale);
  const title = locale === 'fr' ? post.titleFr : post.titleEn;
  const content = locale === 'fr' ? post.contentFr : post.contentEn;

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  const categoryLabel = categoryLabelMap[post.category]
    ? t(categoryLabelMap[post.category])
    : post.category.replace('-', ' ');

  return (
    <div className="container-custom max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/blog" className="text-accent-violet hover:text-accent-blue text-sm transition-colors">
          {t('backToBlog')}
        </Link>

        <div className="mt-6 mb-4 flex items-center gap-3 text-sm text-text-muted">
          <span className="text-accent-violet uppercase tracking-wide text-xs font-medium">
            {categoryLabel}
          </span>
          <span>•</span>
          <span>{post.readTime} {t('readTime')}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>

        <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-text-primary leading-tight mb-8">
          {title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-border-subtle">
          <Image
            src="/images/logo.png"
            alt={t('authorName')}
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
          />
          <div>
            <div className="font-medium text-text-primary text-sm">{t('authorName')}</div>
            <div className="text-xs text-text-muted">{t('authorRole')}</div>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          {content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="font-heading font-bold text-2xl text-text-primary mt-10 mb-4">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="font-heading font-semibold text-xl text-text-primary mt-8 mb-3">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('- **')) {
              return <li key={i} className="text-text-secondary ml-4 mb-2" dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>') }} />;
            }
            if (line.match(/^\d+\. \*\*/)) {
              return <li key={i} className="text-text-secondary ml-4 mb-2 list-decimal" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>') }} />;
            }
            if (line.trim() === '') return <div key={i} className="h-4" />;
            return <p key={i} className="text-text-secondary leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>') }} />;
          })}
        </article>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-accent-violet/10 to-accent-blue/10 border border-accent-violet/20 text-center">
          <h3 className="font-heading font-bold text-xl mb-3">{t('ctaTitle')}</h3>
          <p className="text-text-muted mb-5">{t('ctaText')}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 gradient-bg text-white font-medium px-6 py-3 rounded-full hover:shadow-glow transition-all">
            {t('ctaButton')}
          </a>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="font-heading font-semibold text-xl mb-6">{t('relatedArticles')}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((r) => {
                const relatedCategoryLabel = categoryLabelMap[r.category]
                  ? t(categoryLabelMap[r.category])
                  : r.category.replace('-', ' ');
                return (
                  <Link key={r.slug} href={`/blog/${r.slug}`}>
                    <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-border-medium transition-all">
                      <div className="text-xs text-accent-violet mb-2 uppercase">{relatedCategoryLabel}</div>
                      <h4 className="font-heading font-semibold text-text-primary">{locale === 'fr' ? r.titleFr : r.titleEn}</h4>
                      <p className="text-sm text-text-muted mt-2 line-clamp-2">{locale === 'fr' ? r.excerptFr : r.excerptEn}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
