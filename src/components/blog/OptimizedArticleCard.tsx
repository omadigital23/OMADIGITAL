import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  User, 
  Tag,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { trackEvent } from '../../utils/supabase/info';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  image: string;
  readTime: number;
  views: number;
  featured?: boolean;
  tags: string[];
  seoKeywords: string[];
}

interface OptimizedArticleCardProps {
  article: Article;
  index: number;
  featured?: boolean;
}

export function OptimizedArticleCard({ article, index, featured = false }: OptimizedArticleCardProps) {
  const handleArticleClick = () => {
    trackEvent({
      event_name: 'article_click',
      article_id: article.id,
      article_title: article.title,
      category: article.category,
      position: index
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'automatisation': 'from-orange-500 to-red-500',
      'chatbots-ia': 'from-blue-500 to-blue-600',
      'pme-senegal': 'from-green-500 to-green-600',
      'pme-maroc': 'from-purple-500 to-purple-600',
      'cas-pratiques': 'from-indigo-500 to-indigo-600'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'automatisation': 'Automatisation',
      'chatbots-ia': 'Chatbots & IA',
      'pme-senegal': 'PME Sénégal',
      'pme-maroc': 'PME Maroc',
      'cas-pratiques': 'Cas Pratiques'
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
      >
        {/* Featured Badge */}
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Article Vedette
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 h-full">
          {/* Image Section */}
          <div className="relative h-64 lg:h-full overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index < 2}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${getCategoryColor(article.category)} text-white text-sm font-medium rounded-full`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {getCategoryLabel(article.category)}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(article.date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                {article.title}
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed mb-6 line-clamp-3">
                {article.excerpt}
              </p>
            </div>

            {/* Footer */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.readTime} min
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.views.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link href={`/blog/${article.id}`} onClick={handleArticleClick}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Lire l'Article Complet</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={index < 6 ? 'eager' : 'lazy'}
        />
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${getCategoryColor(article.category)} text-white text-xs font-medium rounded-full`}>
            {getCategoryLabel(article.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(article.date).toLocaleDateString('fr-FR')}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {article.readTime} min
          </span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {article.views}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2 flex-shrink-0">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            <span>{article.author}</span>
          </div>

          <Link href={`/blog/${article.id}`} onClick={handleArticleClick}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm group"
            >
              <span>Lire</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// Composant pour la grille d'articles
interface ArticleGridProps {
  articles: Article[];
  loading?: boolean;
}

export function ArticleGrid({ articles, loading = false }: ArticleGridProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
        <p className="text-gray-600">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  const featuredArticle = articles.find(article => article.featured) || articles[0];
  const regularArticles = articles.filter(article => article.id !== featuredArticle.id);

  return (
    <div className="space-y-12">
      {/* Featured Article */}
      {featuredArticle && (
        <OptimizedArticleCard 
          article={featuredArticle} 
          index={0} 
          featured={true} 
        />
      )}

      {/* Regular Articles Grid */}
      {regularArticles.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.map((article, index) => (
            <OptimizedArticleCard 
              key={article.id} 
              article={article} 
              index={index + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}