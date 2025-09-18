import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role used server-side behind requireAdminApi
const supabase = createClient(supabaseUrl, supabaseKey);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);

    // Récupérer les données en parallèle
    const [
      recentConversationsResult,
      todayConversationsResult,
      todayQuotesResult,
      recentActivityResult,
      analyticsEventsResult
    ] = await Promise.all([
      // Conversations des 30 dernières minutes (utilisateurs "en ligne")
      supabase
        .from('chatbot_interactions')
        .select('session_id, created_at')
        .gte('created_at', last30Minutes.toISOString()),
      
      // Conversations d'aujourd'hui
      supabase
        .from('chatbot_interactions')
        .select('*')
        .gte('created_at', todayStart.toISOString()),
      
      // Devis d'aujourd'hui
      supabase
        .from('quotes')
        .select('*')
        .gte('created_at', todayStart.toISOString()),
      
      // Activité récente pour calculer les chats actifs
      supabase
        .from('chatbot_interactions')
        .select('session_id, created_at, response_time_ms')
        .gte('created_at', new Date(now.getTime() - 5 * 60 * 1000).toISOString()), // 5 dernières minutes

      // Analytics events for geo/device (last 30 minutes)
      supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', last30Minutes.toISOString())
    ]);

    // Calculer les utilisateurs en ligne (sessions uniques des 30 dernières minutes)
    const onlineUsers = new Set(
      recentConversationsResult.data?.map(conv => conv.session_id) || []
    ).size;

    // Calculer les chats actifs (sessions des 5 dernières minutes)
    const activeChats = new Set(
      recentActivityResult.data?.map(conv => conv.session_id) || []
    ).size;

    // Conversations d'aujourd'hui
    const todayConversations = todayConversationsResult.data?.length || 0;
    
    // Devis d'aujourd'hui
    const todayQuotes = todayQuotesResult.data?.length || 0;

    // Temps de réponse réel (médiane des 30 dernières minutes si dispo, sinon moyenne des 5 dernières minutes)
    const recentRt = (recentConversationsResult.data || [])
      .map((r: any) => r.response_time_ms)
      .filter((v: any) => typeof v === 'number' && v >= 0);

    const activityRt = (recentActivityResult.data || [])
      .map((r: any) => r.response_time_ms)
      .filter((v: any) => typeof v === 'number' && v >= 0);

    const median = (arr: number[]) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    };

    let responseTime = 0;
    if (recentRt.length) {
      responseTime = median(recentRt);
    } else if (activityRt.length) {
      responseTime = Math.round(activityRt.reduce((a, b) => a + b, 0) / activityRt.length);
    }
    // Taux de conversion
    const conversionRate = todayConversations > 0 ? (todayQuotes / todayConversations) * 100 : 0;

    // Activité par heure (aujourd'hui)
    const hourlyActivity = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(todayStart);
      hourStart.setHours(hour);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour + 1);

      const hourConversations = todayConversationsResult.data?.filter(conv => {
        const convDate = new Date(conv.created_at);
        return convDate >= hourStart && convDate < hourEnd;
      }).length || 0;

      hourlyActivity.push({
        hour,
        activity: hourConversations
      });
    }

    // Top pays réel et répartition par appareils à partir de analytics_events
    const events = analyticsEventsResult.data || [];

    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};

    for (const ev of events) {
      const country = (ev.country || ev.metadata?.country || '').toString().trim();
      const device = (ev.device_type || ev.metadata?.device_type || '').toString().trim();
      if (country) countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (device) deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    }

    const sortedCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCountries = sortedCountries.map(([country, users]) => ({
      country,
      users,
      flag: ''
    }));

    const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 1;
    const deviceStats = Object.entries(deviceCounts).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      percentage: Math.round((count / totalDevices) * 100),
      count
    }));

    const realTimeData = {
      onlineUsers,
      activeChats,
      todayConversations,
      todayQuotes,
      responseTime,
      conversionRate,
      topCountries,
      deviceStats,
      hourlyActivity
    };

    res.status(200).json(realTimeData);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques temps réel:', error);
    
    // Données par défaut en cas d'erreur
    const fallbackData = {
      onlineUsers: 0,
      activeChats: 0,
      todayConversations: 0,
      todayQuotes: 0,
      responseTime: 0,
      conversionRate: 0,
      topCountries: [],
      deviceStats: [
        { device: 'Mobile', percentage: 65, count: 0 },
        { device: 'Desktop', percentage: 25, count: 0 },
        { device: 'Tablet', percentage: 10, count: 0 }
      ],
      hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, activity: 0 }))
    };

    res.status(200).json(fallbackData);
  }
});