/**
 * Composant des métriques principales - DONNÉES 100% RÉELLES
 */

import React, { memo } from 'react';
import { InlineSpinner, MetricSkeleton } from './LoadingSpinner';

interface MetricsOverviewProps {
  data: any;
  realTimeData?: any;
  isLoading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = memo(({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  subtitle,
  isLoading = false 
}) => {
  if (isLoading) {
    return <MetricSkeleton />;
  }

  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  const changeIcon = change && change > 0 ? '↗' : change && change < 0 ? '↘' : '→';

  return (
    <div className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${changeColor}`}>
            {changeIcon} {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
        </div>
      )}
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

export const MetricsOverview: React.FC<MetricsOverviewProps> = memo(({ 
  data, 
  realTimeData, 
  isLoading = false 
}) => {
  // Utiliser données temps réel si disponibles, sinon données principales
  const metrics = realTimeData || data;

  const metricsConfig = [
    {
      title: 'Utilisateurs Totaux',
      value: metrics?.totalInteractions || metrics?.total_users || 0,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-blue-500',
      subtitle: 'Sessions uniques'
    },
    {
      title: 'Conversations Actives',
      value: metrics?.active_chats || 0,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-green-500',
      subtitle: 'Dernières 2h'
    },
    {
      title: 'Total Conversations',
      value: metrics?.total_conversations || 0,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: 'bg-purple-500',
      subtitle: 'Toutes interactions'
    },
    {
      title: 'Temps de Réponse',
      value: metrics?.avg_response_time ? `${Math.round(metrics.avg_response_time)}ms` : '0ms',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-500',
      subtitle: 'Moyenne réelle'
    },
    {
      title: 'Taux de Conversion',
      value: `${metrics?.conversion_rate || 0}%`,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-indigo-500',
      subtitle: 'Devis/Sessions'
    },
    {
      title: 'Devis Générés',
      value: metrics?.total_quotes || 0,
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-pink-500',
      subtitle: 'Demandes reçues'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Métriques en Temps Réel
        </h2>
        {isLoading && <InlineSpinner />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsConfig.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            subtitle={metric.subtitle}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Métriques secondaires */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Pages Vues</p>
            <p className="text-xl font-bold text-gray-900">{metrics.blog_views || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Clics CTA</p>
            <p className="text-xl font-bold text-gray-900">{metrics.cta_clicks || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Abonnés Newsletter</p>
            <p className="text-xl font-bold text-gray-900">{metrics.total_subscribers || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Articles Blog</p>
            <p className="text-xl font-bold text-gray-900">{metrics.total_blog_articles || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
});

MetricsOverview.displayName = 'MetricsOverview';

export default MetricsOverview;