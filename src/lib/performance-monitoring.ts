// Performance monitoring system with alerts, Google PageSpeed API, and budgets
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from './env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from './env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Performance thresholds based on Google recommendations
export const PERFORMANCE_THRESHOLDS = {
  coreWebVitals: {
    lcp: { good: 2500, needsImprovement: 4000 }, // milliseconds
    fid: { good: 100, needsImprovement: 300 }, // milliseconds
    cls: { good: 0.1, needsImprovement: 0.25 }, // score
    fcp: { good: 1800, needsImprovement: 3000 }, // milliseconds
    ttfb: { good: 600, needsImprovement: 1500 }, // milliseconds
  },
  performance: {
    mobileScore: { good: 90, needsImprovement: 50 },
    desktopScore: { good: 90, needsImprovement: 50 },
    loadTime: { good: 1500, needsImprovement: 3000 }, // milliseconds
  },
  security: {
    httpsScore: { good: 95, needsImprovement: 80 },
    securityHeaders: { good: 90, needsImprovement: 70 },
  },
  technical: {
    bundleSize: { good: 250000, needsImprovement: 500000 }, // bytes
    cacheHitRate: { good: 90, needsImprovement: 70 }, // percentage
    imageOptimization: { good: 90, needsImprovement: 70 }, // percentage
  }
};

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  maxBundleSize: 300000, // 300KB
  maxImageSize: 500000, // 500KB
  maxLoadTime: 1500, // 1.5s
  minCacheHitRate: 85, // 85%
  maxLCP: 2000, // 2s
  maxFID: 100, // 100ms
  maxCLS: 0.1, // 0.1
  minMobileScore: 85,
  minDesktopScore: 90,
};

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  resolved: boolean;
  url?: string;
}

export interface PageSpeedResult {
  url: string;
  timestamp: Date;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  metrics: {
    firstContentfulPaint: number;
    speedIndex: number;
    largestContentfulPaint: number;
    interactive: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
  }>;
}

/**
 * Google PageSpeed Insights API integration
 */
export class PageSpeedService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUrl(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
    try {
      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
        strategy: strategy
      });
      
      // Add multiple categories
      params.append('category', 'performance');
      params.append('category', 'accessibility');
      params.append('category', 'best-practices');
      params.append('category', 'seo');

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parsePageSpeedResult(data, url);
    } catch (error) {
      console.error('PageSpeed API error:', error);
      throw error;
    }
  }

  private parsePageSpeedResult(data: any, url: string): PageSpeedResult {
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;
    const audits = lighthouse.audits;

    return {
      url,
      timestamp: new Date(),
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
      },
      coreWebVitals: {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        ttfb: audits['server-response-time']?.numericValue || 0,
      },
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
        interactive: audits['interactive']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
      },
      opportunities: this.extractOpportunities(audits),
    };
  }

  private extractOpportunities(audits: any): Array<{id: string; title: string; description: string; savings: number}> {
    const opportunities = [];
    const opportunityKeys = [
      'unused-javascript',
      'unused-css-rules',
      'render-blocking-resources',
      'uses-optimized-images',
      'uses-webp-images',
      'efficient-animated-content',
      'legacy-javascript'
    ];

    for (const key of opportunityKeys) {
      const audit = audits[key];
      if (audit && audit.details && audit.details.overallSavingsMs > 0) {
        opportunities.push({
          id: key,
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs,
        });
      }
    }

    return opportunities.sort((a, b) => b.savings - a.savings);
  }
}

/**
 * Performance Alert System
 */
export class PerformanceAlertService {
  private alerts: PerformanceAlert[] = [];

  async checkMetrics(metrics: any): Promise<PerformanceAlert[]> {
    const newAlerts: PerformanceAlert[] = [];

    // Check Core Web Vitals
    if (metrics.coreWebVitals) {
      newAlerts.push(...this.checkCoreWebVitals(metrics.coreWebVitals));
    }

    // Check Performance Scores
    if (metrics.pageSpeed) {
      newAlerts.push(...this.checkPerformanceScores(metrics.pageSpeed));
    }

    // Check Security Metrics
    if (metrics.security) {
      newAlerts.push(...this.checkSecurityMetrics(metrics.security));
    }

    // Check Technical Metrics
    if (metrics.technical) {
      newAlerts.push(...this.checkTechnicalMetrics(metrics.technical));
    }

    // Store alerts in database
    await this.storeAlerts(newAlerts);

    return newAlerts;
  }

  private checkCoreWebVitals(vitals: any): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    Object.entries(vitals).forEach(([metric, data]: [string, any]) => {
      const threshold = PERFORMANCE_THRESHOLDS.coreWebVitals[metric as keyof typeof PERFORMANCE_THRESHOLDS.coreWebVitals];
      if (!threshold) return;

      let alertType: 'warning' | 'critical' | 'info' = 'info';
      let message = '';

      if (data.value > threshold.needsImprovement) {
        alertType = 'critical';
        message = `${metric.toUpperCase()} est critique (${data.value}${this.getUnit(metric)}) - Seuil: ${threshold.good}${this.getUnit(metric)}`;
      } else if (data.value > threshold.good) {
        alertType = 'warning';
        message = `${metric.toUpperCase()} nécessite une amélioration (${data.value}${this.getUnit(metric)}) - Objectif: ${threshold.good}${this.getUnit(metric)}`;
      }

      if (message) {
        alerts.push({
          id: `${metric}-${Date.now()}`,
          type: alertType,
          metric: metric.toUpperCase(),
          value: data.value,
          threshold: threshold.good,
          message,
          timestamp: new Date(),
          resolved: false,
        });
      }
    });

    return alerts;
  }

  private checkPerformanceScores(performance: any): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    // Mobile Performance
    if (performance.mobile < PERFORMANCE_THRESHOLDS.performance.mobileScore.good) {
      alerts.push({
        id: `mobile-score-${Date.now()}`,
        type: performance.mobile < PERFORMANCE_THRESHOLDS.performance.mobileScore.needsImprovement ? 'critical' : 'warning',
        metric: 'Performance Mobile',
        value: performance.mobile,
        threshold: PERFORMANCE_THRESHOLDS.performance.mobileScore.good,
        message: `Score performance mobile faible: ${performance.mobile}/100 (Objectif: 90+)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Desktop Performance
    if (performance.desktop < PERFORMANCE_THRESHOLDS.performance.desktopScore.good) {
      alerts.push({
        id: `desktop-score-${Date.now()}`,
        type: performance.desktop < PERFORMANCE_THRESHOLDS.performance.desktopScore.needsImprovement ? 'critical' : 'warning',
        metric: 'Performance Desktop',
        value: performance.desktop,
        threshold: PERFORMANCE_THRESHOLDS.performance.desktopScore.good,
        message: `Score performance desktop faible: ${performance.desktop}/100 (Objectif: 90+)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }

  private checkSecurityMetrics(security: any): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    if (security.httpsScore < PERFORMANCE_THRESHOLDS.security.httpsScore.good) {
      alerts.push({
        id: `https-score-${Date.now()}`,
        type: 'critical',
        metric: 'Sécurité HTTPS',
        value: security.httpsScore,
        threshold: PERFORMANCE_THRESHOLDS.security.httpsScore.good,
        message: `Score HTTPS insuffisant: ${security.httpsScore}% (Objectif: 95%+)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    if (security.vulnerabilities > 0) {
      alerts.push({
        id: `vulnerabilities-${Date.now()}`,
        type: 'critical',
        metric: 'Vulnérabilités',
        value: security.vulnerabilities,
        threshold: 0,
        message: `${security.vulnerabilities} vulnérabilité(s) détectée(s) - Action immédiate requise`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }

  private checkTechnicalMetrics(technical: any): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    if (technical.bundleSize > PERFORMANCE_THRESHOLDS.technical.bundleSize.good) {
      alerts.push({
        id: `bundle-size-${Date.now()}`,
        type: technical.bundleSize > PERFORMANCE_THRESHOLDS.technical.bundleSize.needsImprovement ? 'critical' : 'warning',
        metric: 'Taille Bundle',
        value: technical.bundleSize,
        threshold: PERFORMANCE_THRESHOLDS.technical.bundleSize.good,
        message: `Bundle trop volumineux: ${Math.round(technical.bundleSize / 1000)}KB (Objectif: <250KB)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    if (technical.cacheHitRate < PERFORMANCE_THRESHOLDS.technical.cacheHitRate.good) {
      alerts.push({
        id: `cache-hit-rate-${Date.now()}`,
        type: 'warning',
        metric: 'Cache Hit Rate',
        value: technical.cacheHitRate,
        threshold: PERFORMANCE_THRESHOLDS.technical.cacheHitRate.good,
        message: `Taux de cache faible: ${technical.cacheHitRate}% (Objectif: 90%+)`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }

  private getUnit(metric: string): string {
    switch (metric) {
      case 'lcp':
      case 'fcp':
        return 's';
      case 'fid':
      case 'ttfb':
        return 'ms';
      case 'cls':
        return '';
      default:
        return '';
    }
  }

  private async storeAlerts(alerts: PerformanceAlert[]): Promise<void> {
    if (alerts.length === 0) return;

    try {
      const { error } = await supabase
        .from('performance_alerts')
        .insert(alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          message: alert.message,
          timestamp: alert.timestamp.toISOString(),
          resolved: alert.resolved,
          url: alert.url,
        })));

      if (error) {
        console.error('Error storing performance alerts:', error);
      }
    } catch (error) {
      console.error('Error storing performance alerts:', error);
    }
  }

  async getActiveAlerts(): Promise<PerformanceAlert[]> {
    try {
      const { data, error } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }

      return data.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance_alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) {
        console.error('Error resolving alert:', error);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }
}

/**
 * Performance Budget Monitor
 */
export class PerformanceBudgetService {
  async checkBudgets(metrics: any): Promise<{
    violations: Array<{
      metric: string;
      current: number;
      budget: number;
      severity: 'warning' | 'critical';
      message: string;
    }>;
    overall: 'passing' | 'warning' | 'failing';
  }> {
    const violations: Array<{
      metric: string;
      current: number;
      budget: number;
      severity: 'warning' | 'critical';
      message: string;
    }> = [];

    // Check bundle size budget
    if (metrics.technical?.bundleSize > PERFORMANCE_BUDGETS.maxBundleSize) {
      violations.push({
        metric: 'Bundle Size',
        current: metrics.technical.bundleSize,
        budget: PERFORMANCE_BUDGETS.maxBundleSize,
        severity: metrics.technical.bundleSize > PERFORMANCE_BUDGETS.maxBundleSize * 1.5 ? 'critical' : 'warning',
        message: `Bundle dépasse le budget: ${Math.round(metrics.technical.bundleSize / 1000)}KB / ${Math.round(PERFORMANCE_BUDGETS.maxBundleSize / 1000)}KB`,
      });
    }

    // Check load time budget
    if (metrics.realUserMetrics?.avgLoadTime > PERFORMANCE_BUDGETS.maxLoadTime) {
      violations.push({
        metric: 'Load Time',
        current: metrics.realUserMetrics.avgLoadTime,
        budget: PERFORMANCE_BUDGETS.maxLoadTime,
        severity: metrics.realUserMetrics.avgLoadTime > PERFORMANCE_BUDGETS.maxLoadTime * 2 ? 'critical' : 'warning',
        message: `Temps de chargement dépasse le budget: ${metrics.realUserMetrics.avgLoadTime}ms / ${PERFORMANCE_BUDGETS.maxLoadTime}ms`,
      });
    }

    // Check Core Web Vitals budgets
    if (metrics.coreWebVitals) {
      if (metrics.coreWebVitals.lcp?.value > PERFORMANCE_BUDGETS.maxLCP) {
        violations.push({
          metric: 'LCP',
          current: metrics.coreWebVitals.lcp.value,
          budget: PERFORMANCE_BUDGETS.maxLCP,
          severity: 'critical',
          message: `LCP dépasse le budget: ${metrics.coreWebVitals.lcp.value}ms / ${PERFORMANCE_BUDGETS.maxLCP}ms`,
        });
      }

      if (metrics.coreWebVitals.fid?.value > PERFORMANCE_BUDGETS.maxFID) {
        violations.push({
          metric: 'FID',
          current: metrics.coreWebVitals.fid.value,
          budget: PERFORMANCE_BUDGETS.maxFID,
          severity: 'critical',
          message: `FID dépasse le budget: ${metrics.coreWebVitals.fid.value}ms / ${PERFORMANCE_BUDGETS.maxFID}ms`,
        });
      }

      if (metrics.coreWebVitals.cls?.value > PERFORMANCE_BUDGETS.maxCLS) {
        violations.push({
          metric: 'CLS',
          current: metrics.coreWebVitals.cls.value,
          budget: PERFORMANCE_BUDGETS.maxCLS,
          severity: 'critical',
          message: `CLS dépasse le budget: ${metrics.coreWebVitals.cls.value} / ${PERFORMANCE_BUDGETS.maxCLS}`,
        });
      }
    }

    // Check performance scores
    if (metrics.pageSpeed?.mobile < PERFORMANCE_BUDGETS.minMobileScore) {
      violations.push({
        metric: 'Mobile Score',
        current: metrics.pageSpeed.mobile,
        budget: PERFORMANCE_BUDGETS.minMobileScore,
        severity: 'warning',
        message: `Score mobile sous le budget: ${metrics.pageSpeed.mobile} / ${PERFORMANCE_BUDGETS.minMobileScore}`,
      });
    }

    if (metrics.pageSpeed?.desktop < PERFORMANCE_BUDGETS.minDesktopScore) {
      violations.push({
        metric: 'Desktop Score',
        current: metrics.pageSpeed.desktop,
        budget: PERFORMANCE_BUDGETS.minDesktopScore,
        severity: 'warning',
        message: `Score desktop sous le budget: ${metrics.pageSpeed.desktop} / ${PERFORMANCE_BUDGETS.minDesktopScore}`,
      });
    }

    // Determine overall status
    let overall: 'passing' | 'warning' | 'failing' = 'passing';
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const warningViolations = violations.filter(v => v.severity === 'warning');

    if (criticalViolations.length > 0) {
      overall = 'failing';
    } else if (warningViolations.length > 0) {
      overall = 'warning';
    }

    // Store budget check results
    await this.storeBudgetResults(violations, overall);

    return { violations, overall };
  }

  private async storeBudgetResults(violations: any[], overall: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance_budget_checks')
        .insert({
          timestamp: new Date().toISOString(),
          violations: violations,
          overall_status: overall,
          violation_count: violations.length,
        });

      if (error) {
        console.error('Error storing budget results:', error);
      }
    } catch (error) {
      console.error('Error storing budget results:', error);
    }
  }

  async getBudgetHistory(days: number = 30): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('performance_budget_checks')
        .select('*')
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching budget history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching budget history:', error);
      return [];
    }
  }
}

// Export services and utilities
export const pageSpeedService = new PageSpeedService(process.env.GOOGLE_PAGESPEED_API_KEY || '');
export const alertService = new PerformanceAlertService();
export const budgetService = new PerformanceBudgetService();

// Monitoring automation
export async function runPerformanceMonitoring(url: string = 'https://oma-digital.sn'): Promise<{
  pageSpeedResults: PageSpeedResult;
  alerts: PerformanceAlert[];
  budgetCheck: any;
}> {
  try {
    // Run PageSpeed analysis
    const pageSpeedResults = await pageSpeedService.analyzeUrl(url);
    
    // Check for alerts
    const alerts = await alertService.checkMetrics({
      coreWebVitals: pageSpeedResults.coreWebVitals,
      pageSpeed: pageSpeedResults.scores,
      // Add more metrics as needed
    });
    
    // Check performance budgets
    const budgetCheck = await budgetService.checkBudgets({
      coreWebVitals: pageSpeedResults.coreWebVitals,
      pageSpeed: pageSpeedResults.scores,
      // Add more metrics as needed
    });

    return {
      pageSpeedResults,
      alerts,
      budgetCheck,
    };
  } catch (error) {
    console.error('Performance monitoring error:', error);
    throw error;
  }
}