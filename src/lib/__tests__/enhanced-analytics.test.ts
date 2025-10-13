import { generateSessionId, getDeviceInfo, getUTMParameters, trackEvent, trackUserBehavior } from '../analytics';
import { abTestingService } from '../ab-testing';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null })
  })
}));

// Mock window and navigator objects
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn()
  },
  writable: true
});

Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    type: 'wifi'
  },
  writable: true
});

Object.defineProperty(document, 'referrer', {
  value: 'https://google.com',
  writable: true
});

describe('Enhanced Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSessionId', () => {
    it('should generate a unique session ID', () => {
      const sessionId1 = generateSessionId();
      const sessionId2 = generateSessionId();
      
      expect(sessionId1).toBeDefined();
      expect(typeof sessionId1).toBe('string');
      // Session IDs should be different when localStorage is not available
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device information', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      
      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo).toHaveProperty('device_type');
      expect(deviceInfo).toHaveProperty('connection_type');
      expect(deviceInfo.device_type).toBe('desktop');
      expect(deviceInfo.connection_type).toBe('4g');
    });
  });

  describe('getUTMParameters', () => {
    it('should extract UTM parameters from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale'
        },
        writable: true
      });
      
      const utmParams = getUTMParameters();
      
      expect(utmParams).toHaveProperty('utm_source', 'google');
      expect(utmParams).toHaveProperty('utm_medium', 'cpc');
      expect(utmParams).toHaveProperty('utm_campaign', 'spring_sale');
    });
  });

  describe('trackEvent', () => {
    it('should track an analytics event with all default properties', async () => {
      const event = {
        event_name: 'button_click',
        event_properties: { button_id: 'cta-primary' }
      };
      
      const result = await trackEvent(event);
      
      expect(result).not.toBeNull();
    });
  });

  describe('trackUserBehavior', () => {
    it('should track user behavior events', async () => {
      const behaviorEvent = {
        event_type: 'click',
        element_id: 'hero-cta',
        page_x: 100,
        page_y: 200,
        session_id: 'test-session',
        url: 'https://oma-digital.sn'
      };
      
      const result = await trackUserBehavior(behaviorEvent);
      
      expect(result).not.toBeNull();
    });
  });
});

describe('Enhanced A/B Testing', () => {
  beforeEach(() => {
    // Reset all tests
    abTestingService.resetAllTests();
  });

  describe('ABTestingService', () => {
    it('should initialize tests with extended variants', () => {
      abTestingService.initTest({
        name: 'extended_test',
        variants: ['A', 'B', 'C', 'D'],
        weights: [25, 25, 25, 25]
      });
      
      const tests = abTestingService.getTests();
      expect(tests.has('extended_test')).toBe(true);
      
      const testConfig = tests.get('extended_test');
      expect(testConfig?.variants).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should assign variants based on weights', () => {
      abTestingService.initTest({
        name: 'weighted_test',
        variants: ['A', 'B'],
        weights: [80, 20] // 80% for A, 20% for B
      });
      
      // Mock Math.random to test weight distribution
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Should assign variant A
      
      const variant = abTestingService.getVariant('weighted_test');
      
      expect(variant).toBe('A');
      
      // Restore original Math.random
      Math.random = originalRandom;
    });

    it('should record conversion events with metadata', async () => {
      abTestingService.initTest({
        name: 'conversion_test',
        variants: ['A', 'B']
      });
      
      const variant = abTestingService.getVariant('conversion_test');
      expect(variant).not.toBeNull();
      
      const metadata = {
        userId: 'test-user',
        page: '/services',
        timestamp: Date.now()
      };
      
      await abTestingService.recordConversion('conversion_test', variant!, metadata);
      
      const results = abTestingService.getResults();
      expect(results.length).toBe(1);
      expect(results[0].testName).toBe('conversion_test');
      expect(results[0].conversion).toBe(true);
      expect(results[0].metadata).toEqual(metadata);
    });

    it('should calculate conversion rates correctly', () => {
      abTestingService.initTest({
        name: 'rate_test',
        variants: ['A', 'B']
      });
      
      const variant = abTestingService.getVariant('rate_test');
      
      // Simulate conversions
      abTestingService.recordConversion('rate_test', 'A');
      abTestingService.recordConversion('rate_test', 'A');
      abTestingService.recordEvent('rate_test', 'A', 'view');
      abTestingService.recordEvent('rate_test', 'A', 'view');
      
      const conversionRate = abTestingService.getConversionRate('rate_test', 'A');
      // 2 conversions out of 4 events = 50%
      expect(conversionRate).toBe(0.5);
    });
  });
});