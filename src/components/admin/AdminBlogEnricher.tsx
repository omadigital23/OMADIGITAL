/**
 * Composant admin pour enrichir les articles de blog
 */

import React, { useState, useEffect } from 'react';
import { FileText, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export function AdminBlogEnricher() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/admin/blog-articles');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Erreur chargement articles:', error);
    }
  };

  const enrichAllArticles = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const response = await fetch('/api/admin/enrich-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enrich-all' })
      });
      
      const data = await response.json();
      setResults(data.results || []);
      await loadArticles();
    } catch (error) {
      console.error('Erreur enrichissement:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrichSingleArticle = async (articleId: string) => {
    setEnriching(prev => [...prev, articleId]);
    
    try {
      const response = await fetch('/api/admin/enrich-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enrich-single', articleId })
      });
      
      if (response.ok) {
        await loadArticles();
        setResults(prev => [...prev, { id: articleId, status: 'enriched' }]);
      }
    } catch (error) {
      console.error('Erreur enrichissement article:', error);
      setResults(prev => [...prev, { id: articleId, status: 'error' }]);
    } finally {
      setEnriching(prev => prev.filter(id => id !== articleId));
    }
  };

  const getArticleStatus = (article: Article) => {
    if (!article.content || article.content.length < 500) {
      return { status: 'short', label: 'Article court', color: 'text-orange-600 bg-orange-100' };
    }
    return { status: 'complete', label: 'Article complet', color: 'text-green-600 bg-green-100' };
  };

  const shortArticles = articles.filter(a => !a.content || a.content.length < 500);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enrichissement des Articles</h2>
          <p className="text-gray-600">Générez automatiquement du contenu complet pour vos articles</p>
        </div>
        <button
          onClick={enrichAllArticles}
          disabled={loading || shortArticles.length === 0}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>Enrichir tous les articles courts ({shortArticles.length})</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total articles</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Articles courts</p>
              <p className="text-2xl font-bold text-gray-900">{shortArticles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Articles complets</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length - shortArticles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats d'enrichissement */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Résultats d'enrichissement</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{result.title || `Article ${result.id}`}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  result.status === 'enriched' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status === 'enriched' ? 'Enrichi' : 'Erreur'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des articles */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Articles ({articles.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Longueur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière MAJ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => {
                const status = getArticleStatus(article);
                const isEnriching = enriching.includes(article.id);
                
                return (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500">{article.category}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.content ? `${article.content.length} caractères` : 'Aucun contenu'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.updated_at).toLocaleDateString('fr-FR')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {status.status === 'short' && (
                        <button
                          onClick={() => enrichSingleArticle(article.id)}
                          disabled={isEnriching}
                          className="text-orange-600 hover:text-orange-900 disabled:opacity-50 flex items-center space-x-1"
                        >
                          {isEnriching ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          <span>Enrichir</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}