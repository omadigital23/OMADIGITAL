import { useEffect } from 'react';

type Config = {
  enableWebVitals?: boolean;
  enableResourceTiming?: boolean;
  reportingEndpoint?: string;
};

export function useOptimizedPerformance(config: Config = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const endpoint = config.reportingEndpoint;

    // Web Vitals basic reporting (placeholder; avoid heavy deps during build)
    if (config.enableWebVitals && endpoint) {
      try {
        // Example: send a simple beacon to confirm client initialized
        navigator.sendBeacon?.(endpoint, JSON.stringify({ type: 'init', ts: Date.now() }));
      } catch {}
    }

    // Resource Timing buffer increase
    if (config.enableResourceTiming && 'performance' in window && 'setResourceTimingBufferSize' in performance) {
      try { (performance as any).setResourceTimingBufferSize(300); } catch {}
    }
  }, [config.enableWebVitals, config.enableResourceTiming, config.reportingEndpoint]);
}
