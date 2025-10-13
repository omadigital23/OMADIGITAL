import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  ToggleLeft, 
  ToggleRight,
  Link,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

interface CTA {
  id: string;
  title: string;
  text: string;
  link: string;
  enabled: boolean;
  color: string;
  icon: string;
  targetType: 'landing' | 'blog' | 'external';
  section: string;
}

export function CTAManager() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ctas, setCtas] = useState<CTA[]>([]);

  useEffect(() => {
    setIsClient(true);
    // Initialize CTAs
    setCtas([
      {
        id: '1',
        title: 'Démo personnalisée',
        text: 'Demander une démo personnalisée',
        link: '#contact',
        enabled: true,
        color: '#f97316',
        icon: 'CursorClick',
        targetType: 'landing' as const,
        section: 'hero'
      },
      {
        id: '2',
        title: 'Découvrir nos solutions',
        text: 'Découvrir nos solutions',
        link: '#services',
        enabled: true,
        color: '#3b82f6',
        icon: 'Lightbulb',
        targetType: 'landing' as const,
        section: 'hero'
      },
      {
        id: '3',
        title: 'Lire l\'article',
        text: 'Lire l\'article',
        link: '/blog',
        enabled: true,
        color: '#10b981',
        icon: 'BookOpen',
        targetType: 'blog' as const,
        section: 'blog-card'
      }
    ]);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real implementation, this would save to your backend
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Modifications enregistrées avec succès!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des modifications');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCTA = () => {
    setCtas(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        text: '',
        link: '',
        enabled: true,
        color: '#f97316',
        icon: 'CursorClick',
        targetType: 'landing',
        section: ''
      }
    ]);
  };

  const removeCTA = (id: string) => {
    setCtas(prev => prev.filter(cta => cta.id !== id));
  };

  const toggleCTA = (id: string) => {
    setCtas(prev => 
      prev.map(cta => 
        cta.id === id ? { ...cta, enabled: !cta.enabled } : cta
      )
    );
  };

  const updateCTA = (id: string, field: keyof CTA, value: any) => {
    setCtas(prev => 
      prev.map(cta => 
        cta.id === id ? { ...cta, [field]: value } : cta
      )
    );
  };

  const getColorName = (color: string) => {
    const colors: Record<string, string> = {
      '#f97316': 'Orange',
      '#3b82f6': 'Bleu',
      '#10b981': 'Vert',
      '#ef4444': 'Rouge',
      '#8b5cf6': 'Violet',
      '#06b6d4': 'Cyan'
    };
    return colors[color] || color;
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des CTA</h2>
          <p className="text-gray-600">Gérez vos boutons d'appel à l'action</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Liste des CTA</h3>
          <button
            onClick={addCTA}
            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter CTA</span>
          </button>
        </div>

        <div className="space-y-4">
          {ctas.map((cta) => (
            <div key={cta.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleCTA(cta.id)}
                    className={`p-1 rounded-full ${cta.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    title={cta.enabled ? 'Désactiver' : 'Activer'}
                  >
                    {cta.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <input
                    type="text"
                    value={cta.title}
                    onChange={(e) => updateCTA(cta.id, 'title', e.target.value)}
                    placeholder="Titre du CTA"
                    className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  onClick={() => removeCTA(cta.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                  <input
                    type="text"
                    value={cta.text}
                    onChange={(e) => updateCTA(cta.id, 'text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien</label>
                  <div className="flex">
                    <div className="flex items-center pl-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                      <Link className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={cta.link}
                      onChange={(e) => updateCTA(cta.id, 'link', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="URL ou ancre"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de cible</label>
                  <select
                    value={cta.targetType}
                    onChange={(e) => updateCTA(cta.id, 'targetType', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="landing">Section de landing page</option>
                    <option value="blog">Article de blog</option>
                    <option value="external">Lien externe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={cta.section}
                    onChange={(e) => updateCTA(cta.id, 'section', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ex: hero, services, blog-card"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-1">
                      <Palette className="w-4 h-4" />
                      <span>Couleur</span>
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateCTA(cta.id, 'color', color)}
                        className={`w-8 h-8 rounded-full border-2 ${cta.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        title={getColorName(color)}
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Couleur actuelle: {getColorName(cta.color)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>Icône</span>
                    </div>
                  </label>
                  <select
                    value={cta.icon}
                    onChange={(e) => updateCTA(cta.id, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="CursorClick">Curseur</option>
                    <option value="Lightbulb">Ampoule</option>
                    <option value="BookOpen">Livre</option>
                    <option value="Phone">Téléphone</option>
                    <option value="Mail">Email</option>
                    <option value="MessageSquare">Message</option>
                    <option value="ArrowRight">Flèche droite</option>
                    <option value="Download">Télécharger</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cta.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cta.enabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {cta.id}
                </div>
              </div>
            </div>
          ))}

          {ctas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun CTA configuré</p>
              <button
                onClick={addCTA}
                className="mt-2 text-orange-600 hover:text-orange-800 font-medium"
              >
                Ajouter votre premier CTA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}