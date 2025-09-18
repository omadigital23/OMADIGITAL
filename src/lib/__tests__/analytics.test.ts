import { trackEvent, trackABTestConversion, getABTestResults, getAnalyticsEvents } from '../analytics';
import { supabase } from '../analytics';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

jest.mock('../analytics', () => ({
  ...jest.requireActual('../analytics'),
  supabase: mockSupabase,
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track events correctly', async () => {
    const mockData = [{ id: 1 }];
    const mockError = null;
    
    mockSupabase.insert.mockResolvedValueOnce({ data: mockData, error: mockError });
    
    const event = {
      event_name: 'test_event',
      timestamp: new Date().toISOString(),
      url: 'http://localhost',
    };
    
    const result = await trackEvent(event);
    
    expect(mockSupabase.from).toHaveBeenCalledWith('analytics_events');
    expect(mockSupabase.insert).toHaveBeenCalledWith([event]);
    expect(result).toEqual(mockData);
  });

  it('should handle tracking errors gracefully', async () => {
    const mockError = new Error('Database error');
    mockSupabase.insert.mockResolvedValueOnce({ data: null, error: mockError });
    
    const event = {
      event_name: 'test_event',
      timestamp: new Date().toISOString(),
      url: 'http://localhost',
    };
    
    const result = await trackEvent(event);
    
    expect(result).toBeNull();
    // Should log error to console
  });

  it('should track A/B test conversions', async () => {
    const mockData = [{ id: 1 }];
    const mockError = null;
    
    mockSupabase.insert.mockResolvedValueOnce({ data: mockData, error: mockError });
    
    const resultData = {
      test_name: 'test_experiment',
      variant: 'A',
      conversion: true,
      timestamp: new Date().toISOString(),
    };
    
    const result = await trackABTestConversion(resultData);
    
    expect(mockSupabase.from).toHaveBeenCalledWith('ab_test_results');
    expect(mockSupabase.insert).toHaveBeenCalledWith([resultData]);
    expect(result).toEqual(mockData);
  });

  it('should fetch A/B test results', async () => {
    const mockData = [{ test_name: 'test_experiment', variant: 'A', conversion: true }];
    const mockError = null;
    
    mockSupabase.select.mockResolvedValueOnce({ data: mockData, error: mockError });
    mockSupabase.order.mockReturnThis();
    mockSupabase.limit.mockReturnThis();
    
    const result = await getABTestResults('test_experiment');
    
    expect(mockSupabase.from).toHaveBeenCalledWith('ab_test_results');
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.order).toHaveBeenCalledWith('timestamp', { ascending: false });
    expect(mockSupabase.limit).toHaveBeenCalledWith(1000);
    expect(result).toEqual(mockData);
  });

  it('should fetch analytics events', async () => {
    const mockData = [{ event_name: 'test_event', timestamp: new Date().toISOString() }];
    const mockError = null;
    
    mockSupabase.select.mockResolvedValueOnce({ data: mockData, error: mockError });
    mockSupabase.order.mockReturnThis();
    mockSupabase.limit.mockReturnThis();
    
    const result = await getAnalyticsEvents('test_event');
    
    expect(mockSupabase.from).toHaveBeenCalledWith('analytics_events');
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.order).toHaveBeenCalledWith('timestamp', { ascending: false });
    expect(mockSupabase.eq).toHaveBeenCalledWith('event_name', 'test_event');
    expect(mockSupabase.limit).toHaveBeenCalledWith(1000);
    expect(result).toEqual(mockData);
  });

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Database error');
    mockSupabase.select.mockResolvedValueOnce({ data: null, error: mockError });
    
    const result = await getAnalyticsEvents('test_event');
    
    expect(result).toBeNull();
    // Should log error to console
  });
});