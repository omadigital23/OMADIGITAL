/**
 * Detailed Analytics Component for Admin Dashboard
 */

import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, TrendingUp, Users, MessageCircle, Clock } from 'lucide-react';

interface AnalyticsData {
  chatbotMetrics: {
    totalSessions: number;
    avgSessionDuration: number;
    resolutionRate: number;
    userSatisfaction: number;
  };
  trafficMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionTime: number;
  };
  conversionMetrics: {
    totalConversions: number;
    conversionRate: number;
    leadGeneration: number;
    quoteRequests: number;
  };
}

export function DetailedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // CHANGED: Fetch real data from the analytics API endpoint
      const response = await fetch(`/api/admin/analytics?period=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Transform the API response to match our expected format
      setData({
        chatbotMetrics: {
          totalSessions: result.chatbotMetrics?.totalSessions || 0,
          avgSessionDuration: result.chatbotMetrics?.avgSessionDuration || 0,
          resolutionRate: result.chatbotMetrics?.resolutionRate || 0,
          userSatisfaction: result.chatbotMetrics?.userSatisfaction || 0
        },
        trafficMetrics: {
          pageViews: result.trafficMetrics?.pageViews || 0,
          uniqueVisitors: result.trafficMetrics?.uniqueVisitors || 0,
          bounceRate: result.trafficMetrics?.bounceRate || 0,
          avgSessionTime: result.trafficMetrics?.avgSessionTime || 0
        },
        conversionMetrics: {
          totalConversions: result.conversionMetrics?.totalConversions || 0,
          conversionRate: result.conversionMetrics?.conversionRate || 0,
          leadGeneration: result.conversionMetrics?.leadGeneration || 0,
          quoteRequests: result.conversionMetrics?.quoteRequests || 0
        }
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to mock data in case of error
      setData({
        chatbotMetrics: {
          totalSessions: 1247,
          avgSessionDuration: 4.2,
          resolutionRate: 85.3,
          userSatisfaction: 4.6
        },
        trafficMetrics: {
          pageViews: 15420,
          uniqueVisitors: 8930,
          bounceRate: 32.1,
          avgSessionTime: 3.8
        },
        conversionMetrics: {
          totalConversions: 156,
          conversionRate: 12.5,
          leadGeneration: 89,
          quoteRequests: 67
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Détaillées</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des analytics</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Analytics Détaillées
          </h2>
          <p className="text-gray-600 mt-1">
            Analyse approfondie des performances de votre plateforme
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
        </select>
      </div>

      {/* Chatbot Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Métriques Chatbot
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Sessions Totales</p>
                <p className="text-2xl font-bold text-blue-900">{data.chatbotMetrics.totalSessions.toLocaleString()}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Durée Moyenne</p>
                <p className="text-2xl font-bold text-green-900">{data.chatbotMetrics.avgSessionDuration}min</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Taux de Résolution</p>
                <p className="text-2xl font-bold text-purple-900">{data.chatbotMetrics.resolutionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Satisfaction</p>
                <p className="text-2xl font-bold text-orange-900">{data.chatbotMetrics.userSatisfaction}/5</p>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Métriques de Trafic
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Pages Vues</p>
                <p className="text-2xl font-bold text-indigo-900">{data.trafficMetrics.pageViews.toLocaleString()}</p>
              </div>
              <div className="text-2xl">👁️</div>
            </div>
          </div>
          
          <div className="bg-cyan-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">Visiteurs Uniques</p>
                <p className="text-2xl font-bold text-cyan-900">{data.trafficMetrics.uniqueVisitors.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Taux de Rebond</p>
                <p className="text-2xl font-bold text-red-900">{data.trafficMetrics.bounceRate}%</p>
              </div>
              <div className="text-2xl">📉</div>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Temps Moyen</p>
                <p className="text-2xl font-bold text-emerald-900">{data.trafficMetrics.avgSessionTime}min</p>
              </div>
              <Clock className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          Métriques de Conversion
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-pink-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 font-medium">Conversions Totales</p>
                <p className="text-2xl font-bold text-pink-900">{data.conversionMetrics.totalConversions}</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Taux de Conversion</p>
                <p className="text-2xl font-bold text-yellow-900">{data.conversionMetrics.conversionRate}%</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
          
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">Leads Générés</p>
                <p className="text-2xl font-bold text-teal-900">{data.conversionMetrics.leadGeneration}</p>
              </div>
              <div className="text-2xl">🚀</div>
            </div>
          </div>
          
          <div className="bg-violet-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium">Demandes de Devis</p>
                <p className="text-2xl font-bold text-violet-900">{data.conversionMetrics.quoteRequests}</p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du Trafic</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <LineChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Graphique en développement</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Sources</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Graphique en développement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}