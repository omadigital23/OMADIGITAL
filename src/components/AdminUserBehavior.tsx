import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  MapPin, 
  Filter,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

export function AdminUserBehavior() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - replace with real API calls
  const behaviorData = {
    uniqueVisitors: 5423,
    pageViews: 12456,
    articlesRead: 3247,
    conversionRate: 4.2, // percentage
    topConversions: [
      { source: 'Formulaire contact', conversions: 127, rate: 3.8 },
      { source: 'WhatsApp', conversions: 98, rate: 5.2 },
      { source: 'Demande démo', conversions: 86, rate: 7.1 }
    ],
    visitorLocations: [
      { country: 'Sénégal', visitors: 3247, percentage: 60 },
      { country: 'Maroc', visitors: 1562, percentage: 29 },
      { country: 'France', visitors: 342, percentage: 6 },
      { country: 'Côte d\'Ivoire', visitors: 187, percentage: 3 },
      { country: 'Mali', visitors: 87, percentage: 2 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" />
            Comportement des Utilisateurs
          </h2>
          <p className="text-gray-600 mt-1">
            Analyse des comportements et tendances des visiteurs
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
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Visiteurs uniques</div>
              <div className="text-2xl font-bold text-gray-900">{behaviorData.uniqueVisitors.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Pages vues</div>
              <div className="text-2xl font-bold text-gray-900">{behaviorData.pageViews.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Articles lus</div>
              <div className="text-2xl font-bold text-gray-900">{behaviorData.articlesRead.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Taux de conversion</div>
              <div className="text-2xl font-bold text-gray-900">{behaviorData.conversionRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Sources */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources de conversion</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Répartition des conversions</p>
              <p className="text-sm text-gray-400 mt-2">(Données simulées)</p>
            </div>
          </div>
        </div>

        {/* Visitor Locations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Localisation des visiteurs
          </h3>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Répartition géographique</p>
              <p className="text-sm text-gray-400 mt-2">(Données simulées)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Conversions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilleures conversions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Source</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Conversions</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Taux</th>
                </tr>
              </thead>
              <tbody>
                {behaviorData.topConversions.map((conversion, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{conversion.source}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{conversion.conversions}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{conversion.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visitor Locations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation des visiteurs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Pays</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Visiteurs</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {behaviorData.visitorLocations.map((location, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{location.country}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{location.visitors.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{location.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights comportementaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Navigation mobile</h4>
            <p className="text-sm text-blue-700 mt-1">
              65% des visiteurs utilisent un appareil mobile. Optimisez l'expérience mobile.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Contenu populaire</h4>
            <p className="text-sm text-green-700 mt-1">
              Les articles sur l'IA conversationnelle ont un taux de lecture de 87%.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900">Taux de rebond</h4>
            <p className="text-sm text-orange-700 mt-1">
              La page d'accueil a un taux de rebond de 42%, ce qui est acceptable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}