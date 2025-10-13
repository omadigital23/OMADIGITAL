import React, { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load des composants non-critiques
const EnhancedOffersSection = lazy(() => import('./EnhancedOffersSection'));
const ServicesSection = lazy(() => import('./ServicesSection'));
const CaseStudiesSection = lazy(() => import('./CaseStudiesSection'));
const ProcessTimeline = lazy(() => import('./ProcessTimeline'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));

// Dynamic import avec SSR désactivé pour les composants lourds
const SmartChatbotNext = dynamic(() => import('./SmartChatbot'), {
  ssr: false,
  loading: () => <div className="fixed bottom-4 right-4 w-12 h-12 bg-orange-500 rounded-full animate-pulse" />
});

const EnhancedWelcomePopup = dynamic(() => import('./EnhancedWelcomePopup'), {
  ssr: false
});

// Composant de loading optimisé
const SectionSkeleton = () => (
  <div className="py-20 animate-pulse">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export function OptimizedLandingStructure() {
  return (
    <main className="relative">
      {/* Contenu critique - chargement immédiat */}
      <HeroSection />
      <TrustSection />
      
      {/* Contenu non-critique - lazy loading */}
      <Suspense fallback={<SectionSkeleton />}>
        <EnhancedOffersSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ServicesSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <CaseStudiesSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ProcessTimeline />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>
      
      <CTASection />
      
      {/* Composants interactifs - chargement différé */}
      <SmartChatbotNext />
      <EnhancedWelcomePopup />
    </main>
  );
}