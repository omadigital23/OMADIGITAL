import { abTestingService, ABTestConfig } from '../ab-testing';
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

describe('ABTestingService', () => {
  beforeEach(() => {
    // Clear all cookies
    jest.clearAllMocks();
    
    // Reset the service
    abTestingService['tests'].clear();
    abTestingService['results'] = [];
  });

  it('should initialize a test correctly', () => {
    const config: ABTestConfig = {
      name: 'test_experiment',
      variants: ['A', 'B'],
      weights: [50, 50],
      enabled: true,
    };

    abTestingService.initTest(config);
    
    const tests = abTestingService.getTests();
    expect(tests.has('test_experiment')).toBe(true);
    
    const test = tests.get('test_experiment');
    expect(test).toEqual(config);
  });

  it('should assign variants based on weights', () => {
    const config: ABTestConfig = {
      name: 'weighted_test',
      variants: ['A', 'B', 'C'],
      weights: [70, 20, 10], // 70%, 20%, 10%
      enabled: true,
    };

    abTestingService.initTest(config);
    
    // Mock Math.random to test different scenarios
    const mathRandomSpy = jest.spyOn(Math, 'random');
    
    // Test 70% case
    mathRandomSpy.mockReturnValue(0.5); // Should return A
    const variantA = abTestingService.getVariant('weighted_test');
    expect(variantA).toBe('A');
    
    // Test 20% case
    mathRandomSpy.mockReturnValue(0.8); // Should return B
    const variantB = abTestingService.getVariant('weighted_test');
    expect(variantB).toBe('B');
    
    // Test 10% case
    mathRandomSpy.mockReturnValue(0.95); // Should return C
    const variantC = abTestingService.getVariant('weighted_test');
    expect(variantC).toBe('C');
    
    mathRandomSpy.mockRestore();
  });

  it('should return null for disabled tests', () => {
    const config: ABTestConfig = {
      name: 'disabled_test',
      variants: ['A', 'B'],
      enabled: false,
    };

    abTestingService.initTest(config);
    const variant = abTestingService.getVariant('disabled_test');
    expect(variant).toBeNull();
  });

  it('should return existing variant from cookie', () => {
    const config: ABTestConfig = {
      name: 'cookie_test',
      variants: ['A', 'B'],
    };

    abTestingService.initTest(config);
    
    // Mock cookie to return existing variant
    (Cookies.get as jest.Mock).mockReturnValue('B');
    
    const variant = abTestingService.getVariant('cookie_test');
    expect(variant).toBe('B');
  });

  it('should record conversions correctly', async () => {
    // Mock the trackABTestConversion function
    const mockTrackConversion = jest.fn().mockResolvedValue(null);
    jest.mock('../analytics', () => ({
      trackABTestConversion: mockTrackConversion,
    }));
    
    const testName = 'conversion_test';
    const variant = 'A';
    
    await abTestingService.recordConversion(testName, variant);
    
    const results = abTestingService.getResults();
    expect(results).toHaveLength(1);
    expect(results[0].testName).toBe(testName);
    expect(results[0].variant).toBe(variant);
  });

  it('should reset test assignments', () => {
    abTestingService.initTest({
      name: 'reset_test',
      variants: ['A', 'B'],
    });
    
    abTestingService.resetTest('reset_test');
    expect(Cookies.remove).toHaveBeenCalledWith('ab_test_reset_test');
  });

  it('should reset all test assignments', () => {
    abTestingService.initTest({
      name: 'test1',
      variants: ['A', 'B'],
    });
    
    abTestingService.initTest({
      name: 'test2',
      variants: ['A', 'B'],
    });
    
    abTestingService.resetAllTests();
    expect(Cookies.remove).toHaveBeenCalledWith('ab_test_test1');
    expect(Cookies.remove).toHaveBeenCalledWith('ab_test_test2');
  });
});