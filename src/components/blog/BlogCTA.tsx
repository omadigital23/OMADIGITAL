import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  ArrowRight, 
  Zap, 
  Target, 
  Award,
  CheckCircle
} from 'lucide-react';
import { trackEvent, generateWhatsAppLink } from '../../utils/supabase/info';

export function BlogCTA() {
  const handleWhatsAppClick = () => {
    trackEvent({
      event_name: 'whatsapp_click',
      source: 'blog_cta'
    });
    const message = "Bonjour ! Après avoir lu vos articles, je suis convaincu(e) de l'importance de l'automatisation pour mon entreprise. Pouvons-nous discuter de mes besoins spécifiques ?";
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const handleConsultationClick = () => {
    trackEvent({
      event_name: 'consultation_request',
      source: 'blog_cta'
    });
    const message = "Bonjour ! Je souhaite planifier une consultation gratuite pour discuter de la transformation digitale de mon entreprise. Quand êtes-vous disponible ?";
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Déploiement Rapide',
      description: 'Votre solution opérationnelle en 48h'
    },
    {
      icon: Target,
      title: 'ROI Garanti',
      description: 'Retour sur investissement en 3 mois'
    },
    {
      icon: Award,
      title: 'Expertise Locale',
      description: 'Équipe basée au Sénégal et Maroc'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-orange-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.orange.500),transparent_50%)] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.blue.500),transparent_50%)] opacity-20"></div>
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Prêt à Passer à l'Action ?
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Transformez Votre PME{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                Dès Aujourd'hui
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Vous avez lu nos conseils, découvert nos cas pratiques. 
              Il est temps de passer à l'action et de rejoindre les{' '}
              <span className="text-orange-400 font-semibold">200+ PME</span> qui ont déjà transformé leur business.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-300 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
                <span>WhatsApp Direct</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleConsultationClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Phone className="w-6 h-6" />
                <span>Consultation Gratuite</span>
              </motion.button>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              💡 Consultation gratuite de 30 minutes • Sans engagement • Conseils personnalisés
            </p>
          </motion.div>

          {/* Right Column - Stats & Social Proof */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Pourquoi Nous Choisir ?
            </h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">200+</div>
                <div className="text-gray-300 text-sm">PME Transformées</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
                <div className="text-gray-300 text-sm">Satisfaction Client</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">48h</div>
                <div className="text-gray-300 text-sm">Déploiement Moyen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">200%</div>
                <div className="text-gray-300 text-sm">ROI Moyen</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <div className="font-semibold">Amadou Diallo</div>
                  <div className="text-gray-300 text-sm">CEO, Restaurant Le Baobab</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "Grâce à OMA Digital, nous avons automatisé nos commandes WhatsApp et doublé notre chiffre d'affaires en 3 mois. L'équipe est professionnelle et comprend vraiment les enjeux des PME sénégalaises."
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full mr-1"></div>
                ))}
                <span className="text-gray-300 text-sm ml-2">5/5 étoiles</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                <span>Garantie satisfait ou remboursé 30 jours</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                <span>Support technique 24/7 inclus</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                <span>Formation complète de votre équipe</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}