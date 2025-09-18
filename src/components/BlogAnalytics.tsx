import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Eye, Clock, Users, BookOpen,
  ThumbsUp, MessageCircle, Share2, Target, Award, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export function BlogAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Mock analytics data - in real app this would come from your analytics API
  const blogStats = {
    totalViews: 15420,
    totalReads: 8945,
    avgReadTime: 4.2,
    bounceRate: 23.5,
    totalShares: 1248,
    totalComments: 342,
    subscriberGrowth: 12.5,
    topPerformingCategory: 'Intelligence Artificielle'
  };

  const viewsData = [
    { name: 'Lun', views: 1200, reads: 720, shares: 89 },
    { name: 'Mar', views: 1890, reads: 1134, shares: 142 },
    { name: 'Mer', views: 2340, reads: 1404, shares: 187 },
    { name: 'Jeu', views: 1980, reads: 1188, shares: 156 },
    { name: 'Ven', views: 2650, reads: 1590, shares: 203 },
    { name: 'Sam', views: 1840, reads: 1104, shares: 134 },
    { name: 'Dim', views: 1520, reads: 912, shares: 98 }
  ];

  const topArticles = [
    {
      id: 1,
      title: "L'IA Conversationnelle : L'Avenir du Service Client",
      views: 3420,
      readTime: 5.2,
      engagement: 89,
      category: 'IA',
      trending: true
    },
    {
      id: 2,
      title: "Sites Web Ultra-Rapides : Guide Complet",
      views: 2890,
      readTime: 6.1,
      engagement: 76,
      category: 'Web',
      trending: false
    },
    {
      id: 3,
      title: "Automatisation WhatsApp Business : ROI 300%",
      views: 2156,
      readTime: 4.8,
      engagement: 92,
      category: 'Automatisation',
      trending: true
    },
    {
      id: 4,
      title: "Analytics Avancées pour PME Sénégalaises",
      views: 1734,
      readTime: 7.3,
      engagement: 68,
      category: 'Analytics',
      trending: false
    },
    {
      id: 5,
      title: "Transformation Digitale en 7 Étapes",
      views: 1456,
      readTime: 8.1,
      engagement: 71,
      category: 'Stratégie',
      trending: false
    }
  ];

  const categoryData = [
    { name: 'IA', value: 35, color: '#F97316' },
    { name: 'Web Dev', value: 25, color: '#3B82F6' },
    { name: 'Automatisation', value: 20, color: '#10B981' },
    { name: 'Analytics', value: 12, color: '#8B5CF6' },
    { name: 'Sécurité', value: 8, color: '#EF4444' }
  ];

  const readingBehavior = [
    { time: '0-30s', readers: 100, color: '#EF4444' },
    { time: '30s-1m', readers: 85, color: '#F59E0B' },
    { time: '1-2m', readers: 68, color: '#F59E0B' },
    { time: '2-5m', readers: 52, color: '#10B981' },
    { time: '5m+', readers: 34, color: '#10B981' }
  ];

  const engagementMetrics = [
    { name: 'Vues', value: blogStats.totalViews, icon: Eye, color: 'bg-blue-500' },
    { name: 'Lectures complètes', value: blogStats.totalReads, icon: BookOpen, color: 'bg-green-500' },
    { name: 'Partages', value: blogStats.totalShares, icon: Share2, color: 'bg-purple-500' },
    { name: 'Commentaires', value: blogStats.totalComments, icon: MessageCircle, color: 'bg-orange-500' }
  ];

  const getMetricColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Analytics du Blog
          </h2>
          <p className="text-gray-600 mt-1">
            Performances et engagement de votre contenu
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
          
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
            Exporter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {engagementMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-gray-500 ml-1">vs période précédente</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views & Reads Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Vues et Lectures</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Vues</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Lectures</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="views" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
                <Area type="monotone" dataKey="reads" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Popularité par Catégorie</h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Articles */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Articles les Plus Performants</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="views">Par vues</option>
            <option value="engagement">Par engagement</option>
            <option value="readTime">Par temps de lecture</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Article</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Catégorie</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vues</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Temps moyen</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Engagement</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((article, index) => (
                <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500">ID: {article.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {article.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{article.views.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{article.readTime} min</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getMetricColor(article.engagement, 100) === 'text-green-600' ? 'bg-green-500' : getMetricColor(article.engagement, 100) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${article.engagement}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{article.engagement}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {article.trending ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        Tendance
                      </span>
                    ) : (
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Stable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reading Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reading Duration */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Durée de Lecture</h3>
          
          <div className="space-y-4">
            {readingBehavior.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700">{item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${item.readers}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{item.readers}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Temps de lecture moyen</span>
              <span className="font-bold text-gray-900">{blogStats.avgReadTime} min</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Taux de rebond</span>
              <span className="font-bold text-green-600">{blogStats.bounceRate}%</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Insights Clés</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Award className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Performance Excellente</div>
                <div className="text-sm text-green-700 mt-1">
                  Votre catégorie "{blogStats.topPerformingCategory}" génère 35% du trafic total
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Croissance Positive</div>
                <div className="text-sm text-blue-700 mt-1">
                  +{blogStats.subscriberGrowth}% de nouveaux abonnés ce mois
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-800">Recommandation</div>
                <div className="text-sm text-orange-700 mt-1">
                  Créer plus de contenu IA pour capitaliser sur l'engagement élevé
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-purple-800">Audience Engagée</div>
                <div className="text-sm text-purple-700 mt-1">
                  Taux de lecture complète de 58% (excellent pour le secteur)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}