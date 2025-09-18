import React, { useState, useMemo } from 'react';
import { Calendar, User, ArrowRight, Filter, Search, Tag, Clock } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { NewsletterSignup } from './NewsletterSignup';

export function AIBlogSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6; // Show 6 articles per page

  // Mock AI-generated articles data
  const articles = [
    {
      id: 1,
      title: "L'IA Conversationnelle : L'Avenir du Service Client au Sénégal",
      excerpt: "Découvrez comment les chatbots IA transforment l'expérience client pour les PME sénégalaises et augmentent les ventes de 40% en moyenne.",
      content: "Les PME sénégalaises adoptent massivement l'intelligence artificielle conversationnelle...",
      author: "OMA AI Assistant",
      date: "2025-01-25",
      category: "Intelligence Artificielle",
      readTime: "5 min",
      image: "/images/auto_all.webp",
      tags: ["IA", "Chatbot", "PME", "Sénégal"],
      featured: true,
      views: 1247
    },
    {
      id: 2,
      title: "Sites Web Ultra-Rapides : Guide Complet pour PME Dakaroises",
      excerpt: "Les secrets pour créer un site web qui se charge en moins de 1.5 secondes et améliore votre positionnement sur Google.",
      content: "La vitesse de chargement d'un site web est cruciale pour le succès en ligne...",
      author: "OMA AI Assistant", 
      date: "2025-01-22",
      category: "Développement Web",
      readTime: "7 min",
      image: "/images/wbapp.webp",
      tags: ["Performance", "SEO", "Site Web", "Dakar"],
      featured: false,
      views: 892
    },
    {
      id: 3,
      title: "Automatisation WhatsApp Business : ROI de 300% en 6 Mois",
      excerpt: "Étude de cas complète : comment une boulangerie de Liberté a automatisé ses commandes WhatsApp et triplé son chiffre d'affaires.",
      content: "L'automatisation WhatsApp Business révolutionne la façon dont les PME sénégalaises...",
      author: "OMA AI Assistant",
      date: "2025-01-20",
      category: "Automatisation",
      readTime: "6 min",
      image: "/images/auto_fwi.webp",
      tags: ["WhatsApp", "Automatisation", "ROI", "PME"],
      featured: false,
      views: 1156
    },
    {
      id: 4,
      title: "Transformation Digitale : 10 Erreurs à Éviter au Sénégal",
      excerpt: "Les pièges les plus courants dans la digitalisation des PME africaines et comment les éviter pour garantir votre succès.",
      content: "La transformation digitale est un enjeu majeur pour les PME sénégalaises...",
      author: "OMA AI Assistant",
      date: "2025-01-18",
      category: "Stratégie Digitale",
      readTime: "8 min",
      image: "/images/marq_dig.webp",
      tags: ["Transformation", "Stratégie", "PME", "Afrique"],
      featured: false,
      views: 756
    },
    {
      id: 5,
      title: "Analytics & KPIs : Mesurer la Performance de Votre PME",
      excerpt: "Guide pratique pour mettre en place des tableaux de bord efficaces et prendre des décisions basées sur les données.",
      content: "Les données sont le nouveau pétrole pour les entreprises sénégalaises...",
      author: "OMA AI Assistant",
      date: "2025-01-15",
      category: "Analytics",
      readTime: "9 min",
      image: "/images/anal.webp",
      tags: ["Analytics", "KPI", "Data", "Performance"],
      featured: false,
      views: 634
    },
    {
      id: 6,
      title: "Sécurité Digitale : Protéger Votre PME des Cyber-Menaces",
      excerpt: "Les meilleures pratiques de cybersécurité pour les PME sénégalaises dans un monde digital en constante évolution.",
      content: "La cybersécurité n'est plus un luxe mais une nécessité pour toute PME...",
      author: "OMA AI Assistant",
      date: "2025-01-12",
      category: "Cybersécurité",
      readTime: "7 min",
      image: "/images/chatbot.webp",
      tags: ["Sécurité", "Cyber", "Protection", "PME"],
      featured: false,
      views: 523
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

  // Memoize filtered articles to prevent unnecessary recalculations
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);
  
  const featuredArticle = articles.find(article => article.featured);
  const recentArticles = paginatedArticles.filter(article => !article.featured);

  return (
    <section id="blog" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                Accueil
              </a>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Blog</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Blog IA : Insights & Tendances
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Articles générés par notre IA et enrichis par nos experts. Restez à la pointe 
            de la transformation digitale au Sénégal et en Afrique de l'Ouest.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              aria-label="Rechercher un article"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
                aria-pressed={selectedCategory === category}
              >
                {category === 'all' ? 'Tous' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="lg:grid lg:grid-cols-2 gap-8">
                <div className="aspect-[4/3] lg:aspect-auto">
                  <OptimizedImage
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    width={600}
                    height={450}
                    objectFit="cover"
                    className="w-full h-full"
                    quality={85}
                    loading="eager"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                </div>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Article en vedette
                    </span>
                    <span className="text-orange-600 font-medium text-sm">
                      {featuredArticle.category}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 line-clamp-2">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-6 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{featuredArticle.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredArticle.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredArticle.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                      window.location.href = `/blog/${featuredArticle.id}`;
                    }}
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold group"
                    aria-label={`Lire l'article complet : ${featuredArticle.title}`}
                  >
                    Lire l'article complet
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {recentArticles.map(article => (
            <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer" 
              onClick={() => {
                window.location.href = `/blog/${article.id}`;
              }}>
              <div className="aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src={article.image}
                  alt={article.title}
                  width={300}
                  height={225}
                  objectFit="cover"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  quality={80}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <span>{article.views} vues</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/blog/${article.id}`;
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center group"
                  aria-label={`Lire plus sur : ${article.title}`}
                >
                  Lire plus
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              aria-label="Page précédente"
            >
              Précédent
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full font-medium ${
                  currentPage === i + 1
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
                aria-label={`Page ${i + 1}`}
                aria-current={currentPage === i + 1 ? 'page' : undefined}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              aria-label="Page suivante"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </section>
  );
}