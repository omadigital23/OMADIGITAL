/**
 * Gestionnaire centralisé des APIs selon .env.local
 */

// Supabase - Base de données et authentification
export const supabaseConfig = {
  url: process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  anonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  serviceKey: process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  jwtSecret: process.env.SUPABASE_JWT_SECRET!,
  dbPassword: process.env.SUPABASE_DB_PASSWORD!
};

// Google AI - Chatbot intelligent
export const googleAIConfig = {
  apiKey: process.env['GOOGLE_AI_API_KEY']!
};

// Performance Monitoring
export const monitoringConfig = {
  enabled: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
  securityLevel: process.env.NEXT_PUBLIC_SECURITY_LEVEL || 'high',
  endpoint: process.env.NEXT_PUBLIC_MONITORING_ENDPOINT || '/api/analytics/web-vitals'
};

// GitHub Repository
export const githubConfig = {
  repoUrl: process.env.GITHUB_REPO_URL!
};

// Environment
export const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development'
};

/**
 * Utilisation des APIs selon leur fonction
 */
export const apiUsage = {
  supabase: {
    purpose: 'Base de données, authentification, stockage conversations',
    credentials: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
  },
  googleAI: {
    purpose: 'Chatbot intelligent, détection langue, réponses contextuelles',
    credentials: ['GOOGLE_AI_API_KEY']
  },
  monitoring: {
    purpose: 'Performance web, analytics, métriques utilisateur',
    credentials: ['PERFORMANCE_MONITORING', 'SECURITY_LEVEL']
  },
  github: {
    purpose: 'Déploiement, versioning, CI/CD',
    credentials: ['GITHUB_REPO_URL']
  }
};