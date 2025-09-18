import React, { useState } from 'react';
import { ExternalLink, TrendingUp, Users, Clock, Star, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

interface CaseStudy {
  title: string;
  industry: string;
  location: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    icon: React.ElementType;
  }[];
  image: string;
  testimonial: string;
  author: string;
  position: string;
}

export function CaseStudiesSection() {
  const { t } = useTranslation();
  const { forceUpdate } = useLanguage(); // Force re-render on language change
  const [activeCase, setActiveCase] = useState(0);

  const caseStudies: CaseStudy[] = [
    {
      title: t('case_studies.boulangerie_touba'),
      industry: t('case_studies.industry.bakery'),
      location: t('case_studies.location.dakar_medina'),
      challenge: t('case_studies.boulangerie.challenge'),
      solution: t('case_studies.boulangerie.solution'),
      results: [
        { metric: "Commandes traitées", value: "+340%", icon: TrendingUp },
        { metric: "Satisfaction client", value: "96%", icon: Star },
        { metric: "Temps de réponse", value: "<15s", icon: Clock },
        { metric: "CA mensuel", value: "+280%", icon: Users }
      ],
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop&crop=center&auto=format&q=75",
      testimonial: t('case_studies.boulangerie.testimonial'),
      author: t('case_studies.boulangerie.author'),
      position: t('case_studies.boulangerie.position')
    },
    {
      title: t('case_studies.riad_atlas'),
      industry: t('case_studies.industry.luxury_hotel'),
      location: t('case_studies.location.marrakech'),
      challenge: t('case_studies.riad.challenge'),
      solution: t('case_studies.riad.solution'),
      results: [
        { metric: "Réservations directes", value: "+420%", icon: TrendingUp },
        { metric: "Taux d'occupation", value: "92%", icon: Star },
        { metric: "Revenus par chambre", value: "+180%", icon: TrendingUp },
        { metric: "Avis 5 étoiles", value: "89%", icon: Users }
      ],
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop&crop=center&auto=format&q=75",
      testimonial: t('case_studies.riad.testimonial'),
      author: t('case_studies.riad.author'),
      position: t('case_studies.riad.position')
    },
    {
      title: t('case_studies.pharmacie_liberte'),
      industry: t('case_studies.industry.pharmacy'),
      location: t('case_studies.location.casablanca'),
      challenge: t('case_studies.pharmacie.challenge'),
      solution: t('case_studies.pharmacie.solution'),
      results: [
        { metric: "Ruptures évitées", value: "-92%", icon: TrendingUp },
        { metric: "Patients fidèles", value: "+340%", icon: Users },
        { metric: "CA parapharmacie", value: "+280%", icon: Star },
        { metric: "Livraisons quotidiennes", value: "180+", icon: Clock }
      ],
      image: "https://images.unsplash.com/photo-1585435557343-3b092031d8d8?w=600&h=400&fit=crop&crop=center&auto=format&q=75",
      testimonial: t('case_studies.pharmacie.testimonial'),
      author: t('case_studies.pharmacie.author'),
      position: t('case_studies.pharmacie.position')
    },
    {
      title: t('case_studies.atelier_couture'),
      industry: t('case_studies.industry.fashion'),
      location: t('case_studies.location.dakar_pikine'),
      challenge: t('case_studies.atelier.challenge'),
      solution: t('case_studies.atelier.solution'),
      results: [
        { metric: "Ventes internationales", value: "+520%", icon: TrendingUp },
        { metric: "Délais production", value: "-65%", icon: Clock },
        { metric: "Diaspora sénégalaise", value: "68%", icon: Users },
        { metric: "Panier moyen", value: "+380%", icon: Star }
      ],
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop&crop=center&auto=format&q=75",
      testimonial: t('case_studies.atelier.testimonial'),
      author: t('case_studies.atelier.author'),
      position: t('case_studies.atelier.position')
    }
  ];

  // Add a safety check for rendering
  if (caseStudies.length === 0) {
    return <div>No case studies available</div>;
  }

  const currentCase = caseStudies[activeCase]!; // Non-null assertion since we know the array has elements

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="case-studies" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('case_studies.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('case_studies.description')}
          </p>
        </div>

        {/* Case Study Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {caseStudies.map((caseStudy, index) => (
            <button
              key={index}
              onClick={() => setActiveCase(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeCase === index
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {caseStudy.title}
            </button>
          ))}
        </div>

        {/* Case Study Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-200">
              <Image
                src={currentCase.image}
                alt={currentCase.title}
                width={600}
                height={400}
                className="w-full h-full object-cover"
                priority={activeCase === 0}
                loading={activeCase === 0 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
            
            {/* Industry Badge */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-gray-900">{currentCase.industry}</span>
            </div>
            
            {/* Location Badge */}
            <div className="absolute top-6 right-6 bg-orange-500/95 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-white">{currentCase.location}</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {currentCase.title}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('case_studies.challenge_label')}</h4>
                  <p className="text-gray-700">{currentCase.challenge}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('case_studies.solution_label')}</h4>
                  <p className="text-gray-700">{currentCase.solution}</p>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4">
              {currentCase.results.map((result, index) => {
                const IconComponent = result.icon;
                return (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{result.value}</div>
                        <div className="text-sm text-gray-600">{result.metric}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Testimonial */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
              <blockquote className="text-lg text-gray-900 mb-4 italic">
                "{currentCase.testimonial}"
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                  <span className="text-orange-800 font-semibold">
                    {currentCase.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{currentCase.author}</div>
                  <div className="text-sm text-gray-600">{currentCase.position}</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button 
              onClick={scrollToContact}
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors group"
            >
              {t('case_studies.create_story')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">300+</div>
            <div className="text-gray-700">{t('case_studies.stats.pme_senegal_maroc')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
            <div className="text-gray-700">{t('case_studies.stats.satisfaction_rate')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">280%</div>
            <div className="text-gray-700">{t('case_studies.stats.average_growth')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">6 {t('case_studies.stats.weeks')}</div>
            <div className="text-gray-700">{t('case_studies.stats.roi_recovered')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}