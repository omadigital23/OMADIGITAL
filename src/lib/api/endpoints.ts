// Type-safe API endpoint definitions with comprehensive request/response types
import { apiClient } from './client';
import { 
  AnalyticsData, 
  RealTimeStats, 
  ChatbotInteraction, 
  QuoteRequest,
  AnalyticsEvent,
  WebVital
} from '../types/analytics';
import { 
  AdminUser, 
  AdminSession, 
  AdminSettings,
  PerformanceAlert 
} from '../types/admin';
import { 
  BlogArticle, 
  APIResponse, 
  PaginatedResponse,
  Language 
} from '../types';

// Admin Authentication API
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface SessionResponse {
  user: AdminUser;
  session: AdminSession;
}

export const authAPI = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/admin/auth', credentials),

  logout: (): Promise<{ success: boolean }> =>
    apiClient.post('/admin/logout'),

  getSession: (): Promise<SessionResponse> =>
    apiClient.get('/admin/session'),

  refreshSession: (): Promise<SessionResponse> =>
    apiClient.post('/admin/refresh-session')
};

// Analytics API
export interface AnalyticsQuery {
  period?: '24h' | '7d' | '30d' | '90d';
  startDate?: string;
  endDate?: string;
  language?: Language;
  source?: string;
}

export const analyticsAPI = {
  getAnalytics: (query: AnalyticsQuery = {}): Promise<AnalyticsData> =>
    apiClient.get('/admin/analytics', query),

  getRealTimeStats: (): Promise<RealTimeStats> =>
    apiClient.get('/admin/realtime-stats'),

  getWebVitals: (query: AnalyticsQuery = {}): Promise<PaginatedResponse<WebVital>> =>
    apiClient.getPaginated('/analytics/web-vitals', 1, 50, query),

  trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<{ success: boolean }> =>
    apiClient.post('/analytics/track-event', event),

  trackPageView: (data: {
    page_url: string;
    user_agent?: string;
    referrer?: string;
  }): Promise<{ success: boolean }> =>
    apiClient.post('/analytics/track-page-view', data),

  trackBehavior: (data: {
    event_name: string;
    event_data: Record<string, any>;
    page_url: string;
  }): Promise<{ success: boolean }> =>
    apiClient.post('/analytics/track-behavior', data)
};

// Chatbot API
export interface ChatbotQuery {
  limit?: number;
  offset?: number;
  language?: Language;
  source?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChatRequest {
  message: string;
  language?: Language;
  sessionId?: string;
}

export interface ChatResponse {
  response: string;
  language: Language;
  source: 'knowledge_base' | 'ai_generated' | 'fallback';
  confidence: number;
  sessionId: string;
  responseTime: number;
}

export const chatbotAPI = {
  sendMessage: (request: ChatRequest): Promise<ChatResponse> =>
    apiClient.post('/chat/send', request),

  getInteractions: (query: ChatbotQuery = {}): Promise<PaginatedResponse<ChatbotInteraction>> =>
    apiClient.getPaginated('/admin/chatbot-interactions', 1, 25, query),

  getInteractionDetails: (id: string): Promise<ChatbotInteraction> =>
    apiClient.get(`/admin/chatbot-interactions/${id}`),

  getChatbotStatus: (): Promise<{
    status: 'online' | 'offline' | 'maintenance';
    uptime: number;
    version: string;
  }> =>
    apiClient.get('/chat/status'),

  transcribeAudio: (audioFile: File): Promise<{ text: string; language: Language }> =>
    apiClient.uploadFile('/chat/transcribe', audioFile),

  synthesizeSpeech: (request: {
    text: string;
    language: Language;
    voice?: string;
  }): Promise<{ audioUrl: string }> =>
    apiClient.post('/tts/synthesize', request)
};

// Quotes API
export interface QuoteQuery {
  status?: 'nouveau' | 'traite' | 'archive' | 'all';
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'name' | 'company' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateQuoteRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  budget?: string;
  location: string;
}

export interface UpdateQuoteRequest {
  status?: 'nouveau' | 'traite' | 'archive';
  notes?: string;
  assignedTo?: string;
}

export const quotesAPI = {
  getQuotes: (query: QuoteQuery = {}): Promise<PaginatedResponse<QuoteRequest>> =>
    apiClient.getPaginated('/admin/quotes', 1, 25, query),

  getQuote: (id: string): Promise<QuoteRequest> =>
    apiClient.get(`/admin/quotes/${id}`),

  createQuote: (request: CreateQuoteRequest): Promise<{ id: string; success: boolean }> =>
    apiClient.post('/quotes', request),

  updateQuote: (id: string, updates: UpdateQuoteRequest): Promise<{ success: boolean }> =>
    apiClient.patch(`/admin/quotes/${id}`, updates),

  deleteQuote: (id: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/admin/quotes/${id}`),

  sendQuoteEmail: (id: string, template?: string): Promise<{ success: boolean }> =>
    apiClient.post(`/admin/quotes/${id}/send-email`, { template })
};

// Blog API
export interface BlogQuery {
  status?: 'draft' | 'published' | 'archived' | 'all';
  category?: string;
  author?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  slug?: string;
}

export const blogAPI = {
  getArticles: (query: BlogQuery = {}): Promise<PaginatedResponse<BlogArticle>> =>
    apiClient.getPaginated('/admin/blog-articles', 1, 25, query),

  getArticle: (id: string): Promise<BlogArticle> =>
    apiClient.get(`/admin/blog-articles/${id}`),

  getPublicArticles: (query: Omit<BlogQuery, 'status'> = {}): Promise<PaginatedResponse<BlogArticle>> =>
    apiClient.getPaginated('/blog/articles', 1, 25, { ...query, status: 'published' }),

  getPublicArticle: (slug: string): Promise<BlogArticle> =>
    apiClient.get(`/blog/articles/${slug}`),

  createArticle: (request: CreateBlogRequest): Promise<{ id: string; slug: string; success: boolean }> =>
    apiClient.post('/admin/blog-articles', request),

  updateArticle: (id: string, updates: UpdateBlogRequest): Promise<{ success: boolean }> =>
    apiClient.patch(`/admin/blog-articles/${id}`, updates),

  deleteArticle: (id: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/admin/blog-articles/${id}`),

  publishArticle: (id: string): Promise<{ success: boolean }> =>
    apiClient.post(`/admin/blog-articles/${id}/publish`),

  unpublishArticle: (id: string): Promise<{ success: boolean }> =>
    apiClient.post(`/admin/blog-articles/${id}/unpublish`),

  enrichArticle: (id: string): Promise<{ success: boolean; enrichedContent: string }> =>
    apiClient.post(`/admin/blog-articles/${id}/enrich`),

  generateArticle: (request: {
    topic: string;
    keywords: string[];
    language: Language;
    length: 'short' | 'medium' | 'long';
  }): Promise<{ article: Partial<BlogArticle>; success: boolean }> =>
    apiClient.post('/admin/blog-articles/generate', request)
};

// Newsletter API
export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirmedAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NewsletterQuery {
  status?: 'pending' | 'confirmed' | 'unsubscribed' | 'all';
  limit?: number;
  offset?: number;
  search?: string;
}

export interface SubscribeRequest {
  email: string;
  source?: string;
  metadata?: Record<string, any>;
}

export const newsletterAPI = {
  subscribe: (request: SubscribeRequest): Promise<{ success: boolean; requiresConfirmation: boolean }> =>
    apiClient.post('/subscribe-newsletter', request),

  unsubscribe: (email: string, token?: string): Promise<{ success: boolean }> =>
    apiClient.post('/unsubscribe-newsletter', { email, token }),

  confirmSubscription: (token: string): Promise<{ success: boolean }> =>
    apiClient.post('/confirm-subscription', { token }),

  getSubscribers: (query: NewsletterQuery = {}): Promise<PaginatedResponse<NewsletterSubscriber>> =>
    apiClient.getPaginated('/admin/newsletter-subscribers', 1, 25, query),

  getSubscriber: (id: string): Promise<NewsletterSubscriber> =>
    apiClient.get(`/admin/newsletter-subscribers/${id}`),

  updateSubscriber: (id: string, updates: {
    status?: 'confirmed' | 'unsubscribed';
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean }> =>
    apiClient.patch(`/admin/newsletter-subscribers/${id}`, updates),

  getAnalytics: (): Promise<{
    totalSubscribers: number;
    confirmedSubscribers: number;
    pendingSubscribers: number;
    unsubscribedCount: number;
    dailySignups: Array<{ date: string; signups: number; confirmations: number; unsubscribes: number }>;
  }> =>
    apiClient.get('/admin/newsletter-analytics')
};

// Settings API
export interface UpdateSettingsRequest extends Partial<AdminSettings> {}

export const settingsAPI = {
  getSettings: (): Promise<AdminSettings> =>
    apiClient.get('/admin/settings'),

  updateSettings: (updates: UpdateSettingsRequest): Promise<{ success: boolean }> =>
    apiClient.patch('/admin/settings', updates),

  resetSettings: (): Promise<{ success: boolean }> =>
    apiClient.post('/admin/settings/reset'),

  exportSettings: (): Promise<{ settings: AdminSettings; exportedAt: string }> =>
    apiClient.get('/admin/settings/export'),

  importSettings: (settingsFile: File): Promise<{ success: boolean; imported: string[] }> =>
    apiClient.uploadFile('/admin/settings/import', settingsFile)
};

// Performance & Monitoring API
export interface PerformanceQuery {
  period?: '1h' | '24h' | '7d' | '30d';
  metrics?: string[];
}

export const monitoringAPI = {
  getPerformanceMetrics: (query: PerformanceQuery = {}): Promise<{
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    cpuUsage: number;
    memoryUsage: number;
  }> =>
    apiClient.get('/admin/performance-metrics', query),

  getAlerts: (): Promise<PaginatedResponse<PerformanceAlert>> =>
    apiClient.getPaginated('/admin/alerts'),

  acknowledgeAlert: (id: string): Promise<{ success: boolean }> =>
    apiClient.post(`/admin/alerts/${id}/acknowledge`),

  dismissAlert: (id: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/admin/alerts/${id}`),

  healthCheck: (): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, { status: string; message?: string; duration: number }>;
    timestamp: string;
  }> =>
    apiClient.get('/health'),

  getSystemInfo: (): Promise<{
    version: string;
    environment: string;
    buildDate: string;
    nodeVersion: string;
    dependencies: Record<string, string>;
  }> =>
    apiClient.get('/admin/system-info')
};

// Language Detection API
export const languageAPI = {
  detectLanguage: (text: string): Promise<{ language: Language; confidence: number }> =>
    apiClient.post('/language/detect', { text }),

  getSupportedLanguages: (): Promise<Array<{ code: Language; name: string; nativeName: string }>> =>
    apiClient.get('/language/supported')
};

// Comprehensive API object
export const api = {
  auth: authAPI,
  analytics: analyticsAPI,
  chatbot: chatbotAPI,
  quotes: quotesAPI,
  blog: blogAPI,
  newsletter: newsletterAPI,
  settings: settingsAPI,
  monitoring: monitoringAPI,
  language: languageAPI,
  
  // Direct client access for custom requests
  client: apiClient
};

export default api;