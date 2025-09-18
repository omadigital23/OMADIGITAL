import { useState, useEffect } from 'react';

export function useRealAnalytics(period = '7d') {
  const [data, setData] = useState({
    visitors: 0,
    sessions: 0,
    conversions: 0,
    conversionRate: 0 as number,
    sessionDuration: 0,
    mobileTraffic: 0,
    localVisitors: 0,
    uptime: '0%',
    loadTime: '0ms',
    errorRate: '0%',
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Récupérer les vraies données analytics
        const analyticsResponse = await fetch(`/api/admin/analytics?period=${period}`);
        const analyticsData = await analyticsResponse.json();

        // Récupérer les vraies données de devis
        const quotesResponse = await fetch('/api/admin/quotes?limit=100');
        const quotesData = await quotesResponse.json();

        // Récupérer les vraies conversations chatbot
        const chatResponse = await fetch('/api/admin/chatbot-conversations?limit=100');
        const chatData = await chatResponse.json();

        // Use real mobile traffic data instead of estimates
        const mobileTraffic = analyticsData.mobileTraffic || 0;
        
        // Use real local visitor data instead of estimates
        const localVisitors = analyticsData.localVisitors || 0;
        
        const realMetrics = {
          visitors: analyticsData.analyticsEvents || 0,
          sessions: analyticsData.chats?.total || 0,
          conversions: quotesData.totalCount || 0,
          conversionRate: quotesData.totalCount > 0 && analyticsData.analyticsEvents > 0 
            ? parseFloat(((quotesData.totalCount / analyticsData.analyticsEvents) * 100).toFixed(1))
            : 0,
          sessionDuration: chatData.conversations?.length > 0 && chatData.conversations[0]?.messages?.length > 0
            ? Math.round(chatData.conversations.reduce((acc: number, conv: any) => {
                // Calculate average message count per conversation as a proxy for session duration
                const messageCount = conv.messages?.length || 0;
                return acc + messageCount;
              }, 0) / chatData.conversations.length)
            : 0,
          mobileTraffic: mobileTraffic || 0,
          localVisitors: localVisitors || 0,
          uptime: analyticsData.performance?.uptime || '0%',
          loadTime: typeof analyticsData.performance?.avgLoadTime === 'string' ? analyticsData.performance.avgLoadTime
            : (typeof analyticsData.performance?.coreWebVitals?.lcp === 'number' ? `${Math.round(analyticsData.performance.coreWebVitals.lcp)}ms` : '0ms'),
          errorRate: typeof analyticsData.performance?.errorRate === 'string' ? analyticsData.performance.errorRate : '0%',
          loading: false,
          error: null
        };

        setData(realMetrics);
      } catch (error: unknown) {
        setData(prev => ({ ...prev, loading: false, error: (error as Error).message || 'Unknown error' }));
      }
    };

    fetchRealData();
  }, [period]);

  return data;
}