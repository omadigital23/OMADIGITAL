/**
 * Performance Optimizer for OMA Digital Platform
 * Comprehensive performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enablePrefetching: boolean;
  enableServiceWorker: boolean;
  enableAnalytics: boolean;
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Partial<PerformanceMetrics> = {};
  private config: OptimizationConfig;
  private observer: PerformanceObserver | null = null;

  private constructor() {
    this.config = {
      enableImageOptimization: true,
      enableCodeSplitting: true,
      enablePrefetching: true,
      enableServiceWorker: true,
      enableAnalytics: true
    };
    
    if (typeof window !== 'undefined') {
      this.initializePerformanceMonitoring();
    }
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize comprehensive performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Web Vitals monitoring
    this.monitorWebVitals();
    
    // Resource timing monitoring
    this.monitorResourceTiming();
    
    // Navigation timing monitoring
    this.monitorNavigationTiming();
    
    // Long task monitoring
    this.monitorLongTasks();
    
    // Memory usage monitoring
    this.monitorMemoryUsage();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorWebVitals(): void {
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.reportMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Monitor resource loading performance
   */
  private monitorResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // Monitor slow resources
          if (entry.duration > 1000) {
            console.warn(`Slow resource detected: ${entry.name} (${entry.duration}ms)`);
            this.reportSlowResource(entry);
          }
          
          // Monitor failed resources
          if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
            console.warn(`Failed resource: ${entry.name}`);
            this.reportFailedResource(entry);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Monitor navigation timing
   */
  private monitorNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domParse: navigation.domContentLoadedEventEnd - navigation.responseEnd,
            total: navigation.loadEventEnd - navigation.navigationStart
          };
          
          this.reportNavigationMetrics(metrics);
        }
      }, 0);
    });
  }

  /**
   * Monitor long tasks that block the main thread
   */
  private monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.warn(`Long task detected: ${entry.duration}ms`);
          this.reportLongTask(entry);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryInfo = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
        
        // Alert if memory usage is high
        if (memoryInfo.usage > 80) {
          console.warn(`High memory usage: ${memoryInfo.usage.toFixed(2)}%`);
          this.reportHighMemoryUsage(memoryInfo);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Report performance metrics to analytics
   */
  private reportMetric(name: string, value: number): void {
    if (!this.config.enableAnalytics) return;
    
    // Send to analytics service
    this.sendToAnalytics('web_vital', {
      metric_name: name,
      value: value,
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report slow resource loading
   */
  private reportSlowResource(entry: any): void {
    this.sendToAnalytics('slow_resource', {
      resource_name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: entry.initiatorType,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report failed resource loading
   */
  private reportFailedResource(entry: any): void {
    this.sendToAnalytics('failed_resource', {
      resource_name: entry.name,
      type: entry.initiatorType,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report navigation metrics
   */
  private reportNavigationMetrics(metrics: any): void {
    this.sendToAnalytics('navigation_timing', {
      ...metrics,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report long tasks
   */
  private reportLongTask(entry: any): void {
    this.sendToAnalytics('long_task', {
      duration: entry.duration,
      start_time: entry.startTime,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report high memory usage
   */
  private reportHighMemoryUsage(memoryInfo: any): void {
    this.sendToAnalytics('high_memory_usage', {
      ...memoryInfo,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send data to analytics service
   */
  private async sendToAnalytics(eventType: string, data: any): Promise<void> {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          data: data
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get performance score based on Web Vitals
   */
  public getPerformanceScore(): number {
    const { lcp, fid, cls } = this.metrics;
    
    if (!lcp || !fid || cls === undefined) {
      return 0;
    }
    
    // Scoring based on Web Vitals thresholds
    let score = 0;
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (lcp <= 2500) score += 40;
    else if (lcp <= 4000) score += 20;
    
    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (fid <= 100) score += 30;
    else if (fid <= 300) score += 15;
    
    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cls <= 0.1) score += 30;
    else if (cls <= 0.25) score += 15;
    
    return score;
  }

  /**
   * Optimize images by lazy loading and format conversion
   */
  public optimizeImages(): void {
    if (!this.config.enableImageOptimization) return;
    
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach((img) => imageObserver.observe(img));
    }
  }

  /**
   * Prefetch critical resources
   */
  public prefetchCriticalResources(): void {
    if (!this.config.enablePrefetching) return;
    
    const criticalResources = [
      '/api/chat/gemini',
      '/images/logo.webp',
      '/videos/hero1.webm'
    ];
    
    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Initialize service worker for caching
   */
  public initializeServiceWorker(): void {
    if (!this.config.enableServiceWorker || !('serviceWorker' in navigator)) return;
    
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  }

  /**
   * Optimize bundle loading with code splitting
   */
  public optimizeBundleLoading(): void {
    if (!this.config.enableCodeSplitting) return;
    
    // Preload critical chunks
    const criticalChunks = [
      '/_next/static/chunks/pages/_app.js',
      '/_next/static/chunks/pages/index.js'
    ];
    
    criticalChunks.forEach((chunk) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = chunk;
      document.head.appendChild(link);
    });
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): any {
    const score = this.getPerformanceScore();
    const metrics = this.getMetrics();
    
    return {
      score,
      metrics,
      recommendations: this.getRecommendations(score, metrics),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get performance recommendations
   */
  private getRecommendations(score: number, metrics: Partial<PerformanceMetrics>): string[] {
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Overall performance needs improvement');
    }
    
    if (metrics.lcp && metrics.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint (LCP) - consider image optimization and server response time');
    }
    
    if (metrics.fid && metrics.fid > 100) {
      recommendations.push('Reduce First Input Delay (FID) - minimize JavaScript execution time');
    }
    
    if (metrics.cls && metrics.cls > 0.1) {
      recommendations.push('Improve Cumulative Layout Shift (CLS) - ensure proper image dimensions and avoid dynamic content insertion');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  // Initialize optimizations after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceOptimizer.optimizeImages();
      performanceOptimizer.prefetchCriticalResources();
      performanceOptimizer.initializeServiceWorker();
      performanceOptimizer.optimizeBundleLoading();
    }, 1000);
  });
}