import { useEffect } from 'react';
import { generateSessionId } from '../lib/analytics';

// Types for Web Vitals
interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  attribution?: any;
}

/**
 * Hook to monitor and report web vitals performance
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Generate session ID for tracking
    const sessionId = generateSessionId();
    
    // Store session start time
    sessionStorage.setItem('session_start_time', Date.now().toString());
    
    // Simple performance monitoring without dynamic imports
    try {
      // Report when page is fully loaded
      const handleLoad = () => {
        // Report page load time
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            reportPageLoadMetrics(perfData, sessionId);
          }
        }, 0);
      };

      // Report when page is about to unload
      const handleBeforeUnload = () => {
        // Report session duration and other final metrics
        reportSessionMetrics(sessionId);
      };

      window.addEventListener('load', handleLoad);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup event listeners
      return () => {
        window.removeEventListener('load', handleLoad);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } catch (error) {
      console.error('Error setting up performance monitoring:', error);
    }
  }, []); // Empty dependency array to run only once
}

/**
 * Report page load metrics
 */
async function reportPageLoadMetrics(perfData: PerformanceNavigationTiming, sessionId: string) {
  try {
    const response = await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'PAGE_LOAD',
        value: perfData.loadEventEnd - perfData.startTime,
        rating: perfData.loadEventEnd - perfData.startTime > 3000 ? 'poor' : 'good',
        delta: perfData.loadEventEnd - perfData.startTime,
        id: `page-load-${Date.now()}`,
        navigationType: perfData.type,
        sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        pageLoadTime: perfData.loadEventEnd - perfData.startTime,
      }),
    });

    if (!response.ok) {
      console.error('Failed to report page load metrics:', response.status);
    }
  } catch (error) {
    console.error('Error reporting page load metrics:', error);
  }
}

/**
 * Report session metrics
 */
async function reportSessionMetrics(sessionId: string) {
  try {
    // Calculate session duration
    const sessionStart = sessionStorage.getItem('session_start_time');
    if (sessionStart) {
      const duration = Date.now() - parseInt(sessionStart);
      
      const response = await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'SESSION_DURATION',
          value: duration,
          rating: duration > 300000 ? 'poor' : 'good', // 5 minutes threshold
          delta: duration,
          id: `session-${sessionId}`,
          sessionId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to report session metrics:', response.status);
      }
    }
  } catch (error) {
    console.error('Error reporting session metrics:', error);
  }
}

// Add utility function for measuring component load times
export function measureComponentLoad(componentName: string, callback: () => void) {
  if (typeof performance !== 'undefined' && performance.mark) {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    
    performance.mark(startMark);
    callback();
    performance.mark(endMark);
    performance.measure(componentName, startMark, endMark);
  } else {
    callback();
  }
}