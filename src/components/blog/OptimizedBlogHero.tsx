import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, TrendingUp, BookOpen, Zap, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../utils/supabase/info';

interface BlogHeroProps {
  onSearch: (query: string) => void;
  onNewsletterSubscribe: (email: string) => void;
}

export function OptimizedBlogHero({ onSearch, onNewsletterSubscribe }: BlogHeroProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      trackEvent({
        event_name: 'blog_search',
        search_query: searchQuery
      });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    try {
      await onNewsletterSubscribe(email);
      trackEvent({
        event_name: 'newsletter_subscribe',
        source: 'blog_hero'
      });
      setEmail('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-orange-900 text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.orange.500),transparent_50%)] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.blue.500),transparent_50%)] opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-500 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights IA & Transformation Digitale
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                OMA Blog
              </span>
              <br />
              <span className="text-white">
                Expertise IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Actualités, conseils pratiques et études de cas sur l'automatisation et l'IA 
              pour les PME en <span className="text-orange-400 font-semibold">Afrique de l'Ouest & du Nord</span>.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des articles, conseils, études de cas..."
                  className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-300" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                >
                  Rechercher
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">50+</div>
                <div className="text-sm text-gray-300">Articles Experts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">200+</div>
                <div className="text-sm text-gray-300">PME Aidées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-sm text-gray-300">Succès Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Newsletter IA Exclusive</h3>
              <p className="text-gray-300">
                Recevez chaque semaine nos derniers insights sur l'IA et l'automatisation pour PME
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@entreprise.com"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Inscription...
                  </div>
                ) : (
                  'S\'abonner Gratuitement'
                )}
              </button>
            </form>

            {/* Benefits */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Zap className="w-4 h-4 text-orange-400 mr-2" />
                Conseils exclusifs chaque mardi
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <BookOpen className="w-4 h-4 text-blue-400 mr-2" />
                Études de cas détaillées
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Globe className="w-4 h-4 text-green-400 mr-2" />
                Tendances IA Afrique
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Désabonnement en 1 clic. Vos données sont protégées.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}