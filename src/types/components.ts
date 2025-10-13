// Component-specific type definitions for better type safety

import { ReactNode } from 'react';
import { Language, LoadingState, ComponentError } from './analytics';

// Base Component Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Loading and Error States
export interface WithLoadingProps {
  loading?: boolean;
  error?: ComponentError | null;
  onRetry?: () => void;
}

// Blog Related Types
export interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  popular: boolean;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  featured?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  ctaClicks?: number;
}

export interface BlogCardProps extends BaseComponentProps {
  article: BlogArticle;
  variant?: 'default' | 'featured' | 'minimal';
  showAuthor?: boolean;
  showDate?: boolean;
  showExcerpt?: boolean;
  onClick?: (article: BlogArticle) => void;
}

export interface BlogSidebarProps extends BaseComponentProps {
  popularArticles?: BlogArticle[];
  categories?: string[];
  tags?: string[];
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
}

// Form Component Types
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  rows?: number;
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
  submitText?: string;
  resetOnSuccess?: boolean;
}

// Navigation and Header Types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  external?: boolean;
  children?: NavigationItem[];
}

export interface HeaderProps extends BaseComponentProps {
  navigation: NavigationItem[];
  logo?: string | ReactNode;
  showLanguageSwitcher?: boolean;
  currentLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  sticky?: boolean;
}

export interface FooterProps extends BaseComponentProps {
  navigation: NavigationItem[];
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: ReactNode;
  }>;
  newsletter?: {
    onSubmit: (email: string) => void;
    loading?: boolean;
  };
  copyright?: string;
}

// Modal and Dialog Types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  dismissible?: boolean;
  showCloseButton?: boolean;
}

export interface ConfirmDialogProps extends ModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

// Button and Action Types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

// Image and Media Types
export interface OptimizedImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

// Chatbot Component Types
export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  language?: Language;
  source?: 'knowledge_base' | 'ai_generated' | 'fallback';
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatInputProps extends BaseComponentProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showVoiceInput?: boolean;
  showFileUpload?: boolean;
  maxLength?: number;
  language?: Language;
}

export interface ChatMessageProps extends BaseComponentProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  showSource?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
}

export interface SmartChatbotProps extends BaseComponentProps {
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  showHeader?: boolean;
  showFooter?: boolean;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  maxMessages?: number;
  onMessageSent?: (message: ChatMessage) => void;
  onError?: (error: ComponentError) => void;
}

// Language Switcher Types
export interface LanguageSwitcherProps extends BaseComponentProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  variant?: 'dropdown' | 'tabs' | 'buttons';
  showFlags?: boolean;
  showLabels?: boolean;
}

// Newsletter and CTA Types
export interface NewsletterSubscriptionProps extends BaseComponentProps {
  onSubmit: (email: string) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
  placeholder?: string;
  buttonText?: string;
  variant?: 'inline' | 'modal' | 'sidebar';
}

export interface CTASectionProps extends BaseComponentProps {
  title: string;
  description?: string;
  buttonText: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gradient';
  backgroundImage?: string;
  showNewsletter?: boolean;
}

// Error Boundary Types
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

// Pagination Types
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
}

// Table Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationProps;
  sortable?: boolean;
  selectable?: boolean;
  onRowClick?: (record: T, index: number) => void;
  onSelectionChange?: (selectedKeys: string[]) => void;
  emptyText?: string;
  rowKey?: string | ((record: T) => string);
}

// Utility Types
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Generic API Response Type
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Generic List Response Type
export interface ListResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}