import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, Users, Bot, FileText, Smartphone, MapPin, BookOpen, 
  MessageSquare, RefreshCw, Download, X, Check, AlertCircle 
} from 'lucide-react';

export function AdminOverview() {
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Performance faible détectée',
      message: 'Le temps de chargement dépasse 2s sur certaines pages',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    }
  ]);

  const [overviewData] = useState({
    visitors: 1250,
    visitorChange: 12,
    conversions: 3.2,
    conversionChange: 8,
    chatbotSessions: 156
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? {...notification, read: true} : notification
      )
    );
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formattedData = [
    { 
      title: 'Visiteurs cette semaine', 
      value: overviewData.visitors.toLocaleString(), 
      change: `+${overviewData.visitorChange}%`, 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Conversions', 
      value: `${overviewData.conversions}%`, 
      change: `+${overviewData.conversionChange}%`, 
      icon: TrendingUp, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Sessions chatbot', 
      value: overviewData.chatbotSessions.toLocaleString(), 
      change: 'Total cette semaine', 
      icon: MessageSquare, 
      color: 'bg-red-500' 
    }
  ];

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formattedData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-green-600">{metric.change}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">{metric.title}</div>
            </div>
          );
        })}
      </div>

      {notifications.filter(n => !n.read).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map(notification => (
              <div key={notification.id} className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Marquer comme lu
                    </button>
                    <button 
                      onClick={() => dismissNotification(notification.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}