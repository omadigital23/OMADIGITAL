/**
 * Advanced Code Splitting for OMA Digital
 * - Route-based lazy loading
 * - Component-based splitting
 * - Intelligent preloading
 * - Error boundaries for chunks
 */

import dynamic from 'next/dynamic';
import { Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Loading components
const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

const ComponentLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Error fallback components
const PageErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Erreur de chargement
      </h2>
      <p className="text-gray-600 mb-6">
        Une erreur s'est produite lors du chargement de cette page.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors"
      >
        Réessayer
      </button>
    </div>
  </div>
);

const ComponentErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <div className="flex items-center">
      <div className="text-red-500 mr-2">⚠️</div>
      <div>
        <h3 className="text-sm font-medium text-red-800">
          Erreur de composant
        </h3>
        <p className="text-sm text-red-600 mt-1">
          Ce composant n'a pas pu se charger.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="text-sm text-red-700 underline mt-2"
        >
          Réessayer
        </button>
      </div>
    </div>
  </div>
);

// Higher-order component for lazy loading with error boundaries
export function withLazyLoading<T extends {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: ReactNode;
    errorFallback?: ComponentType<any>;
    chunkName?: string;
  } = {}
) {
  const LazyComponent = dynamic(importFunc, {
    loading: () => options.fallback || <ComponentLoadingSkeleton />,
    ssr: false,
  });

  return function LazyWrapper(props: T) {
    return (
      <ErrorBoundary
        FallbackComponent={options.errorFallback || ComponentErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={options.fallback || <ComponentLoadingSkeleton />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Higher-order component for page-level lazy loading
export function withPageLazyLoading<T extends {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  pageName: string
) {
  const LazyPage = dynamic(importFunc, {
    loading: () => <PageLoadingSkeleton />,
    ssr: true, // Keep SSR for pages for better SEO
  });

  return function LazyPageWrapper(props: T) {
    return (
      <ErrorBoundary
        FallbackComponent={PageErrorFallback}
        onReset={() => window.location.reload()}
      >
        <LazyPage {...props} />
      </ErrorBoundary>
    );
  };
}

// Predefined lazy-loaded components
export const LazyComponents = {
  // Newsletter components
  NewsletterSubscription: withLazyLoading(
    () => import('../components/Newsletter/SecuredNewsletterSubscription'),
    { chunkName: 'newsletter' }
  ),
  
  // Blog components
  BlogPage: withLazyLoading(
    () => import('../components/blog/OptimizedBlogPage'),
    { chunkName: 'blog' }
  ),
  
  BlogArticle: withLazyLoading(
    () => import('../components/blog/OptimizedArticleCard'),
    { chunkName: 'blog-article' }
  ),
  
  // Admin components (heavy, good for splitting)
  AdminDashboard: withLazyLoading(
    () => import('../components/admin/NewsletterDashboard'),
    { chunkName: 'admin-dashboard' }
  ),
  
  AdminAnalytics: withLazyLoading(
    () => import('../components/AdminAnalytics'),
    { chunkName: 'admin-analytics' }
  ),
  
  // Chatbot (heavy with AI features)
  SmartChatbot: withLazyLoading(
    () => import('../components/SmartChatbot'),
    { chunkName: 'chatbot' }
  ),
  
  // Forms (loaded on demand)
  ContactForm: withLazyLoading(
    () => import('../components/SecureContactForm'),
    { chunkName: 'forms' }
  ),
  
  // Monitoring dashboard
  PerformanceMonitoring: withLazyLoading(
    () => import('../components/ProductionMonitoringDashboard'),
    { chunkName: 'monitoring' }
  ),
};

// Intelligent preloading based on user interaction
export class IntelligentPreloader {
  private preloadedChunks = new Set<string>();
  private preloadQueue = new Map<string, () => Promise<any>>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupPreloadTriggers();
    }
  }

  /**
   * Register a component for intelligent preloading
   */
  registerForPreload(chunkName: string, importFunc: () => Promise<any>) {
    this.preloadQueue.set(chunkName, importFunc);
  }

  /**
   * Preload a specific chunk
   */
  async preloadChunk(chunkName: string): Promise<void> {
    if (this.preloadedChunks.has(chunkName)) {
      return; // Already preloaded
    }

    const importFunc = this.preloadQueue.get(chunkName);
    if (importFunc) {
      try {
        await importFunc();
        this.preloadedChunks.add(chunkName);
        console.log(`✅ Chunk preloaded: ${chunkName}`);
      } catch (error) {
        console.warn(`❌ Failed to preload chunk: ${chunkName}`, error);
      }
    }
  }

  /**
   * Setup preload triggers based on user behavior
   */
  private setupPreloadTriggers() {
    // Preload on hover (for desktop)
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const preloadChunk = target.dataset.preload;
      
      if (preloadChunk) {
        this.preloadChunk(preloadChunk);
      }
    });

    // Preload on scroll into viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const preloadChunk = (entry.target as HTMLElement).dataset.preload;
              if (preloadChunk) {
                this.preloadChunk(preloadChunk);
                observer.unobserve(entry.target);
              }
            }
          });
        },
        { rootMargin: '200px' }
      );

      // Observe elements with data-preload attribute
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-preload]').forEach((el) => {
          observer.observe(el);
        });
      });
    }

    // Preload critical chunks after page load
    window.addEventListener('load', () => {
      requestIdleCallback(() => {
        // Preload likely-to-be-used chunks
        this.preloadChunk('newsletter');
        this.preloadChunk('chatbot');
      });
    });

    // Preload based on user engagement
    let userEngaged = false;
    const engagementEvents = ['scroll', 'click', 'keydown', 'mousemove'];
    
    const handleEngagement = () => {
      if (!userEngaged) {
        userEngaged = true;
        requestIdleCallback(() => {
          this.preloadChunk('forms');
          this.preloadChunk('blog');
        });
        
        // Remove listeners after first engagement
        engagementEvents.forEach(event => {
          document.removeEventListener(event, handleEngagement);
        });
      }
    };
    
    engagementEvents.forEach(event => {
      document.addEventListener(event, handleEngagement, { passive: true });
    });
  }
}

// Export singleton preloader
export const intelligentPreloader = new IntelligentPreloader();

// React hook for managing code splitting
export function useCodeSplitting() {
  const preloadComponent = (chunkName: string) => {
    intelligentPreloader.preloadChunk(chunkName);
  };

  const isChunkLoaded = (chunkName: string) => {
    return intelligentPreloader['preloadedChunks'].has(chunkName);
  };

  return {
    preloadComponent,
    isChunkLoaded,
    LazyComponents
  };
}

// Utility for adding preload hints to elements
export const PreloadTrigger: React.FC<{
  chunkName: string;
  children: ReactNode;
  trigger?: 'hover' | 'viewport' | 'immediate';
}> = ({ chunkName, children, trigger = 'hover' }) => {
  return (
    <div 
      data-preload={chunkName}
      onMouseEnter={trigger === 'hover' ? () => intelligentPreloader.preloadChunk(chunkName) : undefined}
    >
      {children}
    </div>
  );
};