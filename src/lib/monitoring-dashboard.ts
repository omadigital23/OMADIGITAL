/**
 * Production Monitoring Dashboard
 * Real-time monitoring and alerting system for OMA Digital Platform
 */

interface MonitoringMetrics {
  performance: PerformanceMetrics;
  security: SecurityMetrics;
  business: BusinessMetrics;
  technical: TechnicalMetrics;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

interface SecurityMetrics {
  violationCount: number;
  blockedRequests: number;
  suspiciousActivity: number;
  failedLogins: number;
}

interface BusinessMetrics {
  chatbotInteractions: number;
  conversionRate: number;
  userEngagement: number;
  leadGeneration: number;
}

interface TechnicalMetrics {
  memoryUsage: number;
  cpuUsage: number;
  databaseConnections: number;
  apiLatency: number;
}

interface Alert {
  id: string;
  type: 'performance' | 'security' | 'business' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

class MonitoringDashboard {
  private static instance: MonitoringDashboard;
  private metrics: Partial<MonitoringMetrics> = {};
  private alerts: Alert[] = [];
  private thresholds = {
    performance: {
      responseTime: 500, // ms
      errorRate: 1, // %
      availability: 99.9, // %
      lcp: 2500, // ms
      fid: 100, // ms
      cls: 0.1
    },
    security: {
      violationCount: 10, // per hour
      blockedRequests: 50, // per hour
      suspiciousActivity: 5, // per hour
      failedLogins: 10 // per hour
    },
    technical: {
      memoryUsage: 80, // %
      cpuUsage: 70, // %
      databaseConnections: 80, // % of pool
      apiLatency: 200 // ms
    }
  };

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): MonitoringDashboard {
    if (!MonitoringDashboard.instance) {
      MonitoringDashboard.instance = new MonitoringDashboard();
    }
    return MonitoringDashboard.instance;
  }

  /**
   * Initialize comprehensive monitoring
   */
  private initializeMonitoring(): void {
    // Start metric collection
    this.startMetricCollection();
    
    // Initialize alerting system
    this.initializeAlerting();
    
    // Setup health checks
    this.setupHealthChecks();
    
    // Initialize real-time dashboard
    if (typeof window !== 'undefined') {
      this.initializeRealtimeDashboard();
    }
  }

  /**
   * Start collecting metrics from various sources
   */
  private startMetricCollection(): void {
    setInterval(() => {
      this.collectPerformanceMetrics();
      this.collectSecurityMetrics();
      this.collectBusinessMetrics();
      this.collectTechnicalMetrics();
    }, 30000); // Collect every 30 seconds
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      // API response time monitoring
      const apiStartTime = Date.now();
      const response = await fetch('/api/health');
      const responseTime = Date.now() - apiStartTime;
      
      // Calculate error rate from recent logs
      const errorRate = await this.calculateErrorRate();
      
      // Get Core Web Vitals from performance API
      const coreWebVitals = this.getCoreWebVitals();
      
      this.metrics.performance = {
        responseTime,
        throughput: await this.calculateThroughput(),
        errorRate,
        availability: response.ok ? 100 : 0,
        coreWebVitals
      };
      
      // Check thresholds and create alerts
      this.checkPerformanceThresholds();
      
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
      this.createAlert('performance', 'high', 'Failed to collect performance metrics');
    }
  }

  /**
   * Collect security metrics
   */
  private async collectSecurityMetrics(): Promise<void> {
    try {
      const securityData = await fetch('/api/security/metrics').then(r => r.json());
      
      this.metrics.security = {
        violationCount: securityData.violations || 0,
        blockedRequests: securityData.blocked || 0,
        suspiciousActivity: securityData.suspicious || 0,
        failedLogins: securityData.failedLogins || 0
      };
      
      this.checkSecurityThresholds();
      
    } catch (error) {
      console.error('Failed to collect security metrics:', error);
    }
  }

  /**
   * Collect business metrics
   */
  private async collectBusinessMetrics(): Promise<void> {
    try {
      const businessData = await fetch('/api/analytics/business').then(r => r.json());
      
      this.metrics.business = {
        chatbotInteractions: businessData.chatbotInteractions || 0,
        conversionRate: businessData.conversionRate || 0,
        userEngagement: businessData.userEngagement || 0,
        leadGeneration: businessData.leadGeneration || 0
      };
      
    } catch (error) {
      console.error('Failed to collect business metrics:', error);
    }
  }

  /**
   * Collect technical metrics
   */
  private async collectTechnicalMetrics(): Promise<void> {
    try {
      // Memory usage (client-side)
      const memoryUsage = this.getMemoryUsage();
      
      // Database metrics
      const dbMetrics = await fetch('/api/monitoring/database').then(r => r.json());
      
      this.metrics.technical = {
        memoryUsage,
        cpuUsage: 0, // Would need server-side implementation
        databaseConnections: dbMetrics.connections || 0,
        apiLatency: dbMetrics.latency || 0
      };
      
      this.checkTechnicalThresholds();
      
    } catch (error) {
      console.error('Failed to collect technical metrics:', error);
    }
  }

  /**
   * Get Core Web Vitals from Performance API
   */
  private getCoreWebVitals(): { lcp: number; fid: number; cls: number } {
    if (typeof window === 'undefined') {
      return { lcp: 0, fid: 0, cls: 0 };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as any;
    
    return {
      lcp: navigation?.largestContentfulPaint || 0,
      fid: navigation?.firstInputDelay || 0,
      cls: navigation?.cumulativeLayoutShift || 0
    };
  }

  /**
   * Calculate error rate from recent API calls
   */
  private async calculateErrorRate(): Promise<number> {
    try {
      const errorData = await fetch('/api/analytics/errors').then(r => r.json());
      return errorData.errorRate || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate throughput (requests per second)
   */
  private async calculateThroughput(): Promise<number> {
    try {
      const throughputData = await fetch('/api/analytics/throughput').then(r => r.json());
      return throughputData.rps || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get memory usage percentage
   */
  private getMemoryUsage(): number {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return 0;
    }

    const memory = (performance as any).memory;
    return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
  }

  /**
   * Check performance thresholds and create alerts
   */
  private checkPerformanceThresholds(): void {
    const perf = this.metrics.performance;
    if (!perf) return;

    if (perf.responseTime > this.thresholds.performance.responseTime) {
      this.createAlert('performance', 'medium', 
        `High response time: ${perf.responseTime}ms (threshold: ${this.thresholds.performance.responseTime}ms)`);
    }

    if (perf.errorRate > this.thresholds.performance.errorRate) {
      this.createAlert('performance', 'high', 
        `High error rate: ${perf.errorRate}% (threshold: ${this.thresholds.performance.errorRate}%)`);
    }

    if (perf.coreWebVitals.lcp > this.thresholds.performance.lcp) {
      this.createAlert('performance', 'medium', 
        `Poor LCP: ${perf.coreWebVitals.lcp}ms (threshold: ${this.thresholds.performance.lcp}ms)`);
    }
  }

  /**
   * Check security thresholds and create alerts
   */
  private checkSecurityThresholds(): void {
    const security = this.metrics.security;
    if (!security) return;

    if (security.violationCount > this.thresholds.security.violationCount) {
      this.createAlert('security', 'high', 
        `High security violations: ${security.violationCount} (threshold: ${this.thresholds.security.violationCount})`);
    }

    if (security.suspiciousActivity > this.thresholds.security.suspiciousActivity) {
      this.createAlert('security', 'critical', 
        `Suspicious activity detected: ${security.suspiciousActivity} incidents`);
    }
  }

  /**
   * Check technical thresholds and create alerts
   */
  private checkTechnicalThresholds(): void {
    const technical = this.metrics.technical;
    if (!technical) return;

    if (technical.memoryUsage > this.thresholds.technical.memoryUsage) {
      this.createAlert('technical', 'medium', 
        `High memory usage: ${technical.memoryUsage.toFixed(1)}% (threshold: ${this.thresholds.technical.memoryUsage}%)`);
    }

    if (technical.apiLatency > this.thresholds.technical.apiLatency) {
      this.createAlert('technical', 'medium', 
        `High API latency: ${technical.apiLatency}ms (threshold: ${this.thresholds.technical.apiLatency}ms)`);
    }
  }

  /**
   * Create and manage alerts
   */
  private createAlert(type: Alert['type'], severity: Alert['severity'], message: string): void {
    const alert: Alert = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Send to external alerting systems
    this.sendAlert(alert);
    
    console.warn(`[${severity.toUpperCase()}] ${type}: ${message}`);
  }

  /**
   * Send alert to external systems
   */
  private async sendAlert(alert: Alert): Promise<void> {
    try {
      // Send to monitoring service
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });

      // For critical alerts, send immediate notifications
      if (alert.severity === 'critical') {
        await this.sendCriticalAlert(alert);
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Send critical alert notifications
   */
  private async sendCriticalAlert(alert: Alert): Promise<void> {
    // Implementation would depend on notification service (email, SMS, Slack, etc.)
    console.error('CRITICAL ALERT:', alert);
  }

  /**
   * Initialize alerting system
   */
  private initializeAlerting(): void {
    // Setup alert resolution monitoring
    setInterval(() => {
      this.checkAlertResolution();
    }, 60000); // Check every minute
  }

  /**
   * Check if alerts should be auto-resolved
   */
  private checkAlertResolution(): void {
    this.alerts.forEach(alert => {
      if (!alert.resolved && this.shouldAutoResolve(alert)) {
        alert.resolved = true;
        console.log(`Auto-resolved alert: ${alert.id}`);
      }
    });
  }

  /**
   * Determine if alert should be auto-resolved
   */
  private shouldAutoResolve(alert: Alert): boolean {
    const alertAge = Date.now() - new Date(alert.timestamp).getTime();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    // Auto-resolve old alerts if conditions are back to normal
    if (alertAge > maxAge) {
      return this.areConditionsNormal(alert.type);
    }

    return false;
  }

  /**
   * Check if conditions are back to normal for alert type
   */
  private areConditionsNormal(type: Alert['type']): boolean {
    switch (type) {
      case 'performance':
        const perf = this.metrics.performance;
        return perf ? 
          perf.responseTime <= this.thresholds.performance.responseTime &&
          perf.errorRate <= this.thresholds.performance.errorRate : false;
      
      case 'security':
        const security = this.metrics.security;
        return security ?
          security.violationCount <= this.thresholds.security.violationCount &&
          security.suspiciousActivity <= this.thresholds.security.suspiciousActivity : false;
      
      case 'technical':
        const technical = this.metrics.technical;
        return technical ?
          technical.memoryUsage <= this.thresholds.technical.memoryUsage &&
          technical.apiLatency <= this.thresholds.technical.apiLatency : false;
      
      default:
        return false;
    }
  }

  /**
   * Setup health checks
   */
  private setupHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthCheck();
    }, 60000); // Every minute
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const healthChecks = await Promise.allSettled([
        fetch('/api/health'),
        fetch('/api/health/database'),
        fetch('/api/health/external-services')
      ]);

      const failedChecks = healthChecks.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.ok)
      );

      if (failedChecks.length > 0) {
        this.createAlert('technical', 'high', 
          `Health check failed: ${failedChecks.length} services down`);
      }
    } catch (error) {
      this.createAlert('technical', 'critical', 'Health check system failure');
    }
  }

  /**
   * Initialize real-time dashboard (client-side)
   */
  private initializeRealtimeDashboard(): void {
    // Create dashboard UI elements
    this.createDashboardUI();
    
    // Update dashboard every 10 seconds
    setInterval(() => {
      this.updateDashboardUI();
    }, 10000);
  }

  /**
   * Create dashboard UI
   */
  private createDashboardUI(): void {
    // Only create in development or admin mode
    if (process.env.NODE_ENV !== 'development') return;

    const dashboard = document.createElement('div');
    dashboard.id = 'monitoring-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-height: 400px;
      overflow-y: auto;
    `;
    
    document.body.appendChild(dashboard);
  }

  /**
   * Update dashboard UI with current metrics
   */
  private updateDashboardUI(): void {
    const dashboard = document.getElementById('monitoring-dashboard');
    if (!dashboard) return;

    const activeAlerts = this.alerts.filter(a => !a.resolved).length;
    const criticalAlerts = this.alerts.filter(a => !a.resolved && a.severity === 'critical').length;

    dashboard.innerHTML = `
      <h4>🔍 Monitoring Dashboard</h4>
      <div><strong>Alerts:</strong> ${activeAlerts} (${criticalAlerts} critical)</div>
      <div><strong>Response Time:</strong> ${this.metrics.performance?.responseTime || 0}ms</div>
      <div><strong>Error Rate:</strong> ${this.metrics.performance?.errorRate || 0}%</div>
      <div><strong>Memory:</strong> ${(this.metrics.technical?.memoryUsage || 0).toFixed(1)}%</div>
      <div><strong>Security Violations:</strong> ${this.metrics.security?.violationCount || 0}</div>
      <hr>
      <div><strong>Recent Alerts:</strong></div>
      ${this.alerts.slice(0, 3).map(alert => 
        `<div style="color: ${this.getAlertColor(alert.severity)}">
          ${alert.severity.toUpperCase()}: ${alert.message.substring(0, 50)}...
        </div>`
      ).join('')}
    `;
  }

  /**
   * Get color for alert severity
   */
  private getAlertColor(severity: Alert['severity']): string {
    switch (severity) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffaa00';
      case 'low': return '#88ff88';
      default: return '#ffffff';
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): Partial<MonitoringMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get system health status
   */
  public getHealthStatus(): any {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');

    return {
      status: criticalAlerts.length > 0 ? 'critical' :
              highAlerts.length > 0 ? 'degraded' :
              activeAlerts.length > 0 ? 'warning' : 'healthy',
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      metrics: this.metrics,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const monitoringDashboard = MonitoringDashboard.getInstance();

// Auto-initialize monitoring
if (typeof window !== 'undefined') {
  // Initialize after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitoringDashboard;
    }, 1000);
  });
}