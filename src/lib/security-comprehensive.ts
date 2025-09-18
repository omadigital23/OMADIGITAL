/**
 * Comprehensive Security Enhancement Layer
 * Final implementation of OWASP Top 10 protections
 */

import { logger, securityLogger } from './logger';
import { AppError } from '@/utils/error-handling';
import DOMPurify from 'isomorphic-dompurify';

// ============================================================================
// Enhanced Input Validation & XSS Protection
// ============================================================================

export class EnhancedInputValidator {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /document\./gi,
    /window\./gi,
    /eval\(/gi,
  ];

  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\s)/gi,
    /(or|and)\s+\d+\s*=\s*\d+/gi,
    /'\s*(or|and)\s*'/gi,
    /--\s*$/gm,
    /\/\*.*?\*\//gs,
  ];

  static sanitizeAndValidate(input: string, options: {
    maxLength?: number;
    allowHtml?: boolean;
    strict?: boolean;
  } = {}): { sanitized: string; isValid: boolean; warnings: string[] } {
    const { maxLength = 1000, allowHtml = false, strict = false } = options;
    
    if (!input || typeof input !== 'string') {
      return { sanitized: '', isValid: true, warnings: [] };
    }

    const warnings: string[] = [];
    let sanitized = input;

    // Check for XSS attempts
    this.XSS_PATTERNS.forEach(pattern => {
      if (pattern.test(sanitized)) {
        warnings.push('Potential XSS detected');
        securityLogger.event('XSS attempt blocked', { 
          input: input.substring(0, 100),
          pattern: pattern.source 
        });
        if (strict) {
          throw new AppError('Malicious content detected', 'XSS_DETECTED', 400);
        }
      }
    });

    // Check for SQL injection
    this.SQL_INJECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(sanitized)) {
        warnings.push('Potential SQL injection detected');
        securityLogger.event('SQL injection attempt blocked', { 
          input: input.substring(0, 100) 
        });
        if (strict) {
          throw new AppError('Malicious query detected', 'SQL_INJECTION_DETECTED', 400);
        }
      }
    });

    // Sanitize with DOMPurify
    if (allowHtml) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
        ALLOWED_ATTR: ['href', 'title'],
      });
    } else {
      sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }

    // Remove control characters and trim
    sanitized = sanitized
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();

    // Enforce length limit
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      warnings.push(`Content truncated to ${maxLength} characters`);
    }

    return { 
      sanitized, 
      isValid: warnings.length === 0, 
      warnings 
    };
  }

  static validateContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
  }): { isValid: boolean; errors: Record<string, string>; sanitized?: typeof data } {
    const errors: Record<string, string> = {};
    const sanitized = {} as typeof data;

    // Validate and sanitize name
    const nameResult = this.sanitizeAndValidate(data.name, { maxLength: 100, strict: true });
    if (!nameResult.sanitized || nameResult.sanitized.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!nameResult.isValid) {
      errors.name = 'Invalid characters in name';
    } else {
      sanitized.name = nameResult.sanitized;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Invalid email format';
    } else {
      sanitized.email = data.email.toLowerCase().trim();
    }

    // Validate phone (optional)
    if (data.phone) {
      const phoneDigits = data.phone.replace(/\D/g, '');
      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        errors.phone = 'Invalid phone number';
      } else {
        sanitized.phone = phoneDigits;
      }
    }

    // Validate and sanitize company (optional)
    if (data.company) {
      const companyResult = this.sanitizeAndValidate(data.company, { maxLength: 200 });
      if (!companyResult.isValid) {
        errors.company = 'Invalid company name';
      } else {
        sanitized.company = companyResult.sanitized;
      }
    }

    // Validate and sanitize message
    const messageResult = this.sanitizeAndValidate(data.message, { maxLength: 2000, strict: true });
    if (!messageResult.sanitized || messageResult.sanitized.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (!messageResult.isValid) {
      errors.message = 'Invalid content in message';
    } else {
      sanitized.message = messageResult.sanitized;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized: Object.keys(errors).length === 0 ? sanitized : undefined,
    };
  }
}

// ============================================================================
// GDPR Compliance Manager
// ============================================================================

export class GDPRManager {
  static readonly RETENTION_PERIODS = {
    analytics: 26 * 30 * 24 * 60 * 60 * 1000, // 26 months
    chatbot: 12 * 30 * 24 * 60 * 60 * 1000,   // 12 months
    contacts: 36 * 30 * 24 * 60 * 60 * 1000,  // 36 months
    logs: 3 * 30 * 24 * 60 * 60 * 1000,       // 3 months
  };

  static async processDataDeletionRequest(
    userId: string, 
    email: string,
    supabaseClient: any
  ): Promise<{ success: boolean; deletedRecords: number; errors: string[] }> {
    const errors: string[] = [];
    let deletedRecords = 0;

    try {
      // Validate request
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
        return { success: false, deletedRecords: 0, errors };
      }

      // Delete from chatbot_interactions
      const { error: chatbotError, count: chatbotCount } = await supabaseClient
        .from('chatbot_interactions')
        .delete()
        .eq('user_id', userId);

      if (chatbotError) {
        errors.push(`Chatbot data deletion failed: ${chatbotError.message}`);
      } else {
        deletedRecords += chatbotCount || 0;
      }

      // Delete from analytics_events
      const { error: analyticsError, count: analyticsCount } = await supabaseClient
        .from('analytics_events')
        .delete()
        .eq('user_id', userId);

      if (analyticsError) {
        errors.push(`Analytics data deletion failed: ${analyticsError.message}`);
      } else {
        deletedRecords += analyticsCount || 0;
      }

      // Delete from quotes (contact forms)
      const { error: quotesError, count: quotesCount } = await supabaseClient
        .from('quotes')
        .delete()
        .eq('email', email);

      if (quotesError) {
        errors.push(`Contact data deletion failed: ${quotesError.message}`);
      } else {
        deletedRecords += quotesCount || 0;
      }

      // Anonymize remaining data
      await this.anonymizeUserData(userId, email, supabaseClient);

      // Log the deletion request
      logger.info('GDPR data deletion completed', {
        component: 'gdpr_manager',
      }, {
        userId,
        email: this.anonymizeEmail(email),
        deletedRecords,
        errors: errors.length,
      });

      return {
        success: errors.length === 0,
        deletedRecords,
        errors,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Deletion process failed: ${errorMessage}`);
      
      logger.error('GDPR data deletion error', error as Error, {
        component: 'gdpr_manager',
        userId,
      });

      return { success: false, deletedRecords, errors };
    }
  }

  private static async anonymizeUserData(
    userId: string, 
    email: string, 
    supabaseClient: any
  ): Promise<void> {
    // Anonymize any remaining references
    const anonymizedEmail = this.anonymizeEmail(email);
    
    // Update any tables that might still reference the user
    const tables = ['error_logs', 'application_logs'];
    
    for (const table of tables) {
      try {
        await supabaseClient
          .from(table)
          .update({ 
            user_id: null,
            context: supabaseClient.raw('jsonb_set(context, \'{email}\', \'"[DELETED]"\')'),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } catch (error) {
        // Continue with other tables even if one fails
        logger.warn(`Failed to anonymize data in ${table}`, undefined, { error });
      }
    }
  }

  private static anonymizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.substring(0, 2)}***@${domain}`;
  }

  static generateDataExport(userData: Record<string, unknown>): {
    personal_data: Record<string, unknown>;
    metadata: {
      exported_at: string;
      retention_info: Record<string, string>;
    };
  } {
    // Remove sensitive system fields
    const { created_at, updated_at, id, ...personalData } = userData;

    return {
      personal_data: personalData,
      metadata: {
        exported_at: new Date().toISOString(),
        retention_info: {
          analytics: `${this.RETENTION_PERIODS.analytics / (1000 * 60 * 60 * 24)} days`,
          chatbot: `${this.RETENTION_PERIODS.chatbot / (1000 * 60 * 60 * 24)} days`,
          contacts: `${this.RETENTION_PERIODS.contacts / (1000 * 60 * 60 * 24)} days`,
        },
      },
    };
  }
}

// ============================================================================
// Security API Middleware
// ============================================================================

export function createSecurityMiddleware() {
  return {
    validateInput: (req: any, res: any, next: any) => {
      try {
        // Validate and sanitize request body
        if (req.body && typeof req.body === 'object') {
          const sanitizedBody: Record<string, unknown> = {};
          
          for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
              const result = EnhancedInputValidator.sanitizeAndValidate(value, {
                maxLength: 10000,
                strict: true,
              });
              sanitizedBody[key] = result.sanitized;
            } else {
              sanitizedBody[key] = value;
            }
          }
          
          req.body = sanitizedBody;
        }
        
        next();
      } catch (error) {
        logger.error('Security middleware validation failed', error as Error);
        res.status(400).json({ error: 'Invalid input detected' });
      }
    },

    rateLimitByIP: (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
      const requestCounts = new Map<string, { count: number; resetTime: number }>();
      
      return (req: any, res: any, next: any) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const bucket = requestCounts.get(ip);
        
        if (!bucket || now > bucket.resetTime) {
          requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
          next();
        } else if (bucket.count < maxRequests) {
          bucket.count++;
          next();
        } else {
          securityLogger.event('Rate limit exceeded', { ip, endpoint: req.path });
          res.status(429).json({ 
            error: 'Too many requests',
            retryAfter: Math.ceil((bucket.resetTime - now) / 1000),
          });
        }
      };
    },

    securityHeaders: (req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
      
      next();
    },
  };
}

// ============================================================================
// Export main functions
// ============================================================================

export { EnhancedInputValidator, GDPRManager };
export const securityMiddleware = createSecurityMiddleware();
export default { EnhancedInputValidator, GDPRManager, securityMiddleware };