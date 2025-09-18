import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Eye, Save, X, Upload, Image, 
  Calendar, Tag, User, Globe, FileText, Search, Filter,
  Clock, TrendingUp, CheckCircle, AlertCircle, Settings,
  BarChart3, Share2, MessageCircle, Heart, ExternalLink,
  Copy, Monitor, Smartphone
} from 'lucide-react';

interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  category: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  trending: boolean;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  estimatedROI: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  // Performance metrics
  avgReadTime?: number; // in seconds
  ctr?: number; // Click-through rate for CTAs
  engagementRate?: number; // (likes + comments + shares) / views
  conversionRate?: number; // conversions from article to CTA clicks
  ctaClicks?: number; // Number of CTA clicks from this article
}

// Add new interface for article performance data
interface ArticlePerformance {
  id: number;
  views: number;
  avgReadTime: number;
  ctr: number;
  engagementRate: number;
  conversionRate: number;
  ctaClicks: number;
  comments: number;
  shares: number;
  likes: number;
}

export function BlogContentManager() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create' | 'analytics'>('list');
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'title' | 'engagement'>('date');
  const [loading, setLoading] = useState(false);
  const [articlePerformance, setArticlePerformance] = useState<ArticlePerformance[]>([]);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Load articles from API
    const mockArticles: BlogArticle[] = [
      {
        id: 1,
        title: "L'IA Conversationnelle : L'Avenir du Service Client au Sénégal",
        excerpt: "Découvrez comment les chatbots IA transforment l'expérience client pour les PME sénégalaises et augmentent les ventes de 40% en moyenne.",
        content: "# Introduction\n\nLes PME sénégalaises adoptent massivement l'intelligence artificielle conversationnelle...\n\n## Avantages clés\n\n- Disponibilité 24/7\n- Réduction des coûts\n- Amélioration de l'expérience client",
        author: {
          name: "OMA AI Assistant",
          avatar: "/images/logo.webp",
          role: "Expert IA"
        },
        date: "2025-01-25",
        category: "Intelligence Artificielle",
        readTime: "5 min",
        image: "/images/auto_all.webp",
        tags: ["IA", "Chatbot", "PME", "Sénégal"],
        featured: true,
        views: 1247,
        likes: 89,
        comments: 23,
        shares: 15,
        trending: true,
        difficulty: "Débutant",
        estimatedROI: "300%",
        status: "published",
        avgReadTime: 240, // 4 minutes
        ctr: 12.5, // 12.5% CTR
        engagementRate: 9.5, // 9.5% engagement
        conversionRate: 3.2, // 3.2% conversion
        ctaClicks: 40
      },
      {
        id: 2,
        title: "Sites Web Ultra-Rapides : Guide Complet pour PME Dakaroises",
        excerpt: "Les secrets pour créer un site web qui se charge en moins de 1.5 secondes et améliore votre positionnement sur Google.",
        content: "# Guide Complet des Sites Web Rapides\n\nLa vitesse de chargement est cruciale...",
        author: {
          name: "OMA AI Assistant",
          avatar: "/images/logo.webp",
          role: "Expert Web"
        },
        date: "2025-01-22",
        category: "Développement Web",
        readTime: "7 min",
        image: "/images/wbapp.webp",
        tags: ["Performance", "SEO", "Site Web", "Dakar"],
        featured: false,
        views: 892,
        likes: 67,
        comments: 18,
        shares: 12,
        trending: false,
        difficulty: "Intermédiaire",
        estimatedROI: "200%",
        status: "published",
        avgReadTime: 360, // 6 minutes
        ctr: 8.7, // 8.7% CTR
        engagementRate: 10.2, // 10.2% engagement
        conversionRate: 2.1, // 2.1% conversion
        ctaClicks: 19
      },
      {
        id: 3,
        title: "Nouvelles Tendances IA 2025",
        excerpt: "Les innovations qui vont révolutionner les entreprises africaines cette année.",
        content: "# Les Tendances IA de 2025\n\nBrouillon de l'article en cours de rédaction...",
        author: {
          name: "OMA AI Assistant",
          avatar: "/images/logo.webp",
          role: "Expert IA"
        },
        date: "2025-01-26",
        category: "Intelligence Artificielle",
        readTime: "6 min",
        image: "/images/auto_fwi.webp",
        tags: ["IA", "Tendances", "2025", "Innovation"],
        featured: false,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        trending: false,
        difficulty: "Avancé",
        estimatedROI: "400%",
        status: "draft"
      }
    ];
    setArticles(mockArticles);
    
    // Mock performance data
    const mockPerformance: ArticlePerformance[] = [
      {
        id: 1,
        views: 1247,
        avgReadTime: 240,
        ctr: 12.5,
        engagementRate: 9.5,
        conversionRate: 3.2,
        ctaClicks: 40,
        comments: 23,
        shares: 15,
        likes: 89
      },
      {
        id: 2,
        views: 892,
        avgReadTime: 360,
        ctr: 8.7,
        engagementRate: 10.2,
        conversionRate: 2.1,
        ctaClicks: 19,
        comments: 18,
        shares: 12,
        likes: 67
      }
    ];
    setArticlePerformance(mockPerformance);
  }, []);

  const categories = [
    'all',
    'Intelligence Artificielle',
    'Développement Web',
    'Automatisation',
    'Stratégie Digitale',
    'Analytics',
    'Cybersécurité'
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'engagement':
        return (b.engagementRate || 0) - (a.engagementRate || 0);
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const handleCreateNew = () => {
    const newArticle: BlogArticle = {
      id: Date.now(),
      title: '',
      excerpt: '',
      content: '',
      author: {
        name: "OMA AI Assistant",
        avatar: "/images/logo.webp",
        role: "Expert"
      },
      date: new Date().toISOString().split('T')[0],
      category: 'Intelligence Artificielle',
      readTime: '5 min',
      image: '/images/logo.webp',
      tags: [],
      featured: false,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      trending: false,
      difficulty: 'Débutant',
      estimatedROI: '100%',
      status: 'draft'
    };
    setSelectedArticle(newArticle);
    setCurrentView('create');
  };

  const handleEdit = (article: BlogArticle) => {
    setSelectedArticle({ ...article });
    setCurrentView('edit');
  };

  const handleDelete = async (articleId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }
  };

  const handleSave = async (article: BlogArticle) => {
    setLoading(true);
    try {
      if (currentView === 'create') {
        setArticles(prev => [...prev, article]);
      } else {
        setArticles(prev => prev.map(a => a.id === article.id ? article : a));
      }
      setCurrentView('list');
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalytics = (article: BlogArticle) => {
    setSelectedArticle(article);
    setCurrentView('analytics');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (currentView === 'edit' || currentView === 'create') {
    return (
      <BlogArticleEditor
        article={selectedArticle}
        onSave={handleSave}
        onCancel={() => {
          setCurrentView('list');
          setSelectedArticle(null);
        }}
        loading={loading}
        isNew={currentView === 'create'}
      />
    );
  }

  // Add analytics view
  if (currentView === 'analytics' && selectedArticle) {
    const performance = articlePerformance.find(p => p.id === selectedArticle.id) || {
      id: selectedArticle.id,
      views: selectedArticle.views,
      avgReadTime: selectedArticle.avgReadTime || 0,
      ctr: selectedArticle.ctr || 0,
      engagementRate: selectedArticle.engagementRate || 0,
      conversionRate: selectedArticle.conversionRate || 0,
      ctaClicks: selectedArticle.ctaClicks || 0,
      comments: selectedArticle.comments,
      shares: selectedArticle.shares,
      likes: selectedArticle.likes
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              Analytics: {selectedArticle.title}
            </h2>
            <p className="text-gray-600 mt-1">
              Performance détaillée de l'article
            </p>
          </div>
          
          <button
            onClick={() => setCurrentView('list')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues</p>
                <p className="text-2xl font-bold text-gray-900">{performance.views.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps de lecture moyen</p>
                <p className="text-2xl font-bold text-gray-900">{Math.floor(performance.avgReadTime / 60)}m {performance.avgReadTime % 60}s</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de CTR</p>
                <p className="text-2xl font-bold text-gray-900">{performance.ctr.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'engagement</p>
                <p className="text-2xl font-bold text-gray-900">{performance.engagementRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactions sociales</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-gray-700">J'aime</span>
                </div>
                <span className="font-medium">{performance.likes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">Commentaires</span>
                </div>
                <span className="font-medium">{performance.comments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Partages</span>
                </div>
                <span className="font-medium">{performance.shares}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance CTA</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Clics CTA</span>
                <span className="font-medium">{performance.ctaClicks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Taux de conversion</span>
                <span className="font-medium">{performance.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="pt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(performance.conversionRate * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparaison</h3>
            <div className="space-y-4">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Positionnement</span>
                  <span className="font-medium">#{articles.findIndex(a => a.id === selectedArticle.id) + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(performance.views / Math.max(...articles.map(a => a.views))) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Engagement</span>
                  <span className="font-medium">{performance.engagementRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(performance.engagementRate / Math.max(...articlePerformance.map(p => p.engagementRate))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleEdit(selectedArticle)}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Éditer
          </button>
          <button
            onClick={() => window.open(`/blog/${selectedArticle.id}`, '_blank')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Prévisualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            Gestion du Blog
          </h2>
          <p className="text-gray-600 mt-1">
            Créer, éditer et gérer vos articles de blog
          </p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel Article
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Publiés</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter(a => a.status === 'published').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vues Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
              <option value="scheduled">Programmés</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Toutes les catégories' : category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">Trier par date</option>
              <option value="views">Trier par vues</option>
              <option value="title">Trier par titre</option>
              <option value="engagement">Trier par engagement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Article</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Statut</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Catégorie</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Performance</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Engagement</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => {
                const performance = articlePerformance.find(p => p.id === article.id);
                return (
                  <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 line-clamp-1">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {article.excerpt}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {article.featured && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                À la une
                              </span>
                            )}
                            {article.trending && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Tendance
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {article.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                        {getStatusIcon(article.status)}
                        {article.status === 'published' ? 'Publié' : 
                         article.status === 'draft' ? 'Brouillon' : 'Programmé'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">{article.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views.toLocaleString()}
                          </span>
                          {performance && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {performance.ctr?.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {article.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {article.comments}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Éditer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewAnalytics(article)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/blog/${article.id}`, '_blank')}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Prévisualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Commencez par créer votre premier article.'}
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Créer un article
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Blog Article Editor Component will be defined next
interface BlogArticleEditorProps {
  article: BlogArticle | null;
  onSave: (article: BlogArticle) => void;
  onCancel: () => void;
  loading: boolean;
  isNew: boolean;
}

function BlogArticleEditor({ article, onSave, onCancel, loading, isNew }: BlogArticleEditorProps) {
  const [formData, setFormData] = useState<BlogArticle>(article || {} as BlogArticle);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo' | 'preview' | 'ctas'>('content');
  const [imageUploading, setImageUploading] = useState(false);

  const categories = [
    'Intelligence Artificielle',
    'Développement Web',
    'Automatisation',
    'Stratégie Digitale',
    'Analytics',
    'Cybersécurité'
  ];

  const difficulties = ['Débutant', 'Intermédiaire', 'Avancé'];

  useEffect(() => {
    if (article) {
      setFormData(article);
    }
  }, [article]);

  const handleInputChange = (field: keyof BlogArticle, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // In a real app, upload to your image service
      // For now, create a mock URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = () => {
    // Calculate read time based on content
    const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    const updatedArticle = {
      ...formData,
      readTime: `${readTime} min`,
      date: formData.date || new Date().toISOString().split('T')[0]
    };

    onSave(updatedArticle);
  };

  const generatePreview = () => {
    return formData.content
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mb-2">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .split('\n').map(line => {
        if (line.includes('<h') || line.includes('<li') || line.includes('<ul') || line.includes('</ul>')) {
          return line;
        }
        return line.trim() ? `<p class="mb-4">${line}</p>` : '';
      }).join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Créer un nouvel article' : 'Éditer l\'article'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isNew ? 'Rédigez votre nouvel article de blog' : 'Modifiez votre article existant'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => handleInputChange('status', 'draft')}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Sauver comme brouillon
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !formData.title || !formData.content}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {formData.status === 'published' ? 'Publier' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'content', label: 'Contenu', icon: FileText },
            { id: 'settings', label: 'Paramètres', icon: Settings },
            { id: 'ctas', label: 'CTA', icon: ExternalLink },
            { id: 'seo', label: 'SEO', icon: Globe },
            { id: 'preview', label: 'Aperçu', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'article *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Entrez le titre de votre article..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résumé *
              </label>
              <textarea
                value={formData.excerpt || ''}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Écrivez un résumé accrocheur de votre article..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de couverture
              </label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 cursor-pointer transition-colors ${
                      imageUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {imageUploading ? (
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-gray-600">
                      {imageUploading ? 'Upload en cours...' : 'Choisir une image'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'article *
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Markdown supporté:</span>
                    <code className="bg-white px-2 py-1 rounded"># Titre</code>
                    <code className="bg-white px-2 py-1 rounded">**gras**</code>
                    <code className="bg-white px-2 py-1 rounded">*italique*</code>
                    <code className="bg-white px-2 py-1 rounded">- liste</code>
                  </div>
                </div>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="# Introduction&#10;&#10;Commencez à écrire votre article ici...&#10;&#10;## Section 1&#10;&#10;Votre contenu...&#10;&#10;[CTA: Demander une démo](#demo)&#10;&#10;## Section 2&#10;&#10;Votre contenu...&#10;&#10;[CTA: Contacter](#contact)"
                  rows={20}
                  className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau de difficulté
                </label>
                <select
                  value={formData.difficulty || ''}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ROI estimé
                </label>
                <input
                  type="text"
                  value={formData.estimatedROI || ''}
                  onChange={(e) => handleInputChange('estimatedROI', e.target.value)}
                  placeholder="ex: 300%"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="IA, Chatbot, PME, Sénégal"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de publication
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="scheduled">Programmé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de publication
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Article à la une
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trending"
                    checked={formData.trending || false}
                    onChange={(e) => handleInputChange('trending', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="trending" className="ml-2 text-sm text-gray-700">
                    Marquer comme tendance
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auteur
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={formData.author?.avatar || '/images/logo.webp'}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.author?.name || 'OMA AI Assistant'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formData.author?.role || 'Expert'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Tab */}
        {activeTab === 'ctas' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Gestion des CTA</h3>
              <p className="text-sm text-blue-700">
                Intégrez des boutons d'appel à l'action dans votre article pour améliorer les conversions.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Ajouter un CTA</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du CTA
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Demander une démo personnalisée"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien CTA
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500">
                    <option value="#demo">Demander une démo</option>
                    <option value="#contact">Contactez-nous</option>
                    <option value="#whatsapp">WhatsApp</option>
                    <option value="#services">Nos services</option>
                    <option value="#blog">Autres articles</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <button className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md">
                  Ajouter CTA
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">CTA intégrés dans l'article</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Demander une démo personnalisée</div>
                    <div className="text-sm text-gray-500">Lien: #demo</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Actif
                    </span>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Contactez notre équipe</div>
                    <div className="text-sm text-gray-500">Lien: #contact</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Actif
                    </span>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Conseil</h4>
              <p className="text-sm text-yellow-700">
                Pour intégrer un CTA manuellement dans votre contenu, utilisez la syntaxe suivante : 
                <code className="bg-white px-1 py-0.5 rounded ml-1">[CTA: Texte du CTA](#lien)</code>
              </p>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Optimisation SEO</h3>
              <p className="text-sm text-blue-700">
                Optimisez votre article pour les moteurs de recherche et les réseaux sociaux.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title (recommandé: 50-60 caractères)
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <div className="text-sm text-gray-500 mt-1">
                {(formData.title || '').length}/60 caractères
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (recommandé: 150-160 caractères)
              </label>
              <textarea
                value={formData.excerpt || ''}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <div className="text-sm text-gray-500 mt-1">
                {(formData.excerpt || '').length}/160 caractères
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  oma-digital.sn/blog/
                </span>
                <input
                  type="text"
                  value={formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ''}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés cibles
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="intelligence artificielle, chatbot, pme senegal"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Aperçu de l'article</h3>
              <p className="text-sm text-yellow-700">
                Voici comment votre article apparaîtra sur le blog.
              </p>
            </div>

            {/* Article Preview */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 p-6 text-center">
                <div className="flex justify-center items-center gap-3 mb-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {formData.category}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formData.difficulty}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {formData.title || 'Titre de l\'article'}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6">
                  {formData.excerpt || 'Résumé de l\'article'}
                </p>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formData.date ? new Date(formData.date).toLocaleDateString('fr-FR') : 'Date'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formData.readTime || '5 min'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{formData.author?.name || 'Auteur'}</span>
                  </span>
                </div>
              </div>

              {/* Image */}
              {formData.image && (
                <div className="aspect-[16/9]">
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: generatePreview() || '<p class="text-gray-500 italic">Le contenu apparaîtra ici...</p>' 
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}