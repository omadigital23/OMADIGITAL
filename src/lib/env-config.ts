// Enhanced type-safe environment configuration
interface EnvironmentConfig {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly GOOGLE_AI_API_KEY: string;
  readonly PERFORMANCE_MONITORING: boolean;
  readonly SECURITY_LEVEL: 'low' | 'medium' | 'high';
  readonly MONITORING_ENDPOINT: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly IS_PRODUCTION: boolean;
}

// Type-safe environment variable access
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Configuration sécurisée des variables d'environnement
export const ENV_CONFIG: EnvironmentConfig = {
  // Supabase
  SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
  
  // Google AI
  GOOGLE_AI_API_KEY: getEnvVar('GOOGLE_AI_API_KEY', ''),
  
  // Monitoring
  PERFORMANCE_MONITORING: getBooleanEnvVar('NEXT_PUBLIC_PERFORMANCE_MONITORING'),
  SECURITY_LEVEL: (getEnvVar('NEXT_PUBLIC_SECURITY_LEVEL', 'medium') as 'low' | 'medium' | 'high'),
  MONITORING_ENDPOINT: getEnvVar('NEXT_PUBLIC_MONITORING_ENDPOINT', '/api/analytics/web-vitals'),
  
  // App
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  IS_PRODUCTION: getEnvVar('NODE_ENV', 'development') === 'production'
} as const;

// Enhanced validation with detailed error reporting
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const;

const optionalEnvVars = [
  'GOOGLE_AI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const;

export function validateEnvConfig(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required variables
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }
  
  // Check optional but recommended variables
  for (const key of optionalEnvVars) {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable not set: ${key}`);
    }
  }
  
  // Validate URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Auto-validate on import
if (typeof window === 'undefined') {
  const validation = validateEnvConfig();
  if (!validation.isValid) {
    console.error('Environment validation failed:', validation.errors);
    if (ENV_CONFIG.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
    }
  }
  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:', validation.warnings);
  }
}