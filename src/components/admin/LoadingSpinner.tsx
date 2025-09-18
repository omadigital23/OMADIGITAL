/**
 * Composant de chargement optimisé pour l'admin
 */

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Chargement...', 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-center max-w-md">{message}</p>
      )}
    </div>
  );
};

/**
 * Spinner inline pour les petites sections
 */
export const InlineSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center ${className}`}>
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
    <span className="text-sm text-gray-600">Chargement...</span>
  </div>
);

/**
 * Skeleton loader pour les cartes métriques
 */
export const MetricSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6 shadow animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
    </div>
    <div className="mt-4">
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

/**
 * Skeleton pour graphiques
 */
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6 shadow animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-end space-x-2">
          <div className={`bg-gray-200 rounded w-8 h-${(i + 1) * 8}`}></div>
          <div className={`bg-gray-200 rounded w-8 h-${(i + 2) * 6}`}></div>
          <div className={`bg-gray-200 rounded w-8 h-${(i + 3) * 4}`}></div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;