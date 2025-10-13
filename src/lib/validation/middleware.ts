// Validation middleware for API endpoints with comprehensive error handling
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { validator, ValidationResult, ValidationOptions } from './validator';
import { safeErrorMessage, safeParseJSON } from '../../utils/null-safety';

// Extended API request with validated data
export interface ValidatedApiRequest<T = any> extends NextApiRequest {
  validatedBody?: T;
  validatedQuery?: Record<string, any>;
  validationErrors?: ValidationResult<any>['errors'];
}

// Middleware options
export interface ValidationMiddlewareOptions extends ValidationOptions {
  validateQuery?: boolean;
  validateBody?: boolean;
  allowEmptyBody?: boolean;
  onValidationError?: (errors: ValidationResult<any>['errors'], req: NextApiRequest, res: NextApiResponse) => void;
}

// Request validation middleware factory
export function createValidationMiddleware<TBody = any, TQuery = any>(
  bodySchema?: z.ZodSchema<TBody>,
  querySchema?: z.ZodSchema<TQuery>,
  options: ValidationMiddlewareOptions = {}
) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void | Promise<void>
  ) => {
    const validatedReq = req as ValidatedApiRequest<TBody>;
    const allErrors: ValidationResult<any>['errors'] = [];

    // Validate request body
    if (bodySchema && options.validateBody !== false) {
      try {
        let bodyData: unknown;

        // Parse body based on content type
        if (typeof req.body === 'string') {
          bodyData = safeParseJSON(req.body);
        } else {
          bodyData = req.body;
        }

        // Check for empty body
        if (!bodyData && !options.allowEmptyBody) {
          allErrors.push({
            field: 'body',
            message: 'Request body is required',
            code: 'MISSING_BODY'
          });
        } else if (bodyData || options.allowEmptyBody) {
          const bodyValidation = validator.validate(bodySchema, bodyData, options);
          
          if (bodyValidation.success) {
            validatedReq.validatedBody = bodyValidation.data;
          } else {
            allErrors.push(...(bodyValidation.errors || []));
          }
        }
      } catch (error) {
        allErrors.push({
          field: 'body',
          message: `Invalid request body: ${safeErrorMessage(error)}`,
          code: 'INVALID_BODY_FORMAT'
        });
      }
    }

    // Validate query parameters
    if (querySchema && options.validateQuery !== false) {
      try {
        const queryValidation = validator.validate(querySchema, req.query, {
          ...options,
          stripUnknown: true // Usually want to strip unknown query params
        });
        
        if (queryValidation.success) {
          validatedReq.validatedQuery = queryValidation.data;
        } else {
          allErrors.push(...(queryValidation.errors || []));
        }
      } catch (error) {
        allErrors.push({
          field: 'query',
          message: `Invalid query parameters: ${safeErrorMessage(error)}`,
          code: 'INVALID_QUERY_FORMAT'
        });
      }
    }

    // Handle validation errors
    if (allErrors.length > 0) {
      validatedReq.validationErrors = allErrors;

      // Call custom error handler if provided
      if (options.onValidationError) {
        options.onValidationError(allErrors, req, res);
        return;
      }

      // Default error response
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: allErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Proceed to next middleware/handler
    await next();
  };
}

// Specific validation middlewares for common schemas
export const validateQuoteRequest = createValidationMiddleware(
  z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    company: z.string().max(100).optional(),
    service: z.string().min(1).max(200),
    message: z.string().min(10).max(2000),
    budget: z.string().max(50).optional(),
    location: z.string().min(1).max(100)
  }),
  undefined,
  { validateBody: true, validateQuery: false }
);

export const validateChatRequest = createValidationMiddleware(
  z.object({
    message: z.string().min(1).max(1000),
    language: z.enum(['fr', 'en']).optional(),
    sessionId: z.string().optional()
  }),
  undefined,
  { validateBody: true, validateQuery: false }
);

export const validateNewsletterSubscription = createValidationMiddleware(
  z.object({
    email: z.string().email(),
    source: z.string().max(100).optional(),
    metadata: z.record(z.unknown()).optional()
  }),
  undefined,
  { validateBody: true, validateQuery: false }
);

export const validateAdminPagination = createValidationMiddleware(
  undefined,
  z.object({
    page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional(),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().max(200).optional()
  }),
  { validateBody: false, validateQuery: true }
);

export const validateAnalyticsQuery = createValidationMiddleware(
  undefined,
  z.object({
    period: z.enum(['24h', '7d', '30d', '90d']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    language: z.enum(['fr', 'en']).optional(),
    source: z.string().max(50).optional()
  }),
  { validateBody: false, validateQuery: true }
);

// Response validation helper
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  res: NextApiResponse
): T | null {
  const validation = validator.validate(schema, data);
  
  if (!validation.success) {
    console.error('Response validation failed:', validation.errors);
    res.status(500).json({
      success: false,
      error: 'Internal server error - invalid response format',
      timestamp: new Date().toISOString()
    });
    return null;
  }
  
  return validation.data!;
}

// File upload validation middleware
export const validateFileUpload = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: number = 5 * 1024 * 1024, // 5MB
  required: boolean = true
) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // This would typically work with a file upload library like multer
    // For now, we'll validate File objects from FormData
    
    try {
      // Check if files are present when required
      if (required && (!req.body?.files || req.body.files.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'File upload is required',
          timestamp: new Date().toISOString()
        });
      }

      // Validate each file
      const files = req.body?.files || [];
      const errors: string[] = [];

      files.forEach((file: any, index: number) => {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          errors.push(`File ${index + 1}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        // Validate file size
        if (file.size > maxSize) {
          errors.push(`File ${index + 1}: File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
        }

        // Validate file name
        if (!file.name || file.name.length > 255) {
          errors.push(`File ${index + 1}: Invalid file name`);
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'File validation failed',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }

      await next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `File validation error: ${safeErrorMessage(error)}`,
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Rate limiting validation (simple implementation)
export const validateRateLimit = (
  maxRequests: number = 100,
  windowMs: number = 60 * 1000, // 1 minute
  keyGenerator?: (req: NextApiRequest) => string
) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const key = keyGenerator ? keyGenerator(req) : 
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    const now = Date.now();
    const record = requests.get(key as string);

    if (!record || now > record.resetTime) {
      // New window
      requests.set(key as string, {
        count: 1,
        resetTime: now + windowMs
      });
      await next();
      return;
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    record.count++;
    await next();
  };
};

// Security validation middleware
export const validateSecurity = (options: {
  requireHttps?: boolean;
  allowedOrigins?: string[];
  requireApiKey?: boolean;
  maxBodySize?: number;
} = {}) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // HTTPS check
    if (options.requireHttps && req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        error: 'HTTPS required',
        timestamp: new Date().toISOString()
      });
    }

    // Origin check
    if (options.allowedOrigins && options.allowedOrigins.length > 0) {
      const origin = req.headers.origin;
      if (origin && !options.allowedOrigins.includes(origin)) {
        return res.status(403).json({
          success: false,
          error: 'Origin not allowed',
          timestamp: new Date().toISOString()
        });
      }
    }

    // API key check
    if (options.requireApiKey) {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      if (!apiKey || !isValidApiKey(apiKey as string)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or missing API key',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Body size check
    if (options.maxBodySize && req.body) {
      const bodySize = JSON.stringify(req.body).length;
      if (bodySize > options.maxBodySize) {
        return res.status(413).json({
          success: false,
          error: 'Request body too large',
          timestamp: new Date().toISOString()
        });
      }
    }

    await next();
  };
};

// Helper function to validate API keys (implement your own logic)
function isValidApiKey(apiKey: string): boolean {
  // Implement your API key validation logic here
  // This could check against a database, validate JWT tokens, etc.
  return apiKey.length > 0; // Placeholder implementation
}

// Compose multiple middlewares
export function composeMiddleware(...middlewares: Array<(req: NextApiRequest, res: NextApiResponse, next: () => void) => void | Promise<void>>) {
  return async (req: NextApiRequest, res: NextApiResponse, handler: () => void | Promise<void>) => {
    let index = 0;

    async function next(): Promise<void> {
      if (index >= middlewares.length) {
        await handler();
        return;
      }

      const middleware = middlewares[index++];
      await middleware(req, res, next);
    }

    await next();
  };
}

// Export convenience function for API route protection
export function withValidation<TBody = any, TQuery = any>(
  handler: (req: ValidatedApiRequest<TBody>, res: NextApiResponse) => void | Promise<void>,
  bodySchema?: z.ZodSchema<TBody>,
  querySchema?: z.ZodSchema<TQuery>,
  options: ValidationMiddlewareOptions = {}
) {
  const validationMiddleware = createValidationMiddleware(bodySchema, querySchema, options);
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await validationMiddleware(req, res, async () => {
      await handler(req as ValidatedApiRequest<TBody>, res);
    });
  };
}

export default {
  createValidationMiddleware,
  validateResponse,
  validateFileUpload,
  validateRateLimit,
  validateSecurity,
  composeMiddleware,
  withValidation
};