import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, Building, TrendingUp } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export function TestimonialsSection() {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: t('testimonials.aminata.name'),
      position: t('testimonials.aminata.position'),
      company: t('testimonials.aminata.company'),
      location: t('testimonials.aminata.location'),
      industry: "Alimentation",
      testimonial: t('testimonials.aminata.text'),
      rating: 5,
      avatar: "AD",
      results: t('testimonials.aminata.result')
    },
    {
      name: t('testimonials.cheikh.name'),
      position: t('testimonials.cheikh.position'),
      company: t('testimonials.cheikh.company'),
      location: t('testimonials.cheikh.location'),
      industry: "IT Services",
      testimonial: t('testimonials.cheikh.text'),
      rating: 5,
      avatar: "CM",
      results: t('testimonials.cheikh.result')
    },
    {
      name: t('testimonials.fatou.name'),
      position: t('testimonials.fatou.position'),
      company: t('testimonials.fatou.company'),
      location: t('testimonials.fatou.location'),
      industry: "Mode & Textile",
      testimonial: t('testimonials.fatou.text'),
      rating: 5,
      avatar: "FS",
      results: t('testimonials.fatou.result')
    },
    {
      name: t('testimonials.moussa.name'),
      position: t('testimonials.moussa.position'),
      company: t('testimonials.moussa.company'),
      location: t('testimonials.moussa.location'),
      industry: "Immobilier",
      testimonial: t('testimonials.moussa.text'),
      rating: 5,
      avatar: "MF",
      results: t('testimonials.moussa.result')
    },
    {
      name: t('testimonials.aissatou.name'),
      position: t('testimonials.aissatou.position'),
      company: t('testimonials.aissatou.company'),
      location: t('testimonials.aissatou.location'),
      industry: "Santé",
      testimonial: t('testimonials.aissatou.text'),
      rating: 5,
      avatar: "AN",
      results: t('testimonials.aissatou.result')
    },
    {
      name: t('testimonials.ibrahima.name'),
      position: t('testimonials.ibrahima.position'),
      company: t('testimonials.ibrahima.company'),
      location: t('testimonials.ibrahima.location'),
      industry: "Transport",
      testimonial: t('testimonials.ibrahima.text'),
      rating: 5,
      avatar: "IS",
      results: t('testimonials.ibrahima.result')
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

  if (!current) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.description')}
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-6 hidden md:block">
              <button 
                onClick={prevTestimonial}
                className="w-12 h-12 bg-white hover:bg-orange-50 rounded-full shadow-lg flex items-center justify-center transition-colors group"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-orange-600" />
              </button>
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 -right-6 hidden md:block">
              <button 
                onClick={nextTestimonial}
                className="w-12 h-12 bg-white hover:bg-orange-50 rounded-full shadow-lg flex items-center justify-center transition-colors group"
              >
                <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-orange-600" />
              </button>
            </div>

            {/* Content */}
            <div className="pt-6">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-6 h-6 ${
                      star <= current.rating 
                        ? 'text-orange-500 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-gray-900 text-center leading-relaxed mb-8 italic">
                "{current.testimonial}"
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                {/* Avatar & Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{current.avatar}</span>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="font-bold text-gray-900 text-lg">{current.name}</div>
                    <div className="text-gray-600">{current.position}</div>
                  </div>
                </div>

                {/* Company & Location */}
                <div className="text-center md:text-left space-y-1">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{current.company}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{current.location}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{current.industry}</span>
                  </div>
                </div>

                {/* Results Badge */}
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold">{current.results}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentTestimonial 
                  ? 'bg-orange-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center space-x-4 mt-8 md:hidden">
          <button 
            onClick={prevTestimonial}
            className="w-12 h-12 bg-white hover:bg-orange-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button 
            onClick={nextTestimonial}
            className="w-12 h-12 bg-white hover:bg-orange-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Stats Grid - Improved for better visibility */}
        <div className="grid md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
            <div className="text-gray-700">{t('testimonials.average_rating')}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
            <div className="text-gray-700">{t('testimonials.satisfied_clients')}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
            <div className="text-gray-700">{t('testimonials.recommendations')}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-700">{t('testimonials.support')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}