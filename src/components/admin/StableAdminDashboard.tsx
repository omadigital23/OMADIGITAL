/**
 * Dashboard Admin Stable - Version sans erreurs Fast Refresh
 */

import React, { memo, useMemo, useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AdminChatbotSessions } from '../AdminChatbotSessions';
import { AdminChatbotSessionDetails } from '../AdminChatbotSessionDetails';
import { DetailedAnalytics } from './DetailedAnalytics';
import { AdminQuotes } from '../AdminQuotes';

interface DashboardMetrics {
  totalUsers: number;
  activeChats: number;
  totalConversations: number;
  avgResponseTime: number;
  conversionRate: number;
  totalQuotes: number;
  blogViews: number;
  ctaClicks: number;
  totalBlogArticles: number;
  total_subscribers: number;
}

interface StableAdminDashboardProps {
  initialTab?: string;
}

/**
 * Hook pour récupérer les données dashboard de façon stable
 */
function useDashboardData() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/dashboard-metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // S'assurer que nous avons les bonnes données
      if (result && typeof result === 'object') {
        // Map the API response to the expected format
        setData({
          totalUsers: result.total_users || 0,
          activeChats: result.active_chats || 0,
          totalConversations: result.total_conversations || 0,
          avgResponseTime: result.avg_response_time || 0,
          conversionRate: result.conversion_rate || 0,
          totalQuotes: result.total_quotes || 0,
          blogViews: result.blog_views || 0,
          ctaClicks: result.cta_clicks || 0,
          totalBlogArticles: result.total_blog_articles || 0,
          total_subscribers: result.total_subscribers || 0
        });
      } else {
        throw new Error('Invalid data format received');
      }
      
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Données par défaut en cas d'erreur
      setData({
        totalUsers: 0,
        activeChats: 0,
        totalConversations: 0,
        avgResponseTime: 0,
        conversionRate: 0,
        totalQuotes: 0,
        blogViews: 0,
        ctaClicks: 0,
        totalBlogArticles: 0,
        total_subscribers: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Composant de métriques principales
 */
const MetricsGrid = memo(({ data, isLoading }: { data: DashboardMetrics | null; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-800">Erreur lors du chargement des métriques</p>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Utilisateurs Totaux',
      value: (data.totalUsers || 0).toLocaleString(),
      icon: '👥',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Chats Actifs',
      value: (data.activeChats || 0).toLocaleString(),
      icon: '💬',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Conversations',
      value: (data.totalConversations || 0).toLocaleString(),
      icon: '🗨️',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Temps Réponse',
      value: `${Math.round(data.avgResponseTime || 0)}ms`,
      icon: '⚡',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Taux Conversion',
      value: `${data.conversionRate || 0}%`,
      icon: '📈',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Devis Générés',
      value: (data.totalQuotes || 0).toLocaleString(),
      icon: '📋',
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    },
    {
      title: 'Pages Vues',
      value: (data.blogViews || 0).toLocaleString(),
      icon: '👀',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      title: 'Abonnés Newsletter',
      value: (data.total_subscribers || 0).toLocaleString(),
      icon: '📧',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className={`${metric.bg} rounded-lg p-4 sm:p-6 border shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
              <p className={`text-xl sm:text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
            <div className="text-2xl sm:text-3xl">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

MetricsGrid.displayName = 'MetricsGrid';

/**
 * Composant principal du dashboard stable
 */
export const StableAdminDashboard: React.FC<StableAdminDashboardProps> = memo(({ 
  initialTab = 'overview' 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [chatbotSessionId, setChatbotSessionId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useDashboardData();

  // Mettre à jour l'heure seulement côté client
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('fr-FR'));
  }, [data]);

  const handleRefresh = async () => {
    try {
      toast.loading('Actualisation des données...', { id: 'refresh' });
      await refetch();
      setLastUpdated(new Date().toLocaleTimeString('fr-FR'));
      toast.success('Données mises à jour !', { id: 'refresh' });
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation', { id: 'refresh' });
    }
  };

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard Admin OMA Digital
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Données en temps réel {lastUpdated && `• Dernière mise à jour: ${lastUpdated}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoading && (
                <div className="flex items-center text-orange-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                  <span className="text-sm">Chargement...</span>
                </div>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-8 min-w-max">
              {[
                { id: 'overview', label: 'Vue d\'ensemble' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'content', label: 'Contenu' },
                { id: 'chatbot', label: 'Chatbot' },
                { id: 'quotes', label: 'Devis' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur de chargement
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRefresh}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <MetricsGrid data={data} isLoading={isLoading} />
            
            {/* Message de données réelles */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Données 100% Réelles
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Toutes les métriques affichées proviennent directement de votre base de données Supabase.
                      Aucune donnée simulée n'est utilisée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <DetailedAnalytics />
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion de Contenu</h2>
            <p className="text-gray-600">
              Gestion blog, newsletter et contenu (en développement)
            </p>
          </div>
        )}

        {activeTab === 'chatbot' && !chatbotSessionId && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Sessions Chatbot</h2>
            <div className="min-h-[400px]">
              <AdminChatbotSessions onViewDetails={(sessionId) => setChatbotSessionId(sessionId)} />
            </div>
          </div>
        )}
        
        {activeTab === 'chatbot' && chatbotSessionId && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="min-h-[400px]">
              <AdminChatbotSessionDetails sessionId={chatbotSessionId} onBack={() => setChatbotSessionId(null)} />
            </div>
          </div>
        )}

        {/* Added new tab for quotes */}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <AdminQuotes />
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
});

StableAdminDashboard.displayName = 'StableAdminDashboard';

export default StableAdminDashboard;