import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { alertingSystem } from '../../../src/lib/monitoring/alerting-system';

// Initialize Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
      message?: string;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
      message?: string;
    };
    dataFlow: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      metrics: {
        subscribers: number;
        quotes: number;
        conversations: number;
      };
      message?: string;
    };
  };
  alerts?: any[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'healthy', responseTime: 0 },
      api: { status: 'healthy', responseTime: 0 },
      dataFlow: { 
        status: 'healthy', 
        metrics: { subscribers: 0, quotes: 0, conversations: 0 } 
      }
    }
  };

  try {
    // Database health check
    const dbStartTime = Date.now();
    const { data: dbData, error: dbError } = await supabase
      .from('blog_subscribers')
      .select('count()', { count: 'exact' })
      .limit(1);
    
    result.checks.database.responseTime = Date.now() - dbStartTime;
    
    if (dbError) {
      result.checks.database.status = 'unhealthy';
      result.checks.database.message = `Database error: ${dbError.message}`;
      result.status = 'unhealthy';
    } else {
      result.checks.database.status = 'healthy';
    }

    // API response time check
    const apiStartTime = Date.now();
    const dashboardResponse = await fetch(`${getBaseUrl()}/api/admin/dashboard-metrics`);
    result.checks.api.responseTime = Date.now() - apiStartTime;
    
    await alertingSystem.checkApiResponseTime(
      result.checks.api.responseTime, 
      '/api/admin/dashboard-metrics'
    );
    
    if (!dashboardResponse.ok) {
      result.checks.api.status = 'unhealthy';
      result.checks.api.message = `API error: ${dashboardResponse.status} ${dashboardResponse.statusText}`;
      result.status = 'unhealthy';
    } else {
      result.checks.api.status = 'healthy';
    }

    // Data flow integrity check
    try {
      // Check subscriber count
      const { count: subscriberCount } = await supabase
        .from('blog_subscribers')
        .select('*', { count: 'exact', head: true });
      
      result.checks.dataFlow.metrics.subscribers = subscriberCount || 0;
      
      // Check quote count
      const { count: quoteCount } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });
      
      result.checks.dataFlow.metrics.quotes = quoteCount || 0;
      
      // Check conversation count
      const { count: conversationCount } = await supabase
        .from('chatbot_interactions')
        .select('*', { count: 'exact', head: true });
      
      result.checks.dataFlow.metrics.conversations = conversationCount || 0;
      
      result.checks.dataFlow.status = 'healthy';
    } catch (error) {
      result.checks.dataFlow.status = 'unhealthy';
      result.checks.dataFlow.message = `Data flow error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.status = 'unhealthy';
    }

    // Add recent alerts if any
    const recentAlerts = alertingSystem.getRecentAlerts(1); // Last 1 hour
    if (recentAlerts.length > 0) {
      result.alerts = recentAlerts;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: { status: 'unhealthy', responseTime: 0, message: 'Health check failed' },
        api: { status: 'unhealthy', responseTime: 0, message: 'Health check failed' },
        dataFlow: { status: 'unhealthy', metrics: { subscribers: 0, quotes: 0, conversations: 0 }, message: 'Health check failed' }
      }
    });
  }
}

function getBaseUrl(): string {
  if (process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}`;
  }
  
  if (process.env['NEXT_PUBLIC_SITE_URL']) {
    return process.env['NEXT_PUBLIC_SITE_URL'];
  }
  
  return 'http://localhost:3000';
}