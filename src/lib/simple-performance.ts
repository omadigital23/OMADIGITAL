// Simplified performance monitoring for Figma Make environment
// Uses only native browser APIs

export interface SimpleMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

// Track page load performance
export function trackPagePerformance() {
  if (typeof window === 'undefined' || !window.performance) return;

  const perfData = window.performance.timing;
  const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  // Calculate basic metrics
  const metrics: SimpleMetric[] = [];

  // Page Load Time
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  if (pageLoadTime > 0) {
    metrics.push({
      name: 'page_load_time',
      value: pageLoadTime,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  // DOM Content Loaded
  const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
  if (domContentLoaded > 0) {
    metrics.push({
      name: 'dom_content_loaded',
      value: domContentLoaded,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  // Time to First Byte
  const ttfb = perfData.responseStart - perfData.navigationStart;
  if (ttfb > 0) {
    metrics.push({
      name: 'ttfb',
      value: ttfb,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  // First Paint (if available)
  const paintEntries = window.performance.getEntriesByType('paint');
  paintEntries.forEach((entry) => {
    metrics.push({
      name: entry.name.replace('-', '_'),
      value: entry.startTime,
      timestamp: Date.now(),
      url: window.location.href
    });
  });

  // Report metrics
  metrics.forEach(metric => {
    reportSimpleMetric(metric);
  });

  // Monitor resource loading
  monitorResources();
}

// Report metric to analytics
function reportSimpleMetric(metric: SimpleMetric) {
  // Google Analytics 4
  if ((window as any).gtag) {
    (window as any).gtag('event', 'performance_metric', {
      event_category: 'Performance',
      event_label: metric.name,
      value: Math.round(metric.value),
      custom_map: {
        metric_name: metric.name,
        metric_value: metric.value,
        page_url: metric.url
      }
    });
  }

  // Console log in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const rating = getSimpleRating(metric.name, metric.value);
    console.log(`📊 ${metric.name}: ${Math.round(metric.value)}ms (${rating})`, {
      value: metric.value,
      rating,
      url: metric.url
    });
  }
}

// Get simple performance rating
function getSimpleRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: { [key: string]: { good: number; poor: number } } = {
    'page_load_time': { good: 2000, poor: 4000 },
    'dom_content_loaded': { good: 1500, poor: 3000 },
    'ttfb': { good: 800, poor: 1800 },
    'first_paint': { good: 1800, poor: 3000 },
    'first_contentful_paint': { good: 1800, poor: 3000 }
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Monitor resource loading performance
function monitorResources() {
  if (!window.performance || !window.performance.getEntriesByType) return;

  const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  resources.forEach(resource => {
    // Track slow loading resources
    if (resource.duration > 1000) {
      console.warn('🐌 Slow resource:', {
        name: resource.name,
        duration: Math.round(resource.duration),
        type: resource.initiatorType,
        size: resource.transferSize
      });

      // Report to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'slow_resource', {
          event_category: 'Performance',
          event_label: resource.initiatorType,
          value: Math.round(resource.duration),
          custom_map: {
            resource_name: resource.name,
            resource_type: resource.initiatorType,
            resource_duration: resource.duration
          }
        });
      }
    }
  });
}

// Monitor frame rate and responsiveness
export function monitorFrameRate() {
  if (typeof window === 'undefined') return;

  let frameCount = 0;
  let lastTime = performance.now();
  let lowFrameCount = 0;

  function countFrame() {
    frameCount++;
    const currentTime = performance.now();

    // Check every second
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;

      // Track low FPS
      if (fps < 30) {
        lowFrameCount++;
        console.warn(`🎬 Low FPS detected: ${fps}fps`);
        
        // Report if consistently low
        if (lowFrameCount >= 3) {
          if ((window as any).gtag) {
            (window as any).gtag('event', 'low_fps', {
              event_category: 'Performance',
              event_label: 'frame_rate',
              value: fps
            });
          }
          lowFrameCount = 0; // Reset counter
        }
      } else {
        lowFrameCount = 0; // Reset on good frame rate
      }
    }

    requestAnimationFrame(countFrame);
  }

  requestAnimationFrame(countFrame);
}

// Monitor memory usage (if available)
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !(window.performance as any).memory) return;

  const checkMemory = () => {
    const memory = (window.performance as any).memory;
    const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

    if (memoryUsage > 0.8) {
      console.warn('🧠 High memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
        usage: `${Math.round(memoryUsage * 100)}%`
      });

      if ((window as any).gtag) {
        (window as any).gtag('event', 'high_memory_usage', {
          event_category: 'Performance',
          event_label: 'memory',
          value: Math.round(memoryUsage * 100)
        });
      }
    }
  };

  // Check memory every 30 seconds
  setInterval(checkMemory, 30000);
}

// Initialize all simple performance monitoring
export function initSimplePerformance() {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(trackPagePerformance, 100);
    });
  } else {
    setTimeout(trackPagePerformance, 100);
  }

  // Start continuous monitoring
  monitorFrameRate();
  monitorMemoryUsage();

  console.log('✅ Simple performance monitoring initialized');
}

// OMA Digital specific performance targets
export const OMA_PERFORMANCE_TARGETS = {
  page_load_time: 1500,    // Target: <1.5s
  dom_content_loaded: 1000, // Target: <1s
  ttfb: 400,               // Target: <400ms
  first_paint: 1000,       // Target: <1s
  first_contentful_paint: 1200 // Target: <1.2s
};

// Check if page meets OMA targets
export function checkOMAPerformanceTargets(): Promise<{ [key: string]: boolean }> {
  return new Promise((resolve) => {
    const results: { [key: string]: boolean } = {};
    
    setTimeout(() => {
      const perfData = window.performance.timing;
      
      // Check each target
      Object.entries(OMA_PERFORMANCE_TARGETS).forEach(([metric, target]) => {
        let value = 0;
        
        switch (metric) {
          case 'page_load_time':
            value = perfData.loadEventEnd - perfData.navigationStart;
            break;
          case 'dom_content_loaded':
            value = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            break;
          case 'ttfb':
            value = perfData.responseStart - perfData.navigationStart;
            break;
          // Paint metrics require PerformanceObserver
          default:
            value = 0;
        }
        
        results[metric] = value > 0 && value <= target;
      });
      
      resolve(results);
    }, 2000);
  });
}