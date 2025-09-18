/**
 * Hook optimisé pour données RÉELLES dashboard - ZÉRO simulation
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types pour données réelles
interface RealDashboardMetrics {
  totalInteractions: number;
  uniqueSessions: number;
  avgResponseTime: number;
  totalQuotes: number;
  totalSubscribers: number;
  conversionRate: number;
  recentActivity: RealActivity[];
  topPages: RealPageView[];
  dailyPerformance: RealDailyData[];
}

interface RealActivity {
  id: string;
  type: 'conversation' | 'quote' | 'subscription' | 'page_view';
  description: string;
  timestamp: string;
  metadata?: any;
}

interface RealPageView {
  page: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
}

interface RealDailyData {
  date: string;
  conversations: number;
  quotes: number;
  pageViews: number;
  avgResponseTime: number;
}

/**
 * Récupération optimisée des données réelles en une seule requête
 */
async function fetchRealDashboardData(periodDays: number = 30): Promise<RealDashboardMetrics> {
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
  
  try {
    // Requête groupée pour optimiser performance
    const [
      interactionsResult,
      quotesResult,
      subscribersResult,
      eventsResult
    ] = await Promise.all([
      // Interactions chatbot RÉELLES
      supabase
        .from('chatbot_interactions')
        .select('session_id, response_time, created_at, message_text, confidence')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false }),
      
      // Devis RÉELS
      supabase
        .from('quotes')
        .select('id, name, company, created_at, status')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false }),
      
      // Abonnés newsletter RÉELS
      supabase
        .from('blog_subscribers')
        .select('id, email, status, created_at, confirmed_at')
        .gte('created_at', startDate)
        .eq('status', 'active'),
      
      // Événements analytics RÉELS
      supabase
        .from('analytics_events')
        .select('event_name, url, timestamp, session_id, event_properties')
        .gte('timestamp', startDate)
        .order('timestamp', { ascending: false })
    ]);

    // Traitement des données RÉELLES uniquement
    const interactions = interactionsResult.data || [];
    const quotes = quotesResult.data || [];
    const subscribers = subscribersResult.data || [];
    const events = eventsResult.data || [];

    // Calculs basés sur données réelles
    const uniqueSessions = new Set(interactions.map(i => i.session_id)).size;
    const avgResponseTime = interactions.length > 0 
      ? interactions
          .filter(i => i.response_time)
          .reduce((sum, i) => sum + (i.response_time || 0), 0) / interactions.filter(i => i.response_time).length
      : 0;

    const conversionRate = uniqueSessions > 0 ? (quotes.length / uniqueSessions) * 100 : 0;

    // Activité récente RÉELLE
    const recentActivity: RealActivity[] = [];

    // Ajouter interactions récentes
    interactions.slice(0, 5).forEach(interaction => {
      recentActivity.push({
        id: `interaction_${interaction.session_id}`,
        type: 'conversation',
        description: `Conversation: "${interaction.message_text?.substring(0, 50) || 'Message'}..."`,
        timestamp: interaction.created_at,
        metadata: { confidence: interaction.confidence, responseTime: interaction.response_time }
      });
    });

    // Ajouter devis récents
    quotes.slice(0, 3).forEach(quote => {
      recentActivity.push({
        id: `quote_${quote.id}`,
        type: 'quote',
        description: `Devis: ${quote.company || quote.name} (${quote.status})`,
        timestamp: quote.created_at,
        metadata: { status: quote.status }
      });
    });

    // Ajouter abonnements récents
    subscribers.slice(0, 2).forEach(sub => {
      recentActivity.push({
        id: `sub_${sub.id}`,
        type: 'subscription',
        description: `Nouvel abonné: ${sub.email}`,
        timestamp: sub.created_at,
        metadata: { confirmed: !!sub.confirmed_at }
      });
    });

    // Ajouter événements récents
    events.slice(0, 5).forEach(event => {
      recentActivity.push({
        id: `event_${event.timestamp}`,
        type: 'page_view',
        description: `${event.event_name}: ${event.url || 'Page inconnue'}`,
        timestamp: event.timestamp,
        metadata: event.event_properties
      });
    });

    // Trier l'activité par timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pages populaires RÉELLES depuis analytics
    const pageViewsMap = new Map<string, { views: number; sessions: Set<string>; totalTime: number }>();
    
    events.forEach(event => {
      if (event.event_name === 'page_view' && event.url) {
        const current = pageViewsMap.get(event.url) || { views: 0, sessions: new Set(), totalTime: 0 };
        current.views += 1;
        current.sessions.add(event.session_id);
        // Temps sur page depuis les propriétés s'il existe
        if (event.event_properties?.timeOnPage) {
          current.totalTime += event.event_properties.timeOnPage;
        }
        pageViewsMap.set(event.url, current);
      }
    });

    const topPages: RealPageView[] = Array.from(pageViewsMap.entries())
      .map(([page, data]) => ({
        page,
        views: data.views,
        uniqueVisitors: data.sessions.size,
        avgTimeOnPage: data.views > 0 ? data.totalTime / data.views : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Performance quotidienne RÉELLE
    const dailyData = new Map<string, { conversations: Set<string>; quotes: number; pageViews: number; responseTimes: number[] }>();

    // Grouper par jour
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData.set(dateKey, { conversations: new Set(), quotes: 0, pageViews: 0, responseTimes: [] });
    }

    // Traiter interactions par jour
    interactions.forEach(interaction => {
      const dateKey = new Date(interaction.created_at).toISOString().split('T')[0];
      const dayData = dailyData.get(dateKey);
      if (dayData) {
        dayData.conversations.add(interaction.session_id);
        if (interaction.response_time) {
          dayData.responseTimes.push(interaction.response_time);
        }
      }
    });

    // Traiter devis par jour
    quotes.forEach(quote => {
      const dateKey = new Date(quote.created_at).toISOString().split('T')[0];
      const dayData = dailyData.get(dateKey);
      if (dayData) {
        dayData.quotes += 1;
      }
    });

    // Traiter page views par jour
    events.forEach(event => {
      if (event.event_name === 'page_view') {
        const dateKey = new Date(event.timestamp).toISOString().split('T')[0];
        const dayData = dailyData.get(dateKey);
        if (dayData) {
          dayData.pageViews += 1;
        }
      }
    });

    const dailyPerformance: RealDailyData[] = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date: new Date(date).toISOString(),
        conversations: data.conversations.size,
        quotes: data.quotes,
        pageViews: data.pageViews,
        avgResponseTime: data.responseTimes.length > 0 
          ? data.responseTimes.reduce((sum, time) => sum + time, 0) / data.responseTimes.length 
          : 0
      }));

    return {
      totalInteractions: interactions.length,
      uniqueSessions,
      avgResponseTime,
      totalQuotes: quotes.length,
      totalSubscribers: subscribers.length,
      conversionRate,
      recentActivity: recentActivity.slice(0, 10),
      topPages,
      dailyPerformance
    };

  } catch (error) {
    console.error('Erreur récupération données réelles:', error);
    // En cas d'erreur, retourner structure vide mais réelle
    return {
      totalInteractions: 0,
      uniqueSessions: 0,
      avgResponseTime: 0,
      totalQuotes: 0,
      totalSubscribers: 0,
      conversionRate: 0,
      recentActivity: [],
      topPages: [],
      dailyPerformance: []
    };
  }
}

/**
 * Hook principal pour données dashboard réelles avec cache optimisé
 */
export const useRealDashboardData = (periodDays: number = 30) => {
  return useQuery({
    queryKey: ['real-dashboard-data', periodDays],
    queryFn: () => fetchRealDashboardData(periodDays),
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
    refetchInterval: 30 * 1000, // Refresh 30 secondes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook spécialisé pour métriques temps réel
 */
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['real-time-metrics'],
    queryFn: () => fetchRealDashboardData(1), // Dernière 24h
    staleTime: 30 * 1000, // Cache 30 secondes
    refetchInterval: 10 * 1000, // Refresh 10 secondes
  });
};