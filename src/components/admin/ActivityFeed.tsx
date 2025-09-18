/**
 * Composant activité récente - DONNÉES 100% RÉELLES
 */

import React, { memo } from 'react';
import { InlineSpinner } from './LoadingSpinner';

interface Activity {
  id: string;
  type: 'conversation' | 'quote' | 'subscription' | 'page_view';
  description: string;
  timestamp: string;
  metadata?: any;
}

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

const ActivityIcon: React.FC<{ type: Activity['type'] }> = memo(({ type }) => {
  const iconProps = "h-5 w-5";
  
  switch (type) {
    case 'conversation':
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className={`${iconProps} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    case 'quote':
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className={`${iconProps} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    case 'subscription':
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className={`${iconProps} text-purple-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case 'page_view':
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className={`${iconProps} text-orange-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className={`${iconProps} text-gray-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
});

ActivityIcon.displayName = 'ActivityIcon';

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  
  return time.toLocaleDateString('fr-FR');
};

const ActivityItem: React.FC<{ activity: Activity }> = memo(({ activity }) => (
  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <ActivityIcon type={activity.type} />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900 truncate">
        {activity.description}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-500">
          {formatTimeAgo(activity.timestamp)}
        </p>
        {activity.metadata && (
          <div className="flex items-center space-x-2">
            {activity.metadata.confidence && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Conf: {Math.round(activity.metadata.confidence * 100)}%
              </span>
            )}
            {activity.metadata.status && (
              <span className={`text-xs px-2 py-1 rounded ${
                activity.metadata.status === 'success' ? 'bg-green-100 text-green-800' :
                activity.metadata.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.metadata.status}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
));

ActivityItem.displayName = 'ActivityItem';

export const ActivityFeed: React.FC<ActivityFeedProps> = memo(({ 
  activities, 
  isLoading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Activité Récente
          </h3>
          {isLoading && <InlineSpinner />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Événements en temps réel
        </p>
      </div>

      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune activité</h3>
            <p className="mt-1 text-sm text-gray-500">
              L'activité récente apparaîtra ici dès qu'il y aura des interactions.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Voir toute l'activité →
          </button>
        </div>
      )}
    </div>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

export default ActivityFeed;