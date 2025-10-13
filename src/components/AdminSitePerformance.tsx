import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Smartphone, 
  Monitor,
  Filter,
  Calendar
} from 'lucide-react';

export function AdminSitePerformance() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - replace with real API calls
  const performanceData = {
    avgLoadTime: {
      desktop: 1.2, // seconds
      mobile: 2.4, // seconds
    },
    seoScore: 87, // out of 100
    lighthouseScore: 92, // out of 100
    topPages: [
      { path: '/', views: 1247, loadTime: 1.1 },
      { path: '/services', views: 892, loadTime: 1.3 },
      { path: '/blog', views: 756, loadTime: 1.5 },
      { path: '/contact', views: 634, loadTime: 1.0 },
      { path: '/about', views: 521, loadTime: 1.2 }
    ],
    slowPages: [
      { path: '/blog/ai-conversationnelle', views: 423, loadTime: 4.2 },
      { path: '/services/automatisation', views: 356, loadTime: 3.8 },
      { path: '/resources', views: 287, loadTime: 3.5 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            Performance du Site
          </h2>
          <p className="text-gray-600 mt-1">
            Suivi des performances et optimisation du site
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
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Desktop</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.avgLoadTime.desktop}s</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Mobile</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.avgLoadTime.mobile}s</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Score SEO</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.seoScore}/100</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Lighthouse</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.lighthouseScore}/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Pages */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pages les plus visitées</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Page</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Vues</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Temps de chargement</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.topPages.map((page, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{page.path}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{page.views}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className={`inline-flex items-center ${page.loadTime < 2 ? 'text-green-600' : page.loadTime < 3 ? 'text-orange-600' : 'text-red-600'}`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {page.loadTime}s
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Pages */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Pages lentes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Page</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Vues</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Temps de chargement</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.slowPages.map((page, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{page.path}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{page.views}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className="inline-flex items-center text-red-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {page.loadTime}s
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations d'optimisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Images optimisées</h4>
            <p className="text-sm text-blue-700 mt-1">
              Convertir les images en WebP/AVIF pour réduire la taille de 30-50%.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Mise en cache</h4>
            <p className="text-sm text-green-700 mt-1">
              Implémenter un cache navigateur pour les ressources statiques.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900">Code splitting</h4>
            <p className="text-sm text-orange-700 mt-1">
              Diviser le JavaScript en chunks pour réduire le temps de chargement initial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}