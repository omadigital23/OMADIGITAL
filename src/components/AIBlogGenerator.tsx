import React, { useState } from 'react';
import { Zap, FileText, Image, Eye, Calendar, Tag, Globe } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ArticleMetadata {
  title: string;
  description: string;
  slug: string;
  tags: string[];
  summary: string;
}

interface GeneratedArticle {
  content: string;
  metadata: ArticleMetadata;
  generatedAt: string;
}

export function AIBlogGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState('');

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
    },
    {
      title: "Transformation digitale PME sénégalaises 2024",
      keywords: "transformation digitale Sénégal, PME moderne, technologie Afrique"
    },
    {
      title: "ROI automatisation business Dakar",
      keywords: "ROI automatisation, business Dakar, rentabilité digitale"
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
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8066848d/generate-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          topic: topic.trim(),
          targetKeywords: keywords.trim() || 'IA PME Dakar, automatisation Sénégal'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const article = await response.json();
      setGeneratedArticle(article);

    } catch (err) {
      console.error('Erreur génération article:', err);
      setError('Erreur lors de la génération. Réessayez dans quelques instants.');
    } finally {
      setIsGenerating(false);
    }
  };

  const useSuggestedTopic = (suggestion: typeof suggestedTopics[0]) => {
    setTopic(suggestion.title);
    setKeywords(suggestion.keywords);
    setError('');
  };

  const copyContent = () => {
    if (generatedArticle) {
      navigator.clipboard.writeText(generatedArticle.content);
      // Could add toast notification here
    }
  };

  const previewUrl = generatedArticle 
    ? `/blog/${generatedArticle.metadata.slug}` 
    : '#';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <Zap className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Générateur d'Articles IA</h2>
          <p className="text-gray-600">Contenu optimisé pour PME sénégalaises</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
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

      {/* Suggested Topics */}
      {!generatedArticle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggestions de sujets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <span>{suggestion.keywords.split(', ').slice(0, 2).join(', ')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generated Article */}
      {generatedArticle && (
        <div className="space-y-6">
          {/* Article Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Métadonnées de l'article</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre SEO</label>
                <p className="text-sm bg-white p-2 rounded border">{generatedArticle.metadata.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
                <p className="text-sm bg-white p-2 rounded border font-mono">{generatedArticle.metadata.slug}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description meta</label>
                <p className="text-sm bg-white p-2 rounded border">{generatedArticle.metadata.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {generatedArticle.metadata.tags.map((tag, index) => (
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
                  <span>{new Date(generatedArticle.generatedAt).toLocaleDateString('fr-FR')}</span>
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
                <button
                  onClick={copyContent}
                  className="text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded border transition-colors"
                >
                  Copier
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Prévisualiser</span>
                </a>
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

          {/* Article Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Résumé de l'article</h4>
            <p className="text-sm text-blue-800">{generatedArticle.metadata.summary}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>Optimisé pour le SEO local Dakar/Sénégal</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setGeneratedArticle(null)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Nouveau sujet
              </button>
              <button className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                Publier l'article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}