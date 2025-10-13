import React, { useState } from 'react';
import { useRealPerformance } from '../hooks/useRealPerformance';
import { Zap, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function AdminRealtimePerformance() {
  const [timeRange, setTimeRange] = useState('1h');
  const performanceData = useRealPerformance(timeRange);

  // Handle loading state
  if (performanceData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Handle error state
  if (performanceData.error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{performanceData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Handle empty data state
  if (!performanceData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-600">Les données de performance ne sont pas disponibles pour le moment.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Performance en temps réel</h2>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1h">Dernière heure</option>
            <option value="24h">Dernières 24 heures</option>
            <option value="7d">7 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Temps de réponse</div>
              <div className="text-2xl font-bold text-gray-900">
                {performanceData.current.responseTime > 0 ? `${performanceData.current.responseTime}ms` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Uptime</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.current.uptime}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Requêtes/min</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.current.requestsPerMinute}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Taux d'erreur</div>
              <div className="text-2xl font-bold text-gray-900">{performanceData.current.errorRate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps de réponse ({timeRange === '1h' ? '30 dernières minutes' : timeRange === '24h' ? '24 dernières heures' : '7 derniers jours'})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData.responseTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis unit="ms" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trafic ({timeRange === '1h' ? 'Dernière heure' : timeRange === '24h' ? 'Dernières 24 heures' : '7 derniers jours'})</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData.trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={timeRange === '1h' ? 'time' : timeRange === '24h' ? 'date' : 'period'} 
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#3B82F6" name="Visites" />
                <Bar dataKey="uniqueVisitors" fill="#10B981" name="Visiteurs uniques" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux d'erreur par code HTTP</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData.errorRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {performanceData.errorRateData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Web Vitals */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Web Vitals</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Largest Contentful Paint (LCP)</span>
                <span className="text-sm font-medium text-gray-900">
                  {performanceData.webVitals['lcp'] !== 'N/A' ? performanceData.webVitals['lcp'] : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: performanceData.webVitals['lcp'] !== 'N/A' && performanceData.webVitals['lcp'] !== '' ? 
                      `${Math.min(100, (parseFloat(performanceData.webVitals['lcp']) / 2500) * 100)}%` : '0%' 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Objectif: &lt; 2.5s</div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">First Input Delay (FID)</span>
                <span className="text-sm font-medium text-gray-900">
                  {performanceData.webVitals['fid'] !== 'N/A' ? performanceData.webVitals['fid'] : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: performanceData.webVitals['fid'] !== 'N/A' && performanceData.webVitals['fid'] !== '' ? 
                      `${Math.min(100, (parseFloat(performanceData.webVitals['fid']) / 100) * 100)}%` : '0%' 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Objectif: &lt; 100ms</div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Cumulative Layout Shift (CLS)</span>
                <span className="text-sm font-medium text-gray-900">
                  {performanceData.webVitals['cls'] !== 'N/A' ? performanceData.webVitals['cls'] : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ 
                    width: performanceData.webVitals['cls'] !== 'N/A' && performanceData.webVitals['cls'] !== '' ? 
                      `${Math.min(100, (parseFloat(performanceData.webVitals['cls']) / 0.1) * 100)}%` : '0%' 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Objectif: &lt; 0.1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}