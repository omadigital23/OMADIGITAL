import Cookies from 'js-cookie';
import { trackABTestConversion } from './analytics';

// A/B Test Variants
export type Variant = 'A' | 'B' | 'C' | 'D'; // Extended to support more variants

// A/B Test Configuration
export interface ABTestConfig {
  name: string;
  variants: Variant[];
  weights?: number[]; // Optional weights for variants (default is equal distribution)
  enabled?: boolean; // Whether the test is enabled (default is true)
  description?: string; // Description of what is being tested
  startDate?: Date; // When the test started
  endDate?: Date; // When the test should end
}

// A/B Test Result
export interface ABTestResult {
  testName: string;
  variant: Variant;
  timestamp: number;
  conversion?: boolean; // Whether this was a conversion event
  metadata?: Record<string, any>; // Additional data about the event
}

// Enhanced A/B Testing Service
class ABTestingService {
  private tests: Map<string, ABTestConfig> = new Map();
  private results: ABTestResult[] = [];
  private userSessionId: string;

  constructor() {
    // Generate or retrieve user session ID
    this.userSessionId = this.generateOrRetrieveSessionId();
  }

  // Generate or retrieve user session ID
  private generateOrRetrieveSessionId(): string {
    let sessionId = Cookies.get('ab_test_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      Cookies.set('ab_test_session_id', sessionId, { expires: 30, sameSite: 'Lax' });
    }
    return sessionId;
  }

  // Initialize a new A/B test
  public initTest(config: ABTestConfig): void {
    // Set default values
    const testConfig: ABTestConfig = {
      enabled: true,
      weights: config.variants.map(() => 1), // Equal weights by default
      startDate: new Date(),
      ...config
    };

    this.tests.set(config.name, testConfig);
    
    // Log test initialization
    console.log(`A/B Test initialized: ${config.name} with variants [${config.variants.join(', ')}]`);
  }

  // Get the variant for a specific user/test
  public getVariant(testName: string): Variant | null {
    const test = this.tests.get(testName);
    
    // Return null if test doesn't exist or is disabled
    if (!test || !test.enabled) {
      return null;
    }

    // Check if test has ended
    if (test.endDate && test.endDate < new Date()) {
      return null;
    }

    // Check if user already has a variant assigned
    const cookieName = `ab_test_${testName}`;
    let variant = Cookies.get(cookieName) as Variant | undefined;

    // If no variant assigned, assign one based on weights
    if (!variant || !test.variants.includes(variant)) {
      variant = this.assignVariant(test);
      // Store in cookie for 30 days
      Cookies.set(cookieName, variant, { expires: 30, sameSite: 'Lax' });
      
      // Track assignment
      this.trackTestAssignment(testName, variant);
    }

    return variant;
  }

  // Assign a variant based on weights
  private assignVariant(test: ABTestConfig): Variant {
    const totalWeight = test.weights!.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let weightSum = 0;
    for (let i = 0; i < test.variants.length; i++) {
      weightSum += test.weights![i];
      if (random <= weightSum) {
        return test.variants[i];
      }
    }
    
    // Fallback to first variant
    return test.variants[0];
  }

  // Track test assignment
  private async trackTestAssignment(testName: string, variant: Variant): Promise<void> {
    try {
      await trackABTestConversion({
        test_name: testName,
        variant: variant,
        conversion: false, // This is just an assignment, not a conversion
        timestamp: new Date().toISOString(),
        metadata: {
          sessionId: this.userSessionId,
          eventType: 'assignment',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Error sending A/B test assignment to Supabase:', error);
    }
  }

  // Record a conversion event
  public async recordConversion(testName: string, variant: Variant, metadata?: Record<string, any>): Promise<void> {
    this.results.push({
      testName,
      variant,
      timestamp: Date.now(),
      conversion: true,
      metadata
    });

    // Send to Supabase analytics
    try {
      await trackABTestConversion({
        test_name: testName,
        variant: variant,
        conversion: true,
        timestamp: new Date().toISOString(),
        metadata: {
          sessionId: this.userSessionId,
          ...metadata,
          eventType: 'conversion',
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Error sending A/B test conversion to Supabase:', error);
    }

    // Log in console for debugging
    console.log(`Conversion recorded for ${testName} variant ${variant}`, metadata);
  }

  // Record a generic event
  public async recordEvent(testName: string, variant: Variant, eventType: string, metadata?: Record<string, any>): Promise<void> {
    this.results.push({
      testName,
      variant,
      timestamp: Date.now(),
      metadata: {
        eventType,
        ...metadata
      }
    });

    // Send to Supabase analytics
    try {
      await trackABTestConversion({
        test_name: testName,
        variant: variant,
        conversion: false, // Not a conversion by default
        timestamp: new Date().toISOString(),
        metadata: {
          sessionId: this.userSessionId,
          eventType,
          ...metadata,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Error sending A/B test event to Supabase:', error);
    }

    // Log in console for debugging
    console.log(`Event ${eventType} recorded for ${testName} variant ${variant}`, metadata);
  }

  // Get all test configurations
  public getTests(): Map<string, ABTestConfig> {
    return this.tests;
  }

  // Get test results
  public getResults(): ABTestResult[] {
    return this.results;
  }

  // Get results for a specific test
  public getTestResults(testName: string): ABTestResult[] {
    return this.results.filter(result => result.testName === testName);
  }

  // Calculate conversion rate for a test
  public getConversionRate(testName: string, variant: Variant): number {
    const testResults = this.getTestResults(testName);
    const variantResults = testResults.filter(result => result.variant === variant);
    const conversions = variantResults.filter(result => result.conversion).length;
    
    return variantResults.length > 0 ? conversions / variantResults.length : 0;
  }

  // Reset a user's test assignment
  public resetTest(testName: string): void {
    Cookies.remove(`ab_test_${testName}`);
  }

  // Reset all test assignments for a user
  public resetAllTests(): void {
    this.tests.forEach((_, testName) => {
      Cookies.remove(`ab_test_${testName}`);
    });
  }

  // Get user session ID
  public getSessionId(): string {
    return this.userSessionId;
  }
}

// Create and export singleton instance
export const abTestingService = new ABTestingService();

// Initialize default tests with enhanced configuration
abTestingService.initTest({
  name: 'hero_cta_button',
  variants: ['A', 'B'],
  weights: [50, 50],
  description: 'Testing different CTA button colors and text for hero section'
});

abTestingService.initTest({
  name: 'pricing_section',
  variants: ['A', 'B'],
  weights: [50, 50],
  description: 'Testing different pricing layouts and value propositions'
});

abTestingService.initTest({
  name: 'contact_form',
  variants: ['A', 'B'],
  weights: [50, 50],
  description: 'Testing simplified vs detailed contact form'
});

// Add new tests for additional optimization opportunities
abTestingService.initTest({
  name: 'testimonial_section',
  variants: ['A', 'B', 'C'],
  weights: [34, 33, 33],
  description: 'Testing different testimonial layouts and content'
});

abTestingService.initTest({
  name: 'blog_section',
  variants: ['A', 'B'],
  weights: [50, 50],
  description: 'Testing different blog preview layouts and content'
});