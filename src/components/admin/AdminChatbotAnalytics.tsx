import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { MessageSquare, AlertCircle } from 'lucide-react';

export function AdminChatbotAnalytics() {
  const [isClient, setIsClient] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          limit: '50',
          timeRange
        });
        
        const response = await fetch(`/api/admin/chatbot-conversations?${params}`);
        const data = await response.json();
        
        if (response.ok) {
          setConversations(data.conversations || []);
        } else {
          setError(data.error || 'Failed to fetch conversations');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [isClient, timeRange]);

  const stats = useMemo(() => {
    if (!conversations.length) return { total: 0, converted: 0, conversionRate: 0, avgScore: 0 };
    
    const total = conversations.length;
    const converted = conversations.filter(c => c.is_converted).length;
    const conversionRate = Math.round((converted / total) * 100);
    const avgScore = Math.round(conversations.reduce((sum, c) => sum + (c.lead_score || 0), 0) / total);
    
    return { total, converted, conversionRate, avgScore };
  }, [conversations]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Conversations Chatbot</h2>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="24h">24 heures</option>
          <option value="7d">7 jours</option>
          <option value="30d">30 jours</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total conversations</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
          <div className="text-sm text-gray-600">Converties</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
          <div className="text-sm text-gray-600">Taux de conversion</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.avgScore}</div>
          <div className="text-sm text-gray-600">Score moyen</div>
        </div>
      </div>
      
      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.slice(0, 10).map((conversation) => (
            <div 
              key={conversation.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/admin/chatbot/${conversation.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {conversation.user_id ? `User ${conversation.user_id.substring(0, 8)}` : 'Anonymous User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {conversation.recentMessage ? conversation.recentMessage.content.substring(0, 50) + '...' : 'No messages'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(conversation.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucune conversation récente
        </div>
      )}
    </div>
  );
}