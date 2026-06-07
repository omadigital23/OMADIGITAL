'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import { blogCategoryLabelKeys, blogCategorySlugs, blogPosts, isBlogCategorySlug } from '@/data/blog-posts';

const categories = ['all', ...blogCategorySlugs] as const;

export default function BlogListClient({ initialCategory = 'all' }: { initialCategory?: string }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const normalizedInitialCategory = isBlogCategorySlug(initialCategory) ? initialCategory : 'all';
  const [activeCategory, setActiveCategory] = useState<string>(normalizedInitialCategory);

  const filtered = activeCategory === 'all'
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  const getCategoryLabel = (category: typeof categories[number]) => {
    if (category === 'all') return t('allCategories');
    return t(blogCategoryLabelKeys[category]);
  };

  return (
    <div id="blog-list" className="container-custom">
      <div className="text-center mb-12">
        <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl">
          <span className="gradient-text">{t('pageTitle')}</span>
        </h1>
        <p className="mt-4 text-text-secondary text-lg">{t('pageSubtitle')}</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => {
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'gradient-bg text-white'
                  : 'bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => {
          const categoryLabel = t(blogCategoryLabelKeys[post.category]);
          const title = locale === 'fr' ? post.titleFr : post.titleEn;
          const excerpt = locale === 'fr' ? post.excerptFr : post.excerptEn;
          const coverAlt = (locale === 'fr' ? post.coverAltFr : post.coverAltEn) ?? title;
          return (
            <div key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <Card className="h-full flex flex-col cursor-pointer overflow-hidden p-0">
                  {post.coverImage ? (
                    <div className="relative aspect-[1200/630] w-full bg-bg-secondary">
                      <picture>
                        {post.coverImageAvif && <source srcSet={post.coverImageAvif} type="image/avif" />}
                        <Image
                          src={post.coverImage}
                          alt={coverAlt}
                          fill
                          sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </picture>
                    </div>
                  ) : (
                    <div className="px-6 pt-6 text-3xl">{post.emoji}</div>
                  )}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2">
                      {post.coverImage && <span className="text-2xl" aria-hidden="true">{post.emoji}</span>}
                      <div className="text-xs text-accent-violet uppercase tracking-wide">
                        {categoryLabel}
                      </div>
                    </div>
                    <h2 className="font-heading font-semibold text-text-primary mb-3 line-clamp-3 min-h-[4.5rem] leading-snug">
                      {title}
                    </h2>
                    <p className="text-sm text-text-muted mb-4 line-clamp-2 min-h-10 flex-grow leading-relaxed">
                      {excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border-subtle">
                      <span>{post.readTime} {t('readTime')}</span>
                      <span>{post.date}</span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-violet transition-colors group-hover:text-accent-cyan">
                      {locale === 'en' ? 'Read article' : "Lire l'article"}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
