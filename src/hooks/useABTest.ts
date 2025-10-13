import { useState, useEffect } from 'react';
import { abTestingService, Variant } from '../lib/ab-testing';

/**
 * Custom hook for A/B testing
 * @param testName - The name of the A/B test
 * @returns The variant assigned to the user, or null if test is disabled
 */
export function useABTest(testName: string): Variant | null {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    // Get the variant for this test
    const assignedVariant = abTestingService.getVariant(testName);
    setVariant(assignedVariant);
  }, [testName]);

  return variant;
}

/**
 * Custom hook for recording conversions in A/B tests
 * @param testName - The name of the A/B test
 * @param variant - The variant that led to the conversion
 */
export function useRecordConversion(testName: string, variant: Variant | null): () => Promise<void> {
  const recordConversion = async () => {
    if (variant) {
      await abTestingService.recordConversion(testName, variant);
    }
  };

  return recordConversion;
}