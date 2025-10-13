import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  className?: string;
}

/**
 * Memoized stat card component for better rendering performance
 */
export const MemoizedStatCard = memo(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  className = ''
}: StatCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className={`text-sm ${change.includes('+') ? 'text-green-600' : change.includes('-') ? 'text-red-600' : 'text-gray-500'}`}>
            {change}
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600">{title}</div>
    </div>
  );
});

MemoizedStatCard.displayName = 'MemoizedStatCard';