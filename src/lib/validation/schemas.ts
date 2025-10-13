// Comprehensive Zod schemas for runtime validation
import { z } from 'zod';

// Base schemas
export const LanguageSchema = z.enum(['fr', 'en']);
export const StatusSchema = z.enum(['idle', 'loading', 'success', 'error']);
export const VariantSchema = z.enum(['primary', 'secondary', 'success', 'warning', 'danger', 'info']);
export const SizeSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);

// Email validation
export const EmailSchema = z.string().email('Adresse email invalide');

// Phone validation (international format)
export const PhoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Numéro de téléphone invalide'
);

// URL validation
export const URLSchema = z.string().url('URL invalide');

// Date validation
export const DateStringSchema = z.string().datetime('Date invalide');
export const DateSchema = z.date();

// User and Authentication Schemas
export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: EmailSchema,
  role: z.enum(['admin', 'moderator', 'viewer']),
  lastLogin: DateStringSchema,
  permissions: z.array(z.string()),
  active: z.boolean(),
  createdAt: DateStringSchema
});

export const LoginRequestSchema = z.object({
  username: z.string().min(3, 'Nom d\'utilisateur requis').max(50),
  password: z.string().min(6, 'Mot de passe requis (min. 6 caractères)')
});

export const SessionSchema = z.object({
  token: z.string(),
  user: AdminUserSchema,
  expiresAt: DateStringSchema,
  permissions: z.array(z.string())
});

// Analytics Schemas
export const CoreWebVitalsSchema = z.object({
  lcp: z.number().min(0),
  fid: z.number().min(0),
  cls: z.number().min(0),
  ttfb: z.number().min(0),
  lcpRating: z.enum(['good', 'needs-improvement', 'poor']),
  fidRating: z.enum(['good', 'needs-improvement', 'poor']),
  clsRating: z.enum(['good', 'needs-improvement', 'poor']),
  ttfbRating: z.enum(['good', 'needs-improvement', 'poor'])
});

export const PerformanceMetricsSchema = z.object({
  uptime: z.string(),
  avgLoadTime: z.string(),
  errorRate: z.string(),
  coreWebVitals: CoreWebVitalsSchema
});

export const ChatMetricsSchema = z.object({
  total: z.number().min(0),
  voice: z.number().min(0),
  text: z.number().min(0),
  avgResponseTime: z.number().min(0)
});

export const AnalyticsDataSchema = z.object({
  period: z.string(),
  chats: ChatMetricsSchema,
  performance: PerformanceMetricsSchema,
  generated: DateStringSchema,
  analyticsEvents: z.number().min(0),
  mobileTraffic: z.number().min(0),
  localVisitors: z.number().min(0),
  abTestResults: z.array(z.object({
    id: z.string(),
    name: z.string(),
    variant: z.enum(['A', 'B']),
    conversions: z.number().min(0),
    views: z.number().min(0),
    conversionRate: z.number().min(0).max(100)
  })),
  abTestConversions: z.number().min(0),
  conversionRate: z.number().min(0).max(100),
  quotesSubmitted: z.number().min(0),
  webVitalsCount: z.number().min(0)
});

export const AnalyticsEventSchema = z.object({
  id: z.string().uuid().optional(),
  event_name: z.string().min(1),
  event_data: z.record(z.unknown()),
  page_url: URLSchema,
  user_agent: z.string().nullable(),
  country: z.string().optional(),
  device_type: z.string().optional(),
  timestamp: DateStringSchema.optional(),
  metadata: z.record(z.unknown()).optional()
});

// Chatbot Schemas
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, 'Le message ne peut pas être vide'),
  type: z.enum(['user', 'bot']),
  timestamp: DateSchema,
  language: LanguageSchema.optional(),
  source: z.enum(['knowledge_base', 'ai_generated', 'fallback']).optional(),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.unknown()).optional()
});

export const ChatbotInteractionSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string(),
  message: z.string().min(1),
  response: z.string().min(1),
  language: LanguageSchema,
  source: z.enum(['knowledge_base', 'ai_generated', 'fallback']),
  confidence: z.number().min(0).max(1),
  response_time_ms: z.number().min(0),
  created_at: DateStringSchema,
  metadata: z.record(z.unknown()).optional()
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Le message ne peut pas être vide').max(1000, 'Message trop long'),
  language: LanguageSchema.optional(),
  sessionId: z.string().optional()
});

export const ChatResponseSchema = z.object({
  response: z.string().min(1),
  language: LanguageSchema,
  source: z.enum(['knowledge_base', 'ai_generated', 'fallback']),
  confidence: z.number().min(0).max(1),
  sessionId: z.string(),
  responseTime: z.number().min(0)
});

// Quote Schemas
export const QuoteRequestSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nom requis').max(100),
  email: EmailSchema,
  phone: PhoneSchema,
  company: z.string().max(100).nullable(),
  service: z.string().min(1, 'Service requis').max(200),
  message: z.string().min(10, 'Message trop court').max(2000),
  budget: z.string().max(50).nullable(),
  location: z.string().min(1, 'Localisation requise').max(100),
  status: z.enum(['nouveau', 'traite', 'archive']).optional(),
  security_validated: z.boolean().optional(),
  created_at: DateStringSchema.optional()
});

export const CreateQuoteRequestSchema = QuoteRequestSchema.omit({
  id: true,
  status: true,
  security_validated: true,
  created_at: true
});

export const UpdateQuoteRequestSchema = z.object({
  status: z.enum(['nouveau', 'traite', 'archive']).optional(),
  notes: z.string().max(1000).optional(),
  assignedTo: z.string().max(100).optional()
});

// Blog Schemas
export const BlogArticleSchema = z.object({
  id: z.number().positive().optional(),
  title: z.string().min(5, 'Titre trop court').max(200),
  excerpt: z.string().min(10, 'Extrait trop court').max(500),
  content: z.string().min(100, 'Contenu trop court'),
  date: DateStringSchema,
  readTime: z.string(),
  image: URLSchema,
  category: z.string().min(1).max(50),
  author: z.object({
    name: z.string().min(1).max(100),
    avatar: URLSchema,
    role: z.string().min(1).max(100)
  }),
  tags: z.array(z.string().max(30)),
  popular: z.boolean(),
  views: z.number().min(0).optional(),
  likes: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  slug: z.string().min(1).max(200),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean().optional(),
  publishedAt: DateStringSchema.optional(),
  updatedAt: DateStringSchema.optional(),
  ctaClicks: z.number().min(0).optional()
});

export const CreateBlogRequestSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(100),
  excerpt: z.string().min(10).max(500),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(30)),
  status: z.enum(['draft', 'published']),
  featured: z.boolean().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional()
});

// Newsletter Schemas
export const NewsletterSubscriberSchema = z.object({
  id: z.string().uuid(),
  email: EmailSchema,
  status: z.enum(['pending', 'confirmed', 'unsubscribed']),
  confirmedAt: DateStringSchema.nullable(),
  createdAt: DateStringSchema,
  metadata: z.record(z.unknown()).optional()
});

export const SubscribeRequestSchema = z.object({
  email: EmailSchema,
  source: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional()
});

export const UnsubscribeRequestSchema = z.object({
  email: EmailSchema,
  token: z.string().optional()
});

// API Response Schemas
export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: DateStringSchema.optional(),
    requestId: z.string().optional()
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().min(0),
    page: z.number().min(1),
    limit: z.number().min(1),
    hasMore: z.boolean(),
    totalPages: z.number().min(1)
  });

// Form Validation Schemas
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  email: EmailSchema,
  subject: z.string().min(5, 'Sujet requis').max(200),
  message: z.string().min(10, 'Message trop court').max(2000),
  phone: PhoneSchema.optional(),
  company: z.string().max(100).optional()
});

export const NewsletterFormSchema = z.object({
  email: EmailSchema
});

export const SearchFormSchema = z.object({
  query: z.string().min(1, 'Recherche requise').max(200),
  category: z.string().optional(),
  filters: z.record(z.unknown()).optional()
});

// Settings Schemas
export const AdminSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteUrl: URLSchema,
  contactEmail: EmailSchema,
  language: LanguageSchema,
  timezone: z.string(),
  maintenanceMode: z.boolean(),
  debugMode: z.boolean(),
  security: z.object({
    twoFactorEnabled: z.boolean(),
    sessionTimeout: z.number().min(300).max(86400),
    maxLoginAttempts: z.number().min(3).max(10),
    passwordPolicy: z.object({
      minLength: z.number().min(6).max(50),
      requireNumbers: z.boolean(),
      requireSymbols: z.boolean(),
      requireUppercase: z.boolean()
    })
  }),
  integrations: z.object({
    googleAnalytics: z.object({
      enabled: z.boolean(),
      trackingId: z.string().optional()
    }),
    supabase: z.object({
      url: URLSchema,
      anonKey: z.string()
    }),
    ai: z.object({
      provider: z.enum(['google', 'openai', 'anthropic']),
      apiKey: z.string().optional(),
      model: z.string().optional()
    })
  })
});

// File Upload Schemas
export const FileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'Le fichier est trop volumineux (max 10MB)'
  ),
  type: z.enum(['image', 'document', 'audio', 'video']).optional(),
  metadata: z.record(z.unknown()).optional()
});

export const ImageUploadSchema = FileUploadSchema.extend({
  file: z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
    'Type de fichier non supporté (JPEG, PNG, WebP, GIF uniquement)'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB for images
    'Image trop volumineuse (max 5MB)'
  )
});

// Performance Alert Schema
export const PerformanceAlertSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['error', 'warning', 'info']),
  message: z.string().min(1),
  timestamp: DateStringSchema,
  acknowledged: z.boolean(),
  source: z.string(),
  details: z.record(z.unknown()).optional()
});

// Real-time Stats Schema
export const RealTimeStatsSchema = z.object({
  onlineUsers: z.number().min(0),
  activeChats: z.number().min(0),
  todayConversations: z.number().min(0),
  todayQuotes: z.number().min(0),
  responseTime: z.number().min(0),
  conversionRate: z.number().min(0).max(100),
  topCountries: z.array(z.object({
    country: z.string(),
    users: z.number().min(0),
    flag: z.string()
  })),
  deviceStats: z.array(z.object({
    device: z.string(),
    percentage: z.number().min(0).max(100),
    count: z.number().min(0)
  })),
  hourlyActivity: z.array(z.object({
    hour: z.number().min(0).max(23),
    activity: z.number().min(0)
  }))
});

// Export all schemas for easy access
export const schemas = {
  // Base types
  Language: LanguageSchema,
  Email: EmailSchema,
  Phone: PhoneSchema,
  URL: URLSchema,
  DateString: DateStringSchema,
  Date: DateSchema,
  
  // Authentication
  AdminUser: AdminUserSchema,
  LoginRequest: LoginRequestSchema,
  Session: SessionSchema,
  
  // Analytics
  AnalyticsData: AnalyticsDataSchema,
  AnalyticsEvent: AnalyticsEventSchema,
  CoreWebVitals: CoreWebVitalsSchema,
  PerformanceMetrics: PerformanceMetricsSchema,
  RealTimeStats: RealTimeStatsSchema,
  
  // Chatbot
  ChatMessage: ChatMessageSchema,
  ChatbotInteraction: ChatbotInteractionSchema,
  ChatRequest: ChatRequestSchema,
  ChatResponse: ChatResponseSchema,
  
  // Quotes
  QuoteRequest: QuoteRequestSchema,
  CreateQuoteRequest: CreateQuoteRequestSchema,
  UpdateQuoteRequest: UpdateQuoteRequestSchema,
  
  // Blog
  BlogArticle: BlogArticleSchema,
  CreateBlogRequest: CreateBlogRequestSchema,
  
  // Newsletter
  NewsletterSubscriber: NewsletterSubscriberSchema,
  SubscribeRequest: SubscribeRequestSchema,
  UnsubscribeRequest: UnsubscribeRequestSchema,
  
  // Forms
  ContactForm: ContactFormSchema,
  NewsletterForm: NewsletterFormSchema,
  SearchForm: SearchFormSchema,
  
  // Settings
  AdminSettings: AdminSettingsSchema,
  
  // Files
  FileUpload: FileUploadSchema,
  ImageUpload: ImageUploadSchema,
  
  // API
  APIResponse: APIResponseSchema,
  PaginatedResponse: PaginatedResponseSchema,
  
  // Alerts
  PerformanceAlert: PerformanceAlertSchema
};

export default schemas;