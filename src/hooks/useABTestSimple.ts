import { useState, useEffect } from 'react';

export function useABTestSimple(testName: string) {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // Check if user already has a variant
    const stored = localStorage.getItem(`ab_test_${testName}`);
    
    if (stored) {
      setVariant(stored as 'A' | 'B');
    } else {
      // Random assignment (50/50)
      const newVariant = Math.random() < 0.5 ? 'A' : 'B';
      setVariant(newVariant);
      localStorage.setItem(`ab_test_${testName}`, newVariant);
      
      // Track assignment
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ab_test_assignment', {
          test_name: testName,
          variant: newVariant
        });
      }
    }
  }, [testName]);

  const trackConversion = (action: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_conversion', {
        test_name: testName,
        variant,
        action
      });
    }
  };

  return { variant, trackConversion };
}