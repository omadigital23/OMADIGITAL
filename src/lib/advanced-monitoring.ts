/**
 * Système de monitoring avancé pour OMA Digital
 */

interface PerformanceMetrics {
  responseTime: number;
  errorRate: number;
  throughput: number;
  cacheHitRate: number;
  ctaConversionRate: number;
}

interface AlertConfig {
  type: 'error' | 'performance' | 'business';
  threshold: number;
  enabled: boolean;
}

class AdvancedMonitoring {
  private metrics: Map<string, number[]> = new Map();
  private alerts: Map<string, AlertConfig> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeAlerts();
  }

  private initializeAlerts() {
    this.alerts.set('high_error_rate', {
      type: 'error',
      threshold: 0.05, // 5%
      enabled: true
    });

    this.alerts.set('slow_response', {
      type: 'performance',
      threshold: 3000, // 3 seconds
      enabled: true
    });

    this.alerts.set('low_cta_conversion', {
      type: 'business',
      threshold: 0.02, // 2%
      enabled: true
    });
  }

  /**
   * Enregistre une métrique
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Garder seulement les 100 dernières valeurs
    if (values.length > 100) {
      values.shift();
    }

    // Vérifier les alertes
    this.checkAlerts(name, value);
  }

  /**
   * Calcule les métriques moyennes
   */
  getAverageMetric(name: string, windowSize = 10): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;

    const recentValues = values.slice(-windowSize);
    return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  }

  /**
   * Vérifie les alertes
   */
  private checkAlerts(metricName: string, value: number): void {
    for (const [alertName, config] of this.alerts) {
      if (!config.enabled) continue;

      let shouldAlert = false;

      switch (alertName) {
        case 'high_error_rate':
          if (metricName === 'error_rate' && value > config.threshold) {
            shouldAlert = true;
          }
          break;

        case 'slow_response':
          if (metricName === 'response_time' && value > config.threshold) {
            shouldAlert = true;
          }
          break;

        case 'low_cta_conversion':
          if (metricName === 'cta_conversion_rate' && value < config.threshold) {
            shouldAlert = true;
          }
          break;
      }

      if (shouldAlert) {
        this.triggerAlert(alertName, metricName, value, config);
      }
    }
  }

  /**
   * Déclenche une alerte
   */
  private async triggerAlert(
    alertName: string, 
    metricName: string, 
    value: number, 
    config: AlertConfig
  ): Promise<void> {
    const alertData = {
      alert: alertName,
      metric: metricName,
      value,
      threshold: config.threshold,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(config.type, value, config.threshold)
    };

    console.warn('🚨 Alert triggered:', alertData);

    // Envoyer à l'API de monitoring
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Détermine la sévérité d'une alerte
   */
  private getSeverity(type: string, value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = type === 'business' ? threshold / value : value / threshold;

    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Obtient un rapport de santé du système
   */
  getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: PerformanceMetrics;
    alerts: any[];
  } {
    const metrics: PerformanceMetrics = {
      responseTime: this.getAverageMetric('response_time'),
      errorRate: this.getAverageMetric('error_rate'),
      throughput: this.getAverageMetric('throughput'),
      cacheHitRate: this.getAverageMetric('cache_hit_rate'),
      ctaConversionRate: this.getAverageMetric('cta_conversion_rate')
    };

    // Déterminer le statut global
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (metrics.errorRate > 0.1 || metrics.responseTime > 5000) {
      status = 'critical';
    } else if (metrics.errorRate > 0.05 || metrics.responseTime > 3000) {
      status = 'warning';
    }

    return {
      status,
      metrics,
      alerts: [] // TODO: Implémenter la récupération des alertes actives
    };
  }

  /**
   * Track une interaction chatbot avec métriques avancées
   */
  async trackChatbotInteraction(data: {
    sessionId: string;
    messageText: string;
    responseText: string;
    responseTime: number;
    hasError: boolean;
    ctaPresent: boolean;
    ctaClicked?: boolean;
  }): Promise<void> {
    // Enregistrer les métriques
    this.recordMetric('response_time', data.responseTime);
    this.recordMetric('error_rate', data.hasError ? 1 : 0);
    this.recordMetric('throughput', 1);

    if (data.ctaPresent) {
      this.recordMetric('cta_conversion_rate', data.ctaClicked ? 1 : 0);
    }

    // Analyser le sentiment (simple)
    const sentiment = this.analyzeSentiment(data.messageText);

    // Envoyer à Supabase
    try {
      const response = await fetch('/api/monitoring/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sentiment,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        this.recordMetric('error_rate', 1);
      }
    } catch (error) {
      console.error('Failed to track interaction:', error);
      this.recordMetric('error_rate', 1);
    }
  }

  /**
   * Analyse simple du sentiment
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['merci', 'excellent', 'parfait', 'super', 'génial', 'bravo'];
    const negativeWords = ['problème', 'erreur', 'bug', 'lent', 'mauvais', 'nul'];

    const lowerText = text.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Obtient les métriques pour le dashboard
   */
  getDashboardMetrics(): {
    realtime: PerformanceMetrics;
    trends: Record<string, number[]>;
    health: string;
  } {
    const realtime = {
      responseTime: this.getAverageMetric('response_time', 5),
      errorRate: this.getAverageMetric('error_rate', 10),
      throughput: this.getAverageMetric('throughput', 5),
      cacheHitRate: this.getAverageMetric('cache_hit_rate', 10),
      ctaConversionRate: this.getAverageMetric('cta_conversion_rate', 20)
    };

    const trends: Record<string, number[]> = {};
    for (const [name, values] of this.metrics) {
      trends[name] = values.slice(-20); // 20 dernières valeurs
    }

    const health = this.getHealthReport().status;

    return { realtime, trends, health };
  }

  /**
   * Reset des métriques
   */
  resetMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Configuration des alertes
   */
  configureAlert(name: string, config: AlertConfig): void {
    this.alerts.set(name, config);
  }
}

// Export singleton
export const advancedMonitoring = new AdvancedMonitoring();