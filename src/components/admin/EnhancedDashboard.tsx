import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Bot, MessageSquare, FileText, Target, 
  Activity, Clock, Globe, Smartphone, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Eye, MousePointerClick, BarChart3,
  BookOpen, Zap
} from 'lucide-react';
import { PerformanceCharts } from './PerformanceCharts';
import { RealTimeStats } from './RealTimeStats';
import { AlertsPanel } from './AlertsPanel';
import { ExecutiveSummary } from './ExecutiveSummary';

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
  recentActivity: ActivityItem[];
  topPages: PageView[];
  chatbotPerformance: ChatbotMetric[];
}

interface ActivityItem {
  id: string;
  type: 'conversation' | 'quote' | 'blog' | 'cta';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

interface PageView {
  page: string;
  views: number;
  change: number;
}

interface ChatbotMetric {
  date: string;
  conversations: number;
  satisfaction: number;
}

interface ChartData {
  date: string;
  conversations: number;
  quotes: number;
  blogViews: number;
  conversions: number;
}

export function EnhancedDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeChats: 0,
    totalConversations: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    totalQuotes: 0,
    blogViews: 0,
    ctaClicks: 0,
    totalBlogArticles: 0,
    recentActivity: [],
    topPages: [],
    chatbotPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard-metrics');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      
      const data = await response.json();
      setMetrics(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'bg-blue-100 text-blue-800';
      case 'quote': return 'bg-green-100 text-green-800';
      case 'blog': return 'bg-purple-100 text-purple-800';
      case 'cta': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && metrics.totalUsers === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actualisation */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord OMA Digital</h1>
          <p className="text-sm text-gray-600">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Utilisateurs Actifs"
          value={metrics.totalUsers.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          change="+12%"
        />
        <MetricCard
          title="Conversations"
          value={metrics.totalConversations.toLocaleString()}
          icon={MessageSquare}
          color="bg-green-500"
          change="+8%"
        />
        <MetricCard
          title="Taux de Conversion"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={Target}
          color="bg-purple-500"
          change="+15%"
        />
        <MetricCard
          title="Temps de Réponse"
          value={`${metrics.avgResponseTime}ms`}
          icon={Activity}
          color="bg-orange-500"
          change="-5%"
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Devis Générés"
          value={metrics.totalQuotes.toLocaleString()}
          icon={FileText}
          color="bg-indigo-500"
          change="+23%"
        />
        <MetricCard
          title="Vues Blog"
          value={metrics.blogViews.toLocaleString()}
          icon={Eye}
          color="bg-pink-500"
          change="+18%"
        />
        <MetricCard
          title="Clics CTA"
          value={metrics.ctaClicks.toLocaleString()}
          icon={MousePointerClick}
          color="bg-teal-500"
          change="+31%"
        />
        <MetricCard
          title="Articles Blog"
          value={metrics.totalBlogArticles.toLocaleString()}
          icon={BookOpen}
          color="bg-purple-500"
          change="+5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Pages populaires */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pages Populaires</h2>
          <div className="space-y-3">
            {metrics.topPages.length > 0 ? (
              metrics.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{page.page}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</div>
                    <div className={`text-xs ${page.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {page.change >= 0 ? '+' : ''}{page.change}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée de pages</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance du chatbot */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance du Chatbot (7 derniers jours)</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {metrics.chatbotPerformance.map((day, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </div>
              <div className="text-lg font-semibold text-gray-900">{day.conversations}</div>
              <div className="text-xs text-gray-600">conversations</div>
              <div className="mt-2">
                <div className={`text-xs px-2 py-1 rounded-full ${
                  day.satisfaction >= 4 ? 'bg-green-100 text-green-800' :
                  day.satisfaction >= 3 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {day.satisfaction.toFixed(1)}/5
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé exécutif */}
      <ExecutiveSummary />

      {/* Panneau d'alertes */}
      <AlertsPanel />

      {/* Statistiques temps réel */}
      <RealTimeStats />

      {/* Graphiques de performance */}
      <PerformanceCharts data={metrics.chatbotPerformance.map(day => ({
        date: day.date,
        conversations: day.conversations,
        quotes: Math.floor(day.conversations * 0.3), // Estimation
        blogViews: Math.floor(day.conversations * 2.5), // Estimation
        conversions: Math.floor(day.conversations * 0.15) // Estimation
      }))} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  change?: string;
}

function MetricCard({ title, value, icon: Icon, color, change }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`text-sm font-medium ${
            change.startsWith('+') ? 'text-green-600' : 
            change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );
}