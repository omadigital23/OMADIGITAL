import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook to detect device performance and optimize UI accordingly
 */
export function usePerformanceOptimization() {
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);
  const [deviceMemory, setDeviceMemory] = useState<number | null>(null);
  const [hardwareConcurrency, setHardwareConcurrency] = useState<number | null>(null);
  const [effectiveConnectionType, setEffectiveConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // Get device information
    const memory = (navigator as any).deviceMemory || null;
    const cores = navigator.hardwareConcurrency || null;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    setDeviceMemory(memory);
    setHardwareConcurrency(cores);
    
    if (connection) {
      setEffectiveConnectionType(connection.effectiveType || null);
    }

    // Detect low performance device based on criteria
    const isLowPerf = (
      (memory && memory <= 4) || // 4GB or less RAM
      (cores && cores <= 2) || // 2 or fewer CPU cores
      (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) || // Slow network
      (connection && connection.saveData) // Data saver mode
    );
    
    setIsLowPerformanceDevice(!!isLowPerf);
  }, []);

  return {
    isLowPerformanceDevice,
    deviceMemory,
    hardwareConcurrency,
    effectiveConnectionType
  };
}

/**
 * Hook to manage lazy loading of components
 */
export function useLazyLoading() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  const observer = useMemo(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1
      }
    );
  }, [hasIntersected]);

  const observe = useCallback((element: Element | null) => {
    if (!element || !observer) return;
    observer.observe(element);
  }, [observer]);

  const unobserve = useCallback((element: Element | null) => {
    if (!element || !observer) return;
    observer.unobserve(element);
  }, [observer]);

  useEffect(() => {
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  return {
    isVisible,
    observe,
    unobserve
  };
}

/**
 * Hook to manage virtualized lists for better performance with large datasets
 */
export function useVirtualization<T>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible items
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 5; // Add buffer
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll
  };
}