import React from 'react';
import { Search, Lightbulb, Code, Rocket, BarChart3, HeadphonesIcon, CheckCircle } from 'lucide-react';
import { useTranslation } from 'next-i18next';

export function ProcessTimeline() {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: Search,
      title: t('process.audit.title'),
      duration: t('process.audit.duration'),
      description: t('process.audit.description'),
      deliverables: [
        t('process.audit.deliverable1'),
        t('process.audit.deliverable2'),
        t('process.audit.deliverable3')
      ],
      color: "bg-blue-500"
    },
    {
      icon: Lightbulb,
      title: t('process.strategy.title'),
      duration: t('process.strategy.duration'), 
      description: t('process.strategy.description'),
      deliverables: [
        t('process.strategy.deliverable1'),
        t('process.strategy.deliverable2'),
        t('process.strategy.deliverable3')
      ],
      color: "bg-purple-500"
    },
    {
      icon: Code,
      title: t('process.development.title'),
      duration: t('process.development.duration'),
      description: t('process.development.description'),
      deliverables: [
        t('process.development.deliverable1'),
        t('process.development.deliverable2'),
        t('process.development.deliverable3')
      ],
      color: "bg-green-500"
    },
    {
      icon: Rocket,
      title: t('process.deployment.title'),
      duration: t('process.deployment.duration'),
      description: t('process.deployment.description'),
      deliverables: [
        t('process.deployment.deliverable1'),
        t('process.deployment.deliverable2'),
        t('process.deployment.deliverable3')
      ],
      color: "bg-orange-500"
    },
    {
      icon: BarChart3,
      title: t('process.optimization.title'),
      duration: t('process.optimization.duration'),
      description: t('process.optimization.description'),
      deliverables: [
        t('process.optimization.deliverable1'),
        t('process.optimization.deliverable2'),
        t('process.optimization.deliverable3')
      ],
      color: "bg-red-500"
    },
    {
      icon: HeadphonesIcon,
      title: t('process.support.title'),
      duration: t('process.support.duration'),
      description: t('process.support.description'),
      deliverables: [
        t('process.support.deliverable1'),
        t('process.support.deliverable2'),
        t('process.support.deliverable3')
      ],
      color: "bg-indigo-500"
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="process" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('process.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('process.description')}
          </p>
        </div>

        {/* Timeline - Improved for better clarity */}
        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full hidden lg:block"></div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={index} className="relative">
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    {isEven ? (
                      <>
                        {/* Content Left */}
                        <div className="text-right">
                          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="mb-4">
                              <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                {step.duration}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              {step.title}
                            </h3>
                            
                            <p className="text-gray-700 mb-6">
                              {step.description}
                            </p>
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-sm flex items-center justify-end">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {t('process.deliverables_label')} :
                              </h4>
                              <ul className="space-y-1">
                                {step.deliverables.map((deliverable, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-center justify-end">
                                    <span>{deliverable}</span>
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-2"></div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Icon Center */}
                        <div className="flex justify-start">
                          <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center shadow-lg relative z-10`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Icon Center */}
                        <div className="flex justify-end">
                          <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center shadow-lg relative z-10`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Content Right */}
                        <div className="text-left">
                          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="mb-4">
                              <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                {step.duration}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              {step.title}
                            </h3>
                            
                            <p className="text-gray-700 mb-6">
                              {step.description}
                            </p>
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {t('process.deliverables_label')} :
                              </h4>
                              <ul className="space-y-1">
                                {step.deliverables.map((deliverable, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-center">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                    <span>{deliverable}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile Layout - Improved for better readability */}
                  <div className="lg:hidden">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center flex-shrink-0 relative z-10`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
                          <div className="mb-3">
                            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                              {step.duration}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          
                          <p className="text-gray-700 mb-4 text-sm">
                            {step.description}
                          </p>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {t('process.deliverables_label')}
                            </h4>
                            <ul className="space-y-1">
                              {step.deliverables.map((deliverable, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step Number */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 hidden lg:block">
                    <div className="w-8 h-8 bg-white border-4 border-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Benefits Section */}
        <div className="mt-20 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('process.benefits.title')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('process.benefits.transparency.title')}</h4>
              <p className="text-gray-600">{t('process.benefits.transparency.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('process.benefits.agility.title')}</h4>
              <p className="text-gray-600">{t('process.benefits.agility.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('process.benefits.results.title')}</h4>
              <p className="text-gray-600">{t('process.benefits.results.description')}</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t('process.ready_title')}
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            {t('process.ready_description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToContact}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('process.consultation')}
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-semibold border border-gray-200 transition-colors">
              {t('process.see_pricing')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}