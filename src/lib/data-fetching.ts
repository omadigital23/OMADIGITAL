/**
 * Enhanced Data Fetching Strategy
 * Provides optimized data fetching with caching, retry logic, and performance monitoring
 */

import { ApiResponse, ApiError } from '@/types/common';
import { logger, apiLogger } from './logger';
import { withRetry, safeAsync } from '@/utils/error-handling';

// ============================================================================
// Types
// ============================================================================

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached';
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  key?: string;
}

// ============================================================================
// Enhanced Fetch with Performance Monitoring
// ============================================================================

class EnhancedFetcher {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private requestId = 0;

  private generateRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  private getCacheKey(url: string, options?: FetchOptions): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async fetch<T = unknown>(
    url: string,
    options: FetchOptions = {},
    cacheOptions: CacheOptions = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = performance.now();
    const method = options.method || 'GET';

    // Check cache for GET requests
    const cacheKey = this.getCacheKey(url, options);
    if (method === 'GET' && cacheOptions.ttl) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        apiLogger.request(method, url, 200, 0, { requestId, source: 'cache' });
        return cached as ApiResponse<T>;
      }
    }

    const { timeout = 10000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

    try {
      const result = await withRetry(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': requestId,
              ...fetchOptions.headers,
            },
          });

          clearTimeout(timeoutId);

          const duration = performance.now() - startTime;
          apiLogger.request(method, url, response.status, duration, { requestId });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
          }

          const data = await response.json();

          // Cache successful GET requests
          if (method === 'GET' && cacheOptions.ttl && response.status === 200) {
            this.setCache(cacheKey, { success: true, data }, cacheOptions.ttl);
          }

          return {
            success: true,
            data,
            metadata: {
              timestamp: new Date().toISOString(),
              requestId,
            },
          } as ApiResponse<T>;

        } finally {
          clearTimeout(timeoutId);
        }
      }, retries, retryDelay);

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      const apiError: ApiError = {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown fetch error',
        statusCode: 500,
      };

      apiLogger.error(`Fetch failed: ${method} ${url}`, error as Error, { requestId });

      return {
        success: false,
        error: apiError,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    }
  }

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ============================================================================
// API Client
// ============================================================================

export class ApiClient {
  private fetcher = new EnhancedFetcher();
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private getFullUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseUrl}${endpoint}`;
  }

  async get<T>(
    endpoint: string,
    options: Omit<FetchOptions, 'method'> = {},
    cacheOptions: CacheOptions = { ttl: 5 * 60 * 1000 } // 5 minutes default
  ): Promise<ApiResponse<T>> {
    return this.fetcher.fetch<T>(
      this.getFullUrl(endpoint),
      { ...options, method: 'GET' },
      cacheOptions
    );
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<FetchOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.fetcher.fetch<T>(
      this.getFullUrl(endpoint),
      {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<FetchOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.fetcher.fetch<T>(
      this.getFullUrl(endpoint),
      {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  async delete<T>(
    endpoint: string,
    options: Omit<FetchOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.fetcher.fetch<T>(
      this.getFullUrl(endpoint),
      { ...options, method: 'DELETE' }
    );
  }

  // Cache management
  clearCache(pattern?: string): void {
    this.fetcher.clearCache(pattern);
  }

  getCacheStats() {
    return this.fetcher.getCacheStats();
  }
}

// ============================================================================
// React Query Helpers
// ============================================================================

export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (was cacheTime)
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
};

// Query key factories
export const queryKeys = {
  all: ['api'] as const,
  admin: () => [...queryKeys.all, 'admin'] as const,
  adminMetrics: () => [...queryKeys.admin(), 'metrics'] as const,
  adminAnalytics: (params?: Record<string, unknown>) => 
    [...queryKeys.admin(), 'analytics', params] as const,
  
  blog: () => [...queryKeys.all, 'blog'] as const,
  blogArticles: (filters?: Record<string, unknown>) => 
    [...queryKeys.blog(), 'articles', filters] as const,
  blogArticle: (id: string) => [...queryKeys.blog(), 'article', id] as const,
  
  chatbot: () => [...queryKeys.all, 'chatbot'] as const,
  chatbotSessions: (filters?: Record<string, unknown>) => 
    [...queryKeys.chatbot(), 'sessions', filters] as const,
    
  quotes: () => [...queryKeys.all, 'quotes'] as const,
} as const;

// ============================================================================
// Specialized Data Fetchers
// ============================================================================

export class AdminApiClient extends ApiClient {
  constructor() {
    super('/api/admin');
  }

  async getMetrics() {
    return this.get('/metrics', {}, { ttl: 30000 }); // 30 seconds
  }

  async getAnalytics(period?: string) {
    return this.get(`/analytics${period ? `?period=${period}` : ''}`, {}, { ttl: 60000 }); // 1 minute
  }

  async getRealtimeStats() {
    return this.get('/realtime-stats', {}, { ttl: 10000 }); // 10 seconds
  }

  async getBlogArticles() {
    return this.get('/blog-articles', {}, { ttl: 60000 }); // 1 minute
  }

  async getAlerts() {
    return this.get('/alerts', {}, { ttl: 30000 }); // 30 seconds
  }
}

export class BlogApiClient extends ApiClient {
  constructor() {
    super('/api/blog');
  }

  async getArticles(params?: { category?: string; tag?: string; limit?: number }) {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    return this.get(`/articles?${searchParams}`, {}, { ttl: 300000 }); // 5 minutes
  }

  async getArticle(id: string) {
    return this.get(`/articles/${id}`, {}, { ttl: 600000 }); // 10 minutes
  }
}

export class ChatbotApiClient extends ApiClient {
  constructor() {
    super('/api/chat');
  }

  async sendMessage(message: string, sessionId: string) {
    return this.post('/gemini', { message, sessionId });
  }

  async getInteractions(sessionId?: string) {
    return this.get(`/interactions${sessionId ? `?session_id=${sessionId}` : ''}`, {}, { ttl: 60000 });
  }
}

// ============================================================================
// Export instances
// ============================================================================

export const apiClient = new ApiClient();
export const adminApi = new AdminApiClient();
export const blogApi = new BlogApiClient();
export const chatbotApi = new ChatbotApiClient();

export default apiClient;