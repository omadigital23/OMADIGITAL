// Performance optimization utilities for OMA Digital

// Critical resource hints for better loading
export const criticalResources = [
  '/images/logo.webp',
  '/images/hero1.webm',
  '/styles/globals.css'
];

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.includes('.webm') || resource.includes('.mp4')) {
      link.as = 'video';
    } else if (resource.includes('.webp') || resource.includes('.jpg')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Resource prefetching for likely navigation
export function prefetchResources(urls: string[]) {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Intersection Observer for lazy loading optimization
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Image lazy loading with fade-in effect
export function setupLazyImages() {
  if (typeof window === 'undefined') return;

  const imageObserver = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.classList.add('fade-in');
          imageObserver?.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver?.observe(img);
  });
}

// Video lazy loading and autoplay management
export function setupLazyVideos() {
  if (typeof window === 'undefined') return;

  const videoObserver = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target as HTMLVideoElement;
      
      if (entry.isIntersecting) {
        if (video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
        }
        
        // Autoplay if allowed and has autoplay attribute
        if (video.hasAttribute('autoplay')) {
          video.play().catch(() => {
            console.log('Autoplay prevented for video:', video.src);
          });
        }
      } else {
        // Pause video when out of view to save resources
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('video[data-src], video[autoplay]').forEach(video => {
    videoObserver?.observe(video);
  });
}

// Memory management for large datasets
export class MemoryOptimizedList<T> {
  private items: T[] = [];
  private visibleItems: T[] = [];
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop: number = 0;
  
  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }
  
  setItems(items: T[]) {
    this.items = items;
    this.updateVisibleItems();
  }
  
  setScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
    this.updateVisibleItems();
  }
  
  private updateVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + 2 // Buffer
    );
    
    this.visibleItems = this.items.slice(Math.max(0, startIndex - 2), endIndex);
  }
  
  getVisibleItems(): T[] {
    return this.visibleItems;
  }
  
  getTotalHeight(): number {
    return this.items.length * this.itemHeight;
  }
}

// Bundle size optimization - code splitting helpers
export function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  return importFn()
    .then(module => module.default)
    .catch(error => {
      console.error('Dynamic import failed:', error);
      if (fallback) return fallback;
      throw error;
    });
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}

// Network-aware loading
export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 'unknown';
  
  // Slow connections: 2G, slow-2g
  if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
    return 'slow';
  }
  
  // Fast connections: 3g, 4g
  return 'fast';
}

// Adaptive loading based on connection speed
export function shouldLoadHighQualityAssets(): boolean {
  const speed = getConnectionSpeed();
  const isSlowConnection = speed === 'slow';
  const saveData = (navigator as any).connection?.saveData;
  
  return !isSlowConnection && !saveData;
}

// Connection-aware resource loading
export function loadResourceBasedOnConnection(
  slowResource: string, 
  fastResource: string, 
  callback: (resource: string) => void
): void {
  const speed = getConnectionSpeed();
  const resource = speed === 'slow' ? slowResource : fastResource;
  callback(resource);
}

// Adaptive image quality loading
export function getAdaptiveImageQuality(): number {
  const speed = getConnectionSpeed();
  const saveData = (navigator as any).connection?.saveData;
  
  if (speed === 'slow' || saveData) {
    return 60; // Lower quality for slow connections
  }
  
  return 85; // Higher quality for fast connections
}

// Adaptive video quality loading
export function getAdaptiveVideoQuality(): 'low' | 'medium' | 'high' {
  const speed = getConnectionSpeed();
  const saveData = (navigator as any).connection?.saveData;
  
  if (speed === 'slow' || saveData) {
    return 'low';
  } else if (speed === 'fast') {
    return 'high';
  }
  
  return 'medium';
}

// Critical CSS extraction and inlining
export function inlineCriticalCSS(css: string) {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.dataset.critical = 'true';
  document.head.appendChild(style);
}

// Resource cleanup for memory management
export function cleanupResources() {
  // Remove non-critical stylesheets after load
  setTimeout(() => {
    document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])').forEach(link => {
      if ((link as HTMLLinkElement).sheet?.cssRules.length === 0) {
        link.remove();
      }
    });
  }, 3000);
  
  // Cleanup unused images from cache
  if ('caches' in window) {
    caches.open('images').then(cache => {
      cache.keys().then(keys => {
        keys.forEach(key => {
          // Remove cached images older than 1 week
          const url = new URL(key.url);
          const lastUsed = localStorage.getItem(`img-${url.pathname}`);
          if (lastUsed && Date.now() - parseInt(lastUsed) > 7 * 24 * 60 * 60 * 1000) {
            cache.delete(key);
            localStorage.removeItem(`img-${url.pathname}`);
          }
        });
      });
    });
  }
  
  // Cleanup event listeners to prevent memory leaks
  if (typeof window !== 'undefined') {
    // Clean up any lingering event listeners
    window.removeEventListener('resize', () => {});
    window.removeEventListener('scroll', () => {});
  }
}

// Advanced memory management
export function setupMemoryMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Periodic cleanup of unused resources
  setInterval(() => {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Cleanup detached DOM elements
    if ('queryMemoryInfo' in performance) {
      const memoryInfo = (performance as any).queryMemoryInfo();
      if (memoryInfo.usedJSHeapSize > 0.8 * memoryInfo.jsHeapSizeLimit) {
        console.warn('High memory usage detected, cleaning up resources');
        cleanupResources();
      }
    }
  }, 30000); // Check every 30 seconds
}

// Resource preloading with priority management
export function preloadWithPriority(resources: {url: string, priority: 'high' | 'medium' | 'low'}[]) {
  if (typeof window === 'undefined') return;
  
  // Sort by priority
  const sortedResources = [...resources].sort((a, b) => {
    const priorityMap = { high: 1, medium: 2, low: 3 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });
  
  // Preload high priority resources first
  sortedResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.url;
    
    // Set appropriate 'as' attribute
    if (resource.url.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.url.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.url.includes('.webm') || resource.url.includes('.mp4')) {
      link.as = 'video';
    } else if (resource.url.includes('.webp') || resource.url.includes('.jpg') || resource.url.includes('.png')) {
      link.as = 'image';
    } else {
      link.as = 'fetch';
    }
    
    // Add to head
    document.head.appendChild(link);
  });
}

// Performance monitoring
export function startPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor frame rate
  let frameCount = 0;
  let lastTime = performance.now();
  
  function countFrames() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
      
      // Alert if FPS is too low
      if (fps < 30) {
        console.warn(`Low FPS detected: ${fps}`);
        // Send to analytics
        if ((window as any).gtag) {
          (window as any).gtag('event', 'low_fps', {
            event_category: 'Performance',
            event_label: 'Frame Rate',
            value: fps
          });
        }
      }
    }
    
    requestAnimationFrame(countFrames);
  }
  
  requestAnimationFrame(countFrames);

  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (memoryUsage > 0.9) {
        console.warn('High memory usage detected:', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
        
        // Send to analytics
        if ((window as any).gtag) {
          (window as any).gtag('event', 'high_memory_usage', {
            event_category: 'Performance',
            event_label: 'Memory',
            value: Math.round(memoryUsage * 100)
          });
        }
        
        // Trigger garbage collection hint
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }, 10000);
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 100) { // Log tasks longer than 100ms
          console.warn('Long task detected:', entry);
          // Send to analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'long_task', {
              event_category: 'Performance',
              event_label: 'Long Task',
              value: Math.round(entry.duration)
            });
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}