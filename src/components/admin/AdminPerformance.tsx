import React, { useState, useEffect } from 'react';
import { Zap, AlertCircle } from 'lucide-react';

export function AdminPerformance() {
  const [isClient, setIsClient] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    uptime: '99.9%',
    loadTime: '1.2s',
    coreWebVitals: 'Good/Good',
    errorRate: '0.1%'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const fetchPerformanceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/admin/analytics?period=7d');
        if (!response.ok) {
          throw new Error('Failed to fetch performance data');
        }
        const data = await response.json();
        
        setPerformanceData({
          uptime: data.performance?.uptime || '99.9%',
          loadTime: data.performance?.avgLoadTime || '1.2s',
          coreWebVitals: data.performance?.coreWebVitals ? 
            `${data.performance.coreWebVitals.lcpRating}/${data.performance.coreWebVitals.clsRating}` : 
            'Good/Good',
          errorRate: data.performance?.errorRate || '0.1%'
        });
      } catch (err) {
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformanceData();
  }, [isClient]);

  if (loading && !isClient) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center py-12">
        <Zap className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance Technique</h2>
        <p className="text-gray-600 mb-6">
          Métriques de performance et optimisation du site
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-emerald-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 mb-2">{performanceData.uptime}</div>
            <div className="text-gray-700">Uptime</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">{performanceData.loadTime}</div>
            <div className="text-gray-700">Temps de chargement</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">{performanceData.coreWebVitals}</div>
            <div className="text-gray-700">Core Web Vitals</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">{performanceData.errorRate}</div>
            <div className="text-gray-700">Taux d'erreur</div>
          </div>
        </div>
        <div className="mt-8">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors">
            Voir les rapports détaillés
          </button>
        </div>
      </div>
    </div>
  );
}