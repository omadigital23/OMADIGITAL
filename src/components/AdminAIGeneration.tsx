import React, { useState } from 'react';
import { 
  Zap, 
  FileText, 
  Image, 
  Eye, 
  Calendar, 
  Tag, 
  Globe, 
  Save,
  ExternalLink,
  Monitor,
  Smartphone
} from 'lucide-react';

interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'review';
  createdAt: string;
  tags: string[];
  slug: string;
  seoDescription: string;
  suggestedImages: string[];
  ctas: { text: string; link: string }[];
}

export function AdminAIGeneration() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<GeneratedArticle[]>([
    {
      id: '1',
      title: 'Transformer votre entreprise avec l\'IA conversationnelle',
      content: '# Introduction\n\nL\'intelligence artificielle conversationnelle révolutionne la manière dont les entreprises interagissent avec leurs clients...',
      status: 'published',
      createdAt: '2025-01-20T10:30:00',
      tags: ['IA', 'Chatbot', 'Transformation digitale'],
      slug: 'transformer-entreprise-ia-conversationnelle',
      seoDescription: 'Découvrez comment l\'IA conversationnelle peut transformer votre entreprise et améliorer votre service client.',
      suggestedImages: ['/images/ai-chatbot.webp', '/images/digital-transformation.webp'],
      ctas: [
        { text: 'Demander une démo', link: '#demo' },
        { text: 'Contactez-nous', link: '#contact' }
      ]
    },
    {
      id: '2',
      title: 'Optimisation des performances web pour PME sénégalaises',
      content: '# Pourquoi la vitesse est cruciale\n\nDans le contexte sénégalais, la vitesse de chargement de votre site web...',
      status: 'review',
      createdAt: '2025-01-18T14:45:00',
      tags: ['Performance', 'SEO', 'Sites Web'],
      slug: 'optimisation-performances-web-pme-senegalaises',
      seoDescription: 'Apprenez à optimiser les performances de votre site web pour améliorer votre référencement et l\'expérience utilisateur.',
      suggestedImages: ['/images/web-performance.webp', '/images/senegal-business.webp'],
      ctas: [
        { text: 'Nos services', link: '#services' },
        { text: 'Blog', link: '#blog' }
      ]
    },
    {
      id: '3',
      title: 'Automatisation des processus métier avec WhatsApp',
      content: '# L\'automatisation par WhatsApp\n\nWhatsApp Business est devenu un outil incontournable pour les PME...',
      status: 'draft',
      createdAt: '2025-01-15T09:15:00',
      tags: ['WhatsApp', 'Automatisation', 'PME'],
      slug: 'automatisation-processus-metier-whatsapp',
      seoDescription: 'Découvrez comment automatiser vos processus métier avec WhatsApp Business pour gagner du temps et de l\'argent.',
      suggestedImages: ['/images/whatsapp-business.webp', '/images/business-automation.webp'],
      suggestedImages: ['/images/whatsapp-business.webp', '/images/business-automation.webp'],
      ctas: [
        { text: 'WhatsApp', link: '#whatsapp' },
        { text: 'Demander une démo', link: '#demo' }
      ]
    }
  ]);

  const suggestedTopics = [
    {
      title: "Automatisation WhatsApp pour restaurants Dakar",
      keywords: "WhatsApp Business Dakar, restaurant automatisation, PME Sénégal"
    },
    {
      title: "IA conversationnelle en français pour boutiques",
      keywords: "chatbot français, commerce Sénégal, IA locale"
    },
    {
      title: "Sites web ultra-rapides pour entreprises Liberté",
      keywords: "site web Dakar, performance web, PME digitale"
    }
  ];

  const generateArticle = async () => {
    if (!topic.trim()) {
      setError('Veuillez entrer un sujet d\'article');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedArticle(null);

    try {
      // In a real implementation, this would call your Gemini API
      // For now, we'll simulate the response
      setTimeout(() => {
        const mockArticle: GeneratedArticle = {
          id: `gen-${Date.now()}`,
          title: topic,
          content: `# ${topic}\n\nVoici un article généré automatiquement sur le sujet de "${topic}".\n\n## Introduction\n\nDans cet article, nous explorerons les aspects clés de ce sujet important pour les entreprises sénégalaises.\n\n## Points clés\n\n1. **Avantage 1** - Description détaillée\n2. **Avantage 2** - Explication avec exemples\n3. **Avantage 3** - Cas d'utilisation concrets\n\n## Conclusion\n\nEn conclusion, ${topic.toLowerCase()} offre de nombreuses opportunités pour les entreprises locales.`,
          status: 'draft',
          createdAt: new Date().toISOString(),
          tags: keywords.split(',').map(k => k.trim()).filter(k => k),
          slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          seoDescription: `Découvrez tout ce que vous devez savoir sur ${topic.toLowerCase()} et comment cela peut bénéficier à votre entreprise.`,
          suggestedImages: [
            '/images/placeholder-1.webp',
            '/images/placeholder-2.webp',
            '/images/placeholder-3.webp'
          ],
          ctas: [
            { text: 'Demander une démo', link: '#demo' },
            { text: 'Contactez-nous', link: '#contact' }
          ]
        };
        setGeneratedArticle(mockArticle);
        setIsGenerating(false);
      }, 2000);
    } catch (err) {
      console.error('Erreur génération article:', err);
      setError('Erreur lors de la génération. Réessayez dans quelques instants.');
      setIsGenerating(false);
    }
  };

  const useSuggestedTopic = (suggestion: typeof suggestedTopics[0]) => {
    setTopic(suggestion.title);
    setKeywords(suggestion.keywords);
    setError('');
  };

  const saveArticle = () => {
    if (generatedArticle) {
      // In a real implementation, this would save to your database
      setHistory(prev => [generatedArticle, ...prev]);
      setGeneratedArticle(null);
      alert('Article sauvegardé avec succès !');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            Génération Automatique avec Gemini
          </h2>
          <p className="text-gray-600 mt-1">
            Création de contenus optimisés SEO avec l'intelligence artificielle
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Générer un nouvel article</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet de l'article
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Automatisation WhatsApp pour PME à Dakar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={150}
                />
              </div>

              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                  Mots-clés cibles (optionnel)
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: WhatsApp Business Dakar, automatisation PME, Sénégal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Séparez les mots-clés par des virgules
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={generateArticle}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Générer l'article</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggested Topics */}
          {!generatedArticle && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions de sujets</h3>
              <div className="grid grid-cols-1 gap-3">
                {suggestedTopics.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => useSuggestedTopic(suggestion)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{suggestion.keywords}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generated Article */}
          {generatedArticle && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Article généré</h3>
                <button
                  onClick={saveArticle}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>

              {/* Article Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Métadonnées</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre SEO</label>
                    <p className="text-sm bg-white p-2 rounded border">{generatedArticle.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
                    <p className="text-sm bg-white p-2 rounded border font-mono">{generatedArticle.slug}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description meta</label>
                    <p className="text-sm bg-white p-2 rounded border">{generatedArticle.seoDescription}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {generatedArticle.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-sm bg-white p-2 rounded border flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(generatedArticle.createdAt).toLocaleDateString('fr-FR')}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Article Content Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Aperçu de l'article</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded border transition-colors">
                      Copier
                    </button>
                    <button className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Prévisualiser</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                      {generatedArticle.content}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Suggested Images */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Image className="w-5 h-5 text-orange-500" />
                  Images illustratives suggérées
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {generatedArticle.suggestedImages.map((img, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img 
                        src={img} 
                        alt={`Suggested ${index + 1}`} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2 text-center">
                        <button className="text-xs text-orange-600 hover:text-orange-800">
                          Utiliser cette image
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">CTA intégrés</h4>
                <div className="space-y-2">
                  {generatedArticle.ctas.map((cta, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{cta.text}</div>
                        <div className="text-sm text-gray-500">{cta.link}</div>
                      </div>
                      <button className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded">
                        Modifier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Panel */}
        <div className="space-y-6">
          {/* Preview Options */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévisualisation</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Monitor className="w-5 h-5 text-gray-600" />
                <span>Vue desktop</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <span>Vue mobile</span>
              </button>
            </div>
          </div>

          {/* Generation History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des générations</h3>
            <div className="space-y-3">
              {history.map((article) => (
                <div key={article.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 line-clamp-1">{article.title}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status === 'published' ? 'Publié' : 
                       article.status === 'review' ? 'À réviser' : 'Brouillon'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Conseils pour de meilleurs résultats</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Soyez spécifique dans le sujet de l'article</li>
              <li>• Incluez des mots-clés pertinents pour le SEO</li>
              <li>• Mentionnez le contexte local (Sénégal/Maroc)</li>
              <li>• Spécifiez le public cible (PME, startups, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}