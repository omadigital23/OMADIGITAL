import React, { useState, useEffect, useRef } from 'react';

interface LazyLoadComponentProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
}

/**
 * Component that lazy loads its children when they enter the viewport
 */
export const LazyLoadComponent: React.FC<LazyLoadComponentProps> = ({ 
  children, 
  placeholder = null,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Create observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
          // Disconnect observer after first intersection
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1
      }
    );

    // Observe the element
    if (elementRef.current && observerRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasIntersected]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : placeholder}
    </div>
  );
};

// Memoized version for better performance
export const MemoizedLazyLoadComponent = React.memo(LazyLoadComponent);