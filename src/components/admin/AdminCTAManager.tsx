/**
 * Composant Admin pour gérer les CTAs
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BarChart3, Eye, MousePointer, TrendingUp } from 'lucide-react';
import { ctaService } from '../../lib/cta-service';
import { CTAAction } from '../SmartChatbot/types';

interface CTAMetrics {
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  click_rate: number;
  conversion_rate: number;
}

export function AdminCTAManager() {
  const [ctas, setCTAs] = useState<CTAAction[]>([]);
  const [metrics, setMetrics] = useState<Record<string, CTAMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [editingCTA, setEditingCTA] = useState<CTAAction | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCTAs();
  }, []);

  const loadCTAs = async () => {
    try {
      setLoading(true);
      const activeCTAs = await ctaService.getActiveCTAs();
      setCTAs(activeCTAs);

      // Charger les métriques pour chaque CTA
      const metricsData: Record<string, CTAMetrics> = {};
      for (const cta of activeCTAs) {
        if (cta.id) {
          const ctaMetrics = await ctaService.getCTAMetrics(cta.id);
          if (ctaMetrics) {
            metricsData[cta.id] = ctaMetrics;
          }
        }
      }
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erreur lors du chargement des CTAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCTA = async (ctaData: Partial<CTAAction>) => {
    try {
      await ctaService.upsertCTA(ctaData);
      await loadCTAs();
      setShowForm(false);
      setEditingCTA(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDeleteCTA = async (ctaId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce CTA ?')) {
      try {
        await ctaService.deleteCTA(ctaId);
        await loadCTAs();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'demo': return '🎯';
      case 'quote': return '💰';
      case 'appointment': return '📅';
      default: return '🔗';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des CTAs</h2>
          <p className="text-gray-600">Gérez les appels à l'action du chatbot</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau CTA</span>
        </button>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.values(metrics).length > 0 && (
          <>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vues totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(metrics).reduce((sum, m) => sum + m.total_views, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <MousePointer className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clics totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(metrics).reduce((sum, m) => sum + m.total_clicks, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(metrics).reduce((sum, m) => sum + m.total_conversions, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taux moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(metrics).length > 0 
                      ? (Object.values(metrics).reduce((sum, m) => sum + m.click_rate, 0) / Object.values(metrics).length).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Liste des CTAs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">CTAs Actifs ({ctas.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métriques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ctas.map((cta) => {
                const ctaMetrics = cta.id ? metrics[cta.id] : null;
                return (
                  <tr key={cta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getTypeIcon(cta.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cta.action}</div>
                          <div className="text-sm text-gray-500">
                            {cta.conditions?.keywords?.slice(0, 3).join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cta.type}
                        </span>
                        <br />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(cta.priority)}`}>
                          {cta.priority}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ctaMetrics ? (
                        <div className="space-y-1">
                          <div>👁️ {ctaMetrics.total_views} vues</div>
                          <div>👆 {ctaMetrics.total_clicks} clics</div>
                          <div>✅ {ctaMetrics.total_conversions} conversions</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucune donnée</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ctaMetrics ? (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(ctaMetrics.click_rate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{ctaMetrics.click_rate}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(ctaMetrics.conversion_rate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{ctaMetrics.conversion_rate}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingCTA(cta);
                            setShowForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cta.id && handleDeleteCTA(cta.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulaire CTA */}
      {showForm && (
        <CTAForm
          cta={editingCTA}
          onSave={handleSaveCTA}
          onCancel={() => {
            setShowForm(false);
            setEditingCTA(null);
          }}
        />
      )}
    </div>
  );
}

// Composant formulaire CTA
function CTAForm({ 
  cta, 
  onSave, 
  onCancel 
}: { 
  cta: CTAAction | null; 
  onSave: (data: Partial<CTAAction>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    type: cta?.type || 'contact',
    action: cta?.action || '',
    priority: cta?.priority || 'medium',
    data: cta?.data || {},
    conditions: cta?.conditions || { keywords: [], language: 'both' },
    is_active: cta?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...cta, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {cta ? 'Modifier le CTA' : 'Nouveau CTA'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="contact">Contact</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="demo">Démo</option>
                <option value="quote">Devis</option>
                <option value="appointment">RDV</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Texte du bouton</label>
            <input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Mots-clés (séparés par des virgules)</label>
            <input
              type="text"
              value={formData.conditions.keywords?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                conditions: { 
                  ...formData.conditions, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="contact, whatsapp, téléphone"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">CTA actif</label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-orange-600"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}