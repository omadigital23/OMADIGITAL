// Type-safe API client with comprehensive error handling and null safety
import { 
  safeString, 
  safeAsyncWithError, 
  safeErrorMessage, 
  safeParseJSON,
  safeStringifyJSON,
  requireEnvVar
} from '../../utils/null-safety';
import { APIResponse, PaginatedResponse } from '../types';

// API Configuration
export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

// Request options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: RequestCache;
  credentials?: RequestCredentials;
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Default configuration
const DEFAULT_CONFIG: APIConfig = {
  baseURL: process.env['NEXT_PUBLIC_API_BASE_URL'] || '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Type-safe API client class
export class TypeSafeAPIClient {
  private config: APIConfig;
  private requestId = 0;

  constructor(config: Partial<APIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Generate unique request ID for tracking
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestId}`;
  }

  // Safe URL construction
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const baseURL = this.config.baseURL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    let url = `${baseURL}/${cleanEndpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  // Safe request execution with retries
  private async executeRequest<T>(
    url: string,
    options: RequestOptions = {},
    requestId: string
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.timeout,
      retries = this.config.retries,
      cache,
      credentials = 'same-origin'
    } = options;

    // Prepare headers
    const requestHeaders = {
      ...this.config.headers,
      ...headers,
      'X-Request-ID': requestId
    };

    // Prepare request init
    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      cache,
      credentials
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (typeof body === 'object') {
        requestInit.body = safeStringifyJSON(body);
      } else {
        requestInit.body = String(body);
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestInit.signal = controller.signal;

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[API] ${method} ${url} (attempt ${attempt + 1}/${retries + 1})`);

        const response = await fetch(url, requestInit);
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          const errorData = safeParseJSON(errorText);
          
          throw new APIError(
            errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData?.code,
            errorData
          );
        }

        // Parse response
        const responseText = await response.text();
        const data = safeParseJSON<T>(responseText);

        if (data === undefined) {
          throw new APIError('Invalid JSON response', response.status);
        }

        console.log(`[API] ${method} ${url} - Success`);
        return data;

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        if (
          error instanceof APIError && 
          error.status && 
          (error.status < 500 || error.status === 429)
        ) {
          break;
        }

        // Don't retry on validation errors
        if (error instanceof ValidationError) {
          break;
        }

        // Wait before retry
        if (attempt < retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.log(`[API] Retrying ${method} ${url} in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(`[API] ${method} ${url} - Failed after ${retries + 1} attempts`);
    throw lastError || new NetworkError('Request failed');
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    params?: Record<string, any>
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const url = this.buildURL(endpoint, params);

    const [result, error] = await safeAsyncWithError(
      this.executeRequest<T>(url, options, requestId)
    );

    if (error) {
      console.error(`[API] Request failed:`, {
        requestId,
        endpoint,
        error: safeErrorMessage(error)
      });
      throw error;
    }

    return result;
  }

  // Convenience methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, params);
  }

  async post<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body }, params);
  }

  async put<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body }, params);
  }

  async patch<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body }, params);
  }

  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, params);
  }

  // Type-safe response wrappers
  async safeGet<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    try {
      const data = await this.get<T>(endpoint, params);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: safeErrorMessage(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  async safePost<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<APIResponse<T>> {
    try {
      const data = await this.post<T>(endpoint, body, params);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: safeErrorMessage(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    page = 1,
    limit = 25,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const paginationParams = { page, limit, ...params };
    return this.get<PaginatedResponse<T>>(endpoint, paginationParams);
  }

  // File upload with progress
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
      }

      const xhr = new XMLHttpRequest();
      const requestId = this.generateRequestId();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = safeParseJSON<T>(xhr.responseText);
            if (response !== undefined) {
              resolve(response);
            } else {
              reject(new APIError('Invalid JSON response', xhr.status));
            }
          } catch (error) {
            reject(new APIError('Failed to parse response', xhr.status));
          }
        } else {
          const errorData = safeParseJSON(xhr.responseText);
          reject(new APIError(
            errorData?.message || `HTTP ${xhr.status}`,
            xhr.status,
            errorData?.code,
            errorData
          ));
        }
      };

      xhr.onerror = () => {
        reject(new NetworkError('Upload failed'));
      };

      xhr.ontimeout = () => {
        reject(new NetworkError('Upload timeout'));
      };

      const url = this.buildURL(endpoint);
      xhr.open('POST', url);
      
      // Set headers (except Content-Type, let browser set it for FormData)
      Object.entries(this.config.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, value);
        }
      });
      
      xhr.setRequestHeader('X-Request-ID', requestId);
      xhr.timeout = this.config.timeout;
      xhr.send(formData);
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Update configuration
  updateConfig(config: Partial<APIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration
  getConfig(): APIConfig {
    return { ...this.config };
  }
}

// Default client instance
export const apiClient = new TypeSafeAPIClient();

// Convenience exports
export { apiClient as api };
export default TypeSafeAPIClient;