// Types pour les variables d'environnement
declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_JWT_SECRET?: string;
    SUPABASE_DB_PASSWORD?: string;
    
    // Authentication
    JWT_SECRET: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD_HASH: string;
    ADMIN_SALT: string;
    
    // API Keys
    GOOGLE_AI_API_KEY?: string;
    NEXT_PUBLIC_GOOGLE_AI_API_KEY?: string;
    HUGGINGFACE_API_KEY?: string;
    HUGGING_FACE_API_KEY?: string;
    SENDGRID_API_KEY?: string;
    DEEPGRAM_API_KEY?: string;
    
    // URLs et Webhooks
    EMAIL_WEBHOOK_URL?: string;
    ALERT_WEBHOOK_URL?: string;
    LOG_WEBHOOK_URL?: string;
    
    // Analytics
    NEXT_PUBLIC_GA_ID?: string;
    GOOGLE_ANALYTICS_ID?: string;
    
    // Configuration
    NEXT_PUBLIC_APP_VERSION?: string;
    NEXT_PUBLIC_APP_ENV?: string;
    NEXT_PUBLIC_BASE_URL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_SECURITY_LEVEL?: string;
    NEXT_PUBLIC_PERFORMANCE_MONITORING?: string;
    NEXT_PUBLIC_MONITORING_ENDPOINT?: string;
    NEXT_PUBLIC_DEBUG_MODE?: string;
    NEXT_PUBLIC_CLOUD_PROVIDER?: string;
    
    // Deployment
    VERCEL_URL?: string;
    GITHUB_REPO_URL?: string;
    
    // Security & Rate Limiting
    CORS_ORIGINS?: string;
    RATE_LIMIT_ENABLED?: string;
    RATE_LIMIT_WINDOW?: string;
    RATE_LIMIT_MAX?: string;
    
    // Monitoring
    MONITORING_ENABLED?: string;
    ERROR_REPORTING_ENABLED?: string;
    SENTRY_DSN?: string;
    
    // Features
    FEATURE_CHATBOT?: string;
    FEATURE_VOICE?: string;
    FEATURE_ADMIN?: string;
    FEATURE_ANALYTICS?: string;
  }
}

// Types pour window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export {};