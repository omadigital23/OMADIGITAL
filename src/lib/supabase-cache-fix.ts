/**
 * Supabase Schema Cache Fix & Knowledge Base Enhancement
 * Resolves cache issues and optimizes knowledge base access
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface CacheFixResult {
  success: boolean;
  message: string;
  details?: any;
}

interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  language: 'fr' | 'en';
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class SupabaseCacheFix {
  private supabase: SupabaseClient;
  private isInitialized = false;
  private knowledgeCache = new Map<string, KnowledgeBaseItem[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      // Create a mock client to prevent crashes
      this.supabase = null as any;
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      });
      
      // Set initialization timestamp
      this.cacheExpiry.set('init_time', Date.now());
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      this.supabase = null as any;
    }
  }

  // Singleton pattern for Supabase client
  public getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Initialize and fix schema cache issues
   */
  async initialize(): Promise<CacheFixResult> {
    if (this.isInitialized) {
      return { success: true, message: 'Already initialized' };
    }

    try {
      console.log('🔧 Initializing Supabase cache fix...');

      // Step 1: Clear any existing cache
      await this.clearCache();

      // Step 2: Verify database connection with retry
      const connectionResult = await this.verifyConnectionWithRetry();
      if (!connectionResult.success) {
        console.warn('⚠️ Connection failed, continuing with limited functionality');
      }

      // Step 3: Refresh schema cache
      const schemaResult = await this.refreshSchemaCache();
      if (!schemaResult.success) {
        console.warn('⚠️ Schema refresh failed, using fallback');
      }

      // Step 4: Verify knowledge base access
      const kbResult = await this.verifyKnowledgeBaseAccess();
      if (!kbResult.success) {
        console.warn('⚠️ Knowledge base access limited');
      }

      // Step 5: Preload critical data (non-blocking)
      this.preloadKnowledgeBase().catch(error => {
        console.warn('Knowledge base preload failed:', error);
      });

      // Step 6: Initialize CTA cache
      await this.initializeCTACache();

      this.isInitialized = true;
      console.log('✅ Supabase cache fix initialized successfully');

      return {
        success: true,
        message: 'Supabase cache fix initialized successfully',
        details: {
          connection: connectionResult.success,
          schema: schemaResult.success,
          knowledgeBase: kbResult.success
        }
      };

    } catch (error) {
      console.error('❌ Failed to initialize Supabase cache fix:', error);
      // Don't fail completely, allow partial functionality
      this.isInitialized = true;
      return {
        success: true,
        message: `Partial initialization: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, partial: true }
      };
    }
  }

  /**
   * Clear all caches with selective clearing
   */
  private async clearCache(): Promise<void> {
    // Keep initialization timestamp
    const initTime = this.cacheExpiry.get('init_time');
    
    this.knowledgeCache.clear();
    this.cacheExpiry.clear();
    
    // Restore init time
    if (initTime) {
      this.cacheExpiry.set('init_time', initTime);
    }
    
    // Selective browser cache clearing
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const supabaseCaches = cacheNames.filter(name => 
          name.includes('supabase') || name.includes('api')
        );
        await Promise.all(
          supabaseCaches.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.warn('Could not clear browser cache:', error);
      }
    }
  }

  /**
   * Verify database connection with retry logic
   */
  private async verifyConnectionWithRetry(maxRetries = 3): Promise<CacheFixResult> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await this.supabase
          .from('knowledge_base')
          .select('count(*)')
          .limit(1);

        if (error) {
          if (attempt === maxRetries) {
            return {
              success: false,
              message: `Database connection failed after ${maxRetries} attempts: ${error.message}`,
              details: { error, attempts: attempt }
            };
          }
          console.warn(`Connection attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return {
          success: true,
          message: 'Database connection verified',
          details: { connected: true, attempts: attempt }
        };

      } catch (error) {
        if (attempt === maxRetries) {
          return {
            success: false,
            message: `Connection verification failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error, attempts: attempt }
          };
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      success: false,
      message: 'Unexpected error in connection verification',
      details: {}
    };
  }

  /**
   * Refresh schema cache
   */
  private async refreshSchemaCache(): Promise<CacheFixResult> {
    try {
      // Force schema refresh by making a fresh connection
      const freshClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: { persistSession: false },
          db: { schema: 'public' },
          global: {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        }
      );

      // Test all critical tables
      const tables = ['knowledge_base', 'conversations', 'messages', 'chatbot_interactions'];
      const results = [];

      for (const table of tables) {
        try {
          const { data, error } = await freshClient
            .from(table)
            .select('*')
            .limit(1);

          results.push({
            table,
            accessible: !error,
            error: error?.message || null
          });

        } catch (tableError) {
          results.push({
            table,
            accessible: false,
            error: tableError instanceof Error ? tableError.message : 'Unknown error'
          });
        }
      }

      const allAccessible = results.every(r => r.accessible);

      return {
        success: allAccessible,
        message: allAccessible ? 'Schema cache refreshed successfully' : 'Some tables not accessible',
        details: { tables: results }
      };

    } catch (error) {
      return {
        success: false,
        message: `Schema refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  /**
   * Verify knowledge base access
   */
  private async verifyKnowledgeBaseAccess(): Promise<CacheFixResult> {
    try {
      // Test knowledge base queries
      const { data: frenchData, error: frenchError } = await this.supabase
        .from('knowledge_base')
        .select('*')
        .eq('language', 'fr')
        .eq('is_active', true)
        .limit(5);

      const { data: englishData, error: englishError } = await this.supabase
        .from('knowledge_base')
        .select('*')
        .eq('language', 'en')
        .eq('is_active', true)
        .limit(5);

      if (frenchError || englishError) {
        return {
          success: false,
          message: 'Knowledge base access failed',
          details: {
            frenchError: frenchError?.message,
            englishError: englishError?.message
          }
        };
      }

      return {
        success: true,
        message: 'Knowledge base access verified',
        details: {
          frenchItems: frenchData?.length || 0,
          englishItems: englishData?.length || 0,
          totalItems: (frenchData?.length || 0) + (englishData?.length || 0)
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Knowledge base verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  /**
   * Preload knowledge base data into cache
   */
  private async preloadKnowledgeBase(): Promise<void> {
    try {
      const languages: ('fr' | 'en')[] = ['fr', 'en'];
      
      for (const language of languages) {
        const { data, error } = await this.supabase
          .from('knowledge_base')
          .select('*')
          .eq('language', language)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const cacheKey = `kb_${language}`;
          this.knowledgeCache.set(cacheKey, data);
          this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
          
          console.log(`📚 Preloaded ${data.length} ${language} knowledge base items`);
        }
      }
    } catch (error) {
      console.warn('Failed to preload knowledge base:', error);
    }
  }

  /**
   * Enhanced knowledge base search with caching
   */
  async searchKnowledgeBase(
    query: string,
    language: 'fr' | 'en',
    limit: number = 5
  ): Promise<KnowledgeBaseItem[]> {
    try {
      const cacheKey = `search_${language}_${query.toLowerCase().slice(0, 50)}`;
      const now = Date.now();

      // Check cache first
      if (this.knowledgeCache.has(cacheKey) && 
          this.cacheExpiry.has(cacheKey) && 
          this.cacheExpiry.get(cacheKey)! > now) {
        return this.knowledgeCache.get(cacheKey)!.slice(0, limit);
      }

      // Perform multiple search strategies
      const searchResults = await Promise.allSettled([
        // 1. Text search on content
        this.supabase
          .from('knowledge_base')
          .select('*')
          .eq('language', language)
          .eq('is_active', true)
          .textSearch('content', query, { type: 'websearch' })
          .limit(limit),

        // 2. Keyword array search
        this.supabase
          .from('knowledge_base')
          .select('*')
          .eq('language', language)
          .eq('is_active', true)
          .contains('keywords', [query.toLowerCase()])
          .limit(limit),

        // 3. Title search
        this.supabase
          .from('knowledge_base')
          .select('*')
          .eq('language', language)
          .eq('is_active', true)
          .ilike('title', `%${query}%`)
          .limit(limit)
      ]);

      // Combine and deduplicate results
      const allResults: KnowledgeBaseItem[] = [];
      const seenIds = new Set<string>();

      searchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data) {
          result.value.data.forEach((item: KnowledgeBaseItem) => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              allResults.push(item);
            }
          });
        }
      });

      // Sort by relevance (simple scoring based on query matches)
      const scoredResults = allResults.map(item => ({
        ...item,
        score: this.calculateRelevanceScore(item, query)
      })).sort((a, b) => b.score - a.score);

      const finalResults = scoredResults.slice(0, limit);

      // Cache results
      this.knowledgeCache.set(cacheKey, finalResults);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

      return finalResults;

    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(item: KnowledgeBaseItem, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Keyword match (high weight)
    const keywordMatches = item.keywords.filter(keyword => 
      keyword.toLowerCase().includes(queryLower) || 
      queryLower.includes(keyword.toLowerCase())
    );
    score += keywordMatches.length * 5;

    // Content match (medium weight)
    const contentMatches = (item.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;

    // Category bonus
    if (item.category === 'services' || item.category === 'contact') {
      score += 3;
    }

    return score;
  }

  /**
   * Get cached knowledge base items by language
   */
  getCachedKnowledgeBase(language: 'fr' | 'en'): KnowledgeBaseItem[] {
    const cacheKey = `kb_${language}`;
    const now = Date.now();

    if (this.knowledgeCache.has(cacheKey) && 
        this.cacheExpiry.has(cacheKey) && 
        this.cacheExpiry.get(cacheKey)! > now) {
      return this.knowledgeCache.get(cacheKey)!;
    }

    return [];
  }

  /**
   * Initialize CTA cache
   */
  private async initializeCTACache(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('cta_actions')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (!error && data) {
        this.knowledgeCache.set('active_ctas', data);
        this.cacheExpiry.set('active_ctas', Date.now() + this.CACHE_DURATION);
        console.log(`🎯 Preloaded ${data.length} active CTAs`);
      }
    } catch (error) {
      console.warn('Failed to initialize CTA cache:', error);
    }
  }

  /**
   * Get cached CTAs
   */
  getCachedCTAs(): any[] {
    const cacheKey = 'active_ctas';
    const now = Date.now();

    if (this.knowledgeCache.has(cacheKey) && 
        this.cacheExpiry.has(cacheKey) && 
        this.cacheExpiry.get(cacheKey)! > now) {
      return this.knowledgeCache.get(cacheKey)!;
    }

    return [];
  }

  /**
   * Force refresh knowledge base cache
   */
  async refreshKnowledgeBaseCache(): Promise<void> {
    this.knowledgeCache.clear();
    this.cacheExpiry.clear();
    await this.preloadKnowledgeBase();
    await this.initializeCTACache();
  }

  /**
   * Health check for the cache system
   */
  async healthCheck(): Promise<CacheFixResult> {
    try {
      if (!this.isInitialized) {
        return { success: false, message: 'Cache fix not initialized' };
      }

      const connectionResult = await this.verifyConnectionWithRetry(1);
      const kbResult = await this.verifyKnowledgeBaseAccess();
      
      // Check CTA system
      const ctaCount = this.getCachedCTAs().length;

      const isHealthy = connectionResult.success && kbResult.success;

      return {
        success: isHealthy,
        message: isHealthy ? 'System healthy' : 'System issues detected',
        details: {
          connection: connectionResult.success,
          knowledgeBase: kbResult.success,
          cacheSize: this.knowledgeCache.size,
          ctaCount,
          initialized: this.isInitialized,
          uptime: Date.now() - (this.cacheExpiry.get('init_time') || Date.now())
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }
}

// Export singleton instance
export const supabaseCacheFix = new SupabaseCacheFix();

// Export a function to get the Supabase client
export function getSupabaseClient() {
  return supabaseCacheFix.getSupabaseClient();
}

// Auto-initialize with improved error handling
if (typeof window === 'undefined') {
  // Server-side initialization with timeout
  Promise.race([
    supabaseCacheFix.initialize(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Initialization timeout')), 10000))
  ]).catch(error => {
    console.warn('Supabase cache fix initialization failed or timed out:', error);
  });
} else {
  // Client-side initialization
  const initializeClient = () => {
    supabaseCacheFix.initialize().catch(error => {
      console.warn('Client-side Supabase cache fix initialization failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeClient);
  } else {
    // Delay initialization to avoid blocking
    setTimeout(initializeClient, 100);
  }
}