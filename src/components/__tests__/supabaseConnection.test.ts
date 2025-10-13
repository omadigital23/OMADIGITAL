import { supabaseCacheFix } from '../../lib/supabase-cache-fix';
import { supabase } from '../../lib/analytics';
import { ctaService } from '../../lib/cta-service';

// Mock the Supabase client to avoid actual network calls
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  })),
}));

// Mock environment variables
const originalEnv = process.env;

describe('Supabase Connection Test', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should verify Supabase configuration is present', () => {
    // Test that the required environment variables are defined
    expect(process.env['NEXT_PUBLIC_SUPABASE_URL']).toBeDefined();
    expect(process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']).toBeDefined();
    
    // In development, these might be fallback values
    expect(process.env['NEXT_PUBLIC_SUPABASE_URL']).not.toBeNull();
    expect(process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']).not.toBeNull();
  });

  it('should initialize Supabase cache fix without errors', async () => {
    // Test that the Supabase cache fix initializes correctly
    const result = await supabaseCacheFix.initialize();
    
    // Should return a result object
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  it('should create Supabase client instances', () => {
    // Test that Supabase clients are created in different modules
    expect(supabase).toBeDefined();
    expect(ctaService).toBeDefined();
    
    // Verify they have the expected methods
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should perform health check on Supabase connection', async () => {
    // Test the health check functionality
    const healthResult = await supabaseCacheFix.healthCheck();
    
    // Should return a result object
    expect(healthResult).toBeDefined();
    expect(healthResult).toHaveProperty('success');
    expect(healthResult).toHaveProperty('message');
    
    // Log the health check result for debugging
    console.log('Supabase Health Check Result:', healthResult);
  });

  it('should verify knowledge base access', async () => {
    // Mock successful knowledge base access
    const mockData = [{ id: '1', title: 'Test', content: 'Test content' }];
    const mockError = null;
    
    // Mock the Supabase client methods for knowledge base
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    
    // Apply the mock to the cache fix instance
    (supabaseCacheFix as any).supabase = mockSupabase;
    
    // Mock the response
    mockSupabase.select.mockResolvedValueOnce({ data: mockData, error: mockError });
    
    // Test knowledge base verification
    const kbResult = await (supabaseCacheFix as any).verifyKnowledgeBaseAccess();
    
    expect(kbResult).toBeDefined();
    expect(kbResult.success).toBe(true);
    expect(kbResult.message).toContain('Knowledge base access verified');
  });

  it('should handle Supabase connection errors gracefully', async () => {
    // Mock a connection error
    const mockError = new Error('Connection failed');
    
    // Mock the Supabase client to simulate connection failure
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    
    // Apply the mock
    (supabaseCacheFix as any).supabase = mockSupabase;
    
    // Mock the response with error
    mockSupabase.select.mockResolvedValueOnce({ data: null, error: mockError });
    
    // Test error handling
    const connectionResult = await (supabaseCacheFix as any).verifyConnectionWithRetry(1);
    
    expect(connectionResult).toBeDefined();
    expect(connectionResult.success).toBe(false);
    expect(connectionResult.message).toContain('Database connection failed');
  });
});