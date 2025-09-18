import React from 'react';
import { useRealAnalytics } from '../hooks/useRealAnalytics';
import { TrendingUp, Users, Target, Clock, Smartphone, MapPin, Zap } from 'lucide-react';

export function AdminAnalyticsReal() {
  const analytics = useRealAnalytics('7d');

  if (analytics.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (analytics.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur: {analytics.error}</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Visiteurs uniques',
      value: analytics.visitors.toLocaleString(),
      change: 'Données réelles Supabase',
      trend: 'neutral',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Sessions',
      value: analytics.sessions.toLocaleString(),
      change: 'Conversations chatbot',
      trend: 'neutral',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      title: 'Conversions',
      value: analytics.conversions.toLocaleString(),
      change: 'Devis reçus',
      trend: 'neutral',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Taux de conversion',
      value: `${analytics.conversionRate}%`,
      change: 'Calculé réel',
      trend: 'neutral',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Durée de session',
      value: `${Math.max(0, analytics.sessionDuration)}s`,
      change: analytics.sessionDuration > 0 ? 'Score moyen lead' : 'Aucune donnée',
      trend: 'neutral',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Trafic mobile',
      value: analytics.mobileTraffic.toLocaleString(),
      change: 'Données réelles des visiteurs mobiles',
      trend: analytics.mobileTraffic > 1000 ? 'up' : 'neutral',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-pink-500'
    },
    {
      title: 'Visiteurs locaux',
      value: analytics.localVisitors.toLocaleString(),
      change: 'Données réelles des visiteurs locaux',
      trend: analytics.localVisitors > 500 ? 'up' : 'neutral',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-teal-500'
    },
    {
      title: 'Performance',
      value: analytics.uptime || '0%',
      change: analytics.loadTime || '0ms',
      trend: 'neutral',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics - Données Réelles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.color}`}>
                <div className="text-white">
                  {metric.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources de Données</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Supabase Analytics</h4>
            <p className="text-sm text-blue-700">Événements, conversations, devis</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900">Google Analytics</h4>
            <p className="text-sm text-yellow-700">Trafic mobile, géolocalisation</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Web Vitals</h4>
            <p className="text-sm text-green-700">Performance, temps de chargement</p>
          </div>
        </div>
      </div>
    </div>
  );
}