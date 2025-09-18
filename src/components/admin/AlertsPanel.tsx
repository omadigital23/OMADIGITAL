import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Info, 
  Bell, X, Eye, EyeOff, RefreshCw 
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  actionRequired?: boolean;
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [showOnlyActionRequired, setShowOnlyActionRequired] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Actualisation toutes les 30 secondes
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (alertId: string) => {
    try {
      await fetch('/api/admin/alerts/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch('/api/admin/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/alerts/mark-all-read', {
        method: 'POST'
      });
      
      setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    } catch (error) {
      console.error('Erreur lors du marquage global:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBorderColor = (type: string, priority: string) => {
    if (priority === 'critical') return 'border-l-red-600';
    switch (type) {
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-yellow-500';
      case 'success': return 'border-l-green-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const getAlertBgColor = (type: string, read: boolean) => {
    const opacity = read ? '50' : '100';
    switch (type) {
      case 'error': return `bg-red-${opacity}`;
      case 'warning': return `bg-yellow-${opacity}`;
      case 'success': return `bg-green-${opacity}`;
      case 'info': return `bg-blue-${opacity}`;
      default: return `bg-gray-${opacity}`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread' && alert.read) return false;
    if (filter === 'critical' && alert.priority !== 'critical') return false;
    if (showOnlyActionRequired && !alert.actionRequired) return false;
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical' && !alert.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Alertes & Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
          {criticalCount > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {criticalCount} critique{criticalCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAlerts}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex space-x-2">
          {['all', 'unread', 'critical'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === filterType
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filterType === 'all' ? 'Toutes' : 
               filterType === 'unread' ? 'Non lues' : 'Critiques'}
            </button>
          ))}
        </div>
        
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showOnlyActionRequired}
            onChange={(e) => setShowOnlyActionRequired(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Action requise uniquement</span>
        </label>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-l-4 rounded-lg ${getAlertBorderColor(alert.type, alert.priority)} ${
                alert.read ? 'bg-gray-50' : 'bg-white shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {alert.title}
                      </h4>
                      {getPriorityBadge(alert.priority)}
                      {alert.actionRequired && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Action requise
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${alert.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{alert.source}</span>
                      <span>{new Date(alert.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Marquer comme lu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune alerte à afficher</p>
          </div>
        )}
      </div>

      {/* Résumé */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total: {alerts.length} alertes</span>
            <span>Non lues: {unreadCount}</span>
            <span>Critiques: {criticalCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}