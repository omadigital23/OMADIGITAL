/**
 * Dashboard Admin Optimisé - DONNÉES 100% RÉELLES
 * Composant découplé et performant
 */

import React, { memo, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { useRealDashboardData, useRealTimeMetrics } from '../../hooks/useRealDashboardData';
import { MetricsOverview } from './MetricsOverview';
import { ActivityFeed } from './ActivityFeed';
import { PerformanceCharts } from './PerformanceCharts';
import { PopularPages } from './PopularPages';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

interface OptimizedAdminDashboardProps {
  initialTab?: string;
}

/**
 * Composant principal dashboard optimisé
 */
const OptimizedAdminDashboardContent = memo(({ initialTab = 'overview' }: OptimizedAdminDashboardProps) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Hook données réelles principales (30 jours)
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching
  } = useRealDashboardData(30);

  // Hook métriques temps réel (24h)
  const { 
    data: realTimeData, 
    isLoading: isRealTimeLoading 
  } = useRealTimeMetrics();

  // Fonction de rafraîchissement manuel
  const handleRefresh = React.useCallback(async () => {
    try {
      toast.loading('Actualisation des données...', { id: 'refresh' });
      await refetchDashboard();
      setRefreshTrigger(prev => prev + 1);
      toast.success('Données mises à jour !', { id: 'refresh' });
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation', { id: 'refresh' });
    }
  }, [refetchDashboard]);

  // Raccourcis clavier
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            handleRefresh();
            break;
          case '1':
            e.preventDefault();
            setActiveTab('overview');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('analytics');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('content');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh]);

  // Mémorisation des données combinées
  const combinedData = useMemo(() => {
    if (!dashboardData) return null;
    
    return {
      ...dashboardData,
      realTimeMetrics: realTimeData,
      lastUpdated: new Date().toISOString()
    };
  }, [dashboardData, realTimeData, refreshTrigger]);

  // Gestion des erreurs
  if (dashboardError) {
    return (
      <ErrorDisplay 
        error={dashboardError}
        onRetry={handleRefresh}
        title="Erreur de chargement du dashboard"
      />
    );
  }

  // État de chargement initial
  if (isDashboardLoading && !dashboardData) {
    return <LoadingSpinner message="Chargement des données réelles..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec actions */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Admin OMA Digital
              </h1>
              <p className="text-sm text-gray-500">
                Données en temps réel • Dernière mise à jour: {combinedData?.lastUpdated ? 
                  new Date(combinedData.lastUpdated).toLocaleTimeString('fr-FR') : 'Chargement...'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Indicateur de chargement en temps réel */}
              {isFetching && (
                <div className="flex items-center text-orange-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                  <span className="text-sm">Actualisation...</span>
                </div>
              )}
              
              {/* Bouton refresh manuel */}
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
                title="Rafraîchir (Ctrl+R)"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', shortcut: '1' },
                { id: 'analytics', label: 'Analytics', shortcut: '2' },
                { id: 'content', label: 'Contenu', shortcut: '3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={`Raccourci: Ctrl+${tab.shortcut}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && combinedData && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <MetricsOverview 
              data={combinedData} 
              realTimeData={realTimeData}
              isLoading={isRealTimeLoading}
            />
            
            {/* Graphiques et activité */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceCharts 
                  data={combinedData.dailyPerformance}
                  isLoading={isFetching}
                />
              </div>
              <div>
                <ActivityFeed 
                  activities={combinedData.recentActivity}
                  isLoading={isFetching}
                />
              </div>
            </div>

            {/* Pages populaires */}
            <PopularPages 
              pages={combinedData.topPages}
              isLoading={isFetching}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics Détaillées</h2>
            <p className="text-gray-600">
              Section analytics avec données réelles détaillées
            </p>
            {/* TODO: Implémenter analytics détaillées */}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion de Contenu</h2>
            <p className="text-gray-600">
              Gestion blog, newsletter et contenu avec données réelles
            </p>
            {/* TODO: Implémenter gestion contenu */}
          </div>
        )}
      </div>

      {/* Notifications toast */}
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

OptimizedAdminDashboardContent.displayName = 'OptimizedAdminDashboardContent';

/**
 * Wrapper avec QueryClient provider
 */
export const OptimizedAdminDashboard: React.FC<OptimizedAdminDashboardProps> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <OptimizedAdminDashboardContent {...props} />
    </QueryClientProvider>
  );
};

export default OptimizedAdminDashboard;