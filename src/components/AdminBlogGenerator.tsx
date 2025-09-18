import React, { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

export function AdminBlogGenerator() {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; article?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/blog-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, language }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ success: true, message: data.message, article: data.article });
        setTitle(''); // Clear the form
      } else {
        setError(data.error || 'Failed to generate blog article');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Blog generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-900">Générateur d'articles de blog</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre de l'article
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Entrez le titre de l'article"
            required
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Langue
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !title}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            'Générer l\'article'
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.message}
          {result.article && (
            <div className="mt-2 text-sm">
              <strong>Article ID:</strong> {result.article.id}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}