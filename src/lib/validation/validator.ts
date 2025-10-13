// Comprehensive validation utilities with Zod integration
import { z } from 'zod';
import { safeErrorMessage } from '../../utils/null-safety';

// Validation result types
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowPartial?: boolean;
  customMessages?: Record<string, string>;
}

// Enhanced validator class
export class TypeSafeValidator {
  private static instance: TypeSafeValidator;
  private customValidators: Map<string, (value: any) => boolean> = new Map();
  private customMessages: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): TypeSafeValidator {
    if (!TypeSafeValidator.instance) {
      TypeSafeValidator.instance = new TypeSafeValidator();
    }
    return TypeSafeValidator.instance;
  }

  // Register custom validator
  registerValidator(name: string, validator: (value: any) => boolean): void {
    this.customValidators.set(name, validator);
  }

  // Register custom error message
  registerMessage(key: string, message: string): void {
    this.customMessages.set(key, message);
  }

  // Validate data against Zod schema
  validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    try {
      // Configure schema based on options
      let workingSchema = schema;
      
      if (options.stripUnknown) {
        workingSchema = schema.passthrough() as z.ZodSchema<T>;
      }

      if (options.allowPartial && 'partial' in schema) {
        workingSchema = (schema as any).partial();
      }

      // Parse data
      const result = workingSchema.safeParse(data);

      if (result.success) {
        return {
          success: true,
          data: result.data,
          errors: [],
          warnings: this.generateWarnings(result.data, schema)
        };
      } else {
        const errors = this.formatZodErrors(result.error, options);
        
        // Stop on first error if abortEarly is true
        if (options.abortEarly && errors.length > 0) {
          return {
            success: false,
            errors: [errors[0]]
          };
        }

        return {
          success: false,
          errors
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'root',
          message: safeErrorMessage(error),
          code: 'VALIDATION_ERROR'
        }]
      };
    }
  }

  // Async validation with custom validators
  async validateAsync<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: ValidationOptions = {}
  ): Promise<ValidationResult<T>> {
    // First run synchronous validation
    const syncResult = this.validate(schema, data, options);
    
    if (!syncResult.success) {
      return syncResult;
    }

    // Run custom async validators if any
    const asyncErrors: ValidationError[] = [];
    
    // Example: Email uniqueness check, phone validation, etc.
    // These would be registered separately
    for (const [name, validator] of this.customValidators) {
      try {
        const isValid = await Promise.resolve(validator(syncResult.data));
        if (!isValid) {
          asyncErrors.push({
            field: name,
            message: this.customMessages.get(name) || `Validation failed for ${name}`,
            code: 'ASYNC_VALIDATION_ERROR'
          });
        }
      } catch (error) {
        asyncErrors.push({
          field: name,
          message: safeErrorMessage(error),
          code: 'ASYNC_VALIDATION_ERROR'
        });
      }
    }

    if (asyncErrors.length > 0) {
      return {
        success: false,
        errors: asyncErrors
      };
    }

    return syncResult;
  }

  // Format Zod errors into our error format
  private formatZodErrors(
    zodError: z.ZodError,
    options: ValidationOptions = {}
  ): ValidationError[] {
    return zodError.errors.map(error => {
      const field = error.path.join('.');
      const customMessage = options.customMessages?.[field];
      
      return {
        field: field || 'root',
        message: customMessage || error.message,
        code: error.code,
        value: (error as any).received
      };
    });
  }

  // Generate warnings for potential issues
  private generateWarnings<T>(data: T, schema: z.ZodSchema<T>): string[] {
    const warnings: string[] = [];
    
    // Example warning generation logic
    if (typeof data === 'object' && data !== null) {
      // Check for potentially suspicious values
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 1000) {
          warnings.push(`Field ${key} is very long (${value.length} characters)`);
        }
        
        if (key.toLowerCase().includes('password') && typeof value === 'string' && value.length < 8) {
          warnings.push(`Field ${key} appears to be a weak password`);
        }
      });
    }
    
    return warnings;
  }

  // Validate single field
  validateField<T>(
    schema: z.ZodSchema<T>,
    value: unknown,
    fieldName: string
  ): ValidationResult<T> {
    try {
      const result = schema.safeParse(value);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          errors: []
        };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(error => ({
            field: fieldName,
            message: error.message,
            code: error.code,
            value: (error as any).received
          }))
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: fieldName,
          message: safeErrorMessage(error),
          code: 'VALIDATION_ERROR'
        }]
      };
    }
  }

  // Validate form data
  validateForm<T extends Record<string, any>>(
    formSchema: z.ZodSchema<T>,
    formData: FormData | Record<string, any>,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    try {
      // Convert FormData to object if needed
      let data: Record<string, any>;
      
      if (formData instanceof FormData) {
        data = {};
        formData.forEach((value, key) => {
          // Handle multiple values for the same key
          if (data[key]) {
            if (Array.isArray(data[key])) {
              data[key].push(value);
            } else {
              data[key] = [data[key], value];
            }
          } else {
            data[key] = value;
          }
        });
      } else {
        data = formData;
      }

      return this.validate(formSchema, data, options);
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'form',
          message: safeErrorMessage(error),
          code: 'FORM_VALIDATION_ERROR'
        }]
      };
    }
  }

  // Validate API request body
  validateApiRequest<T>(
    schema: z.ZodSchema<T>,
    body: unknown,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    const defaultOptions: ValidationOptions = {
      abortEarly: false,
      stripUnknown: true,
      ...options
    };

    return this.validate(schema, body, defaultOptions);
  }

  // Validate API response
  validateApiResponse<T>(
    schema: z.ZodSchema<T>,
    response: unknown,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    const defaultOptions: ValidationOptions = {
      abortEarly: false,
      stripUnknown: false,
      ...options
    };

    return this.validate(schema, response, defaultOptions);
  }

  // Sanitize and validate input
  sanitizeAndValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    sanitizers: Array<(value: any) => any> = []
  ): ValidationResult<T> {
    try {
      let sanitizedData = data;
      
      // Apply sanitizers
      for (const sanitizer of sanitizers) {
        sanitizedData = sanitizer(sanitizedData);
      }

      return this.validate(schema, sanitizedData);
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'root',
          message: safeErrorMessage(error),
          code: 'SANITIZATION_ERROR'
        }]
      };
    }
  }

  // Validate with transformation
  validateAndTransform<T, U>(
    schema: z.ZodSchema<T>,
    data: unknown,
    transformer: (value: T) => U,
    options: ValidationOptions = {}
  ): ValidationResult<U> {
    const validationResult = this.validate(schema, data, options);
    
    if (!validationResult.success || !validationResult.data) {
      return {
        success: false,
        errors: validationResult.errors
      };
    }

    try {
      const transformedData = transformer(validationResult.data);
      return {
        success: true,
        data: transformedData,
        warnings: validationResult.warnings
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'transformation',
          message: safeErrorMessage(error),
          code: 'TRANSFORMATION_ERROR'
        }]
      };
    }
  }

  // Batch validate multiple items
  validateBatch<T>(
    schema: z.ZodSchema<T>,
    items: unknown[],
    options: ValidationOptions = {}
  ): Array<ValidationResult<T>> {
    return items.map((item, index) => {
      const result = this.validate(schema, item, options);
      
      // Add index information to errors
      if (!result.success && result.errors) {
        result.errors = result.errors.map(error => ({
          ...error,
          field: `[${index}].${error.field}`
        }));
      }
      
      return result;
    });
  }

  // Create a summary of validation results
  createValidationSummary<T>(results: Array<ValidationResult<T>>): {
    totalItems: number;
    validItems: number;
    invalidItems: number;
    totalErrors: number;
    totalWarnings: number;
    errorsByField: Record<string, number>;
  } {
    const summary = {
      totalItems: results.length,
      validItems: 0,
      invalidItems: 0,
      totalErrors: 0,
      totalWarnings: 0,
      errorsByField: {} as Record<string, number>
    };

    results.forEach(result => {
      if (result.success) {
        summary.validItems++;
      } else {
        summary.invalidItems++;
      }

      if (result.errors) {
        summary.totalErrors += result.errors.length;
        result.errors.forEach(error => {
          summary.errorsByField[error.field] = (summary.errorsByField[error.field] || 0) + 1;
        });
      }

      if (result.warnings) {
        summary.totalWarnings += result.warnings.length;
      }
    });

    return summary;
  }
}

// Singleton instance
export const validator = TypeSafeValidator.getInstance();

// Common sanitizers
export const sanitizers = {
  trim: (value: any) => typeof value === 'string' ? value.trim() : value,
  
  toLowerCase: (value: any) => typeof value === 'string' ? value.toLowerCase() : value,
  
  toUpperCase: (value: any) => typeof value === 'string' ? value.toUpperCase() : value,
  
  stripHtml: (value: any) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '');
  },
  
  normalizeEmail: (value: any) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().trim();
  },
  
  normalizePhone: (value: any) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\D/g, '');
  },
  
  truncate: (maxLength: number) => (value: any) => {
    if (typeof value !== 'string') return value;
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  }
};

// Convenience functions
export const validateEmail = (email: string) => 
  validator.validateField(z.string().email(), email, 'email');

export const validatePhone = (phone: string) =>
  validator.validateField(z.string().regex(/^\+?[1-9]\d{1,14}$/), phone, 'phone');

export const validateUrl = (url: string) =>
  validator.validateField(z.string().url(), url, 'url');

export const validateRequired = (value: any, fieldName: string) =>
  validator.validateField(z.any().refine(val => val !== null && val !== undefined && val !== ''), value, fieldName);

// Export default validator
export default validator;