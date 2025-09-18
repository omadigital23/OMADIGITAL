/**
 * Centralized Logging Service
 * Provides structured logging with multiple targets (console, Supabase, external services)
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: SerializedError;
  metadata?: Record<string, unknown>;
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  component?: string;
  action?: string;
  environment?: string;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
}

// ============================================================================
// Logger Class
// ============================================================================

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';
  private supabase: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase(): Promise<void> {
    try {
      if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Server-side initialization
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
      }
    } catch (error) {
      console.error('Failed to initialize Supabase for logging:', error);
    }
  }

  private serializeError(error: Error | unknown): SerializedError | undefined {
    if (!error) return undefined;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error.constructor.name === 'AppError' && {
          code: (error as any).code,
          statusCode: (error as any).statusCode,
        }),
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        environment: process.env.NODE_ENV,
        ...context,
      },
      error: this.serializeError(error),
      metadata,
    };
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context, error, metadata } = entry;
    
    // Color-coded console output
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m', // Magenta
    };
    
    const reset = '\x1b[0m';
    const levelColor = colors[level] || '';
    
    const logMethod = level === 'error' || level === 'fatal' ? console.error : console.log;
    
    if (this.isDevelopment) {
      // Detailed development logging
      logMethod(
        `${levelColor}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`,
        {
          context,
          error,
          metadata,
        }
      );
    } else {
      // Simplified production logging
      logMethod(`[${level.toUpperCase()}] ${message}`, {
        timestamp,
        context: context?.component ? { component: context.component } : undefined,
        error: error ? { message: error.message, code: error.code } : undefined,
      });
    }
  }

  private async logToSupabase(entry: LogEntry): Promise<void> {
    if (!this.supabase || typeof window !== 'undefined') {
      return; // Only log to Supabase from server-side
    }

    try {
      await this.supabase.from('application_logs').insert([{
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        context: entry.context || {},
        error_details: entry.error || null,
        metadata: entry.metadata || {},
      }]);
    } catch (error) {
      // Fail silently to avoid cascading logging errors
      console.error('Failed to log to Supabase:', error);
    }
  }

  private async logToExternalService(entry: LogEntry): Promise<void> {
    // TODO: Implement external logging service integration (Sentry, LogRocket, etc.)
    // This is where you would send logs to external monitoring services
    
    if (!this.isProduction) return;

    try {
      // Example: Send to webhook endpoint
      if (process.env.LOG_WEBHOOK_URL && (entry.level === 'error' || entry.level === 'fatal')) {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private async writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry = this.createLogEntry(level, message, context, error, metadata);

    // Always log to console
    this.logToConsole(entry);

    // Log to Supabase (server-side only)
    await this.logToSupabase(entry);

    // Log to external services for errors/fatal
    if (level === 'error' || level === 'fatal') {
      await this.logToExternalService(entry);
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  debug(message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.writeLog('debug', message, context, undefined, metadata);
    }
  }

  info(message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    this.writeLog('info', message, context, undefined, metadata);
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    this.writeLog('warn', message, context, undefined, metadata);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    this.writeLog('error', message, context, error, metadata);
  }

  fatal(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    this.writeLog('fatal', message, context, error, metadata);
  }

  // Convenience methods for common scenarios
  apiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`API ${method} ${url}`, context, {
      statusCode,
      duration,
      type: 'api_request',
    });
  }

  performanceMetric(name: string, value: number, unit: string, context?: LogContext): void {
    this.info(`Performance: ${name}`, context, {
      metric: name,
      value,
      unit,
      type: 'performance',
    });
  }

  userAction(action: string, userId?: string, metadata?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      userId,
      component: 'user_interaction',
    }, {
      action,
      ...metadata,
      type: 'user_action',
    });
  }

  chatbotInteraction(
    sessionId: string,
    messageType: 'user' | 'bot',
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.info(`Chatbot ${messageType} message`, {
      sessionId,
      component: 'chatbot',
    }, {
      messageType,
      messageLength: message.length,
      ...metadata,
      type: 'chatbot_interaction',
    });
  }

  securityEvent(event: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, context, {
      ...metadata,
      type: 'security',
    });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const logger = new Logger();

// Export individual methods for convenience
export const { debug, info, warn, error, fatal } = logger;

// Export specialized loggers
export const apiLogger = {
  request: logger.apiRequest.bind(logger),
  error: (message: string, error: Error, context?: LogContext) => 
    logger.error(`API Error: ${message}`, error, { ...context, component: 'api' }),
};

export const performanceLogger = {
  metric: logger.performanceMetric.bind(logger),
  timing: (name: string, startTime: number, context?: LogContext) => {
    const duration = Date.now() - startTime;
    logger.performanceMetric(name, duration, 'ms', context);
  },
};

export const securityLogger = {
  event: logger.securityEvent.bind(logger),
  authFailure: (reason: string, context?: LogContext) =>
    logger.securityEvent(`Authentication failure: ${reason}`, context),
  suspiciousActivity: (activity: string, context?: LogContext) =>
    logger.securityEvent(`Suspicious activity: ${activity}`, context),
};

export const userLogger = {
  action: logger.userAction.bind(logger),
  login: (userId: string) => logger.userAction('login', userId),
  logout: (userId: string) => logger.userAction('logout', userId),
};

export const chatbotLogger = {
  interaction: logger.chatbotInteraction.bind(logger),
  error: (error: Error, sessionId: string) =>
    logger.error('Chatbot error', error, { sessionId, component: 'chatbot' }),
};

export default logger;