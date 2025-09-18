import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, ArrowLeft, Share2, Eye, Heart, MessageCircle, 
  ChevronUp, Twitter, Facebook, Linkedin, Mail, Phone, ArrowRight,
  BookOpen, TrendingUp, User
} from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from './OptimizedImage';
import { NewsletterSignup } from './NewsletterSignup';
import SEOHelmet from './SEOHelmet';

interface BlogArticleProps {
  article: any;
  onBack: () => void;
  relatedArticles?: any[];
}

export function OptimalBlogArticle({ article, onBack, relatedArticles = [] }: BlogArticleProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setReadingProgress(Math.min(progress, 100));
      setShowBackToTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);
    const text = encodeURIComponent(article.excerpt);

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${title}&body=${text}%20${url}`, '_blank');
        break;
    }
    setShowShareMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate JSON-LD schema for the article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt,
    "image": `https://oma-digital.sn${article.image}`,
    "author": {
      "@type": "Organization",
      "name": "OMA Digital",
      "url": "https://oma-digital.sn"
    },
    "publisher": {
      "@type": "Organization",
      "name": "OMA Digital",
      "logo": {
        "@type": "ImageObject",
        "url": "https://oma-digital.sn/images/logo.webp"
      }
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://oma-digital.sn/blog/${article.id}`
    },
    "keywords": article.seoKeywords || article.tags.join(', '),
    "articleSection": article.category,
    "wordCount": article.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  };

  return (
    <>
      <SEOHelmet 
        title={`${article.title} | OMA Digital Blog`}
        description={article.excerpt}
        keywords={article.seoKeywords || article.tags.join(', ')}
        url={`https://oma-digital.sn/blog/${article.id}`}
        image={`https://oma-digital.sn${article.image}`}
        type="article"
        blogPostSchema={articleSchema}
      />
      
      <div className="min-h-screen bg-white">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <main className="pt-16 md:pt-20">
          {/* Back Button */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button 
              onClick={onBack}
              className="flex items-center font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au blog
            </button>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              {/* Category and Badges */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {article.category}
                </span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  {article.difficulty}
                </span>
                {article.trending && (
                  <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Tendance
                  </span>
                )}
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                  ROI: {article.estimatedROI}
                </span>
              </div>

              {/* Titre H1 SEO riche en mots-clés */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
                {article.title}
              </h1>

              <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-gray-600">
                {article.excerpt}
              </p>

              {/* Date + Auteur = OMA Digital */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <OptimizedImage
                    src={article.author.avatar}
                    alt="OMA Digital"
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-orange-300"
                  />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Auteur : OMA Digital
                    </div>
                    <div className="text-sm text-gray-500">
                      {article.author.role}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                  </span>
                  <span className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </span>
                  <span className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                    <Eye className="w-4 h-4" />
                    <span>{article.views.toLocaleString()} vues</span>
                  </span>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex justify-center items-center space-x-4 mb-8">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{article.likes + (isLiked ? 1 : 0)}</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl z-50 p-4 min-w-48">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Facebook className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-blue-700" />
                          <span className="text-sm">LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare('email')}
                          className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">Email</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image principale illustrative */}
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 shadow-xl">
              <OptimizedImage
                src={article.image}
                alt={article.title}
                width={800}
                height={450}
                objectFit="cover"
                className="w-full h-full"
                quality={90}
                priority
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Article Content */}
              <div className="lg:col-span-3">
                <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-ul:list-disc prose-ol:list-decimal prose-h2:text-2xl prose-h3:text-xl">
                  {/* Contenu bien structuré avec H2/H3 */}
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  
                  {/* CTA intégrés au milieu du contenu */}
                  <div className="not-prose my-12 p-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Vous voulez implémenter cette solution dans votre PME ?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Réservez une démo gratuite et découvrez comment nous pouvons vous aider à automatiser votre business.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                          href="/#contact" 
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>Réservez une démo</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a 
                          href="https://wa.me/221701193811" 
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* Sidebar marketing */}
              <div className="lg:col-span-1 space-y-8">
                {/* Articles recommandés */}
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
                    Articles Recommandés
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.slice(0, 3).map(relatedArticle => (
                      <Link 
                        key={relatedArticle.id} 
                        href={`/blog/${relatedArticle.id}`}
                        className="block group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                            <OptimizedImage
                              src={relatedArticle.image}
                              alt={relatedArticle.title}
                              width={64}
                              height={64}
                              objectFit="cover"
                              className="w-full h-full"
                              quality={70}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 text-sm">
                              {relatedArticle.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{relatedArticle.readTime}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA WhatsApp & Devis rapide */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Besoin d'aide ?</h3>
                  <div className="space-y-3">
                    <a 
                      href="https://wa.me/221701193811" 
                      className="flex items-center space-x-3 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <div>
                        <div className="font-medium">WhatsApp Direct</div>
                        <div className="text-sm opacity-90">Réponse immédiate</div>
                      </div>
                    </a>
                    
                    <Link 
                      href="/#contact" 
                      className="flex items-center space-x-3 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Devis Rapide</div>
                        <div className="text-sm opacity-90">Gratuit & personnalisé</div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Formulaire Newsletter */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Newsletter IA</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Recevez nos derniers insights sur l'IA et l'automatisation
                  </p>
                  <NewsletterSignup />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <section className="py-16 mt-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prêt à automatiser votre PME au Sénégal ou au Maroc ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Contactez-nous dès aujourd'hui pour découvrir comment cette solution peut transformer votre business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/221701193811" 
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
                
                <Link 
                  href="/#contact" 
                  className="bg-white hover:bg-gray-100 text-orange-600 px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Consultation gratuite</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 z-40"
            title="Retour en haut"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  );
}