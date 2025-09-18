/**
 * Hooks de performance optimisés pour OMA Digital
 * 
 * Ces hooks aident à réduire les re-renders et optimiser les performances
 * en utilisant des techniques comme debouncing, throttling et memoization
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook pour debouncer les valeurs et éviter les mises à jour trop fréquentes
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour throttler les fonctions et limiter leur fréquence d'exécution
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        fn(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [fn, delay]
  );
}

/**
 * Hook pour différer les tâches non critiques avec requestIdleCallback
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList
) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 0);
      return () => clearTimeout(id);
    }
  }, deps);
}

/**
 * Hook pour mesurer les performances d'un composant
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStart = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - renderStart.current;
    
    // Log seulement si le rendering prend plus de 16ms (60fps)
    if (renderTime > 16) {
      console.warn(
        `⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
      );
    }
    
    renderStart.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStart.current = performance.now();
    }
  };
}

/**
 * Hook pour éviter les re-renders lors du scroll
 */
export function useScrollThrottle(delay: number = 100) {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  const updateScrollY = useCallback(() => {
    setScrollY(window.scrollY);
    ticking.current = false;
  }, []);

  const requestTick = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollY);
      ticking.current = true;
    }
  }, [updateScrollY]);

  useEffect(() => {
    const throttledScrollHandler = useThrottle(requestTick, delay);
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [requestTick, delay]);

  return scrollY;
}

/**
 * Hook pour optimiser les animations avec Intersection Observer
 */
export function useInViewAnimation(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsInView(true);
          setHasAnimated(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated, options]);

  return {
    ref: elementRef,
    isInView,
    hasAnimated
  };
}

/**
 * Hook pour optimiser les images avec lazy loading
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { ref, isInView } = useInViewAnimation();

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsError(true);
    };
    img.src = src;
  }, [src, isInView]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    isError,
    isInView
  };
}