// Example API endpoint demonstrating all type safety features
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withValidation, ValidatedApiRequest } from '../../../src/lib/validation/middleware';
import { validator } from '../../../src/lib/validation/validator';
import { schemas } from '../../../src/lib/validation/schemas';
import { apiClient } from '../../../src/lib/api/client';
import { 
  safeString, 
  safeNumber, 
  safeArray, 
  safeAsyncWithError,
  isNotNullOrUndefined 
} from '../../../src/utils/null-safety';

// Request/Response type definitions
const ExampleRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: schemas.Email,
  age: z.number().min(18, 'Must be at least 18 years old').max(120),
  preferences: z.object({
    language: schemas.Language,
    notifications: z.boolean(),
    theme: z.enum(['light', 'dark', 'auto']).default('auto')
  }),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed'),
  metadata: z.record(z.unknown()).optional()
});

const ExampleQuerySchema = z.object({
  format: z.enum(['json', 'xml', 'csv']).default('json'),
  include: z.string().transform(val => val.split(',')).pipe(z.array(z.string())).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default('25')
});

type ExampleRequest = z.infer<typeof ExampleRequestSchema>;
type ExampleQuery = z.infer<typeof ExampleQuerySchema>;

interface ExampleResponse {
  success: boolean;
  data: {
    id: string;
    processedData: ExampleRequest;
    metadata: {
      processedAt: string;
      format: string;
      version: string;
    };
  };
  message: string;
}

// Main handler with comprehensive type safety
async function handler(
  req: ValidatedApiRequest<ExampleRequest>,
  res: NextApiResponse<ExampleResponse | { success: false; error: string; details?: any }>
) {
  try {
    // Method validation
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: `Method ${req.method || 'UNKNOWN'} not allowed`
      });
    }

    // Safe access to validated data
    const requestData = req.validatedBody;
    const queryParams = req.validatedQuery as ExampleQuery;

    if (!requestData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data'
      });
    }

    // Demonstrate null-safe operations
    const safeName = safeString(requestData.name, 'Anonymous');
    const safeAge = safeNumber(requestData.age, 18);
    const safeTags = safeArray(requestData.tags);
    const safeFormat = safeString(queryParams?.format, 'json');

    // Demonstrate additional validation
    const additionalValidation = validator.validate(
      z.object({
        name: z.string().refine(
          name => !name.toLowerCase().includes('admin'),
          'Name cannot contain "admin"'
        ),
        email: z.string().email().refine(
          email => !email.endsWith('@example.com'),
          'Example.com emails are not allowed'
        )
      }),
      { name: safeName, email: requestData.email }
    );

    if (!additionalValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Additional validation failed',
        details: additionalValidation.errors
      });
    }

    // Demonstrate safe async operation
    const [externalData, externalError] = await safeAsyncWithError(
      simulateExternalAPICall(requestData.email)
    );

    if (externalError) {
      console.warn('External API call failed:', externalError.message);
      // Continue with default data instead of failing
    }

    // Demonstrate safe data processing
    const processedData: ExampleRequest = {
      ...requestData,
      name: safeName.trim(),
      age: safeAge,
      tags: safeTags.map(tag => safeString(tag).trim()).filter(Boolean),
      preferences: {
        language: requestData.preferences.language || 'fr',
        notifications: requestData.preferences.notifications ?? true,
        theme: requestData.preferences.theme || 'auto'
      },
      metadata: {
        ...requestData.metadata,
        processedAt: new Date().toISOString(),
        userAgent: safeString(req.headers['user-agent'], 'unknown'),
        ...(externalData && { externalInfo: externalData })
      }
    };

    // Generate unique ID safely
    const id = generateSafeId();

    // Prepare response with validation
    const responseData: ExampleResponse = {
      success: true,
      data: {
        id,
        processedData,
        metadata: {
          processedAt: new Date().toISOString(),
          format: safeFormat,
          version: '1.0.0'
        }
      },
      message: 'Data processed successfully'
    };

    // Validate response before sending
    const responseValidation = validator.validate(
      z.object({
        success: z.boolean(),
        data: z.object({
          id: z.string().uuid(),
          processedData: ExampleRequestSchema,
          metadata: z.object({
            processedAt: z.string().datetime(),
            format: z.string(),
            version: z.string()
          })
        }),
        message: z.string()
      }),
      responseData
    );

    if (!responseValidation.success) {
      console.error('Response validation failed:', responseValidation.errors);
      return res.status(500).json({
        success: false,
        error: 'Internal server error - invalid response format'
      });
    }

    // Success response
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    });
  }
}

// Helper functions with null safety
function generateSafeId(): string {
  try {
    // Use crypto.randomUUID if available, fallback to timestamp-based ID
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    
    // Fallback ID generation
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } catch {
    // Ultimate fallback
    return `fallback_${Date.now()}`;
  }
}

async function simulateExternalAPICall(email: string): Promise<{ verified: boolean; score: number }> {
  // Simulate an external API call that might fail
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.includes('fail')) {
        reject(new Error('External API simulation failure'));
      } else {
        resolve({
          verified: !email.includes('invalid'),
          score: Math.random() * 100
        });
      }
    }, Math.random() * 100); // Random delay up to 100ms
  });
}

// Example of using the API client internally
async function fetchRelatedData(userId: string) {
  try {
    // Demonstrate type-safe API client usage
    const response = await apiClient.safeGet<{ user: any; stats: any }>(`/users/${userId}/stats`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch related data:', error);
    return null;
  }
}

// Export the handler with validation middleware
export default withValidation(
  handler,
  ExampleRequestSchema,
  ExampleQuerySchema,
  {
    validateBody: true,
    validateQuery: true,
    stripUnknown: true,
    onValidationError: (errors, req, res) => {
      // Custom validation error handler
      console.warn('Validation failed for endpoint:', {
        url: req.url,
        method: req.method,
        errors: errors.map(e => ({ field: e.field, message: e.message }))
      });
      
      res.status(400).json({
        success: false,
        error: 'Request validation failed',
        details: errors,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Additional configuration for Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};