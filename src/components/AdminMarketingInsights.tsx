import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Eye, 
  MousePointerClick, 
  Heart, 
  Share2, 
  Filter,
  Calendar,
  MapPin
} from 'lucide-react';

export function AdminMarketingInsights() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - replace with real API calls
  const marketingData = {
    topArticles: [
      { title: 'L\'IA Conversationnelle : L\'Avenir du Service Client au Sénégal', views: 1247, clicks: 142, shares: 89 },
      { title: 'Sites Web Ultra-Rapides : Guide Complet pour PME Dakaroises', views: 892, clicks: 98, shares: 67 },
      { title: 'Automatisation WhatsApp pour Restaurants', views: 756, clicks: 76, shares: 54 },
      { title: 'Transformation Digitale des PME Sénégalaises', views: 634, clicks: 65, shares: 42 },
      { title: 'ROI de l\'Automatisation Business', views: 521, clicks: 42, shares: 31 }
    ],
    topServices: [
      { name: 'Chatbot IA', clicks: 247, conversions: 89 },
      { name: 'Sites Web Ultra-Rapides', clicks: 189, conversions: 67 },
      { name: 'Automatisation WhatsApp', clicks: 156, conversions: 54 },
      { name: 'Stratégie Digitale', clicks: 134, conversions: 42 },
      { name: 'Analytics & Reporting', clicks: 98, conversions: 31 }
    ],
    topCTAs: [
      { text: 'Demander une démo', clicks: 142, conversion: 28.4 },
      { text: 'Contactez-nous', clicks: 98, conversion: 19.6 },
      { text: 'WhatsApp', clicks: 76, conversion: 15.2 },
      { text: 'Nos services', clicks: 65, conversion: 13.0 },
      { text: 'Blog', clicks: 42, conversion: 8.4 }
    ],
    leadsByLocation: [
      { location: 'Dakar, Sénégal', leads: 142, conversion: 12.3 },
      { location: 'Casablanca, Maroc', leads: 98, conversion: 9.8 },
      { location: 'Thiès, Sénégal', leads: 76, conversion: 11.2 },
      { location: 'Saint-Louis, Sénégal', leads: 54, conversion: 8.7 },
      { location: 'Rabat, Maroc', leads: 42, conversion: 7.6 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Insights Marketing
          </h2>
          <p className="text-gray-600 mt-1">
            Performance des contenus et services marketing
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Articles les plus lus</div>
              <div className="text-2xl font-bold text-gray-900">{marketingData.topArticles[0].views}</div>
              <div className="text-sm text-gray-600">"{marketingData.topArticles[0].title.substring(0, 30)}..."</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">CTA les plus efficaces</div>
              <div className="text-2xl font-bold text-gray-900">{marketingData.topCTAs[0].conversion}%</div>
              <div className="text-sm text-gray-600">"{marketingData.topCTAs[0].text}"</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Service le plus demandé</div>
              <div className="text-2xl font-bold text-gray-900">{marketingData.topServices[0].conversions}</div>
              <div className="text-sm text-gray-600">"{marketingData.topServices[0].name}"</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles et services les plus cliqués</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Article</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Vues</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Clics CTA</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Partages</th>
                </tr>
              </thead>
              <tbody>
                {marketingData.topArticles.map((article, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 max-w-xs truncate">{article.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{article.views}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{article.clicks}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{article.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services les plus demandés</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Service</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Clics</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {marketingData.topServices.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{service.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{service.clicks}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{service.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des CTA</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Texte CTA</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Clics</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Taux de conversion</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {marketingData.topCTAs.map((cta, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{cta.text}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{cta.clicks}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{cta.conversion}%</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${cta.conversion}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leads by Location */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          Leads générés par localisation
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Localisation</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Leads</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Taux de conversion</th>
              </tr>
            </thead>
            <tbody>
              {marketingData.leadsByLocation.map((location, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{location.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{location.leads}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{location.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marketing Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations marketing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Contenu populaire</h4>
            <p className="text-sm text-blue-700 mt-1">
              L'article sur l'IA conversationnelle a généré 142 clics CTA. Créez plus de contenu similaire.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">CTA optimisés</h4>
            <p className="text-sm text-green-700 mt-1">
              Le CTA "Demander une démo" a un taux de conversion de 28.4%. Utilisez-le davantage.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900">Segmentation géographique</h4>
            <p className="text-sm text-orange-700 mt-1">
              Les visiteurs de Dakar ont un taux de conversion de 12.3%. Ciblez cette région.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}