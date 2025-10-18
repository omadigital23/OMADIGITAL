import { GetStaticProps } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Static imports for critical components
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { ImprovedLandingStructure } from '../src/components/ImprovedLandingStructure';
import { SmartChatbotNext } from '../src/components/SmartChatbotNext';
import { StickyWhatsAppButton } from '../src/components/StickyWhatsAppButton';
import { SEOHead } from '../src/components/SEOHead';
import { initGA, trackPageView } from '../src/lib/analytics';
import { faqSchema, breadcrumbSchema, serviceSchema } from '../src/lib/seo-faq-schema';

// Critical CSS for above-the-fold content
const criticalCSS = `
  .hero-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  .header-backdrop {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .animate-fade-in {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

interface HomeProps {
  seoData: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    canonicalUrl: string;
  };
  performanceData: {
    buildTime: string;
    version: string;
  };
}

export default function Home({ seoData, performanceData }: HomeProps) {
  const router = useRouter();
  const locale = router.locale || 'fr';

  // Initialize Google Analytics 4
  useEffect(() => {
    initGA();
    trackPageView(window.location.href, seoData.title);
  }, [seoData.title]);

  return (
    <>
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords.join(', ')}
        image={seoData.ogImage}
        canonical={seoData.canonicalUrl}
      />
      
      {/* Enhanced SEO - FAQ, Breadcrumb, and Service Schemas for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      
      {/* Critical CSS - Inline for LCP optimization */}
      <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />

      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
      >
        {locale === 'en' ? 'Skip to main content' : 'Aller au contenu principal'}
      </a>

      <div className="min-h-screen bg-white">
        {/* Header with optimized loading */}
        <Header />
        
        {/* Main content with performance optimizations */}
        <main id="main-content" className="pt-16 md:pt-20" role="main" aria-label={locale === 'en' ? 'Main content' : 'Contenu principal'}>
          <ImprovedLandingStructure />
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Chatbot - Loaded only on client side */}
        <SmartChatbotNext />
        
        {/* Bouton WhatsApp Sticky Mobile */}
        <StickyWhatsAppButton />
      </div>
    </>
  );
}

// Static Site Generation for maximum performance
export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale }) => {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  // Pre-generate SEO data at build time based on locale
  const seoData = locale === 'en' ? {
    title: "OMA Digital - AI Solutions & Automation in Senegal and Morocco | WhatsApp Business, Ultra-Fast Websites",
    description: "Transform your business with our AI solutions in Senegal and Morocco. WhatsApp Business automation, ultra-fast websites, intelligent chatbots. Free quote 24h.",
    keywords: [
      "WhatsApp automation Senegal",
      "fast websites Morocco", 
      "AI business Dakar",
      "WhatsApp chatbot Casablanca",
      "digital transformation Africa",
      "AI solutions SME",
      "web development Senegal Morocco",
      "digital marketing West Africa",
      "business automation Senegal",
      "OMA Digital"
    ],
    ogImage: "https://www.omadigital.net/images/og-homepage.jpg",
    canonicalUrl: "https://www.omadigital.net/en"
  } : {
    title: "OMA Digital - Solutions IA et Automatisation au Sénégal et Maroc | WhatsApp Business, Sites Web Ultra-Rapides",
    description: "Transformez votre entreprise avec nos solutions IA au Sénégal et Maroc. Automatisation WhatsApp Business, sites web ultra-rapides, chatbots intelligents. Devis gratuit 24h.",
    keywords: [
      "chatbot vocal intelligent Sénégal",
      "chatbot vocal Maroc",
      "automatisation WhatsApp Business API Dakar",
      "WhatsApp Business automatique Casablanca",
      "IA conversationnelle multilingue",
      "assistant virtuel français arabe wolof",
      "Vertex AI chatbot Sénégal",
      "chatbot reconnaissance vocale Dakar",
      "speech to text Sénégal",
      "text to speech Maroc",
      "automatisation service client WhatsApp",
      "chatbot PME Afrique",
      "intelligence artificielle Thiès",
      "IA entreprise Casablanca",
      "développement web Next.js Sénégal",
      "sites web ultra-rapides Maroc",
      "agence digitale IA Dakar",
      "transformation digitale PME africaine",
      "solutions IA abordables Sénégal",
      "OMA Digital"
    ],
    ogImage: "https://www.omadigital.net/images/og-homepage.jpg",
    canonicalUrl: "https://www.omadigital.net"
  };

  const performanceData = {
    buildTime: new Date().toISOString(),
    version: (process.env['npm_package_version'] as string) || "2.0.0"
  };

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common'])),
      seoData,
      performanceData
    },
    // ISR - Regenerate page every hour for fresh content
    revalidate: 3600
  };
};