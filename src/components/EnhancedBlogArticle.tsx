import React, { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { 
  Calendar, User, Clock, Tag, ArrowLeft, Share2, Bookmark, 
  Eye, Heart, MessageCircle, ChevronUp, Copy, Twitter, 
  Facebook, Linkedin, Mail, ThumbsUp, ThumbsDown, Star,
  VolumeX, Volume2, Menu, XIcon, TrendingUp
} from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface BlogArticleProps {
  article: any;
  onBack: () => void;
}

export function EnhancedBlogArticle({ article, onBack }: BlogArticleProps) {
  const [isClient, setIsClient] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [currentSection, setCurrentSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Extract table of contents from article content
  const [tableOfContents, setTableOfContents] = useState<Array<{id: string, title: string, level: number}>>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Extract headings for table of contents
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const toc = Array.from(headings).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      return {
        id,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });
    
    setTableOfContents(toc);
    
    // Calculate estimated read time
    const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    setEstimatedReadTime(Math.ceil(wordCount / 200)); // 200 words per minute
  }, [article.content, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setReadingProgress(Math.min(progress, 100));
      setIsScrolled(scrollTop > 100);
      setShowBackToTop(scrollTop > 500);

      // Update current section
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let current = '';
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });
      
      setCurrentSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  const handleShare = (platform?: string) => {
    if (typeof window === 'undefined') return;
    
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
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers !');
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: article.title, text: article.excerpt, url: window.location.href });
        }
    }
    setShowShareMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (typeof document === 'undefined') return;
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowTableOfContents(false);
  };

  const toggleTextToSpeech = () => {
    if (typeof window === 'undefined' || typeof speechSynthesis === 'undefined') return;
    
    if (isListening) {
      speechSynthesis.cancel();
      setIsListening(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.content.replace(/<[^>]*>/g, ''));
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      setIsListening(true);
      
      utterance.onend = () => setIsListening(false);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      default: return 'text-base';
    }
  };

  // Don't render interactive elements on server to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <main className="pt-16 md:pt-20">
          {/* Back Button */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center font-medium text-orange-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au blog
            </div>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              {/* Category and Badges */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {article.category}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {article.difficulty}
                </span>
                {article.trending && (
                  <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Tendance
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
                {article.title}
              </h1>

              <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-gray-600">
                {article.excerpt}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {article.author.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {article.author.role}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.ceil(estimatedReadTime)} min de lecture</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views.toLocaleString()} vues</span>
                  </span>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{article.likes}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{article.comments}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
                  <Share2 className="w-4 h-4" />
                  <span>{article.shares}</span>
                </div>
                
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                  ROI: {article.estimatedROI}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 shadow-xl bg-gray-200">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Image de l'article</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-88 mb-16">
            <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-ul:list-disc prose-ol:list-decimal">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
            </article>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Action Bar */}
      <div className={`fixed top-20 right-4 z-40 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className={`flex flex-col gap-2 p-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={() => setShowTableOfContents(!showTableOfContents)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Table des matières"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Partager"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-orange-500' 
                : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title="Sauvegarder"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={toggleTextToSpeech}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'text-blue-500' 
                : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title="Écouter l'article"
          >
            {isListening ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Mode sombre"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Table of Contents Sidebar */}
      {showTableOfContents && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Table des matières</h3>
              <button
                onClick={() => setShowTableOfContents(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentSection === item.id
                      ? 'bg-orange-100 text-orange-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{ marginLeft: `${(item.level - 1) * 16}px` }}
                >
                  {item.title}
                </button>
              ))}
            </div>
            
            {/* Reading Controls */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Paramètres de lecture</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Taille du texte</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="small">Petit</option>
                    <option value="normal">Normal</option>
                    <option value="large">Grand</option>
                    <option value="xlarge">Très grand</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Temps de lecture estimé</span>
                  <span className="text-xs font-medium">{estimatedReadTime} min</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Progression</span>
                  <span className="text-xs font-medium">{Math.round(readingProgress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Menu */}
      {showShareMenu && (
        <div className="fixed top-32 right-20 bg-white rounded-lg shadow-xl z-50 p-4 min-w-48">
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
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Copier le lien</span>
            </button>
          </div>
        </div>
      )}

      <main className="pt-16 md:pt-20">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={onBack}
            className={`flex items-center font-medium transition-colors ${
              isDarkMode 
                ? 'text-orange-400 hover:text-orange-300' 
                : 'text-orange-600 hover:text-orange-700'
            }`}
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
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {article.difficulty}
              </span>
              {article.trending && (
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Tendance
                </span>
              )}
            </div>

            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {article.title}
            </h1>

            <p className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <OptimizedImage
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="text-left">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {article.author.name}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {article.author.role}
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center space-x-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{estimatedReadTime} min de lecture</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views.toLocaleString()} vues</span>
                </span>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex justify-center items-center space-x-6 mb-8">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'bg-red-50 text-red-600' 
                    : isDarkMode 
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{article.likes + (isLiked ? 1 : 0)}</span>
              </button>
              
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                <MessageCircle className="w-4 h-4" />
                <span>{article.comments}</span>
              </div>
              
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                <Share2 className="w-4 h-4" />
                <span>{article.shares}</span>
              </div>
              
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                ROI: {article.estimatedROI}
              </div>
            </div>
          </div>

          {/* Featured Image */}
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

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-88 mb-16">
          <article className={`prose prose-lg max-w-none transition-all ${getFontSizeClass()} ${
            isDarkMode 
              ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-orange-400 hover:prose-a:text-orange-300' 
              : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-orange-600 hover:prose-a:text-orange-700'
          } prose-ul:list-disc prose-ol:list-decimal`}>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
          </article>
        </div>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-300 z-40 ${
            isDarkMode 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          title="Retour en haut"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}