import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Target, Clock, Award, AlertTriangle 
} from 'lucide-react';

interface ExecutiveData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  customers: {
    total: number;
    new: number;
    retention: number;
  };
  performance: {
    conversionRate: number;
    avgResponseTime: number;
    satisfaction: number;
  };
  goals: {
    monthlyTarget: number;
    achieved: number;
    remaining: number;
  };
  insights: string[];
  recommendations: string[];
}

export function ExecutiveSummary() {
  const [data, setData] = useState<ExecutiveData>({
    revenue: { current: 0, previous: 0, change: 0 },
    customers: { total: 0, new: 0, retention: 0 },
    performance: { conversionRate: 0, avgResponseTime: 0, satisfaction: 0 },
    goals: { monthlyTarget: 0, achieved: 0, remaining: 0 },
    insights: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutiveData = async () => {
      try {
        const response = await fetch('/api/admin/executive-summary');
        if (response.ok) {
          const executiveData = await response.json();
          setData(executiveData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du résumé exécutif:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutiveData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé des revenus */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Résumé Exécutif</h2>
            <p className="text-blue-100">Performance globale de la plateforme</p>
          </div>
          <Award className="w-12 h-12 text-blue-200" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Revenus Estimés</span>
            </div>
            <div className="text-2xl font-bold">{data.revenue.current.toLocaleString()}€</div>
            <div className="flex items-center space-x-1 text-sm">
              {data.revenue.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-300" />
              )}
              <span className={data.revenue.change >= 0 ? 'text-green-300' : 'text-red-300'}>
                {data.revenue.change >= 0 ? '+' : ''}{data.revenue.change.toFixed(1)}%
              </span>
              <span className="text-blue-200">vs mois dernier</span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Clients</span>
            </div>
            <div className="text-2xl font-bold">{data.customers.total}</div>
            <div className="text-sm text-blue-200">
              +{data.customers.new} nouveaux ce mois
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Objectif Mensuel</span>
            </div>
            <div className="text-2xl font-bold">
              {((data.goals.achieved / data.goals.monthlyTarget) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-blue-200">
              {data.goals.remaining.toLocaleString()}€ restants
            </div>
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Taux de Conversion</h3>
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {data.performance.conversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            {data.performance.conversionRate >= 5 ? 'Excellent' : 
             data.performance.conversionRate >= 3 ? 'Bon' : 'À améliorer'}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(data.performance.conversionRate * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Temps de Réponse</h3>
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {data.performance.avgResponseTime}ms
          </div>
          <div className="text-sm text-gray-600">
            {data.performance.avgResponseTime <= 500 ? 'Excellent' : 
             data.performance.avgResponseTime <= 1000 ? 'Bon' : 'À optimiser'}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(100 - (data.performance.avgResponseTime / 20), 10)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Satisfaction Client</h3>
            <Award className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {data.performance.satisfaction.toFixed(1)}/5
          </div>
          <div className="text-sm text-gray-600">
            {data.performance.satisfaction >= 4.5 ? 'Excellent' : 
             data.performance.satisfaction >= 4 ? 'Très bon' : 
             data.performance.satisfaction >= 3.5 ? 'Bon' : 'À améliorer'}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(data.performance.satisfaction / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Insights Clés
          </h3>
          <div className="space-y-3">
            {data.insights.length > 0 ? (
              data.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun insight disponible</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Recommandations
          </h3>
          <div className="space-y-3">
            {data.recommendations.length > 0 ? (
              data.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune recommandation</p>
            )}
          </div>
        </div>
      </div>

      {/* Progression vers l'objectif */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression vers l'Objectif Mensuel</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Réalisé: {data.goals.achieved.toLocaleString()}€</span>
            <span>Objectif: {data.goals.monthlyTarget.toLocaleString()}€</span>
          </div>
          <div className="bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((data.goals.achieved / data.goals.monthlyTarget) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0€</span>
            <span>{((data.goals.achieved / data.goals.monthlyTarget) * 100).toFixed(1)}%</span>
            <span>{data.goals.monthlyTarget.toLocaleString()}€</span>
          </div>
        </div>
        
        {data.goals.achieved >= data.goals.monthlyTarget ? (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 font-medium">🎉 Objectif mensuel atteint ! Félicitations !</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800">
              Il reste <strong>{data.goals.remaining.toLocaleString()}€</strong> à réaliser pour atteindre l'objectif mensuel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}