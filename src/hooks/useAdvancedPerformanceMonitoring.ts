import { useState, useEffect, useCallback } from 'react';

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

export interface CoreWebVitals {
  lcp: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  fid: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  cls: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  fcp: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  ttfb: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
}

export interface PerformanceScores {
  mobile: number;
  desktop: number;
  lastUpdated: string | null;
}

export interface BudgetStatus {
  status: 'passing' | 'warning' | 'failing' | 'unknown';
  violations: number;
  lastCheck: string | null;
}

export interface RealUserMetrics {
  avgLoadTime: number;
  avgLCP: number;
  bounceRate: number;
  totalSessions: number;
  uniqueVisitors: number;
}

export interface PerformanceDashboard {
  performance: PerformanceScores;
  coreWebVitals: CoreWebVitals;
  alerts: {
    total: number;
    critical: number;
    warning: number;
    recent: PerformanceAlert[];
  };
  budget: BudgetStatus;
  realUserMetrics: RealUserMetrics;
  thresholds: any;
  budgets: any;
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
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
  }>;
}

export function useAdvancedPerformanceMonitoring() {
  const [dashboard, setDashboard] = useState<PerformanceDashboard | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/performance-monitoring?action=dashboard');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      setDashboard(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/performance-monitoring?action=alerts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }

      const data = await response.json();
      setAlerts(data.active || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Run performance monitoring
  const runMonitoring = useCallback(async (url?: string) => {
    try {
      setError(null);
      const response = await fetch('/api/admin/performance-monitoring?action=run-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url || 'https://oma-digital.sn' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to run monitoring: ${response.status}`);
      }

      const data = await response.json();
      
      // Refresh dashboard data after monitoring
      await fetchDashboard();
      await fetchAlerts();
      
      return data;
    } catch (err) {
      console.error('Error running monitoring:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [fetchDashboard, fetchAlerts]);

  // Run PageSpeed analysis
  const runPageSpeedAnalysis = useCallback(async (url: string, strategy: 'mobile' | 'desktop' = 'mobile') => {
    try {
      setError(null);
      const response = await fetch('/api/admin/performance-monitoring?action=pagespeed-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, strategy }),
      });

      if (!response.ok) {
        throw new Error(`Failed to run PageSpeed analysis: ${response.status}`);
      }

      const data = await response.json();
      
      // Refresh dashboard data
      await fetchDashboard();
      
      return data.result as PageSpeedResult;
    } catch (err) {
      console.error('Error running PageSpeed analysis:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [fetchDashboard]);

  // Check performance budgets
  const checkBudgets = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/performance-monitoring?action=check-budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check budgets: ${response.status}`);
      }

      const data = await response.json();
      
      // Refresh dashboard data
      await fetchDashboard();
      
      return data.budgetCheck;
    } catch (err) {
      console.error('Error checking budgets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [fetchDashboard]);

  // Resolve an alert
  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      setError(null);
      const response = await fetch('/api/admin/performance-monitoring?action=resolve-alert', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve alert: ${response.status}`);
      }

      // Remove the alert from the local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      // Refresh alerts
      await fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [fetchAlerts]);

  // Get performance trends
  const getPerformanceTrends = useCallback(async (days: number = 7) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/performance-monitoring?action=trends&days=${days}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.status}`);
      }

      const data = await response.json();
      return data.trends;
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  // Get PageSpeed history
  const getPageSpeedHistory = useCallback(async (url: string, days: number = 7) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/performance-monitoring?action=pagespeed&url=${encodeURIComponent(url)}&days=${days}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PageSpeed history: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching PageSpeed history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboard(),
          fetchAlerts()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchDashboard, fetchAlerts]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
      fetchAlerts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboard, fetchAlerts]);

  // Performance status helpers
  const getOverallStatus = useCallback(() => {
    if (!dashboard) return 'unknown';

    const criticalAlerts = dashboard.alerts.critical > 0;
    const budgetFailing = dashboard.budget.status === 'failing';
    const lowPerformance = dashboard.performance.mobile < 50 || dashboard.performance.desktop < 50;

    if (criticalAlerts || budgetFailing || lowPerformance) {
      return 'critical';
    }

    const warningAlerts = dashboard.alerts.warning > 0;
    const budgetWarning = dashboard.budget.status === 'warning';
    const mediumPerformance = dashboard.performance.mobile < 80 || dashboard.performance.desktop < 80;

    if (warningAlerts || budgetWarning || mediumPerformance) {
      return 'warning';
    }

    return 'good';
  }, [dashboard]);

  const getWebVitalsStatus = useCallback(() => {
    if (!dashboard) return 'unknown';

    const vitals = dashboard.coreWebVitals;
    const poorVitals = Object.values(vitals).filter(v => v.score === 'poor').length;
    const needsImprovementVitals = Object.values(vitals).filter(v => v.score === 'needs-improvement').length;

    if (poorVitals > 0) return 'poor';
    if (needsImprovementVitals > 0) return 'needs-improvement';
    return 'good';
  }, [dashboard]);

  const getPerformanceGrade = useCallback(() => {
    if (!dashboard) return 'N/A';

    const avgScore = (dashboard.performance.mobile + dashboard.performance.desktop) / 2;
    
    if (avgScore >= 95) return 'A+';
    if (avgScore >= 90) return 'A';
    if (avgScore >= 85) return 'B+';
    if (avgScore >= 80) return 'B';
    if (avgScore >= 75) return 'C+';
    if (avgScore >= 70) return 'C';
    if (avgScore >= 65) return 'D+';
    if (avgScore >= 60) return 'D';
    return 'F';
  }, []);

  return {
    // Data
    dashboard,
    alerts,
    loading,
    error,
    lastUpdate,

    // Actions
    runMonitoring,
    runPageSpeedAnalysis,
    checkBudgets,
    resolveAlert,
    fetchDashboard,
    fetchAlerts,

    // Data fetchers
    getPerformanceTrends,
    getPageSpeedHistory,

    // Status helpers
    getOverallStatus,
    getWebVitalsStatus,
    getPerformanceGrade,

    // Refresh
    refresh: () => {
      fetchDashboard();
      fetchAlerts();
    }
  };
}

// Performance monitoring notification hook
export function usePerformanceNotifications() {
  const [notifications, setNotifications] = useState<PerformanceAlert[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Check for new alerts every minute
    const checkAlerts = async () => {
      try {
        const response = await fetch('/api/admin/performance-monitoring?action=alerts');
        if (response.ok) {
          const data = await response.json();
          const newAlerts = data.active.filter((alert: PerformanceAlert) => 
            !notifications.find(n => n.id === alert.id)
          );

          if (newAlerts.length > 0) {
            setNotifications(prev => [...newAlerts, ...prev].slice(0, 10)); // Keep last 10
            setHasUnread(true);
            
            // Show browser notification for critical alerts
            newAlerts.forEach((alert: PerformanceAlert) => {
              if (alert.type === 'critical' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification(`Performance Alert: ${alert.metric}`, {
                    body: alert.message,
                    icon: '/images/logo.webp',
                    tag: alert.id,
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error checking alerts:', error);
      }
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkAlerts, 60000); // 1 minute
    checkAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [notifications]);

  const markAsRead = useCallback(() => {
    setHasUnread(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setHasUnread(false);
  }, []);

  return {
    notifications,
    hasUnread,
    markAsRead,
    clearNotifications,
  };
}