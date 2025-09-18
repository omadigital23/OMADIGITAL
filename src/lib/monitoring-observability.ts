/**
 * Monitoring & Observability System
 * Comprehensive monitoring with Sentry integration, performance tracking, and alerting
 */

import { logger, performanceLogger, apiLogger, securityLogger } from './logger';

// ============================================================================
// Types
// ============================================================================

export interface MonitoringConfig {
  sentry: {
    dsn?: string;
    environment: string;
    tracesSampleRate: number;
    profilesSampleRate: number;
    enabled: boolean;
  };
  performance: {
    enableWebVitals: boolean;
    enableResourceTiming: boolean;
    enableNavigationTiming: boolean;
    samplingRate: number;
  };
  errors: {
    enableAutomaticCapture: boolean;
    enableManualCapture: boolean;
    enableUnhandledRejection: boolean;
    filterSensitiveData: boolean;
  };
  alerts: {
    errorThreshold: number;
    performanceThreshold: number;
    availabilityThreshold: number;
    webhookUrl?: string;
  };
  analytics: {
    enableUserTracking: boolean;
    enableFeatureTracking: boolean;
    enableBusinessMetrics: boolean;
    retentionDays: number;
  };
}

export interface PerformanceEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: string;
  url: string;
  userAgent: string;
  language: 'fr' | 'en';
}

export interface ErrorEntry {
  message: string;
  stack?: string;
  source: string;
  line?: number;
  column?: number;
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, unknown>;
}

export interface BusinessMetrics {
  chatbotInteractions: number;
  leadGeneration: number;
  conversionRate: number;
  userEngagement: number;
  languageDistribution: { fr: number; en: number };
  topPages: Array<{ page: string; views: number }>;
  timestamp: string;
}

// ============================================================================
// Sentry Integration Manager
// ============================================================================

export class SentryManager {
  private static initialized = false;
  private static config: MonitoringConfig['sentry'] = {
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    enabled: false,
  };

  static async initialize(config?: Partial<MonitoringConfig['sentry']>): Promise<void> {
    if (this.initialized) return;

    this.config = { ...this.config, ...config };
    
    if (!this.config.dsn) {
      this.config.dsn = process.env.SENTRY_DSN;
    }

    if (!this.config.dsn) {
      logger.warn('Sentry DSN not configured, error tracking disabled');
      return;
    }

    try {
      // Dynamic import to avoid SSR issues
      if (typeof window !== 'undefined') {
        await this.initializeBrowser();
      } else {
        await this.initializeServer();
      }

      this.initialized = true;
      logger.info('Sentry monitoring initialized', undefined, {
        environment: this.config.environment,
        tracesSampleRate: this.config.tracesSampleRate,
      });

    } catch (error) {
      logger.error('Failed to initialize Sentry', error as Error);
    }
  }

  private static async initializeBrowser(): Promise<void> {
    const Sentry = await import('@sentry/react');
    const { BrowserTracing } = await import('@sentry/tracing');

    Sentry.init({
      dsn: this.config.dsn,
      environment: this.config.environment,
      tracesSampleRate: this.config.tracesSampleRate,
      profilesSampleRate: this.config.profilesSampleRate,
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*\.vercel\.app/,
            /^https:\/\/.*\.supabase\.co/,
          ],
        }),
      ],
      beforeSend: this.filterSensitiveData,
      beforeSendTransaction: this.filterSensitiveTransactions,
    });

    // Set user context for French/English users
    Sentry.setContext('app', {
      name: 'OMA Digital Platform',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
      supportedLanguages: ['fr', 'en'],
    });
  }

  private static async initializeServer(): Promise<void> {
    const Sentry = await import('@sentry/node');
    const { ProfilingIntegration } = await import('@sentry/profiling-node');

    Sentry.init({
      dsn: this.config.dsn,
      environment: this.config.environment,
      tracesSampleRate: this.config.tracesSampleRate,
      profilesSampleRate: this.config.profilesSampleRate,
      integrations: [
        new ProfilingIntegration(),
      ],
      beforeSend: this.filterSensitiveData,
    });
  }

  private static filterSensitiveData(event: any): any {
    // Remove sensitive information from error reports
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // Keep only supported languages in context
    if (event.tags?.language && !['fr', 'en'].includes(event.tags.language)) {
      event.tags.language = 'fr'; // Default to French
    }

    return event;
  }

  private static filterSensitiveTransactions(event: any): any {
    // Filter out admin routes from public monitoring
    if (event.transaction?.includes('/admin/')) {
      return null;
    }

    return event;
  }

  static captureError(
    error: Error,
    context?: Record<string, unknown>,
    level: 'error' | 'warning' | 'info' = 'error'
  ): void {
    if (!this.initialized) return;

    try {
      import('@sentry/react').then(Sentry => {
        Sentry.withScope(scope => {
          scope.setLevel(level);
          
          if (context) {
            Object.entries(context).forEach(([key, value]) => {
              scope.setContext(key, value);
            });
          }

          // Ensure language context is always set
          scope.setTag('language', context?.language || 'fr');
          
          Sentry.captureException(error);
        });
      });
    } catch (captureError) {
      logger.error('Failed to capture error in Sentry', captureError as Error);
    }
  }

  static captureMessage(
    message: string,
    level: 'error' | 'warning' | 'info' = 'info',
    context?: Record<string, unknown>
  ): void {
    if (!this.initialized) return;

    try {
      import('@sentry/react').then(Sentry => {
        Sentry.withScope(scope => {
          scope.setLevel(level);
          
          if (context) {
            Object.entries(context).forEach(([key, value]) => {
              scope.setContext(key, value);
            });
          }

          scope.setTag('language', context?.language || 'fr');
          
          Sentry.captureMessage(message);
        });
      });
    } catch (captureError) {
      logger.error('Failed to capture message in Sentry', captureError as Error);
    }
  }

  static setUser(user: { id: string; language: 'fr' | 'en'; [key: string]: unknown }): void {
    if (!this.initialized) return;

    try {
      import('@sentry/react').then(Sentry => {
        Sentry.setUser({
          id: user.id,
          language: user.language,
          // Don't include sensitive information
        });
      });
    } catch (error) {
      logger.error('Failed to set Sentry user', error as Error);
    }
  }
}

// ============================================================================
// Performance Monitoring Manager
// ============================================================================

export class PerformanceMonitor {
  private static metrics: PerformanceEntry[] = [];
  private static config: MonitoringConfig['performance'] = {
    enableWebVitals: true,
    enableResourceTiming: true,
    enableNavigationTiming: true,
    samplingRate: 1.0,
  };

  static initialize(config?: Partial<MonitoringConfig['performance']>): void {
    this.config = { ...this.config, ...config };

    if (typeof window === 'undefined') return;

    // Initialize Web Vitals monitoring
    if (this.config.enableWebVitals) {
      this.initializeWebVitals();
    }

    // Initialize Resource Timing monitoring
    if (this.config.enableResourceTiming) {
      this.initializeResourceTiming();
    }

    // Initialize Navigation Timing monitoring
    if (this.config.enableNavigationTiming) {
      this.initializeNavigationTiming();
    }

    logger.info('Performance monitoring initialized', undefined, {
      enableWebVitals: this.config.enableWebVitals,
      samplingRate: this.config.samplingRate,
    });
  }

  private static initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Use dynamic import for web-vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const handleMetric = (metric: any) => {
        if (Math.random() > this.config.samplingRate) return;

        const entry: PerformanceEntry = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          language: this.detectPageLanguage(),
        };

        this.recordMetric(entry);
      };

      getCLS(handleMetric);
      getFID(handleMetric);
      getFCP(handleMetric);
      getLCP(handleMetric);
      getTTFB(handleMetric);
    }).catch(error => {
      logger.warn('Web Vitals library not available', undefined, { error });
    });
  }

  private static initializeResourceTiming(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 1000) { // Only track slow resources (>1s)
          const metric: PerformanceEntry = {
            name: `resource_${entry.name}`,
            value: entry.duration,
            rating: entry.duration > 3000 ? 'poor' : entry.duration > 1500 ? 'needs-improvement' : 'good',
            delta: 0,
            id: `resource_${Date.now()}`,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            language: this.detectPageLanguage(),
          };

          this.recordMetric(metric);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private static initializeNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = [
          { name: 'domContentLoaded', value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart },
          { name: 'windowLoad', value: navigation.loadEventEnd - navigation.loadEventStart },
          { name: 'ttfb', value: navigation.responseStart - navigation.requestStart },
        ];

        metrics.forEach(({ name, value }) => {
          const entry: PerformanceEntry = {
            name,
            value,
            rating: this.rateNavigationMetric(name, value),
            delta: 0,
            id: `nav_${name}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            language: this.detectPageLanguage(),
          };

          this.recordMetric(entry);
        });
      }
    });
  }

  private static detectPageLanguage(): 'fr' | 'en' {
    // Detect page language from HTML lang attribute or URL
    const htmlLang = document.documentElement.lang;
    const urlLang = window.location.pathname.includes('/en') ? 'en' : 
                   window.location.search.includes('lng=en') ? 'en' : 'fr';
    
    return (htmlLang === 'en' || urlLang === 'en') ? 'en' : 'fr';
  }

  private static rateNavigationMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      domContentLoaded: { good: 1500, poor: 3000 },
      windowLoad: { good: 2500, poor: 5000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private static recordMetric(entry: PerformanceEntry): void {
    this.metrics.push(entry);

    // Keep only last 100 metrics in memory
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Send to analytics
    this.sendMetricToAnalytics(entry);

    // Log performance issues
    if (entry.rating === 'poor') {
      performanceLogger.metric(entry.name, entry.value, 'ms', {
        rating: entry.rating,
        url: entry.url,
        language: entry.language,
      });

      // Alert on critical performance issues
      if (entry.value > 5000) {
        SentryManager.captureMessage(
          `Critical performance issue: ${entry.name} took ${entry.value}ms`,
          'warning',
          { metric: entry, language: entry.language }
        );
      }
    }
  }

  private static async sendMetricToAnalytics(entry: PerformanceEntry): Promise<void> {
    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: entry.name,
          value: entry.value,
          rating: entry.rating,
          id: entry.id,
          timestamp: entry.timestamp,
          url: entry.url,
          language: entry.language,
        }),
      });
    } catch (error) {
      // Silently fail analytics to avoid affecting user experience
    }
  }

  static getMetrics(): PerformanceEntry[] {
    return [...this.metrics];
  }

  static getMetricsSummary(): {
    averages: Record<string, number>;
    ratings: Record<string, { good: number; needs_improvement: number; poor: number }>;
    languageBreakdown: { fr: number; en: number };
  } {
    const averages: Record<string, number> = {};
    const ratings: Record<string, { good: number; needs_improvement: number; poor: number }> = {};
    const languageBreakdown = { fr: 0, en: 0 };

    this.metrics.forEach(metric => {
      // Calculate averages
      if (!averages[metric.name]) {
        averages[metric.name] = 0;
      }
      averages[metric.name] += metric.value;

      // Count ratings
      if (!ratings[metric.name]) {
        ratings[metric.name] = { good: 0, needs_improvement: 0, poor: 0 };
      }
      ratings[metric.name][metric.rating.replace('-', '_') as keyof typeof ratings[string]]++;

      // Language breakdown
      languageBreakdown[metric.language]++;
    });

    // Calculate actual averages
    Object.keys(averages).forEach(key => {
      const count = this.metrics.filter(m => m.name === key).length;
      averages[key] = averages[key] / count;
    });

    return { averages, ratings, languageBreakdown };
  }
}

// ============================================================================
// Error Monitoring Manager
// ============================================================================

export class ErrorMonitor {
  private static errors: ErrorEntry[] = [];
  private static config: MonitoringConfig['errors'] = {
    enableAutomaticCapture: true,
    enableManualCapture: true,
    enableUnhandledRejection: true,
    filterSensitiveData: true,
  };

  static initialize(config?: Partial<MonitoringConfig['errors']>): void {
    this.config = { ...this.config, ...config };

    if (typeof window === 'undefined') return;

    if (this.config.enableAutomaticCapture) {
      this.setupGlobalErrorHandlers();
    }

    logger.info('Error monitoring initialized', undefined, {
      automaticCapture: this.config.enableAutomaticCapture,
      unhandledRejection: this.config.enableUnhandledRejection,
    });
  }

  private static setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      const errorEntry: ErrorEntry = {
        message: event.message,
        stack: event.error?.stack,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: this.assessErrorSeverity(event.error || new Error(event.message)),
        context: {
          type: 'javascript_error',
          language: this.detectPageLanguage(),
        },
      };

      this.recordError(errorEntry);
    });

    // Unhandled promise rejection handler
    if (this.config.enableUnhandledRejection) {
      window.addEventListener('unhandledrejection', (event) => {
        const errorEntry: ErrorEntry = {
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          source: 'promise',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          severity: this.assessErrorSeverity(event.reason),
          context: {
            type: 'unhandled_rejection',
            reason: String(event.reason),
            language: this.detectPageLanguage(),
          },
        };

        this.recordError(errorEntry);
      });
    }
  }

  private static detectPageLanguage(): 'fr' | 'en' {
    const htmlLang = document.documentElement.lang;
    const urlLang = window.location.pathname.includes('/en') ? 'en' : 
                   window.location.search.includes('lng=en') ? 'en' : 'fr';
    
    return (htmlLang === 'en' || urlLang === 'en') ? 'en' : 'fr';
  }

  private static assessErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error?.message?.toLowerCase() || '';
    
    // Critical errors
    if (message.includes('network') || message.includes('fetch') || message.includes('cors')) {
      return 'critical';
    }

    // High severity errors
    if (message.includes('chunk') || message.includes('module') || message.includes('syntax')) {
      return 'high';
    }

    // Medium severity errors
    if (message.includes('null') || message.includes('undefined') || message.includes('cannot read')) {
      return 'medium';
    }

    return 'low';
  }

  static recordError(errorEntry: ErrorEntry): void {
    // Filter sensitive data if enabled
    if (this.config.filterSensitiveData) {
      errorEntry = this.filterSensitiveData(errorEntry);
    }

    this.errors.push(errorEntry);

    // Keep only last 50 errors in memory
    if (this.errors.length > 50) {
      this.errors.shift();
    }

    // Send to Sentry
    const error = new Error(errorEntry.message);
    error.stack = errorEntry.stack;
    
    SentryManager.captureError(error, {
      ...errorEntry.context,
      severity: errorEntry.severity,
      source: errorEntry.source,
      language: errorEntry.context.language,
    }, errorEntry.severity === 'critical' ? 'error' : 'warning');

    // Log locally
    logger.error('Client error captured', error, {
      component: 'error_monitor',
      severity: errorEntry.severity,
      language: errorEntry.context.language,
    });
  }

  private static filterSensitiveData(errorEntry: ErrorEntry): ErrorEntry {
    // Remove sensitive information from error messages and stack traces
    const sensitivePatterns = [
      /api[_-]?key[s]?['":\s=]+[^'">\s]+/gi,
      /token[s]?['":\s=]+[^'">\s]+/gi,
      /password[s]?['":\s=]+[^'">\s]+/gi,
      /secret[s]?['":\s=]+[^'">\s]+/gi,
    ];

    let filteredMessage = errorEntry.message;
    let filteredStack = errorEntry.stack;

    sensitivePatterns.forEach(pattern => {
      filteredMessage = filteredMessage.replace(pattern, '[REDACTED]');
      if (filteredStack) {
        filteredStack = filteredStack.replace(pattern, '[REDACTED]');
      }
    });

    return {
      ...errorEntry,
      message: filteredMessage,
      stack: filteredStack,
    };
  }

  static getErrors(): ErrorEntry[] {
    return [...this.errors];
  }

  static getErrorSummary(): {
    totalErrors: number;
    severityBreakdown: Record<string, number>;
    languageBreakdown: { fr: number; en: number };
    commonErrors: Array<{ message: string; count: number }>;
  } {
    const severityBreakdown = { low: 0, medium: 0, high: 0, critical: 0 };
    const languageBreakdown = { fr: 0, en: 0 };
    const errorCounts: Record<string, number> = {};

    this.errors.forEach(error => {
      severityBreakdown[error.severity]++;
      languageBreakdown[error.context.language as 'fr' | 'en']++;

      const errorKey = error.message.substring(0, 100); // First 100 chars
      errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
    });

    const commonErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));

    return {
      totalErrors: this.errors.length,
      severityBreakdown,
      languageBreakdown,
      commonErrors,
    };
  }
}

// ============================================================================
// Main Monitoring Manager
// ============================================================================

export class MonitoringManager {
  private static config: MonitoringConfig = {
    sentry: {
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === 'production',
    },
    performance: {
      enableWebVitals: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      samplingRate: 1.0,
    },
    errors: {
      enableAutomaticCapture: true,
      enableManualCapture: true,
      enableUnhandledRejection: true,
      filterSensitiveData: true,
    },
    alerts: {
      errorThreshold: 10,
      performanceThreshold: 3000,
      availabilityThreshold: 95,
    },
    analytics: {
      enableUserTracking: true,
      enableFeatureTracking: true,
      enableBusinessMetrics: true,
      retentionDays: 90,
    },
  };

  static async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    // Initialize Sentry
    if (this.config.sentry.enabled) {
      await SentryManager.initialize(this.config.sentry);
    }

    // Initialize Performance Monitoring
    PerformanceMonitor.initialize(this.config.performance);

    // Initialize Error Monitoring
    ErrorMonitor.initialize(this.config.errors);

    logger.info('Monitoring system initialized', undefined, {
      sentryEnabled: this.config.sentry.enabled,
      environment: this.config.sentry.environment,
      performanceEnabled: this.config.performance.enableWebVitals,
      errorTrackingEnabled: this.config.errors.enableAutomaticCapture,
    });
  }

  static getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{ name: string; status: boolean; details?: string }>;
    summary: {
      errors: any;
      performance: any;
      uptime: number;
    };
  } {
    const checks = [
      {
        name: 'Error Rate',
        status: this.isErrorRateHealthy(),
        details: `${ErrorMonitor.getErrors().length} errors in monitoring period`,
      },
      {
        name: 'Performance',
        status: this.isPerformanceHealthy(),
        details: 'Core Web Vitals within acceptable ranges',
      },
      {
        name: 'Language Support',
        status: true,
        details: 'French and English languages supported',
      },
    ];

    const failedChecks = checks.filter(check => !check.status).length;
    const status = failedChecks === 0 ? 'healthy' : 
                  failedChecks <= 1 ? 'degraded' : 'unhealthy';

    return {
      status,
      checks,
      summary: {
        errors: ErrorMonitor.getErrorSummary(),
        performance: PerformanceMonitor.getMetricsSummary(),
        uptime: this.calculateUptime(),
      },
    };
  }

  private static isErrorRateHealthy(): boolean {
    const errors = ErrorMonitor.getErrors();
    const recentErrors = errors.filter(error => 
      Date.now() - new Date(error.timestamp).getTime() < 15 * 60 * 1000 // Last 15 minutes
    );
    
    return recentErrors.length < this.config.alerts.errorThreshold;
  }

  private static isPerformanceHealthy(): boolean {
    const metrics = PerformanceMonitor.getMetrics();
    const recentMetrics = metrics.filter(metric => 
      Date.now() - new Date(metric.timestamp).getTime() < 15 * 60 * 1000 // Last 15 minutes
    );

    const poorMetrics = recentMetrics.filter(metric => metric.rating === 'poor');
    return poorMetrics.length / Math.max(recentMetrics.length, 1) < 0.1; // Less than 10% poor metrics
  }

  private static calculateUptime(): number {
    // This is a simplified uptime calculation
    // In a real implementation, this would track actual service availability
    return 99.9; // Placeholder
  }

  static generateMonitoringReport(): string {
    const health = this.getHealthStatus();
    const errors = ErrorMonitor.getErrorSummary();
    const performance = PerformanceMonitor.getMetricsSummary();

    return `
# 📊 OMA Digital Platform - Monitoring Report

## System Health: ${health.status.toUpperCase()}

### Health Checks
${health.checks.map(check => 
  `- **${check.name}**: ${check.status ? '✅ PASS' : '❌ FAIL'} - ${check.details}`
).join('\n')}

### Error Summary
- **Total Errors**: ${errors.totalErrors}
- **Critical**: ${errors.severityBreakdown.critical}
- **High**: ${errors.severityBreakdown.high}
- **Medium**: ${errors.severityBreakdown.medium}
- **Low**: ${errors.severityBreakdown.low}

### Language Distribution (Errors)
- **French**: ${errors.languageBreakdown.fr} (${Math.round(errors.languageBreakdown.fr / Math.max(errors.totalErrors, 1) * 100)}%)
- **English**: ${errors.languageBreakdown.en} (${Math.round(errors.languageBreakdown.en / Math.max(errors.totalErrors, 1) * 100)}%)

### Performance Metrics
- **Language Distribution**: FR: ${performance.languageBreakdown.fr}, EN: ${performance.languageBreakdown.en}
- **Average LCP**: ${Math.round(performance.averages.lcp || 0)}ms
- **Average FID**: ${Math.round(performance.averages.fid || 0)}ms
- **Average CLS**: ${(performance.averages.cls || 0).toFixed(3)}

### Common Errors
${errors.commonErrors.map((error, index) => 
  `${index + 1}. ${error.message.substring(0, 80)}... (${error.count} occurrences)`
).join('\n')}

---
*Report generated: ${new Date().toISOString()}*
*Languages supported: French (fr), English (en) only*
`;
  }
}

// ============================================================================
// Export
// ============================================================================

export {
  SentryManager,
  PerformanceMonitor,
  ErrorMonitor,
  MonitoringManager,
};

export default MonitoringManager;