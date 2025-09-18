import Head from 'next/head';
import { Header } from '../src/components/Header';
import { ImprovedLandingStructure } from '../src/components/ImprovedLandingStructure';
import { Footer } from '../src/components/Footer';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>OMA Digital - Automatisation WhatsApp & Solutions Digitales pour PME Sénégalaises</title>
        <meta name="description" content="Transformez votre business avec nos solutions d'automatisation WhatsApp, sites web ultra-rapides et marketing digital. ROI garanti 200% en 6 mois pour PME sénégalaises." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="automatisation WhatsApp, IA pour PME, transformation digitale Sénégal, transformation digitale Maroc" />
        <meta name="author" content="OMA Digital" />
        <meta name="robots" content="index, follow" />
        {/* Security: Add referrer policy for additional protection */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        {/* Security: Prevent MIME type sniffing */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        {/* Security: XSS Protection */}
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <link rel="icon" href="/favicon.ico" />
        {/* Security: DNS prefetch control */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Enhanced SEO */}
        <meta property="og:title" content="OMA Digital - Transformation Digitale PME Sénégal & Maroc" />
        <meta property="og:description" content="Solutions d'automatisation WhatsApp, sites web ultra-rapides et IA pour PME. ROI garanti 200% en 6 mois." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://omadigital.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://omadigital.com" />
      </Head>

      <Header />
      
      {/* Improved Landing Structure with Enhanced UX */}
      <div className="pt-16 md:pt-20">
        <ImprovedLandingStructure />
      </div>
      
      <Footer />
      
      {/* Smart Chatbot */}
      <SmartChatbotNext />
    </div>
  );
}