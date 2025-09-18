/**
 * Centralized Error Handling Utilities
 * Provides consistent error handling across the application
 */

import { ApiError, ApiResponse } from '@/types/common';

// ============================================================================
// Error Classes
// ============================================================================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_ERROR', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Error Response Builders
// ============================================================================

export function createErrorResponse<T = never>(
  error: AppError | Error | string,
  requestId?: string
): ApiResponse<T> {
  let apiError: ApiError;

  if (error instanceof AppError) {
    apiError = error.toApiError();
  } else if (error instanceof Error) {
    apiError = {
      code: 'INTERNAL_ERROR',
      message: error.message,
      statusCode: 500,
    };
  } else {
    apiError = {
      code: 'UNKNOWN_ERROR',
      message: error,
      statusCode: 500,
    };
  }

  return {
    success: false,
    error: apiError,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

// ============================================================================
// Error Logging
// ============================================================================

interface ErrorLogContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  additional?: Record<string, unknown>;
}

export async function logError(
  error: Error | AppError,
  context?: ErrorLogContext
): Promise<void> {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context,
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    }),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error logged:', errorLog);
  }

  // In production, you might want to send to an external service
  // await sendToExternalLoggingService(errorLog);
  
  // For now, we can log to Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('error_logs').insert([{
      error_type: error.name,
      error_message: error.message,
      error_stack: error.stack,
      error_code: error instanceof AppError ? error.code : null,
      status_code: error instanceof AppError ? error.statusCode : 500,
      context: context || {},
      timestamp: new Date().toISOString(),
    }]);
  } catch (logError) {
    // Fail silently for logging errors to avoid cascading failures
    console.error('Failed to log error to database:', logError);
  }
}

// ============================================================================
// Error Boundary Utilities
// ============================================================================

export interface ErrorInfo {
  componentStack: string;
}

export function handleErrorBoundaryError(
  error: Error,
  errorInfo: ErrorInfo,
  userId?: string
): void {
  logError(error, {
    userId,
    additional: {
      componentStack: errorInfo.componentStack,
      boundary: 'react-error-boundary',
    },
  });
}

// ============================================================================
// Async Error Handling
// ============================================================================

export type AsyncResult<T, E = AppError> = Promise<{
  data?: T;
  error?: E;
  success: boolean;
}>;

export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): AsyncResult<T> {
  try {
    const data = await operation();
    return { data, success: true };
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          'ASYNC_OPERATION_ERROR'
        );
    
    await logError(appError);
    
    return { 
      error: appError, 
      success: false,
      ...(fallback !== undefined && { data: fallback })
    };
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value;
}

export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  return email;
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): string {
  if (value.length < min || value.length > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max} characters`,
      { min, max, actualLength: value.length }
    );
  }
  return value;
}

// ============================================================================
// Error Recovery Strategies
// ============================================================================

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry for certain errors
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError!;
}

export function withFallback<T>(
  operation: () => T,
  fallback: T
): T {
  try {
    return operation();
  } catch {
    return fallback;
  }
}