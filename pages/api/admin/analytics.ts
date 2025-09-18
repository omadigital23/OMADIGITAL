import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period, start, end } = req.query;
    
    // Calculate date range based on parameters
    const endDate = end ? new Date(end as string) : new Date();
    let startDate = start ? new Date(start as string) : new Date();
    
    if (!start && !end) {
      // Calculate date range based on period only if start/end not provided
      switch (period) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
    }

    // Fetch chatbot interactions data
    const { data: chatInteractions, error: chatError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .gte('"timestamp"', startDate.toISOString())
      .lte('"timestamp"', endDate.toISOString())
      .order('"timestamp"', { ascending: true });

    if (chatError) {
      console.error('Error fetching chat interactions:', chatError);
    }

    // Fetch analytics events data
    const { data: analyticsEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Error fetching analytics events:', eventsError);
    }

    // Fetch A/B test results
    const { data: abTestResults, error: abTestError } = await supabase
      .from('ab_test_results')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });

    if (abTestError) {
      console.error('Error fetching A/B test results:', abTestError);
    }

    // Fetch quote submissions
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError);
    }

    // Fetch web vitals data for performance metrics
    const { data: webVitals, error: webVitalsError } = await supabase
      .from('web_vitals')
      .select('metric_name, metric_value, metric_rating, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (webVitalsError) {
      console.error('Error fetching web vitals:', webVitalsError);
    }

    // Process and aggregate the data
    const processedData = processAnalyticsData(
      chatInteractions || [],
      analyticsEvents || [],
      abTestResults || [],
      quotes || [],
      webVitals || [],
      startDate,
      endDate
    );

    res.status(200).json(processedData);
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process and aggregate analytics data - simplified to avoid errors
function processAnalyticsData(
  chatInteractions: any[],
  analyticsEvents: any[],
  abTestResults: any[],
  quotes: any[],
  webVitals: any[],
  startDate: Date,
  endDate: Date
) {
  // Calculate chat statistics
  const totalChats = chatInteractions.length;
  const voiceChats = chatInteractions.filter(interaction => 
    interaction.input_method === 'voice'
  ).length;
  const textChats = totalChats - voiceChats;
  
  // Calculate average response time
  const avgResponseTime = totalChats > 0 
    ? chatInteractions.reduce((sum, interaction) => sum + (interaction.response_time || 0), 0) / totalChats
    : 0;

  // Calculate conversion rate from A/B tests
  const totalAbTests = abTestResults.length;
  const convertedAbTests = abTestResults.filter(result => result.conversion).length;
  const conversionRate = totalAbTests > 0 ? (convertedAbTests / totalAbTests) * 100 : 0;

  // Calculate Core Web Vitals averages
  const lcpValues = webVitals.filter(vital => vital.metric_name === 'LCP').map(vital => vital.metric_value);
  const fidValues = webVitals.filter(vital => vital.metric_name === 'FID').map(vital => vital.metric_value);
  const clsValues = webVitals.filter(vital => vital.metric_name === 'CLS').map(vital => vital.metric_value);
  const ttfbValues = webVitals.filter(vital => vital.metric_name === 'TTFB').map(vital => vital.metric_value);

  const avgLCP = lcpValues.length > 0 ? lcpValues.reduce((sum, val) => sum + val, 0) / lcpValues.length : 0;
  const avgFID = fidValues.length > 0 ? fidValues.reduce((sum, val) => sum + val, 0) / fidValues.length : 0;
  const avgCLS = clsValues.length > 0 ? clsValues.reduce((sum, val) => sum + val, 0) / clsValues.length : 0;
  const avgTTFB = ttfbValues.length > 0 ? ttfbValues.reduce((sum, val) => sum + val, 0) / ttfbValues.length : 0;

  // Calculate performance ratings based on thresholds
  const getPerformanceRating = (value: number, metric: string): string => {
    const thresholds: Record<string, { good: number, needsImprovement: number }> = {
      'LCP': { good: 2500, needsImprovement: 4000 },
      'FID': { good: 100, needsImprovement: 300 },
      'CLS': { good: 0.1, needsImprovement: 0.25 },
      'TTFB': { good: 800, needsImprovement: 1800 }
    };

    if (value <= thresholds[metric].good) return 'Excellent';
    if (value <= thresholds[metric].needsImprovement) return 'Good';
    return 'Poor';
  };

  // Calculate real mobile traffic and location data
  const mobileEvents = analyticsEvents.filter(event => 
    event.device_type === 'mobile'
  );
  
  const dakarEvents = analyticsEvents.filter(event => 
    event.city && event.city.toLowerCase().includes('dakar')
  );
  
  const senegalEvents = analyticsEvents.filter(event => 
    (event.country && event.country.toLowerCase().includes('senegal')) ||
    (event.country && event.country.toLowerCase().includes('sn'))
  );

  // Return data in the format expected by AdminAnalytics component
  return {
    period: `${startDate.toISOString()}-${endDate.toISOString()}`,
    chats: {
      total: totalChats,
      voice: voiceChats,
      text: textChats,
      avgResponseTime: parseFloat(avgResponseTime.toFixed(2))
    },
    performance: {
      uptime: (() => {
        const total = webVitals.length;
        if (total === 0) return '100%';
        const nonPoor = webVitals.filter(v => (v as any).metric_rating && (v as any).metric_rating !== 'poor').length;
        return `${((nonPoor / total) * 100).toFixed(1)}%`;
      })(),
      avgLoadTime: (() => {
        if (avgLCP > 0) return `${Math.round(avgLCP)}ms`;
        if (avgTTFB > 0) return `${Math.round(avgTTFB)}ms`;
        return '0ms';
      })(),
      errorRate: (() => {
        const total = webVitals.length;
        if (total === 0) return '0%';
        const poor = webVitals.filter(v => (v as any).metric_rating === 'poor').length;
        return `${((poor / total) * 100).toFixed(2)}%`;
      })(),
      coreWebVitals: {
        lcp: parseFloat(avgLCP.toFixed(1)),
        fid: parseFloat(avgFID.toFixed(0)),
        cls: parseFloat(avgCLS.toFixed(2)),
        ttfb: parseFloat(avgTTFB.toFixed(0)),
        lcpRating: getPerformanceRating(avgLCP, 'LCP'),
        fidRating: getPerformanceRating(avgFID, 'FID'),
        clsRating: getPerformanceRating(avgCLS, 'CLS'),
        ttfbRating: getPerformanceRating(avgTTFB, 'TTFB')
      }
    },
    generated: new Date().toISOString(),
    // Additional data that could be used in the future
    analyticsEvents: analyticsEvents.length,
    mobileTraffic: mobileEvents.length, // Real mobile traffic data
    localVisitors: dakarEvents.length > 0 ? dakarEvents.length : senegalEvents.length, // Real local visitor data
    abTestResults,
    abTestConversions: convertedAbTests,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    quotesSubmitted: quotes.length,
    webVitalsCount: webVitals.length
  };
}