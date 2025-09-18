import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Bell, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Star,
  Download,
  Zap
} from 'lucide-react';
import { trackEvent, generateWhatsAppLink } from '../../utils/supabase/info';

interface BlogSidebarProps {
  recommendedArticles?: any[];
  onNewsletterSubscribe?: (email: string) => void;
}

export function BlogSidebar({ recommendedArticles = [], onNewsletterSubscribe }: BlogSidebarProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleWhatsAppClick = () => {
    trackEvent({
      event_name: 'whatsapp_click',
      source: 'blog_sidebar'
    });
    const message = "Bonjour ! J'ai lu vos articles sur l'automatisation et j'aimerais en savoir plus sur vos services.";
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const handleConsultationClick = () => {
    trackEvent({
      event_name: 'consultation_request',
      source: 'blog_sidebar'
    });
    const message = "Bonjour ! J'aimerais planifier une consultation gratuite pour discuter de mes besoins en transformation digitale.";
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !onNewsletterSubscribe) return;

    setIsSubscribing(true);
    try {
      await onNewsletterSubscribe(email);
      trackEvent({
        event_name: 'newsletter_subscribe',
        source: 'blog_sidebar'
      });
      setEmail('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <aside className="space-y-8">
      {/* CTA Principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-xl font-bold mb-3">
            Prêt à Automatiser Votre PME ?
          </h3>
          
          <p className="text-orange-100 mb-6 text-sm leading-relaxed">
            Découvrez comment nos solutions peuvent transformer votre business en 48h.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Direct</span>
            </button>
            
            <button
              onClick={handleConsultationClick}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/20 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Consultation Gratuite</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Newsletter */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Newsletter Hebdo
          </h3>
          <p className="text-gray-600 text-sm">
            Recevez nos meilleurs conseils IA chaque mardi
          </p>
        </div>

        <form onSubmit={handleNewsletterSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={isSubscribing}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubscribing ? 'Inscription...' : 'S\'abonner Gratuitement'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Star className="w-3 h-3 mr-1 text-yellow-500" />
            2000+ abonnés
          </span>
          <span>•</span>
          <span>Désabonnement 1-clic</span>
        </div>
      </motion.div>

      {/* Articles Recommandés */}
      {recommendedArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
            Articles Populaires
          </h3>
          
          <div className="space-y-4">
            {recommendedArticles.slice(0, 4).map((article, index) => (
              <div key={article.id} className="group cursor-pointer">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span>•</span>
                      <span>{article.readTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-center space-x-1 group">
            <span>Voir tous les articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </motion.div>
      )}

      {/* Guide Gratuit */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Guide Gratuit
          </h3>
          
          <p className="text-gray-600 text-sm mb-4">
            "10 Étapes pour Automatiser Votre PME en 2024"
          </p>
          
          <button
            onClick={() => {
              trackEvent({
                event_name: 'guide_download',
                source: 'blog_sidebar'
              });
            }}
            className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Télécharger PDF</span>
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            Gratuit • 24 pages • Format PDF
          </p>
        </div>
      </motion.div>
    </aside>
  );
}