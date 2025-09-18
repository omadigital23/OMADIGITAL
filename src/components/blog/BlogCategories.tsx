import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  MessageCircle, 
  MapPin, 
  TrendingUp, 
  FileText, 
  Zap,
  Globe,
  Target,
  Award
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string;
  gradient: string;
  featured?: boolean;
}

interface BlogCategoriesProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function BlogCategories({ activeCategory, onCategoryChange }: BlogCategoriesProps) {
  const { t } = useTranslation();

  const categories: Category[] = [
    {
      id: 'all',
      name: 'Tous les Articles',
      description: 'Découvrez tous nos contenus experts',
      icon: Globe,
      count: 47,
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      id: 'automatisation',
      name: 'Automatisation',
      description: 'Processus automatisés pour PME',
      icon: Zap,
      count: 15,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      featured: true
    },
    {
      id: 'chatbots-ia',
      name: 'Chatbots & IA',
      description: 'Intelligence artificielle conversationnelle',
      icon: Bot,
      count: 12,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pme-senegal',
      name: 'PME Sénégal',
      description: 'Spécifique au marché sénégalais',
      icon: MapPin,
      count: 8,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'pme-maroc',
      name: 'PME Maroc',
      description: 'Adapté au contexte marocain',
      icon: MapPin,
      count: 6,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'cas-pratiques',
      name: 'Cas Pratiques',
      description: 'Études de cas réels et résultats',
      icon: Target,
      count: 10,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      featured: true
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explorez par{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Catégorie
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez rapidement les contenus qui correspondent à vos besoins spécifiques
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-6 rounded-2xl text-left transition-all duration-300 group
                  ${isActive 
                    ? 'bg-white shadow-xl border-2 border-orange-200 transform scale-105' 
                    : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-200'
                  }
                `}
              >
                {/* Featured Badge */}
                {category.featured && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <Award className="w-3 h-3 inline mr-1" />
                      Populaire
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-r ${category.gradient}` 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}>
                  <IconComponent 
                    className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-600'}`} 
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className={`text-lg font-semibold mb-2 ${isActive ? 'text-orange-600' : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Count */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                    {category.count} articles
                  </span>
                  
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8"
        >
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">47</div>
              <div className="text-gray-600">Articles Publiés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">15k+</div>
              <div className="text-gray-600">Lecteurs/Mois</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">PME Inspirées</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Contenu Utile</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}