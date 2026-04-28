'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';
import { blogPosts } from '@/data/blog-posts';

const categories = ['all', 'website', 'ecommerce', 'mobile', 'ai-automation'] as const;
const categoryLabelMap: Record<string, string> = {
  all: 'allCategories',
  website: 'categoryWebsite',
  ecommerce: 'categoryEcommerce',
  mobile: 'categoryMobile',
  'ai-automation': 'categoryAI',
};

export default function BlogListClient() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="container-custom">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl">
          <span className="gradient-text">{t('pageTitle')}</span>
        </h1>
        <p className="mt-4 text-text-secondary text-lg">{t('pageSubtitle')}</p>
      </motion.div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'gradient-bg text-white'
                : 'bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary'
            }`}
          >
            {t(categoryLabelMap[cat])}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post, i) => {
          const categoryLabel = categoryLabelMap[post.category]
            ? t(categoryLabelMap[post.category])
            : post.category.replace('-', ' ');
          return (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="p-6 h-full flex flex-col cursor-pointer">
                  <div className="text-3xl mb-4">{post.emoji}</div>
                  <div className="text-xs text-accent-violet mb-2 uppercase tracking-wide">
                    {categoryLabel}
                  </div>
                  <h2 className="font-heading font-semibold text-text-primary mb-3 line-clamp-2">
                    {locale === 'fr' ? post.titleFr : post.titleEn}
                  </h2>
                  <p className="text-sm text-text-muted mb-4 line-clamp-3 flex-grow">
                    {locale === 'fr' ? post.excerptFr : post.excerptEn}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border-subtle">
                    <span>{post.readTime} {t('readTime')}</span>
                    <span>{post.date}</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
