/**
 * Advanced Performance Optimization Manager
 * Provides intelligent resource management, lazy loading, and performance monitoring
 */

import { logger, performanceLogger } from './logger';

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  inp?: number;
}

export interface ResourceHint {
  url: string;
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
}

export interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  unobserveAfterLoad?: boolean;
}

// ============================================================================
// Performance Budget Monitor
// ============================================================================

class PerformanceBudgetMonitor {
  private budgets = {
    lcp: 2500, // Good LCP threshold
    fid: 100,  // Good FID threshold
    cls: 0.1,  // Good CLS threshold
    fcp: 1800, // Good FCP threshold
    ttfb: 800, // Good TTFB threshold
    bundleSize: 250000, // 250KB gzipped
    imageSize: 500000,  // 500KB per image
  };

  private violations: Array<{
    metric: string;
    value: number;
    threshold: number;
    timestamp: string;
  }> = [];

  checkMetric(metric: keyof PerformanceMetrics, value: number): boolean {
    const threshold = this.budgets[metric];
    if (!threshold) return true;

    const isWithinBudget = value <= threshold;
    
    if (!isWithinBudget) {
      const violation = {
        metric,
        value,
        threshold,
        timestamp: new Date().toISOString(),
      };
      
      this.violations.push(violation);
      
      logger.warn(`Performance budget violation: ${metric}`, {
        component: 'performance_monitor',
      }, violation);
    }

    return isWithinBudget;
  }

  getViolations(): typeof this.violations {
    return [...this.violations];
  }

  setBudget(metric: keyof typeof this.budgets, value: number): void {
    this.budgets[metric] = value;
  }
}

// ============================================================================
// Resource Preloading Manager
// ============================================================================

class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preconnectedOrigins = new Set<string>();

  preloadResource(hint: ResourceHint): void {
    if (this.preloadedResources.has(hint.url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = hint.url;
    link.as = hint.as;
    
    if (hint.crossorigin) {
      link.crossOrigin = hint.crossorigin;
    }
    
    if (hint.integrity) {
      link.integrity = hint.integrity;
    }

    document.head.appendChild(link);
    this.preloadedResources.add(hint.url);

    logger.debug(`Preloaded resource: ${hint.url}`, {
      component: 'resource_preloader',
    }, { as: hint.as });
  }

  preconnectOrigin(origin: string): void {
    if (this.preconnectedOrigins.has(origin)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    
    document.head.appendChild(link);
    this.preconnectedOrigins.add(origin);

    logger.debug(`Preconnected to origin: ${origin}`, {
      component: 'resource_preloader',
    });
  }

  preloadCriticalResources(): void {
    // Preconnect to external domains
    this.preconnectOrigin('https://fonts.googleapis.com');
    this.preconnectOrigin('https://fonts.gstatic.com');
    this.preconnectOrigin('https://www.googletagmanager.com');
    
    // Preload critical fonts
    this.preloadResource({
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      as: 'style',
    });
  }
}

// ============================================================================
// Intelligent Lazy Loading
// ============================================================================

export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private loadedElements = new WeakSet();

  constructor(options: LazyLoadOptions = {}) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1,
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadElement(entry.target as HTMLElement);
        this.loadedElements.add(entry.target);
        this.observer?.unobserve(entry.target);
      }
    });
  }

  private loadElement(element: HTMLElement): void {
    const startTime = performance.now();

    // Handle images
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      const dataSrc = img.dataset.src;
      if (dataSrc) {
        img.src = dataSrc;
        img.onload = () => {
          performanceLogger.timing('lazy_image_load', startTime, {
            component: 'lazy_loader',
          });
        };
      }
    }

    // Handle background images
    const dataBg = element.dataset.bg;
    if (dataBg) {
      element.style.backgroundImage = `url(${dataBg})`;
    }

    // Handle custom lazy components
    if (element.dataset.component) {
      element.classList.add('loaded');
      performanceLogger.timing('lazy_component_load', startTime, {
        component: 'lazy_loader',
      });
    }
  }

  observe(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadElement(element);
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
  }
}

// ============================================================================
// Code Splitting Helper
// ============================================================================

export class CodeSplitter {
  private loadedChunks = new Set<string>();

  async loadChunk<T>(
    chunkName: string,
    loader: () => Promise<T>
  ): Promise<T> {
    if (this.loadedChunks.has(chunkName)) {
      return loader();
    }

    const startTime = performance.now();
    
    try {
      const result = await loader();
      this.loadedChunks.add(chunkName);
      
      performanceLogger.timing(`chunk_load_${chunkName}`, startTime, {
        component: 'code_splitter',
      });
      
      return result;
    } catch (error) {
      logger.error(`Failed to load chunk: ${chunkName}`, error, {
        component: 'code_splitter',
      });
      throw error;
    }
  }

  preloadChunk(chunkName: string, loader: () => Promise<unknown>): void {
    // Preload chunk in the background
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadChunk(chunkName, loader).catch(() => {
          // Silently fail for preloading
        });
      });
    }
  }
}

// ============================================================================
// Main Performance Manager
// ============================================================================

export class PerformanceManager {
  private budgetMonitor = new PerformanceBudgetMonitor();
  private resourcePreloader = new ResourcePreloader();
  private codeSplitter = new CodeSplitter();
  private lazyLoader: LazyLoader | null = null;

  init(): void {
    if (typeof window === 'undefined') return;

    // Initialize all performance optimizations
    this.resourcePreloader.preloadCriticalResources();
    this.initLazyLoading();
    this.optimizeResources();

    logger.info('Performance manager initialized', {
      component: 'performance_manager',
    });
  }

  private initLazyLoading(): void {
    this.lazyLoader = new LazyLoader({
      rootMargin: '50px',
      threshold: 0.1,
    });
  }

  private optimizeResources(): void {
    // Preload critical chunks
    this.codeSplitter.preloadChunk('admin', () => import('../components/AdminDashboard360'));
    this.codeSplitter.preloadChunk('chatbot', () => import('../components/SmartChatbot'));
  }

  // Public API
  observeLazyElement(element: HTMLElement): void {
    this.lazyLoader?.observe(element);
  }

  async loadChunk<T>(name: string, loader: () => Promise<T>): Promise<T> {
    return this.codeSplitter.loadChunk(name, loader);
  }

  preloadResource(hint: ResourceHint): void {
    this.resourcePreloader.preloadResource(hint);
  }

  cleanup(): void {
    this.lazyLoader?.disconnect();
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const performanceManager = new PerformanceManager();

export default performanceManager;