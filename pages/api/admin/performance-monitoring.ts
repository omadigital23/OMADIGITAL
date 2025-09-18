import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../src/utils/adminApiGuard';
import { 
  pageSpeedService, 
  alertService, 
  budgetService, 
  runPerformanceMonitoring,
  PERFORMANCE_THRESHOLDS,
  PERFORMANCE_BUDGETS
} from '../../../src/lib/performance-monitoring';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Performance monitoring API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { action, url, days = '7' } = req.query;

  switch (action) {
    case 'dashboard':
      return await getDashboardData(res);
    
    case 'alerts':
      return await getAlerts(res);
    
    case 'pagespeed':
      if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
      }
      return await getPageSpeedData(res, url as string, parseInt(days as string));
    
    case 'budgets':
      return await getBudgetStatus(res);
    
    case 'trends':
      return await getPerformanceTrends(res, parseInt(days as string));
    
    case 'config':
      return await getConfig(res);
    
    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  const { url, strategy } = req.body;

  switch (action) {
    case 'run-monitoring':
      return await runFullMonitoring(res, url);
    
    case 'pagespeed-analysis':
      if (!url) {
        return res.status(400).json({ error: 'URL required in request body' });
      }
      return await runPageSpeedAnalysis(res, url, strategy || 'mobile');
    
    case 'check-budgets':
      return await runBudgetCheck(res);
    
    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  switch (action) {
    case 'resolve-alert':
      const { alertId } = req.body;
      if (!alertId) {
        return res.status(400).json({ error: 'Alert ID required' });
      }
      await alertService.resolveAlert(alertId);
      return res.status(200).json({ success: true });
    
    case 'update-config':
      return await updateConfig(req, res);
    
    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function getDashboardData(res: NextApiResponse) {
  try {
    // Get latest PageSpeed results
    const { data: latestPageSpeed } = await supabase
      .from('pagespeed_results')
      .select('*')
      .eq('url', 'https://oma-digital.sn')
      .order('timestamp', { ascending: false })
      .limit(2);

    // Get active alerts
    const activeAlerts = await alertService.getActiveAlerts();

    // Get latest budget check
    const { data: latestBudget } = await supabase
      .from('performance_budget_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);

    // Get real user metrics (last 24h)
    const { data: rumMetrics } = await supabase
      .from('real_user_metrics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Calculate aggregated metrics
    const mobileResult = latestPageSpeed?.find(r => r.strategy === 'mobile');
    const desktopResult = latestPageSpeed?.find(r => r.strategy === 'desktop');

    const avgLoadTime = rumMetrics && rumMetrics.length > 0 
      ? rumMetrics.reduce((sum, m) => sum + (m.load_time || 0), 0) / rumMetrics.length 
      : 0;

    const avgLCP = rumMetrics && rumMetrics.length > 0 
      ? rumMetrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / rumMetrics.length 
      : 0;

    const bounceRate = rumMetrics && rumMetrics.length > 0 
      ? (rumMetrics.filter(m => m.bounce).length / rumMetrics.length) * 100 
      : 0;

    res.status(200).json({
      performance: {
        mobile: mobileResult?.performance_score || 0,
        desktop: desktopResult?.performance_score || 0,
        lastUpdated: latestPageSpeed?.[0]?.timestamp || null,
      },
      coreWebVitals: {
        lcp: { 
          value: mobileResult?.lcp || 0, 
          score: getLCPScore(mobileResult?.lcp || 0) 
        },
        fid: { 
          value: mobileResult?.fid || 0, 
          score: getFIDScore(mobileResult?.fid || 0) 
        },
        cls: { 
          value: mobileResult?.cls || 0, 
          score: getCLSScore(mobileResult?.cls || 0) 
        },
        fcp: { 
          value: mobileResult?.fcp || 0, 
          score: getFCPScore(mobileResult?.fcp || 0) 
        },
        ttfb: { 
          value: mobileResult?.ttfb || 0, 
          score: getTTFBScore(mobileResult?.ttfb || 0) 
        },
      },
      alerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.type === 'critical').length,
        warning: activeAlerts.filter(a => a.type === 'warning').length,
        recent: activeAlerts.slice(0, 5),
      },
      budget: {
        status: latestBudget?.[0]?.overall_status || 'unknown',
        violations: latestBudget?.[0]?.violation_count || 0,
        lastCheck: latestBudget?.[0]?.timestamp || null,
      },
      realUserMetrics: {
        avgLoadTime: Math.round(avgLoadTime),
        avgLCP: Math.round(avgLCP),
        bounceRate: Math.round(bounceRate),
        totalSessions: rumMetrics?.length || 0,
        uniqueVisitors: new Set(rumMetrics?.map(m => m.session_id)).size || 0,
      },
      thresholds: PERFORMANCE_THRESHOLDS,
      budgets: PERFORMANCE_BUDGETS,
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
}

async function getAlerts(res: NextApiResponse) {
  try {
    const activeAlerts = await alertService.getActiveAlerts();
    
    // Get alert history (last 30 days)
    const { data: alertHistory } = await supabase
      .from('performance_alerts')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(100);

    res.status(200).json({
      active: activeAlerts,
      history: alertHistory || [],
      summary: {
        totalActive: activeAlerts.length,
        criticalCount: activeAlerts.filter(a => a.type === 'critical').length,
        warningCount: activeAlerts.filter(a => a.type === 'warning').length,
        last24h: alertHistory?.filter(a => 
          new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length || 0,
      }
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw error;
  }
}

async function getPageSpeedData(res: NextApiResponse, url: string, days: number) {
  try {
    const { data: results } = await supabase
      .from('pagespeed_results')
      .select('*')
      .eq('url', url)
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    // Get performance trends
    const { data: trends } = await supabase
      .from('performance_trends')
      .select('*')
      .eq('url', url)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    res.status(200).json({
      results: results || [],
      trends: trends || [],
      summary: {
        totalChecks: results?.length || 0,
        avgMobileScore: results?.filter(r => r.strategy === 'mobile')
          .reduce((sum, r) => sum + r.performance_score, 0) / 
          (results?.filter(r => r.strategy === 'mobile').length || 1),
        avgDesktopScore: results?.filter(r => r.strategy === 'desktop')
          .reduce((sum, r) => sum + r.performance_score, 0) / 
          (results?.filter(r => r.strategy === 'desktop').length || 1),
      }
    });
  } catch (error) {
    console.error('Error getting PageSpeed data:', error);
    throw error;
  }
}

async function getBudgetStatus(res: NextApiResponse) {
  try {
    const { data: budgetHistory } = await supabase
      .from('performance_budget_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(30);

    const latest = budgetHistory?.[0];

    res.status(200).json({
      current: latest || null,
      history: budgetHistory || [],
      budgets: PERFORMANCE_BUDGETS,
      summary: {
        status: latest?.overall_status || 'unknown',
        violations: latest?.violation_count || 0,
        passingRate: budgetHistory ? 
          (budgetHistory.filter(b => b.overall_status === 'passing').length / budgetHistory.length) * 100 : 0,
      }
    });
  } catch (error) {
    console.error('Error getting budget status:', error);
    throw error;
  }
}

async function getPerformanceTrends(res: NextApiResponse, days: number) {
  try {
    const { data: trends } = await supabase
      .from('performance_trends')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    res.status(200).json({
      trends: trends || [],
      period: `${days} days`,
    });
  } catch (error) {
    console.error('Error getting performance trends:', error);
    throw error;
  }
}

async function getConfig(res: NextApiResponse) {
  try {
    const { data: config } = await supabase
      .from('performance_config')
      .select('*');

    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>) || {};

    res.status(200).json({
      config: configMap,
      thresholds: PERFORMANCE_THRESHOLDS,
      budgets: PERFORMANCE_BUDGETS,
    });
  } catch (error) {
    console.error('Error getting config:', error);
    throw error;
  }
}

async function runFullMonitoring(res: NextApiResponse, url: string = 'https://oma-digital.sn') {
  try {
    const results = await runPerformanceMonitoring(url);
    
    // Store PageSpeed results
    const mobileResult = await pageSpeedService.analyzeUrl(url, 'mobile');
    const desktopResult = await pageSpeedService.analyzeUrl(url, 'desktop');

    await Promise.all([
      storePageSpeedResult(mobileResult, 'mobile'),
      storePageSpeedResult(desktopResult, 'desktop'),
    ]);

    res.status(200).json({
      success: true,
      results,
      message: 'Performance monitoring completed successfully',
    });
  } catch (error) {
    console.error('Error running full monitoring:', error);
    throw error;
  }
}

async function runPageSpeedAnalysis(res: NextApiResponse, url: string, strategy: 'mobile' | 'desktop') {
  try {
    const result = await pageSpeedService.analyzeUrl(url, strategy);
    await storePageSpeedResult(result, strategy);

    res.status(200).json({
      success: true,
      result,
      message: `PageSpeed analysis completed for ${strategy}`,
    });
  } catch (error) {
    console.error('Error running PageSpeed analysis:', error);
    throw error;
  }
}

async function runBudgetCheck(res: NextApiResponse) {
  try {
    // Get latest metrics for budget check
    const { data: latestMetrics } = await supabase
      .from('pagespeed_results')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(2);

    const mobileMetrics = latestMetrics?.find(m => m.strategy === 'mobile');
    const desktopMetrics = latestMetrics?.find(m => m.strategy === 'desktop');

    const budgetCheck = await budgetService.checkBudgets({
      coreWebVitals: {
        lcp: { value: mobileMetrics?.lcp || 0 },
        fid: { value: mobileMetrics?.fid || 0 },
        cls: { value: mobileMetrics?.cls || 0 },
      },
      pageSpeed: {
        mobile: mobileMetrics?.performance_score || 0,
        desktop: desktopMetrics?.performance_score || 0,
      },
    });

    res.status(200).json({
      success: true,
      budgetCheck,
      message: 'Budget check completed',
    });
  } catch (error) {
    console.error('Error running budget check:', error);
    throw error;
  }
}

async function updateConfig(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const { error } = await supabase
      .from('performance_config')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}

async function storePageSpeedResult(result: any, strategy: 'mobile' | 'desktop') {
  try {
    const { error } = await supabase
      .from('pagespeed_results')
      .insert({
        url: result.url,
        strategy,
        performance_score: result.scores.performance,
        accessibility_score: result.scores.accessibility,
        best_practices_score: result.scores.bestPractices,
        seo_score: result.scores.seo,
        lcp: result.coreWebVitals.lcp,
        fid: result.coreWebVitals.fid,
        cls: result.coreWebVitals.cls,
        fcp: result.coreWebVitals.fcp,
        ttfb: result.coreWebVitals.ttfb,
        speed_index: result.metrics.speedIndex,
        interactive: result.metrics.interactive,
        total_blocking_time: result.metrics.totalBlockingTime,
        opportunities: result.opportunities,
        timestamp: result.timestamp.toISOString(),
      });

    if (error) {
      console.error('Error storing PageSpeed result:', error);
    }
  } catch (error) {
    console.error('Error storing PageSpeed result:', error);
  }
}

// Helper functions for Web Vitals scoring
function getLCPScore(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

function getFIDScore(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 100) return 'good';
  if (value <= 300) return 'needs-improvement';
  return 'poor';
}

function getCLSScore(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

function getFCPScore(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 1800) return 'good';
  if (value <= 3000) return 'needs-improvement';
  return 'poor';
}

function getTTFBScore(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 600) return 'good';
  if (value <= 1500) return 'needs-improvement';
  return 'poor';
}