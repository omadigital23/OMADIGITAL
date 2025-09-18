/**
 * Alerting System for Data Flow Monitoring
 * 
 * This module provides a centralized alerting system that can be integrated
 * with various monitoring points throughout the application.
 */

interface AlertConfig {
  enabled: boolean;
  thresholds: {
    apiResponseTime: number; // in milliseconds
    errorRate: number; // percentage
    dataConsistency: number; // percentage
  };
  channels: {
    slack?: string; // webhook URL
    email?: string[]; // email addresses
    sms?: string[]; // phone numbers
  };
}

interface AlertEvent {
  type: 'api_error' | 'data_inconsistency' | 'performance_degradation' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  timestamp: Date;
}

class AlertingSystem {
  private config: AlertConfig;
  private alertHistory: AlertEvent[] = [];

  constructor(config: AlertConfig) {
    this.config = config;
  }

  /**
   * Send an alert through configured channels
   */
  async sendAlert(event: AlertEvent): Promise<void> {
    // Add to history
    this.alertHistory.push(event);
    
    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }

    console.log(`[${event.severity.toUpperCase()}] ${event.type}: ${event.message}`);
    
    // In production, implement actual alerting channels:
    // - Slack notifications
    // - Email alerts
    // - SMS notifications
    // - Integration with monitoring services
    
    if (this.config.channels.slack) {
      await this.sendSlackAlert(event);
    }
    
    if (this.config.channels.email && this.config.channels.email.length > 0) {
      await this.sendEmailAlert(event);
    }
  }

  /**
   * Check API response time and alert if threshold exceeded
   */
  async checkApiResponseTime(responseTime: number, endpoint: string): Promise<void> {
    if (responseTime > this.config.thresholds.apiResponseTime) {
      await this.sendAlert({
        type: 'performance_degradation',
        severity: responseTime > this.config.thresholds.apiResponseTime * 2 ? 'high' : 'medium',
        message: `API response time degradation detected for ${endpoint}`,
        details: { responseTime, threshold: this.config.thresholds.apiResponseTime },
        timestamp: new Date()
      });
    }
  }

  /**
   * Check for data consistency issues
   */
  async checkDataConsistency(expected: number, actual: number, context: string): Promise<void> {
    const consistency = (actual / expected) * 100;
    if (consistency < this.config.thresholds.dataConsistency) {
      await this.sendAlert({
        type: 'data_inconsistency',
        severity: consistency < this.config.thresholds.dataConsistency / 2 ? 'high' : 'medium',
        message: `Data consistency issue detected in ${context}`,
        details: { expected, actual, consistency: `${consistency.toFixed(2)}%` },
        timestamp: new Date()
      });
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendSlackAlert(event: AlertEvent): Promise<void> {
    // Implementation would go here
    // This is a placeholder for actual Slack webhook integration
    console.log(`Would send Slack alert: ${event.message}`);
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(event: AlertEvent): Promise<void> {
    // Implementation would go here
    // This is a placeholder for actual email sending
    console.log(`Would send email alert: ${event.message}`);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(hours: number = 24): AlertEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(alert => alert.timestamp >= cutoff);
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> } {
    const stats = {
      total: this.alertHistory.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    this.alertHistory.forEach(alert => {
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
    });

    return stats;
  }
}

// Default configuration
const defaultConfig: AlertConfig = {
  enabled: true,
  thresholds: {
    apiResponseTime: 5000, // 5 seconds
    errorRate: 5, // 5%
    dataConsistency: 95 // 95%
  },
  channels: {
    // Add actual webhook URLs and contact information in production
  }
};

// Export singleton instance
export const alertingSystem = new AlertingSystem(defaultConfig);

// Export types for use in other modules
export type { AlertConfig, AlertEvent };
export default AlertingSystem;