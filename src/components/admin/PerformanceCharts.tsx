/**
 * Graphiques de performance - DONNÉES 100% RÉELLES
 */

import React, { memo } from 'react';
import { ChartSkeleton } from './LoadingSpinner';

interface DailyData {
  date: string;
  conversations: number;
  quotes: number;
  pageViews: number;
  avgResponseTime: number;
}

interface PerformanceChartsProps {
  data: DailyData[];
  isLoading?: boolean;
}

const SimpleLineChart: React.FC<{ data: number[]; labels: string[]; title: string; color: string }> = memo(({ 
  data, 
  labels, 
  title, 
  color 
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
          {/* Grille de fond */}
          <defs>
            <pattern id="grid" width="60" height="24" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 24" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Ligne de données */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 120 - ((value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Points */}
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 300;
            const y = 120 - ((value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="hover:r-4 transition-all cursor-pointer"
              >
                <title>{`${labels[index]}: ${value}`}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* Labels X */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
          {labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>Min: {minValue}</span>
        <span>Max: {maxValue}</span>
        <span>Moy: {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}</span>
      </div>
    </div>
  );
});

SimpleLineChart.displayName = 'SimpleLineChart';

export const PerformanceCharts: React.FC<PerformanceChartsProps> = memo(({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance 7 Jours</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Les données de performance apparaîtront dès qu'il y aura de l'activité.
          </p>
        </div>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const labels = data.map(d => new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }));
  const conversations = data.map(d => d.conversations);
  const quotes = data.map(d => d.quotes);
  const pageViews = data.map(d => d.pageViews);
  const responseTimes = data.map(d => d.avgResponseTime);

  // Calculs statistiques
  const totalConversations = conversations.reduce((a, b) => a + b, 0);
  const totalQuotes = quotes.reduce((a, b) => a + b, 0);
  const totalPageViews = pageViews.reduce((a, b) => a + b, 0);
  const avgResponseTime = responseTimes.filter(t => t > 0).reduce((a, b) => a + b, 0) / responseTimes.filter(t => t > 0).length || 0;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Performance 7 Jours</h3>
        <p className="text-sm text-gray-500 mt-1">Données en temps réel</p>
      </div>

      {/* Résumé des métriques */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalConversations}</p>
            <p className="text-sm text-gray-600">Conversations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{totalQuotes}</p>
            <p className="text-sm text-gray-600">Devis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{totalPageViews}</p>
            <p className="text-sm text-gray-600">Pages Vues</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{Math.round(avgResponseTime)}ms</p>
            <p className="text-sm text-gray-600">Temps Moyen</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SimpleLineChart
            data={conversations}
            labels={labels}
            title="Conversations Quotidiennes"
            color="#3b82f6"
          />
          
          <SimpleLineChart
            data={quotes}
            labels={labels}
            title="Devis Générés"
            color="#10b981"
          />
          
          <SimpleLineChart
            data={pageViews}
            labels={labels}
            title="Pages Vues"
            color="#8b5cf6"
          />
          
          <SimpleLineChart
            data={responseTimes.map(t => t || 0)}
            labels={labels}
            title="Temps de Réponse (ms)"
            color="#f59e0b"
          />
        </div>
      </div>
    </div>
  );
});

PerformanceCharts.displayName = 'PerformanceCharts';

export default PerformanceCharts;