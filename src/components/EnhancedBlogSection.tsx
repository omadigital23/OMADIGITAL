import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, User, ArrowRight, Filter, Search, Tag, Clock, Eye, TrendingUp, BookOpen, Share2, Heart, MessageCircle } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { NewsletterSignup } from './NewsletterSignup';

export function EnhancedBlogSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, trending
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showFilters, setShowFilters] = useState(false);
  const articlesPerPage = 6;

  // Enhanced mock articles data with engagement metrics
  const articles = [
    {
      id: 1,
      title: "L'IA Conversationnelle : L'Avenir du Service Client au Sénégal",
      excerpt: "Découvrez comment les chatbots IA transforment l'expérience client pour les PME sénégalaises et augmentent les ventes de 40% en moyenne.",
      content: "Les PME sénégalaises adoptent massivement l'intelligence artificielle conversationnelle...",
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
      estimatedROI: "300%"
    },
    {
      id: 2,
      title: "Sites Web Ultra-Rapides : Guide Complet pour PME Dakaroises",
      excerpt: "Les secrets pour créer un site web qui se charge en moins de 1.5 secondes et améliore votre positionnement sur Google.",
      content: "La vitesse de chargement d'un site web est cruciale pour le succès en ligne...",
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
      estimatedROI: "200%"
    },
    {
      id: 3,
      title: "Automatisation WhatsApp Business : ROI de 300% en 6 Mois",
      excerpt: "Étude de cas complète : comment une boulangerie de Liberté a automatisé ses commandes WhatsApp et triplé son chiffre d'affaires.",
      content: "L'automatisation WhatsApp Business révolutionne la façon dont les PME sénégalaises...",
      author: {
        name: "OMA AI Assistant",
        avatar: "/images/logo.webp",
        role: "Expert Automatisation"
      },
      date: "2025-01-20",
      category: "Automatisation",
      readTime: "6 min",
      image: "/images/whatsapp.webm",
      tags: ["WhatsApp", "Automatisation", "PME", "ROI"],
      featured: false,
      views: 1543,
      likes: 156,
      comments: 42,
      shares: 28,
      trending: true,
      difficulty: "Débutant",
      estimatedROI: "300%"
    },
    {
      id: 4,
      title: "Analytics Avancées : Comprendre Votre Audience Sénégalaise",
      excerpt: "Maîtrisez Google Analytics 4 et découvrez les métriques qui comptent vraiment pour votre business au Sénégal.",
      content: "Les données sont le nouveau pétrole, et pour les PME sénégalaises...",
      author: {
        name: "OMA AI Assistant",
        avatar: "/images/logo.webp",
        role: "Expert Data"
      },
      date: "2025-01-18",
      category: "Analytics",
      readTime: "8 min",
      image: "/images/anal.webp",
      tags: ["Analytics", "Data", "Google Analytics", "PME"],
      featured: false,
      views: 634,
      likes: 45,
      comments: 12,
      shares: 8,
      trending: false,
      difficulty: "Avancé",
      estimatedROI: "150%"
    },
    {
      id: 5,
      title: "Transformation Digitale : 7 Étapes pour les PME Sénégalaises",
      excerpt: "Un roadmap complet pour digitaliser votre entreprise sénégalaise en 2025, avec des outils adaptés au marché local.",
      content: "La transformation digitale n'est plus une option mais une nécessité...",
      author: {
        name: "OMA AI Assistant",
        avatar: "/images/logo.webp",
        role: "Expert Transformation"
      },
      date: "2025-01-15",
      category: "Stratégie Digitale",
      readTime: "10 min",
      image: "/images/transformation.webm",
      tags: ["Transformation", "Digital", "PME", "Stratégie"],
      featured: false,
      views: 987,
      likes: 78,
      comments: 19,
      shares: 22,
      trending: false,
      difficulty: "Intermédiaire",
      estimatedROI: "250%"
    },
    {
      id: 6,
      title: "Cybersécurité pour PME : Protégez Votre Business Numérique",
      excerpt: "Guide pratique pour sécuriser votre entreprise contre les cybermenaces, avec des solutions abordables pour les PME sénégalaises.",
      content: "La cybersécurité est un enjeu majeur pour toutes les entreprises...",
      author: {
        name: "OMA AI Assistant",
        avatar: "/images/logo.webp",
        role: "Expert Sécurité"
      },
      date: "2025-01-12",
      category: "Cybersécurité",
      readTime: "6 min",
      image: "/images/logo.webp",
      tags: ["Sécurité", "Cybersécurité", "PME", "Protection"],
      featured: false,
      views: 456,
      likes: 34,
      comments: 8,
      shares: 5,
      trending: false,
      difficulty: "Intermédiaire",
      estimatedROI: "100%"
    }
  ];

  const categories = [
    'all',
    'Intelligence Artificielle',
    'Développement Web', 
    'Automatisation',
    'Stratégie Digitale',
    'Analytics',
    'Cybersécurité'
  ];

  const difficultyLevels = ['all', 'Débutant', 'Intermédiaire', 'Avancé'];
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Memoize filtered and sorted articles
  const processedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.author.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'trending':
          return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
        case 'recent':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [articles, selectedCategory, selectedDifficulty, searchTerm, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(processedArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = processedArticles.slice(startIndex, startIndex + articlesPerPage);
  
  const featuredArticle = articles.find(article => article.featured);
  const trendingArticles = articles.filter(article => article.trending).slice(0, 3);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDifficulty, searchTerm, sortBy]);

  const handleLike = (articleId: number) => {
    // In a real app, this would make an API call
    console.log('Liked article:', articleId);
  };

  const handleShare = (article: any) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: `/blog/${article.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${article.id}`);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <section id="blog" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Blog IA & Transformation Digitale
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Expertise <span className="text-orange-600">IA & Digital</span> pour PME Sénégalaises
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos guides, études de cas et conseils d'experts pour transformer votre entreprise 
            avec l'intelligence artificielle et les technologies digitales.
          </p>
          
          {/* Blog Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{articles.length}</div>
              <div className="text-sm text-gray-500">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Lecteurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {trendingArticles.length}
              </div>
              <div className="text-sm text-gray-500">Tendances</div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher articles, tags, ou auteurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Sort and View Mode */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="recent">Plus récents</option>
                <option value="popular">Plus populaires</option>
                <option value="trending">Tendances</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Catégorie</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-orange-100 text-orange-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category === 'all' ? 'Toutes les catégories' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Niveau</label>
                <div className="space-y-2">
                  {difficultyLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedDifficulty(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDifficulty === level
                          ? 'bg-orange-100 text-orange-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {level === 'all' ? 'Tous les niveaux' : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Filtres rapides</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSortBy('trending');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Tendances du moment
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('Intelligence Artificielle');
                      setSortBy('popular');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                  >
                    🤖 Articles IA populaires
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDifficulty('Débutant');
                      setSortBy('recent');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                  >
                    🌱 Pour débuter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
            <div className="border-t pt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDifficulty !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedDifficulty}
                  <button
                    onClick={() => setSelectedDifficulty('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-600">
            {processedArticles.length} article{processedArticles.length > 1 ? 's' : ''} trouvé{processedArticles.length > 1 ? 's' : ''}
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
          <div className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages}
          </div>
        </div>

        {/* Featured Article */}
        {featuredArticle && selectedCategory === 'all' && !searchTerm && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-orange-500 mr-2" />
              Article à la une
            </h2>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-[16/10] lg:aspect-auto">
                  <OptimizedImage
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    width={600}
                    height={400}
                    objectFit="cover"
                    className="w-full h-full"
                    quality={90}
                    priority
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {featuredArticle.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {featuredArticle.difficulty}
                    </span>
                    {featuredArticle.trending && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Tendance
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  
                  {/* Author and Meta */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <OptimizedImage
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{featuredArticle.author.name}</div>
                        <div className="text-sm text-gray-500">{featuredArticle.author.role}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredArticle.date).toLocaleDateString('fr-FR')}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readTime}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{featuredArticle.views.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{featuredArticle.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{featuredArticle.comments}</span>
                      </span>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ROI estimé: {featuredArticle.estimatedROI}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <a
                      href={`/blog/${featuredArticle.id}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>Lire l'article</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleLike(featuredArticle.id)}
                      className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare(featuredArticle)}
                      className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {paginatedArticles.filter(article => !article.featured || selectedCategory !== 'all' || searchTerm).map((article, index) => (
            <article 
              key={article.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <OptimizedImage
                  src={article.image}
                  alt={article.title}
                  width={400}
                  height={250}
                  objectFit="cover"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  quality={80}
                  loading={index < 3 ? "eager" : "lazy"}
                />
                
                {/* Overlay badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                  {article.trending && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Tendance
                    </span>
                  )}
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {article.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs cursor-pointer hover:bg-orange-100 hover:text-orange-600 transition-colors"
                      onClick={() => setSearchTerm(tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="font-bold text-gray-900 mb-3 leading-tight hover:text-orange-600 transition-colors cursor-pointer line-clamp-2">
                  <a href={`/blog/${article.id}`}>{article.title}</a>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                
                {/* Author Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <OptimizedImage
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <div>
                      <div className="text-xs font-medium text-gray-900">{article.author.name}</div>
                      <div className="text-xs text-gray-500">{article.author.role}</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    ROI: {article.estimatedROI}
                  </div>
                </div>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views.toLocaleString()}</span>
                  </span>
                </div>
                
                {/* Engagement and Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <button 
                      onClick={() => handleLike(article.id)}
                      className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                      <span>{article.likes}</span>
                    </button>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{article.comments}</span>
                    </span>
                    <button 
                      onClick={() => handleShare(article)}
                      className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{article.shares}</span>
                    </button>
                  </div>
                  <a
                    href={`/blog/${article.id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1 group"
                  >
                    <span>Lire</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {processedArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-12">
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
                }`}
                aria-label="Page précédente"
              >
                Précédent
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                const isCurrentPage = currentPage === pageNumber;
                const shouldShow = 
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  Math.abs(pageNumber - currentPage) <= 1;
                
                if (!shouldShow && pageNumber !== 2 && pageNumber !== totalPages - 1) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      isCurrentPage
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
                    }`}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
                }`}
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Affichage {startIndex + 1}-{Math.min(startIndex + articlesPerPage, processedArticles.length)} sur {processedArticles.length} articles
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </section>
  );
}