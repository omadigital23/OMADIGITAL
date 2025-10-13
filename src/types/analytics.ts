// Comprehensive type definitions for analytics and dashboard components

export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  lcpRating: 'good' | 'needs-improvement' | 'poor';
  fidRating: 'good' | 'needs-improvement' | 'poor';
  clsRating: 'good' | 'needs-improvement' | 'poor';
  ttfbRating: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceMetrics {
  uptime: string;
  avgLoadTime: string;
  errorRate: string;
  coreWebVitals: CoreWebVitals;
}

export interface ChatMetrics {
  total: number;
  voice: number;
  text: number;
  avgResponseTime: number;
}

export interface AnalyticsData {
  period: string;
  chats: ChatMetrics;
  performance: PerformanceMetrics;
  generated: string;
  analyticsEvents: number;
  mobileTraffic: number;
  localVisitors: number;
  abTestResults: ABTestResult[];
  abTestConversions: number;
  conversionRate: number;
  quotesSubmitted: number;
  webVitalsCount: number;
}

export interface ABTestResult {
  id: string;
  name: string;
  variant: 'A' | 'B';
  conversions: number;
  views: number;
  conversionRate: number;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export interface CountryData {
  country: string;
  users: number;
  flag: string;
}

export interface DeviceStats {
  device: string;
  percentage: number;
  count: number;
}

export interface HourlyActivity {
  hour: number;
  activity: number;
}

export interface RealTimeStats {
  onlineUsers: number;
  activeChats: number;
  todayConversations: number;
  todayQuotes: number;
  responseTime: number;
  conversionRate: number;
  topCountries: CountryData[];
  deviceStats: DeviceStats[];
  hourlyActivity: HourlyActivity[];
}

export interface ChatbotInteraction {
  id: string;
  session_id: string;
  message: string;
  response: string;
  language: 'fr' | 'en';
  source: 'knowledge_base' | 'ai_generated' | 'fallback';
  confidence: number;
  response_time_ms: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  service: string;
  message: string;
  budget: string | null;
  location: string;
  status: 'nouveau' | 'traite' | 'archive';
  security_validated: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_data: Record<string, unknown>;
  page_url: string;
  user_agent: string | null;
  country?: string;
  device_type?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WebVital {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_rating: 'good' | 'needs-improvement' | 'poor';
  page_url: string;
  timestamp: string;
}

// Component Props Types
export interface AdminAnalyticsProps {
  period?: '24h' | '7d' | '30d' | '90d';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface RealTimeStatsProps {
  refreshInterval?: number;
  showDetails?: boolean;
}

export interface MetricCardProps {
  metric: MetricCard;
  loading?: boolean;
}

export interface ChatbotResponsesWidgetProps {
  limit?: number;
  showLanguageStats?: boolean;
  showSourceStats?: boolean;
}

// API Response Types
export interface AnalyticsAPIResponse {
  success: boolean;
  data: AnalyticsData;
  error?: string;
}

export interface RealTimeStatsAPIResponse {
  success: boolean;
  data: RealTimeStats;
  error?: string;
}

export interface ChatbotInteractionsAPIResponse {
  success: boolean;
  data: {
    interactions: ChatbotInteraction[];
    totalCount: number;
    hasMore: boolean;
  };
  error?: string;
}

// Language and Internationalization Types
export type Language = 'fr' | 'en';

export interface LanguageStats {
  [key: string]: number;
}

export interface SourceStats {
  knowledge_base: number;
  ai_generated: number;
  fallback: number;
}

// Error Handling Types
export interface ComponentError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  isLoading: boolean;
  error: ComponentError | null;
  lastUpdated: Date | null;
}

// Form Types
export interface AdminLoginForm {
  username: string;
  password: string;
}

export interface QuoteForm {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  budget?: string;
  location: string;
}

// Dashboard State Types
export interface DashboardState {
  analytics: AnalyticsData | null;
  realTimeStats: RealTimeStats | null;
  chatbotInteractions: ChatbotInteraction[];
  quotes: QuoteRequest[];
  loading: LoadingState;
  filters: {
    period: string;
    language?: Language;
    source?: string;
  };
}