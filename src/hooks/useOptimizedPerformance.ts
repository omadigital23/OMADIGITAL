import { useEffect, useCallback, useRef, useState } from 'react';
import { generateSecureId } from '../lib/security-utils';

// Types pour les métriques de performance
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  sessionId: string;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

interface PerformanceConfig {
  enableWebVitals: boolean;
  enableResourceTiming: boolean;
  enableUserTiming: boolean;
  reportingEndpoint?: string;
  batchSize: number;
  reportingDelay: number;
}

// Configuration par défaut
const DEFAULT_CONFIG: PerformanceConfig = {
  enableWebVitals: true,
  enableResourceTiming: true,
  enableUserTiming: true,
  batchSize: 10,
  reportingDelay: 5000 // 5 secondes
};

// Cache pour les métriques en attente
let metricsQueue: PerformanceMetric[] = [];
let resourceQueue: ResourceTiming[] = [];

/**
 * Hook principal pour le monitoring de performance optimisé
 */
export function useOptimizedPerformance(config: Partial<PerformanceConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const sessionId = useRef<string>(generateSecureId('perf_'));
  const [isSupported, setIsSupported] = useState(false);
  const reportingTimer = useRef<NodeJS.Timeout>();

  // Vérification du support des APIs de performance
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 
                     'performance' in window && 
                     'PerformanceObserver' in window;
    setIsSupported(supported);
  }, []);

  // Fonction de rapport des métriques
  const reportMetrics = useCallback(async (metrics: PerformanceMetric[]) => {
    if (!finalConfig.reportingEndpoint || metrics.length === 0) return;

    try {
      await fetch(finalConfig.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          sessionId: sessionId.current,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }),
      });
    } catch (error) {
      console.error('Erreur lors du rapport de métriques:', error);
    }
  }, [finalConfig.reportingEndpoint]);

  // Fonction de rapport des ressources
  const reportResources = useCallback(async (resources: ResourceTiming[]) => {
    if (!finalConfig.reportingEndpoint || resources.length === 0) return;

    try {
      await fetch('/api/analytics/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resources,
          sessionId: sessionId.current,
          timestamp: Date.now(),
          url: window.location.href
        }),
      });
    } catch (error) {
      console.error('Erreur lors du rapport de ressources:', error);
    }
  }, [finalConfig.reportingEndpoint]);

  // Traitement par batch des métriques
  const processMetricsQueue = useCallback(() => {
    if (metricsQueue.length >= finalConfig.batchSize) {
      const batch = metricsQueue.splice(0, finalConfig.batchSize);
      reportMetrics(batch);
    }

    if (resourceQueue.length >= finalConfig.batchSize) {
      const batch = resourceQueue.splice(0, finalConfig.batchSize);
      reportResources(batch);
    }
  }, [finalConfig.batchSize, reportMetrics, reportResources]);

  // Ajout d'une métrique à la queue
  const addMetric = useCallback((metric: Omit<PerformanceMetric, 'sessionId' | 'timestamp'>) => {
    const fullMetric: PerformanceMetric = {
      ...metric,
      sessionId: sessionId.current,
      timestamp: Date.now()
    };

    metricsQueue.push(fullMetric);
    processMetricsQueue();
  }, [processMetricsQueue]);

  // Monitoring des Web Vitals
  useEffect(() => {
    if (!isSupported || !finalConfig.enableWebVitals) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          addMetric({
            name: 'LCP',
            value: entry.startTime,
            rating: entry.startTime > 4000 ? 'poor' : entry.startTime > 2500 ? 'needs-improvement' : 'good'
          });
        }
        
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          addMetric({
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            rating: fidEntry.processingStart - fidEntry.startTime > 300 ? 'poor' : 
                   fidEntry.processingStart - fidEntry.startTime > 100 ? 'needs-improvement' : 'good'
          });
        }

        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          addMetric({
            name: 'CLS',
            value: (entry as any).value,
            rating: (entry as any).value > 0.25 ? 'poor' : 
                   (entry as any).value > 0.1 ? 'needs-improvement' : 'good'
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Certaines métriques Web Vitals ne sont pas supportées:', error);
    }

    return () => observer.disconnect();
  }, [isSupported, finalConfig.enableWebVitals, addMetric]);

  // Monitoring des ressources
  useEffect(() => {
    if (!isSupported || !finalConfig.enableResourceTiming) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        resourceQueue.push({
          name: resourceEntry.name,
          duration: resourceEntry.duration,
          size: resourceEntry.transferSize,
          type: getResourceType(resourceEntry.name)
        });
      }
      
      if (resourceQueue.length >= finalConfig.batchSize) {
        const batch = resourceQueue.splice(0, finalConfig.batchSize);
        reportResources(batch);
      }
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource timing non supporté:', error);
    }

    return () => observer.disconnect();
  }, [isSupported, finalConfig.enableResourceTiming, finalConfig.batchSize, reportResources]);

  // Timer pour le rapport périodique
  useEffect(() => {
    reportingTimer.current = setInterval(() => {
      if (metricsQueue.length > 0) {
        const batch = metricsQueue.splice(0);
        reportMetrics(batch);
      }
      
      if (resourceQueue.length > 0) {
        const batch = resourceQueue.splice(0);
        reportResources(batch);
      }
    }, finalConfig.reportingDelay);

    return () => {
      if (reportingTimer.current) {
        clearInterval(reportingTimer.current);
      }
    };
  }, [finalConfig.reportingDelay, reportMetrics, reportResources]);

  // Nettoyage lors du déchargement de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Rapport final des métriques en attente
      if (metricsQueue.length > 0 && navigator.sendBeacon && finalConfig.reportingEndpoint) {
        navigator.sendBeacon(
          finalConfig.reportingEndpoint,
          JSON.stringify({
            metrics: metricsQueue,
            sessionId: sessionId.current,
            timestamp: Date.now(),
            final: true
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [finalConfig.reportingEndpoint]);

  return {
    sessionId: sessionId.current,
    isSupported,
    addMetric
  };
}

/**
 * Hook pour mesurer les performances des composants
 */
export function useComponentPerformance(componentName: string) {
  const startTime = useRef<number>();
  const { addMetric } = useOptimizedPerformance();

  const startMeasure = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endMeasure = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      addMetric({
        name: `component_${componentName}`,
        value: duration,
        rating: duration > 100 ? 'poor' : duration > 50 ? 'needs-improvement' : 'good'
      });
    }
  }, [componentName, addMetric]);

  useEffect(() => {
    startMeasure();
    return endMeasure;
  }, [startMeasure, endMeasure]);

  return { startMeasure, endMeasure };
}

/**
 * Hook pour mesurer les performances des API calls
 */
export function useAPIPerformance() {
  const { addMetric } = useOptimizedPerformance();

  const measureAPICall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      addMetric({
        name: `api_${apiName}`,
        value: duration,
        rating: duration > 2000 ? 'poor' : duration > 1000 ? 'needs-improvement' : 'good'
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      addMetric({
        name: `api_${apiName}_error`,
        value: duration,
        rating: 'poor'
      });
      
      throw error;
    }
  }, [addMetric]);

  return { measureAPICall };
}

/**
 * Hook pour le monitoring de la mémoire
 */
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const { addMetric } = useOptimizedPerformance();

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo(memory);
        
        // Rapport si l'utilisation mémoire est élevée
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usageRatio > 0.8) {
          addMetric({
            name: 'memory_usage_high',
            value: usageRatio * 100,
            rating: 'poor'
          });
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Toutes les 30 secondes
    checkMemory(); // Check initial

    return () => clearInterval(interval);
  }, [addMetric]);

  return memoryInfo;
}

// Utilitaires
function getResourceType(url: string): string {
  if (url.includes('.js')) return 'script';
  if (url.includes('.css')) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
  if (url.includes('.json')) return 'json';
  return 'other';
}

/**
 * Fonction utilitaire pour marquer des événements personnalisés
 */
export function markPerformanceEvent(eventName: string, detail?: any) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(eventName);
    
    if (detail && performance.measure) {
      performance.measure(`${eventName}_measure`, eventName);
    }
  }
}

/**
 * Fonction pour obtenir les métriques de navigation
 */
export function getNavigationMetrics(): PerformanceNavigationTiming | null {
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return navEntries.length > 0 ? navEntries[0] : null;
  }
  return null;
}