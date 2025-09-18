import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedBlogHero } from './OptimizedBlogHero';
import { BlogCategories } from './BlogCategories';
import { ArticleGrid } from './OptimizedArticleCard';
import { BlogSidebar } from './BlogSidebar';
import { BlogCTA } from './BlogCTA';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid, 
  List,
  Loader,
  ChevronDown
} from 'lucide-react';
import { trackEvent } from '../../utils/supabase/info';

// Types
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

interface BlogFilters {
  category: string;
  search: string;
  sortBy: 'date' | 'views' | 'readTime';
  sortOrder: 'asc' | 'desc';
}

// Mock data - À remplacer par des données réelles de Supabase
const mockArticles: Article[] = [
  {
    id: 'automatisation-pme-dakar-2024',
    title: 'Comment Automatiser Votre PME à Dakar en 2024 : Guide Complet',
    excerpt: 'Découvrez les 7 étapes essentielles pour transformer votre entreprise sénégalaise avec l\'automatisation. ROI garanti en 3 mois.',
    content: '',
    category: 'automatisation',
    date: '2024-01-15',
    author: 'OMA Digital',
    image: '/images/auto_all.webp',
    readTime: 8,
    views: 2547,
    featured: true,
    tags: ['automatisation', 'PME', 'Dakar', 'transformation digitale'],
    seoKeywords: ['automatisation PME Dakar', 'transformation digitale Sénégal']
  },
  {
    id: 'chatbot-whatsapp-business-maroc',
    title: 'Chatbot WhatsApp Business : Révolutionnez Votre Service Client au Maroc',
    excerpt: 'Augmentez vos ventes de 200% avec un chatbot WhatsApp intelligent. Cas d\'étude d\'une PME casablancaise.',
    content: '',
    category: 'chatbots-ia',
    date: '2024-01-12',
    author: 'OMA Digital',
    image: '/images/chatbot.webp',
    readTime: 6,
    views: 1823,
    tags: ['chatbot', 'WhatsApp', 'Maroc', 'service client'],
    seoKeywords: ['chatbot WhatsApp Maroc', 'service client automatisé']
  },
  {
    id: 'ia-pme-senegal-opportunites',
    title: 'IA pour PME Sénégalaises : Opportunités et Défis en 2024',
    excerpt: 'L\'intelligence artificielle n\'est plus réservée aux grandes entreprises. Découvrez comment les PME sénégalaises peuvent en bénéficier.',
    content: '',
    category: 'pme-senegal',
    date: '2024-01-10',
    author: 'OMA Digital',
    image: '/images/marq_dig.webp',
    readTime: 10,
    views: 3156,
    tags: ['IA', 'PME', 'Sénégal', 'opportunités'],
    seoKeywords: ['IA PME Sénégal', 'intelligence artificielle Dakar']
  },
  {
    id: 'cas-pratique-restaurant-casablanca',
    title: 'Cas Pratique : Comment un Restaurant de Casablanca a Doublé son CA',
    excerpt: 'Étude de cas complète : automatisation des commandes, chatbot de réservation et marketing digital pour un restaurant marocain.',
    content: '',
    category: 'cas-pratiques',
    date: '2024-01-08',
    author: 'OMA Digital',
    image: '/images/wbapp.webp',
    readTime: 12,
    views: 4231,
    tags: ['cas pratique', 'restaurant', 'Casablanca', 'ROI'],
    seoKeywords: ['automatisation restaurant Maroc', 'cas pratique PME Casablanca']
  },
  {
    id: 'marketing-digital-pme-africaines',
    title: 'Marketing Digital pour PME Africaines : Stratégies Gagnantes 2024',
    excerpt: 'Les meilleures stratégies de marketing digital adaptées au contexte africain. Exemples concrets du Sénégal et du Maroc.',
    content: '',
    category: 'pme-maroc',
    date: '2024-01-05',
    author: 'OMA Digital',
    image: '/images/auto_fwi.webp',
    readTime: 9,
    views: 1967,
    tags: ['marketing digital', 'PME', 'Afrique', 'stratégie'],
    seoKeywords: ['marketing digital PME Afrique', 'stratégie digitale Sénégal Maroc']
  }
];

export function OptimizedBlogPage() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<BlogFilters>({
    category: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage et tri des articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filtrage par catégorie
    if (filters.category !== 'all') {
      filtered = filtered.filter(article => article.category === filters.category);
    }

    // Filtrage par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'readTime':
          aValue = a.readTime;
          bValue = b.readTime;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [articles, filters]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    trackEvent({
      event_name: 'blog_search',
      search_query: query,
      results_count: filteredArticles.length
    });
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    trackEvent({
      event_name: 'blog_category_filter',
      category: category
    });
  };

  const handleNewsletterSubscribe = async (email: string) => {
    // Implémentation de l'abonnement newsletter
    try {
      // Appel API pour inscription newsletter
      console.log('Newsletter subscription:', email);
      // Ici, vous intégreriez avec votre service d'email (Mailchimp, SendGrid, etc.)
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    }
  };

  const recommendedArticles = articles
    .filter(article => article.id !== filteredArticles[0]?.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <OptimizedBlogHero 
        onSearch={handleSearch}
        onNewsletterSubscribe={handleNewsletterSubscribe}
      />

      {/* Categories */}
      <BlogCategories 
        activeCategory={filters.category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Articles Section */}
            <div className="lg:col-span-3">
              {/* Filters & Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filters.category === 'all' ? 'Tous les Articles' : 'Articles Filtrés'}
                  </h2>
                  <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                    {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setFilters(prev => ({ 
                          ...prev, 
                          sortBy: sortBy as 'date' | 'views' | 'readTime',
                          sortOrder: sortOrder as 'asc' | 'desc'
                        }));
                      }}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="date-desc">Plus récents</option>
                      <option value="date-asc">Plus anciens</option>
                      <option value="views-desc">Plus populaires</option>
                      <option value="readTime-asc">Lecture rapide</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Mode */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Articles Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filters.category}-${filters.search}-${filters.sortBy}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArticleGrid 
                    articles={filteredArticles}
                    loading={loading}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Load More / Pagination */}
              {filteredArticles.length > 0 && (
                <div className="text-center mt-12">
                  <button className="bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-orange-700 transition-colors duration-200">
                    Charger Plus d'Articles
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BlogSidebar 
                  recommendedArticles={recommendedArticles}
                  onNewsletterSubscribe={handleNewsletterSubscribe}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <BlogCTA />
    </div>
  );
}