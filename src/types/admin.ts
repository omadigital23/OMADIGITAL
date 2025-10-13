// Admin-specific type definitions

import { ReactNode } from 'react';
import { 
  AnalyticsData, 
  RealTimeStats, 
  ChatbotInteraction, 
  QuoteRequest, 
  MetricCard,
  LoadingState 
} from './analytics';

// Admin Dashboard Types
export interface AdminDashboardProps {
  initialTab?: TabType;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export type TabType = 
  | 'overview' 
  | 'analytics' 
  | 'chatbot' 
  | 'quotes' 
  | 'blog' 
  | 'performance' 
  | 'users' 
  | 'settings';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: ReactNode;
  component: React.ComponentType<any>;
  badge?: string | number;
  disabled?: boolean;
}

// Admin User Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  lastLogin: string;
  permissions: string[];
  active: boolean;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
  permissions: string[];
}

// Admin Analytics Types
export interface AdminAnalyticsProps {
  period?: '24h' | '7d' | '30d' | '90d';
  autoRefresh?: boolean;
  showExport?: boolean;
}

export interface AnalyticsFilter {
  period: string;
  startDate?: string;
  endDate?: string;
  language?: 'fr' | 'en';
  source?: string;
  category?: string;
}

// Admin Quotes Management
export interface AdminQuotesProps {
  status?: 'nouveau' | 'traite' | 'archive' | 'all';
  limit?: number;
  sortBy?: 'created_at' | 'name' | 'company' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface QuoteAction {
  id: string;
  action: 'approve' | 'reject' | 'archive' | 'delete';
  note?: string;
  assignedTo?: string;
}

// Admin Blog Management
export interface AdminBlogProps {
  view?: 'list' | 'grid' | 'calendar';
  status?: 'draft' | 'published' | 'archived' | 'all';
  showEditor?: boolean;
}

export interface BlogManagementAction {
  type: 'create' | 'edit' | 'delete' | 'publish' | 'unpublish' | 'archive';
  articleId?: string;
  data?: Record<string, any>;
}

// Admin Performance Monitoring
export interface AdminPerformanceProps {
  showRealTime?: boolean;
  showHistorical?: boolean;
  showAlerts?: boolean;
}

export interface PerformanceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
  details?: Record<string, any>;
}

// Admin Chatbot Management
export interface AdminChatbotProps {
  showInteractions?: boolean;
  showAnalytics?: boolean;
  showConfiguration?: boolean;
  limit?: number;
}

export interface ChatbotConfiguration {
  enabled: boolean;
  languages: string[];
  defaultLanguage: string;
  responseTimeout: number;
  maxRetries: number;
  fallbackMessage: string;
  knowledgeBaseEnabled: boolean;
  aiEnabled: boolean;
  voiceEnabled: boolean;
  loggingEnabled: boolean;
}

// Admin Settings Types
export interface AdminSettingsProps {
  section?: 'general' | 'security' | 'integrations' | 'appearance';
}

export interface AdminSettings {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
    };
  };
  integrations: {
    googleAnalytics: {
      enabled: boolean;
      trackingId?: string;
    };
    supabase: {
      url: string;
      anonKey: string;
    };
    ai: {
      provider: 'google' | 'openai' | 'anthropic';
      apiKey?: string;
      model?: string;
    };
  };
}

// Admin API Types
export interface AdminAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface AdminListResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters?: Record<string, any>;
}

// Admin Form Types
export interface AdminFormProps<T = any> {
  data?: T;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  mode?: 'create' | 'edit' | 'view';
}

// Admin Table Types
export interface AdminTableColumn<T = any> {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface AdminTableProps<T = any> {
  columns: AdminTableColumn<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  selectable?: boolean;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  actions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: (record: T) => void;
    disabled?: (record: T) => boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

// Admin Widget Types
export interface AdminWidgetProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface AdminStatCardProps extends AdminWidgetProps {
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  color?: string;
}

// Admin Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface AdminNotificationProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

// Admin Search Types
export interface AdminSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  filters?: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'boolean';
    options?: Array<{ value: any; label: string }>;
  }>;
  loading?: boolean;
}

// Admin Export Types
export interface AdminExportProps {
  data: any[];
  filename?: string;
  format?: 'csv' | 'xlsx' | 'json' | 'pdf';
  columns?: string[];
  onExport?: (format: string) => void;
}

// Admin Bulk Actions
export interface AdminBulkActionProps<T = any> {
  selectedItems: T[];
  actions: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: (items: T[]) => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    confirmMessage?: string;
  }>;
  onClearSelection: () => void;
}

// Admin Route Protection
export interface AdminRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

// Admin Context Types
export interface AdminContextType {
  user: AdminUser | null;
  session: AdminSession | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// Admin Theme Types
export interface AdminTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}