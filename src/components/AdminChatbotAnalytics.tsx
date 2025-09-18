import React, { useState } from 'react';
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  MessageCircle, 
  ExternalLink, 
  Calendar, 
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function AdminChatbotAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - replace with real API calls
  const analyticsData = {
    totalSessions: 1247,
    activeSessions: 23,
    resolvedSessions: 1184,
    pendingSessions: 40,
    avgResponseTime: 1.2, // seconds
    resolutionRate: 95.3, // percentage
    userSatisfaction: 4.7, // out of 5
    topCTAs: [
      { name: 'Demander une démo', clicks: 142, conversion: 28.4 },
      { name: 'Contactez-nous', clicks: 98, conversion: 19.6 },
      { name: 'WhatsApp', clicks: 76, conversion: 15.2 },
      { name: 'Nos services', clicks: 65, conversion: 13.0 },
      { name: 'Blog', clicks: 42, conversion: 8.4 }
    ],
    frequentTopics: [
      { topic: 'Automatisation WhatsApp', count: 245 },
      { topic: 'Sites Web', count: 187 },
      { topic: 'IA Conversationnelle', count: 156 },
      { topic: 'SEO', count: 98 },
      { topic: 'Prix', count: 87 }
    ],
    sessionsByDay: [
      { date: '2025-01-18', sessions: 32 },
      { date: '2025-01-19', sessions: 45 },
      { date: '2025-01-20', sessions: 38 },
      { date: '2025-01-21', sessions: 51 },
      { date: '2025-01-22', sessions: 47 },
      { date: '2025-01-23', sessions: 53 },
      { date: '2025-01-24', sessions: 49 },
      { date: '2025-01-25', sessions: 42 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Analytics Chatbot
          </h2>
          <p className="text-gray-600 mt-1">
            Performance et insights des interactions chatbot
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Sessions totales</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalSessions.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Sessions résolues</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.resolvedSessions.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Temps de réponse moyen</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.avgResponseTime}s</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Taux de résolution</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.resolutionRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Over Time */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions au fil du temps</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Graphique des sessions par jour</p>
              <p className="text-sm text-gray-400 mt-2">(Données simulées)</p>
            </div>
          </div>
        </div>

        {/* Top CTAs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CTA les plus utilisés</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Répartition des CTA</p>
              <p className="text-sm text-gray-400 mt-2">(Données simulées)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top CTAs Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-orange-500" />
            CTA les plus utilisés
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">CTA</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Clics</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Taux de conversion</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topCTAs.map((cta, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{cta.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{cta.clicks}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{cta.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequent Topics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sujets fréquents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Sujet</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.frequentTopics.map((topic, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{topic.topic}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{topic.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions d'amélioration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Optimisation des réponses</h4>
            <p className="text-sm text-blue-700 mt-1">
              Ajoutez des exemples concrets pour les questions sur l'automatisation WhatsApp.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">CTA améliorés</h4>
            <p className="text-sm text-green-700 mt-1">
              Le CTA "Demander une démo" a un bon taux de conversion (28.4%).
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900">Nouveaux sujets</h4>
            <p className="text-sm text-orange-700 mt-1">
              Ajoutez des réponses pour les questions sur le e-commerce local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}