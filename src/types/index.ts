// Central type exports for the entire application
// This file serves as the main entry point for all type definitions

// Core Analytics and Dashboard Types
export * from './analytics';

// Component Types
export * from './components';

// Admin-specific Types
export * from './admin';

// Re-export common types for convenience
export type { Language } from './analytics';
export type { 
  BaseComponentProps, 
  OptimizedImageProps, 
  ChatMessage, 
  ChatMessageProps,
  ErrorBoundaryProps,
  ErrorBoundaryState 
} from './components';

export type { 
  AdminUser, 
  AdminSession, 
  TabType,
  AdminDashboardProps 
} from './admin';

// Global utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Common API response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

// Common list/pagination response
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

// Environment and configuration types
export interface AppConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  SITE_URL: string;
  API_BASE_URL: string;
  FEATURES: {
    analytics: boolean;
    chatbot: boolean;
    newsletter: boolean;
    blog: boolean;
    admin: boolean;
  };
}