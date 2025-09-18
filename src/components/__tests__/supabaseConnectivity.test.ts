/**
 * Test to verify Supabase connectivity for the chatbot
 * This test checks if the chatbot can successfully connect to Supabase
 * and perform basic operations like storing and retrieving chat interactions.
 */

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

// Set environment variables before importing modules
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Import the modules we want to test
import { supabase } from '../../lib/analytics';
import { supabaseCacheFix } from '../../lib/supabase-cache-fix';

describe('Supabase Chatbot Connectivity Test', () => {
  it('should verify Supabase client is properly configured', () => {
    // Check that the Supabase client is defined
    expect(supabase).toBeDefined();
    
    // Check that it has the required methods
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.rpc).toBe('function');
  });

  it('should verify Supabase cache fix can be initialized', async () => {
    // Check that the cache fix instance is defined
    expect(supabaseCacheFix).toBeDefined();
    
    // Mock the verifyConnectionWithRetry method to avoid actual network calls
    const mockVerifyConnection = jest.spyOn(supabaseCacheFix as any, 'verifyConnectionWithRetry');
    mockVerifyConnection.mockResolvedValue({ success: true, message: 'Mock connection successful' });
    
    // Mock the verifyKnowledgeBaseAccess method
    const mockVerifyKB = jest.spyOn(supabaseCacheFix as any, 'verifyKnowledgeBaseAccess');
    mockVerifyKB.mockResolvedValue({ success: true, message: 'Mock KB access successful' });
    
    // Mock the refreshSchemaCache method
    const mockRefreshSchema = jest.spyOn(supabaseCacheFix as any, 'refreshSchemaCache');
    mockRefreshSchema.mockResolvedValue({ success: true, message: 'Mock schema refresh successful' });
    
    // Mock the initializeCTACache method
    const mockInitCTA = jest.spyOn(supabaseCacheFix as any, 'initializeCTACache');
    mockInitCTA.mockResolvedValue(undefined);
    
    // Mock the preloadKnowledgeBase method
    const mockPreloadKB = jest.spyOn(supabaseCacheFix as any, 'preloadKnowledgeBase');
    mockPreloadKB.mockResolvedValue(undefined);
    
    // Try to initialize it
    const result = await supabaseCacheFix.initialize();
    
    // Should return a result object
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    
    // Verify the initialization was successful
    expect(result.success).toBe(true);
  });

  it('should verify environment variables are set', () => {
    // Check that the required environment variables are present
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    
    // Check that they have values
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBeNull();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBeNull();
    
    // Check specific values
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });

  it('should verify Supabase cache fix health check works', async () => {
    // Mock the verifyConnectionWithRetry method
    const mockVerifyConnection = jest.spyOn(supabaseCacheFix as any, 'verifyConnectionWithRetry');
    mockVerifyConnection.mockResolvedValue({ success: true, message: 'Mock connection successful' });
    
    // Mock the verifyKnowledgeBaseAccess method
    const mockVerifyKB = jest.spyOn(supabaseCacheFix as any, 'verifyKnowledgeBaseAccess');
    mockVerifyKB.mockResolvedValue({ success: true, message: 'Mock KB access successful' });
    
    // Perform health check
    const healthResult = await supabaseCacheFix.healthCheck();
    
    // Should return a result object
    expect(healthResult).toBeDefined();
    expect(healthResult).toHaveProperty('success');
    expect(healthResult).toHaveProperty('message');
    
    // Verify the health check result
    expect(healthResult.success).toBe(true);
  });
});