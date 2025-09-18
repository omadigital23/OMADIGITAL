import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, User, Clock, Tag, ArrowLeft, Share2, Bookmark, Eye, ArrowRight, MessageCircle } from 'lucide-react';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { BlogSEO } from '../../src/components/BlogSEO';
import { OptimizedImage } from '../../src/components/OptimizedImage';
import { trackEvent } from '../../src/utils/supabase/info';
import { SmartChatbotNext } from '../../src/components/SmartChatbotNext';
import { useTranslation } from 'react-i18next';

// Mock data - in a real app this would come from an API or CMS
const mockArticles = [
  {
    id: 'doubler-ca-ia-3-mois',
    title: "Comment l'IA peut Doubler votre CA en 3 Mois",
    excerpt: "Découvrez les 5 stratégies éprouvées qui ont permis à 200+ PME sénégalaises et marocaines de doubler leur chiffre d'affaires.",
    content: `<p><strong>Imaginez doubler votre chiffre d'affaires en seulement 3 mois.</strong> C'est exactement ce qu'ont réalisé Amadou Diop (boulangerie à Dakar), Fatima El Mansouri (boutique à Casablanca) et 200+ autres entrepreneurs grâce à l'Intelligence Artificielle.</p>

    <div class="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
      <h3 class="text-lg font-bold text-green-800 mb-2">🎯 Résultats Garantis</h3>
      <p class="text-green-700">
        En appliquant ces 5 stratégies, nos clients obtiennent en moyenne <strong>+247% de CA en 90 jours</strong>. 
        Si vous n'obtenez pas de résultats, nous vous remboursons 200%.
      </p>
    </div>

    <h2><span class="bg-orange-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-lg mr-4">1</span>Automatisation WhatsApp : Votre Vendeur 24/7</h2>

    <p><strong>Le problème :</strong> Vous perdez 70% de vos prospects parce que vous ne répondez pas assez vite sur WhatsApp.</p>

    <p><strong>La solution IA :</strong> Un chatbot intelligent qui répond instantanément, qualifie vos prospects et prend les commandes même quand vous dormez.</p>

    <div class="bg-blue-50 p-6 rounded-lg mb-8">
      <h4 class="font-bold text-blue-800 mb-3">📊 Cas Concret : Amadou Diop - Boulangerie Liberté (Dakar)</h4>
      <ul class="text-blue-700 space-y-2">
        <li>• <strong>Avant :</strong> 50 commandes/jour, réponse en 2h moyenne</li>
        <li>• <strong>Après :</strong> 180 commandes/jour, réponse instantanée</li>
        <li>• <strong>Résultat :</strong> +260% de CA en 2 mois</li>
      </ul>
    </div>

    <h2><span class="bg-orange-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-lg mr-4">2</span>Site Ultra-Rapide : Convertir Chaque Visiteur</h2>

    <p><strong>Fait choquant :</strong> 53% des visiteurs quittent un site qui met plus de 3 secondes à charger. Au Sénégal et au Maroc, avec les connexions parfois lentes, c'est encore pire.</p>

    <p><strong>Notre solution :</strong> Sites optimisés IA qui chargent en moins de 1.5 seconde et convertissent 3x mieux.</p>

    <h2><span class="bg-orange-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-lg mr-4">3</span>IA Prédictive : Anticiper les Besoins Clients</h2>

    <p>L'IA analyse le comportement de vos clients et prédit leurs prochains achats. Résultat : vous proposez le bon produit au bon moment.</p>

    <h2><span class="bg-orange-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-lg mr-4">4</span>Marketing Automation : Fidéliser Sans Effort</h2>

    <p>L'IA envoie automatiquement les bons messages aux bons clients au bon moment. Fini les campagnes marketing qui tombent à plat.</p>

    <h2><span class="bg-orange-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-lg mr-4">5</span>Analytics IA : Décisions Basées sur la Data</h2>

    <p>Plus de décisions au feeling. L'IA vous dit exactement quoi faire pour maximiser vos profits.</p>`,
    author: "OMA Digital",
    date: "2025-01-25",
    category: "Automatisation",
    readTime: "5 min",
    image: "/images/auto_all.webp",
    tags: ["WhatsApp", "Automatisation", "PME", "Sénégal", "Ventes"],
    views: 1247,
    estimatedROI: "300%",
    relatedArticles: ['whatsapp-business-guide-2024', 'sites-ultra-rapides-performance']
  },
  {
    id: 'whatsapp-business-guide-2024',
    title: "WhatsApp Business : Guide Complet 2024",
    excerpt: "Tout ce que vous devez savoir pour automatiser vos conversations WhatsApp et booster vos ventes.",
    content: `<p>Dans le paysage numérique actuel, la vitesse d'un site web peut faire la différence entre le succès et l'échec d'une entreprise. Pour les PME dakaroises, où la concurrence est féroce et l'attention des clients fragmentée, un site web ultra-rapide n'est plus un luxe, mais une nécessité absolue.</p>

    <h2>Pourquoi la Vitesse est Cruciale</h2>
    <p>La patience des internautes est de plus en plus limitée. Des études montrent que 53% des visites mobiles sont abandonnées si le chargement d'une page prend plus de 3 secondes. Au Sénégal, où la connectivité peut varier considérablement, cette problématique est encore plus critique pour les utilisateurs dakarois.</p>
    
    <p>Un site web rapide améliore non seulement l'expérience utilisateur, mais aussi les performances commerciales :</p>
    <ul>
      <li><strong>Taux de conversion</strong> : Une réduction de 100ms dans le temps de chargement peut augmenter les conversions de 1%</li>
      <li><strong>SEO</strong> : Google utilise la vitesse comme facteur de ranking depuis 2010</li>
      <li><strong>Coût d'acquisition</strong> : Un site rapide réduit les coûts de publicité en améliorant le Quality Score</li>
    </ul>
    
    <h2>Optimisation des Performances Techniques</h2>
    <h3>Compression et Minification</h3>
    <p>La première étape vers un site ultra-rapide consiste à réduire la taille des fichiers :</p>
    <ul>
      <li>Minification du CSS, JavaScript et HTML</li>
      <li>Compression Gzip ou Brotli pour tous les assets textuels</li>
      <li>Optimisation des images avec des formats modernes (WebP, AVIF)</li>
    </ul>
    
    <h3>Mise en Cache Stratégique</h3>
    <p>Une stratégie de mise en cache efficace peut réduire les temps de chargement de 70% :</p>
    <ul>
      <li>Cache navigateur pour les assets statiques</li>
      <li>Cache serveur pour le contenu dynamique</li>
      <li>CDN (Content Delivery Network) pour distribuer le contenu géographiquement</li>
    </ul>
    
    <h3>Optimisation des Ressources Critiques</h3>
    <p>Le chargement progressif des ressources permet d'afficher le contenu principal rapidement :</p>
    <ul>
      <li>Chargement différé (lazy loading) pour les images non visibles</li>
      <li>Préchargement des ressources critiques</li>
      <li>Élimination du JavaScript non utilisé</li>
    </ul>`,
    author: "OMA Digital", 
    date: "2025-01-22",
    category: "Sites Web",
    readTime: "7 min",
    image: "/images/wbapp.webp",
    tags: ["Performance", "SEO", "Site Web", "Dakar", "Conversion"],
    views: 892,
    estimatedROI: "200%",
    relatedArticles: ['doubler-ca-ia-3-mois', 'marketing-digital-pme-senegal']
  },
  {
    id: 'sites-ultra-rapides-performance',
    title: "Sites Ultra-Rapides : Performance Garantie",
    excerpt: "Les secrets pour créer un site qui charge en moins de 1.5 secondes et convertit 3x mieux.",
    content: `<p>Dans le paysage numérique actuel, la vitesse d'un site web peut faire la différence entre le succès et l'échec d'une entreprise.</p>`,
    author: "OMA Digital",
    date: "2025-01-10",
    category: "Développement Web",
    readTime: "5 min",
    image: "/images/wbapp.webp",
    tags: ["Performance", "SEO", "Site Web", "Conversion"],
    views: 650,
    estimatedROI: "300%",
    relatedArticles: ['doubler-ca-ia-3-mois', 'whatsapp-business-guide-2024']
  },
  {
    id: 'marketing-digital-pme-senegal',
    title: "Marketing Digital pour PME au Sénégal",
    excerpt: "Stratégies locales pour développer votre présence digitale et attirer plus de clients sénégalais.",
    content: `<p>Le marketing digital au Sénégal présente des opportunités uniques pour les PME locales.</p>`,
    author: "OMA Digital",
    date: "2025-01-08",
    category: "Marketing Digital",
    readTime: "7 min",
    image: "/images/auto_all.webp",
    tags: ["Marketing", "PME", "Sénégal", "Digital"],
    views: 420,
    estimatedROI: "250%",
    relatedArticles: ['doubler-ca-ia-3-mois', 'whatsapp-business-guide-2024']
  }
];

export default function BlogArticlePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (id) {
      const articleId = id as string;
      const foundArticle = mockArticles.find(article => article.id === articleId);
      setArticle(foundArticle);
      
      // Track page view
      if (foundArticle && typeof window !== 'undefined') {
        trackEvent('blog_article_view', {
          article_id: articleId,
          article_title: foundArticle.title,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [id]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: `https://oma-digital.sn/blog/${article.id}`
        });
        trackEvent('blog_article_share', { 
          method: 'native', 
          article_id: article.id,
          article_title: article.title,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.log('Sharing failed', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(`https://oma-digital.sn/blog/${article.id}`);
        alert('Lien copié dans le presse-papiers !');
        trackEvent('blog_article_share', { 
          method: 'clipboard', 
          article_id: article.id,
          article_title: article.title,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  // Function to handle WhatsApp share
  const handleWhatsAppShare = () => {
    if (typeof window !== 'undefined') {
      const message = `Je viens de lire un article intéressant : ${article.title} - ${window.location.href}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      trackEvent('blog_article_share', { 
        method: 'whatsapp', 
        article_id: article.id,
        article_title: article.title,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to handle social shares
  const handleSocialShare = (platform: string) => {
    if (typeof window === 'undefined') return;
    
    const url = `https://oma-digital.sn/blog/${article.id}`;
    const title = article.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }
    
    trackEvent('blog_article_share', { 
      method: platform, 
      article_id: article.id,
      article_title: article.title,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  };

  // Function to handle CTA clicks in article content
  const handleCtaClick = (ctaType: string) => {
    trackEvent('blog_article_cta_click', {
      cta_type: ctaType,
      article_id: article.id,
      article_title: article.title,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Navigate to contact section
    router.push('/#contact');
  };

  const relatedArticles = mockArticles.filter(a => 
    article.relatedArticles.includes(a.id) && a.id !== article.id
  );

  return (
    <>
      <BlogSEO
        title={article.title}
        description={article.excerpt}
        image={`https://oma-digital.sn${article.image}`}
        url={`https://oma-digital.sn/blog/${article.id}`}
        publishedTime={article.date}
        tags={article.tags}
        category={article.category}
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Main content area */}
        <main className="pt-16 md:pt-20">
          {/* Back to blog button */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <button 
              onClick={() => router.push('/blog')}
              className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors text-sm md:text-base"
              data-cta-type="back_to_blog"
              data-cta-location="article_header"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Retour au blog
            </button>
          </div>
          
          {/* Article header */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span className="inline-block bg-orange-500 text-white text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-md">
                  {article.category}
                </span>
                <span className="inline-block bg-green-100 text-green-800 text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                  {article.readTime} de lecture
                </span>
                <span className="inline-block bg-purple-100 text-purple-800 text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                  ROI estimé: {article.estimatedROI || "200%"}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-orange-500" />
                  <span className="font-medium">{article.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-orange-500" />
                  <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-orange-500" />
                  <span>{article.views?.toLocaleString() || 0} vues</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-6 md:mb-8">
                {article.tags?.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="bg-gray-100 text-gray-700 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors cursor-pointer"
                    data-cta-type="tag_filter"
                    data-cta-location="article_header"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Article image */}
            <div className="aspect-[16/9] mb-8 md:mb-12 rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl">
              <OptimizedImage
                src={article.image}
                alt={article.title}
                width={1200}
                height={675}
                objectFit="cover"
                className="w-full h-full"
                quality={80}
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1200px"
              />
            </div>
          </div>
          
          {/* Article content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="flex gap-2 md:gap-3">
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2.5 md:p-3 rounded-full ${isBookmarked ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'} hover:bg-orange-100 hover:text-orange-600 transition-colors shadow-md`}
                  aria-label={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
                  data-cta-type="bookmark"
                  data-cta-location="article_content"
                >
                  <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              {/* Social sharing */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-gray-600 text-xs md:text-sm font-medium">Partager:</span>
                <button 
                  onClick={() => handleSocialShare('facebook')}
                  className="p-2 md:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                  aria-label="Partager sur Facebook"
                  data-cta-type="share_facebook"
                  data-cta-location="article_content"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => handleSocialShare('twitter')}
                  className="p-2 md:p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-md"
                  aria-label="Partager sur Twitter"
                  data-cta-type="share_twitter"
                  data-cta-location="article_content"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </button>
                <button 
                  onClick={() => handleSocialShare('linkedin')}
                  className="p-2 md:p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors shadow-md"
                  aria-label="Partager sur LinkedIn"
                  data-cta-type="share_linkedin"
                  data-cta-location="article_content"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                <button 
                  onClick={handleWhatsAppShare}
                  className="p-2 md:p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                  aria-label="Partager sur WhatsApp"
                  data-cta-type="share_whatsapp"
                  data-cta-location="article_content"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 md:p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors shadow-md"
                  aria-label="Partager"
                  data-cta-type="share"
                  data-cta-location="article_content"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
            
            {/* Article body with integrated CTAs */}
            <div 
              className="prose prose-orange max-w-none mb-8 md:mb-12 prose-headings:font-bold prose-h2:text-xl md:prose-h2:text-2xl prose-h3:text-lg md:prose-h3:text-xl prose-p:text-gray-700 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-blockquote:border-l-orange-500 prose-li:marker:text-orange-500"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {/* Integrated CTA after article content */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 md:p-8 mb-8 md:mb-12">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Prêt à transformer votre entreprise avec l'IA ?</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Découvrez comment nos solutions d'automatisation peuvent booster votre CA de 200% en seulement 6 mois. 
                  Découvrez votre potentiel de transformation !
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <button
                    onClick={() => handleCtaClick('article_end_demo')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    data-cta-type="article_end_demo"
                    data-cta-location="article_end"
                  >
                    <span>Découvrir Mon Potentiel</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={() => handleCtaClick('article_end_whatsapp')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    data-cta-type="article_end_whatsapp"
                    data-cta-location="article_end"
                  >
                    <span>Contacter par WhatsApp</span>
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Related articles */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Articles connexes</h3>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <div 
                    key={relatedArticle.id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="aspect-[16/9] relative">
                      <OptimizedImage
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        width={600}
                        height={338}
                        objectFit="cover"
                        className="w-full h-full"
                        quality={75}
                      />
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        {relatedArticle.category}
                      </div>
                    </div>
                    <div className="p-4 md:p-6">
                      <h4 className="font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2 text-base md:text-lg">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs md:text-sm text-gray-500 flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{relatedArticle.readTime}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{relatedArticle.views?.toLocaleString() || 0}</span>
                          </span>
                        </div>
                        <Link
                          href={`/blog/${relatedArticle.id}${i18n.language !== 'fr' ? `?lng=${i18n.language}` : ''}`}
                          onClick={() => trackEvent('blog_related_article_click', {
                            article_id: relatedArticle.id,
                            article_title: relatedArticle.title,
                            related_to: article.id,
                            url: window.location.href,
                            timestamp: new Date().toISOString()
                          })}
                          className="text-orange-600 hover:text-orange-700 font-medium text-sm md:text-base flex items-center"
                          data-cta-type="related_article"
                          data-cta-location="article_end"
                        >
                          {t('blog.read_article')}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
        <SmartChatbotNext />
      </div>
    </>
  );
}

