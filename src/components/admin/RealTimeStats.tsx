import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, TrendingUp, Activity, 
  Globe, Smartphone, Clock, Target, Zap 
} from 'lucide-react';

interface RealTimeData {
  onlineUsers: number;
  activeChats: number;
  todayConversations: number;
  todayQuotes: number;
  responseTime: number;
  conversionRate: number;
  topCountries: CountryData[];
  deviceStats: DeviceData[];
  hourlyActivity: HourlyData[];
}

interface CountryData {
  country: string;
  users: number;
  flag: string;
}

interface DeviceData {
  device: string;
  percentage: number;
  count: number;
}

interface HourlyData {
  hour: number;
  activity: number;
}

export function RealTimeStats() {
  const [data, setData] = useState<RealTimeData>({
    onlineUsers: 0,
    activeChats: 0,
    todayConversations: 0,
    todayQuotes: 0,
    responseTime: 0,
    conversionRate: 0,
    topCountries: [],
    deviceStats: [],
    hourlyActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/admin/realtime-stats');
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données temps réel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Mise à jour toutes les 10 secondes
    const interval = setInterval(fetchRealTimeData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header temps réel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-semibold text-gray-900">Statistiques en Temps Réel</h2>
        </div>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      </div>

      {/* Métriques principales temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeCard
          title="Utilisateurs en ligne"
          value={data.onlineUsers}
          icon={Users}
          color="bg-green-500"
          pulse={true}
        />
        <RealTimeCard
          title="Chats actifs"
          value={data.activeChats}
          icon={MessageSquare}
          color="bg-blue-500"
          pulse={data.activeChats > 0}
        />
        <RealTimeCard
          title="Conversations aujourd'hui"
          value={data.todayConversations}
          icon={Activity}
          color="bg-purple-500"
        />
        <RealTimeCard
          title="Temps de réponse"
          value={`${data.responseTime}ms`}
          icon={Zap}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité par heure */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité par Heure (Aujourd'hui)</h3>
          <div className="space-y-2">
            {data.hourlyActivity.map((hour, index) => {
              const maxActivity = Math.max(...data.hourlyActivity.map(h => h.activity));
              const percentage = maxActivity > 0 ? (hour.activity / maxActivity) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 text-xs text-gray-500">
                    {hour.hour.toString().padStart(2, '0')}h
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs text-gray-700 text-right">
                    {hour.activity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top pays */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pays</h3>
          <div className="space-y-3">
            {data.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium text-gray-900">{country.country}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{country.users}</div>
                  <div className="text-xs text-gray-500">utilisateurs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques des appareils */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Appareil</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.deviceStats.map((device, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-2">
                {device.device === 'Mobile' && <Smartphone className="w-8 h-8 text-blue-500" />}
                {device.device === 'Desktop' && <Globe className="w-8 h-8 text-green-500" />}
                {device.device === 'Tablet' && <Target className="w-8 h-8 text-purple-500" />}
              </div>
              <div className="text-2xl font-bold text-gray-900">{device.percentage}%</div>
              <div className="text-sm text-gray-600">{device.device}</div>
              <div className="text-xs text-gray-500">{device.count} utilisateurs</div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Taux de Conversion</div>
              <div className="text-2xl font-bold text-green-600">{data.conversionRate.toFixed(1)}%</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Devis Aujourd'hui</div>
              <div className="text-2xl font-bold text-blue-600">{data.todayQuotes}</div>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Temps Moyen Session</div>
              <div className="text-2xl font-bold text-purple-600">4m 32s</div>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface RealTimeCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  pulse?: boolean;
}

function RealTimeCard({ title, value, icon: Icon, color, pulse = false }: RealTimeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center ${pulse ? 'animate-pulse' : ''}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{title}</div>
        </div>
      </div>
    </div>
  );
}