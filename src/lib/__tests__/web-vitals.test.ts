import { 
  reportWebVitals, 
  initWebVitals, 
  initPerformanceObserver,
  PERFORMANCE_THRESHOLDS 
} from '../web-vitals';

describe('web-vitals', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock window.gtag
    (window as any).gtag = jest.fn();
  });

  describe('reportWebVitals', () => {
    it('sends metrics to Google Analytics when available', () => {
      const metric = {
        name: 'LCP',
        value: 1500,
        rating: 'good' as const,
        id: 'test-id',
        delta: 1500
      };

      reportWebVitals(metric);

      expect((window as any).gtag).toHaveBeenCalledWith('event', 'LCP', {
        event_category: 'Web Vitals',
        event_label: 'test-id',
        value: 1500,
        non_interaction: true,
        custom_map: {
          metric_id: 'test-id',
          metric_value: 1500,
          metric_delta: 1500
        }
      });
    });

    it('logs to console in development environment', () => {
      const originalHostname = window.location.hostname;
      
      // Mock localhost environment
      Object.defineProperty(window.location, 'hostname', {
        writable: true,
        value: 'localhost'
      });
      
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const metric = {
        name: 'FID',
        value: 50,
        rating: 'good' as const,
        id: 'test-id',
        delta: 50
      };

      reportWebVitals(metric);

      expect(consoleLogSpy).toHaveBeenCalledWith('Web Vital:', {
        name: 'FID',
        value: 50,
        rating: 'good',
        id: 'test-id',
        delta: 50
      });

      // Restore original hostname
      Object.defineProperty(window.location, 'hostname', {
        writable: true,
        value: originalHostname
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('initWebVitals', () => {
    it('does not throw errors when called', () => {
      expect(() => {
        initWebVitals();
      }).not.toThrow();
    });

    it('does nothing when called in server environment', () => {
      // Mock server environment by removing window
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(() => {
        initWebVitals();
      }).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('PERFORMANCE_THRESHOLDS', () => {
    it('has correct performance thresholds', () => {
      expect(PERFORMANCE_THRESHOLDS).toEqual({
        LCP: 1500,
        FID: 50,
        CLS: 0.05,
        FCP: 1000,
        TTFB: 400,
        totalLoadTime: 2000
      });
    });
  });
});