/**
 * Common types and interfaces for OMA Digital Platform
 * Centralized type definitions to improve consistency and reusability
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// Database Entity Base Types
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface TimestampedEntity {
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// User and Authentication Types
// ============================================================================

export interface User extends BaseEntity {
  email: string;
  username?: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  metadata?: Record<string, unknown>;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: 'Bearer';
}

// ============================================================================
// Language and Localization Types
// ============================================================================

export type SupportedLanguage = 'fr' | 'en';

export interface LocalizedContent {
  fr: string;
  en: string;
}

export interface LanguageContext {
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

// ============================================================================
// Performance and Analytics Types
// ============================================================================

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  timestamp: string;
  url: string;
  device_type: DeviceType;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface AnalyticsEvent extends TimestampedEntity {
  event_name: string;
  event_properties?: Record<string, unknown>;
  user_id?: string;
  session_id: string;
  url: string;
  device_type?: DeviceType;
  country?: string;
  city?: string;
}

// ============================================================================
// Blog and Content Types
// ============================================================================

export interface BlogArticle extends BaseEntity {
  title: LocalizedContent;
  content: LocalizedContent;
  excerpt: LocalizedContent;
  slug: string;
  status: ContentStatus;
  featured_image?: string;
  author_id: string;
  category_id?: string;
  tags: string[];
  seo_data?: SEOData;
  view_count: number;
  published_at?: string;
}

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface SEOData {
  meta_title?: LocalizedContent;
  meta_description?: LocalizedContent;
  keywords?: string[];
  canonical_url?: string;
}

// ============================================================================
// Chatbot and AI Types
// ============================================================================

export interface ChatMessage extends TimestampedEntity {
  id: string;
  text: string;
  sender: MessageSender;
  language?: SupportedLanguage;
  session_id: string;
  confidence?: number;
  source?: string;
  metadata?: ChatMessageMetadata;
}

export type MessageSender = 'user' | 'bot';

export interface ChatMessageMetadata {
  intent?: string;
  entities?: Record<string, unknown>;
  sentiment?: SentimentType;
  cta?: CTAAction;
  suggestions?: string[];
}

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface CTAAction {
  id?: string;
  type: CTAType;
  action: string;
  priority: Priority;
  data?: Record<string, unknown>;
}

export type CTAType = 'contact' | 'demo' | 'appointment' | 'quote' | 'whatsapp' | 'email' | 'phone';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// ============================================================================
// Form and Input Types
// ============================================================================

export interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  error?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  message: string;
  language: SupportedLanguage;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface WithLoading {
  isLoading?: boolean;
}

export interface WithError {
  error?: string | ApiError;
}

export interface CommonProps extends WithChildren, WithClassName, WithLoading, WithError {}

// ============================================================================
// Environment and Configuration Types
// ============================================================================

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: Environment;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  ai: {
    geminiApiKey: string;
    huggingfaceApiKey: string;
  };
  features: {
    analytics: boolean;
    chatbot: boolean;
    blog: boolean;
    admin: boolean;
  };
}

export type Environment = 'development' | 'staging' | 'production';

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type guards
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};

export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return ['fr', 'en'].includes(lang);
};

export const isValidDeviceType = (device: string): device is DeviceType => {
  return ['mobile', 'tablet', 'desktop'].includes(device);
};