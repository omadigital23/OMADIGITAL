import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MousePointer, MessageCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface NewsletterMetrics {
  total_subscribers: number;
  active_subscribers: number;
  pending_subscribers: number;
  new_this_week: number;
  conversion_rate: number;
}

interface CTAMetrics {
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  click_rate: number;
}

interface ChatbotMetrics {
  total_interactions: number;
  avg_confidence: number;
  avg_response_time: number;
  daily_interactions: number;
}

export function SimplifiedDashboard() {
  const [newsletterData, setNewsletterData] = useState<NewsletterMetrics | null>(null);
  const [ctaData, setCTAData] = useState<CTAMetrics | null>(null);
  const [chatbotData, setChatbotData] = useState<ChatbotMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [newsletterRes, ctaRes, chatbotRes] = await Promise.all([
        fetch('/api/admin/newsletter-analytics'),
        fetch('/api/admin/cta-management?analytics=true'),
        fetch('/api/admin/chatbot-interactions')
      ]);

      if (newsletterRes.ok) {
        const newsletterResult = await newsletterRes.json();
        setNewsletterData(newsletterResult.data?.dashboard || null);
      }

      if (ctaRes.ok) {
        const ctaResult = await ctaRes.json();
        // Calculate CTA metrics from event counts
        const eventCounts = ctaResult?.eventCounts || {};
        const totalViews = Object.values(eventCounts).reduce((sum: number, count: number) => sum + count, 0);
        const totalClicks = eventCounts['cta_click'] || 0;
        const clickRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;
        
        setCTAData({
          total_views: totalViews,
          total_clicks: totalClicks,
          total_conversions: eventCounts['conversion'] || 0,
          click_rate: clickRate
        });
      }

      if (chatbotRes.ok) {
        const chatbotResult = await chatbotRes.json();
        setChatbotData(chatbotResult.stats || null);
      }

      setLastUpdated(new Date().toLocaleTimeString('fr-FR'));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Simplifié</h1>
              <p className="text-gray-600 mt-1">
                {lastUpdated 
                  ? `Dernière mise à jour: ${lastUpdated}` 
                  : 'Chargement...'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Link href="/admin/detailed-dashboard" className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                Vue Détaillée
              </Link>
              
              <Link href="/admin/focused-dashboard" className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Dashboard Focused
              </Link>
              
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Newsletter Block */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Abonnés Newsletter</h2>
            </div>
          </div>
          
          <div className="p-6">
            {loading && !newsletterData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : newsletterData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Abonnés</p>
                  <p className="text-2xl font-bold text-blue-600">{newsletterData.total_subscribers || 0}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{newsletterData.active_subscribers || 0}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">En Attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{newsletterData.pending_subscribers || 0}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Cette Semaine</p>
                  <p className="text-2xl font-bold text-purple-600">{newsletterData.new_this_week || 0}</p>
                </div>
                
                <div className="md:col-span-4 mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Taux de conversion: <span className="font-semibold">{(newsletterData.conversion_rate || 0).toFixed(2)}%</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Données newsletter non disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Block */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <MousePointer className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Soumissions CTA</h2>
            </div>
          </div>
          
          <div className="p-6">
            {loading && !ctaData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : ctaData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Vues Totales</p>
                  <p className="text-2xl font-bold text-blue-600">{ctaData.total_views || 0}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Clics</p>
                  <p className="text-2xl font-bold text-green-600">{ctaData.total_clicks || 0}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Taux de Clics</p>
                  <p className="text-2xl font-bold text-yellow-600">{ctaData.click_rate || 0}%</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Conversions</p>
                  <p className="text-2xl font-bold text-purple-600">{ctaData.total_conversions || 0}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MousePointer className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Données CTA non disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Block */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Conversations Chatbot</h2>
            </div>
          </div>
          
          <div className="p-6">
            {loading && !chatbotData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : chatbotData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Interactions Totales</p>
                  <p className="text-2xl font-bold text-blue-600">{chatbotData.total_interactions || 0}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Confiance Moyenne</p>
                  <p className="text-2xl font-bold text-green-600">
                    {chatbotData.avg_confidence ? (chatbotData.avg_confidence * 100).toFixed(0) : 0}%
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Temps Réponse</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatResponseTime(chatbotData.avg_response_time || 0)}
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-purple-600">{chatbotData.daily_interactions || 0}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Données chatbot non disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}