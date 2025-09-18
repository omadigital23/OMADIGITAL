// Custom Web Vitals implementation using native Performance APIs
export interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  delta: number;
}

// Web Vitals tracking for Core Web Vitals optimization
export function reportWebVitals(metric: Metric) {
  // Track in Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      custom_map: {
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta
      }
    });
  }

  // Log to console in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta
    });
  }

  // Send to monitoring service (Sentry, custom analytics, etc.)
  sendToAnalytics(metric);
}

// Get performance rating based on Core Web Vitals thresholds
function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

// Generate unique ID for metrics
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Send metrics to analytics service
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  });

  // Use sendBeacon if available for reliability
  if (navigator.sendBeacon) {
    // sendBeacon doesn't allow setting content-type, so we'll use fetch as primary method
    // and only use sendBeacon as a last resort
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {
      // Fallback to sendBeacon if fetch fails
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    });
  } else {
    // Fallback to fetch
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(console.error);
  }
}

// Native implementations of Web Vitals using Performance APIs

// Largest Contentful Paint (LCP)
function observeLCP(callback: (metric: Metric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        const metric: Metric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: getVitalRating('LCP', lastEntry.startTime),
          id: generateUniqueId(),
          delta: lastEntry.startTime
        };
        callback(metric);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.warn('LCP observer failed:', error);
  }
}

// First Input Delay (FID) - replaced by INP in newer browsers
function observeFID(callback: (metric: Metric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          const metric: Metric = {
            name: 'FID',
            value: fid,
            rating: getVitalRating('FID', fid),
            id: generateUniqueId(),
            delta: fid
          };
          callback(metric);
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    console.warn('FID observer failed:', error);
  }
}

// Cumulative Layout Shift (CLS)
function observeCLS(callback: (metric: Metric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: any[] = [];
  
  // Throttle CLS tracking to prevent excessive events
  let lastReportTime = 0;
  const THROTTLE_DELAY = 1000; // 1 second throttle

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            
            // Throttle the reporting
            const now = Date.now();
            if (now - lastReportTime > THROTTLE_DELAY) {
              lastReportTime = now;
              
              const metric: Metric = {
                name: 'CLS',
                value: clsValue,
                rating: getVitalRating('CLS', clsValue),
                id: generateUniqueId(),
                delta: entry.value
              };
              callback(metric);
            }
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    console.warn('CLS observer failed:', error);
  }
}

// First Contentful Paint (FCP)
function observeFCP(callback: (metric: Metric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const metric: Metric = {
            name: 'FCP',
            value: entry.startTime,
            rating: getVitalRating('FCP', entry.startTime),
            id: generateUniqueId(),
            delta: entry.startTime
          };
          callback(metric);
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  } catch (error) {
    console.warn('FCP observer failed:', error);
  }
}

// Time to First Byte (TTFB)
function observeTTFB(callback: (metric: Metric) => void) {
  if (typeof window === 'undefined' || !performance.timing) return;

  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigationEntry) {
    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    const metric: Metric = {
      name: 'TTFB',
      value: ttfb,
      rating: getVitalRating('TTFB', ttfb),
      id: generateUniqueId(),
      delta: ttfb
    };
    callback(metric);
  }
}

// Interaction to Next Paint (INP) - modern replacement for FID
function observeINP(callback: (metric: Metric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // Throttle INP tracking to prevent excessive events
  let lastReportTime = 0;
  const THROTTLE_DELAY = 1000; // 1 second throttle

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const inp = entry.processingStart - entry.startTime;
          
          // Throttle the reporting
          const now = Date.now();
          if (now - lastReportTime > THROTTLE_DELAY) {
            lastReportTime = now;
            
            const metric: Metric = {
              name: 'INP',
              value: inp,
              rating: getVitalRating('INP', inp),
              id: generateUniqueId(),
              delta: inp
            };
            callback(metric);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['event'] });
  } catch (error) {
    console.warn('INP observer failed:', error);
  }
}

// Initialize all Web Vitals tracking
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  observeLCP(reportWebVitals);
  observeFID(reportWebVitals);
  observeCLS(reportWebVitals);
  observeFCP(reportWebVitals);
  observeTTFB(reportWebVitals);
  observeINP(reportWebVitals);
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    // Observe long tasks (>50ms) that can cause janky interactions
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });

          // Track long tasks in analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'long_task', {
              event_category: 'Performance',
              event_label: 'Long Task Detected',
              value: Math.round(entry.duration),
              custom_map: {
                task_duration: entry.duration,
                task_start: entry.startTime
              }
            });
          }
        }
      });
    });

    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Observe layout shifts for CLS debugging
    const layoutShiftObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.value > 0.1) {
          console.warn('Large layout shift detected:', {
            value: entry.value,
            sources: entry.sources,
            startTime: entry.startTime
          });
          
          // Track layout shifts in analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'layout_shift', {
              event_category: 'Performance',
              event_label: 'Layout Shift',
              value: Math.round(entry.value * 1000),
              custom_map: {
                shift_value: entry.value,
                shift_sources: entry.sources?.length || 0
              }
            });
          }
        }
      });
    });

    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

    // Observe resource loading performance
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        // Track slow loading resources (increased threshold to reduce noise)
        if (entry.duration > 2000) {
          console.warn('Slow resource loading:', {
            name: entry.name,
            duration: entry.duration,
            type: entry.initiatorType
          });
          
          // Track slow resources in analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'slow_resource', {
              event_category: 'Performance',
              event_label: entry.name,
              value: Math.round(entry.duration),
              custom_map: {
                resource_name: entry.name,
                resource_type: entry.initiatorType,
                load_duration: entry.duration
              }
            });
          }
        }
        
        // Track all resources for performance analysis
        if ((window as any).gtag) {
          (window as any).gtag('event', 'resource_load', {
            event_category: 'Performance',
            event_label: entry.name,
            value: Math.round(entry.duration),
            custom_map: {
              resource_name: entry.name,
              resource_type: entry.initiatorType,
              load_duration: entry.duration,
              transfer_size: entry.transferSize || 0
            }
          });
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Observe navigation timing for page load metrics
    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        // Track navigation timing in analytics
        if ((window as any).gtag) {
          (window as any).gtag('event', 'navigation_timing', {
            event_category: 'Performance',
            event_label: 'Page Load',
            value: Math.round(entry.loadEventEnd - entry.loadEventStart),
            custom_map: {
              dns_time: entry.domainLookupEnd - entry.domainLookupStart,
              connect_time: entry.connectEnd - entry.connectStart,
              response_time: entry.responseEnd - entry.responseStart,
              dom_content_loaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              load_time: entry.loadEventEnd - entry.loadEventStart
            }
          });
        }
      });
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });

  } catch (error) {
    console.error('Performance observer initialization failed:', error);
  }
}

// Critical performance thresholds for OMA Digital
export const PERFORMANCE_THRESHOLDS = {
  LCP: 1500,        // Target: <1.5s (très strict)
  FID: 50,          // Target: <50ms
  CLS: 0.05,        // Target: <0.05
  FCP: 1000,        // Target: <1s
  TTFB: 400,        // Target: <400ms
  totalLoadTime: 2000 // Target: <2s pour le chargement complet
};

// Check if current page meets performance targets
export function checkPerformanceTargets(): Promise<{ [key: string]: boolean }> {
  return new Promise((resolve) => {
    const results: { [key: string]: boolean } = {};
    let metricsReceived = 0;
    const expectedMetrics = 5;

    const checkMetric = (name: string, value: number) => {
      results[name] = value <= PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
      metricsReceived++;
      
      if (metricsReceived >= expectedMetrics) {
        resolve(results);
      }
    };

    // Check LCP
    observeLCP((metric) => {
      checkMetric('LCP', metric.value);
    });

    // Check FID  
    observeFID((metric) => {
      checkMetric('FID', metric.value);
    });

    // Check CLS
    observeCLS((metric) => {
      checkMetric('CLS', metric.value);
    });

    // Check FCP
    observeFCP((metric) => {
      checkMetric('FCP', metric.value);
    });

    // Check TTFB
    observeTTFB((metric) => {
      checkMetric('TTFB', metric.value);
    });

    // Fallback timeout
    setTimeout(() => {
      resolve(results);
    }, 5000);
  });
}