// Safe Admin Dashboard with comprehensive null safety and error handling
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Settings,
  Shield
} from 'lucide-react';
import { AdminDashboardProps, TabType, AdminUser, AdminSession } from '../types/admin';
import { AnalyticsData, RealTimeStats, LoadingState } from '../types/analytics';
import { 
  safeArray, 
  safeNumber, 
  safeString, 
  safeGet,
  safeCall,
  safeAsyncWithError,
  isNotNullOrUndefined,
  safeDateString,
  safeErrorMessage
} from '../utils/null-safety';

interface SafeDashboardState {
  activeTab: TabType;
  analytics: AnalyticsData | null;
  realTimeStats: RealTimeStats | null;
  user: AdminUser | null;
  session: AdminSession | null;
  loading: LoadingState;
  lastRefresh: Date | null;
}

export const SafeAdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'overview',
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [state, setState] = useState<SafeDashboardState>({
    activeTab: initialTab,
    analytics: null,
    realTimeStats: null,
    user: null,
    session: null,
    loading: {
      isLoading: true,
      error: null,
      lastUpdated: null
    },
    lastRefresh: null
  });

  // Safe data fetching functions
  const fetchAnalytics = useCallback(async (period = '7d') => {
    const [data, error] = await safeAsyncWithError(
      fetch(`/api/admin/analytics?period=${period}`)
        .then(res => res.json())
    );

    if (error) {
      throw new Error(`Analytics fetch failed: ${safeErrorMessage(error)}`);
    }

    return data?.data ?? null;
  }, []);

  const fetchRealTimeStats = useCallback(async () => {
    const [data, error] = await safeAsyncWithError(
      fetch('/api/admin/realtime-stats').then(res => res.json())
    );

    if (error) {
      throw new Error(`Real-time stats fetch failed: ${safeErrorMessage(error)}`);
    }

    return data ?? null;
  }, []);

  const fetchUserSession = useCallback(async () => {
    const [data, error] = await safeAsyncWithError(
      fetch('/api/admin/session').then(res => res.json())
    );

    if (error) {
      console.warn('Session fetch failed:', safeErrorMessage(error));
      return { user: null, session: null };
    }

    return {
      user: data?.user ?? null,
      session: data?.session ?? null
    };
  }, []);

  // Safe data refresh function
  const refreshData = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, isLoading: true, error: null }
    }));

    try {
      const [analytics, realTimeStats, userSession] = await Promise.allSettled([
        fetchAnalytics(),
        fetchRealTimeStats(),
        fetchUserSession()
      ]);

      setState(prev => ({
        ...prev,
        analytics: analytics.status === 'fulfilled' ? analytics.value : null,
        realTimeStats: realTimeStats.status === 'fulfilled' ? realTimeStats.value : null,
        user: userSession.status === 'fulfilled' ? userSession.value.user : null,
        session: userSession.status === 'fulfilled' ? userSession.value.session : null,
        loading: {
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        },
        lastRefresh: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: {
          isLoading: false,
          error: {
            message: safeErrorMessage(error),
            code: 'DASHBOARD_FETCH_ERROR'
          },
          lastUpdated: new Date()
        }
      }));
    }
  }, [fetchAnalytics, fetchRealTimeStats, fetchUserSession]);

  // Auto-refresh effect
  useEffect(() => {
    refreshData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshData, autoRefresh, refreshInterval]);

  // Safe tab change handler
  const handleTabChange = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Safe logout handler
  const handleLogout = useCallback(async () => {
    const [result, error] = await safeAsyncWithError(
      fetch('/api/admin/logout', { method: 'POST' })
    );

    if (error) {
      console.error('Logout failed:', safeErrorMessage(error));
      return;
    }

    // Redirect to login or clear session
    window.location.href = '/admin/login';
  }, []);

  // Memoized computed values
  const computedStats = useMemo(() => {
    const analytics = state.analytics;
    const realTime = state.realTimeStats;

    return {
      totalChats: safeNumber(analytics?.chats?.total, 0),
      totalQuotes: safeNumber(analytics?.quotesSubmitted, 0),
      onlineUsers: safeNumber(realTime?.onlineUsers, 0),
      conversionRate: safeNumber(analytics?.conversionRate, 0),
      avgResponseTime: safeNumber(analytics?.chats?.avgResponseTime, 0),
      uptime: safeString(analytics?.performance?.uptime, '99.9%'),
      errorRate: safeString(analytics?.performance?.errorRate, '0.1%')
    };
  }, [state.analytics, state.realTimeStats]);

  // Safe metric cards configuration
  const metricCards = useMemo(() => [
    {
      title: 'Conversations',
      value: computedStats.totalChats.toLocaleString(),
      change: '+12% vs hier',
      trend: 'up' as const,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Devis générés',
      value: computedStats.totalQuotes.toLocaleString(),
      change: `${computedStats.conversionRate.toFixed(1)}% conversion`,
      trend: 'up' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      title: 'Utilisateurs en ligne',
      value: computedStats.onlineUsers.toString(),
      change: 'En temps réel',
      trend: 'neutral' as const,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Performance',
      value: computedStats.uptime,
      change: `${computedStats.avgResponseTime}ms réponse`,
      trend: 'up' as const,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ], [computedStats]);

  // Tab configuration with safe access
  const tabConfig = useMemo(() => [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analytics' as TabType, label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'chatbot' as TabType, label: 'Chatbot', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'users' as TabType, label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
    { id: 'settings' as TabType, label: 'Paramètres', icon: <Settings className="w-4 h-4" /> }
  ], []);

  // Loading state
  if (state.loading.isLoading && !state.analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.loading.error && !state.analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">
            {state.loading.error.message}
          </p>
          <button
            onClick={refreshData}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with safe user display */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
              {state.loading.isLoading && (
                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Safe user info display */}
              {state.user && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {safeString(state.user.username, 'Admin')}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
              
              {/* Last refresh indicator */}
              {state.lastRefresh && (
                <span className="text-xs text-gray-400">
                  Mis à jour: {state.lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabConfig.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  state.activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview tab content */}
        {state.activeTab === 'overview' && (
          <>
            {/* Metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metricCards.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center text-white`}>
                      {metric.icon}
                    </div>
                    <div className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {metric.value}
                    </h3>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Error display for partial failures */}
            {state.loading.error && state.analytics && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Certaines données peuvent être incomplètes: {state.loading.error.message}
                  </span>
                </div>
              </div>
            )}

            {/* Additional dashboard content would go here */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Activité récente
              </h2>
              <p className="text-gray-600">
                Contenu du tableau de bord en cours de développement...
              </p>
            </div>
          </>
        )}

        {/* Other tab contents */}
        {state.activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {tabConfig.find(t => t.id === state.activeTab)?.label}
            </h2>
            <p className="text-gray-600">
              Contenu de l'onglet "{state.activeTab}" en cours de développement...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SafeAdminDashboard;