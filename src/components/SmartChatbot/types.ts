// Types pour le chatbot amélioré avec CTA tracking
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  suggestions?: string[];
  cta?: CTAAction;
  language?: 'fr' | 'en';
  source?: string;
  confidence?: number;
  metadata?: MessageMetadata;
}

export interface CTAAction {
  id?: string;
  type: 'contact' | 'demo' | 'appointment' | 'quote' | 'whatsapp' | 'email' | 'phone';
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: {
    phone?: string;
    email?: string;
    url?: string;
    service?: string;
    message?: string;
    [key: string]: unknown;
  };
  tracking?: CTATracking;
  conditions?: CTAConditions;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CTATracking {
  clicks: number;
  conversions: number;
  last_clicked?: string;
  conversion_rate?: number;
}

export interface CTAConditions {
  keywords?: string[];
  language?: 'fr' | 'en' | 'both';
  time_of_day?: string[];
  user_type?: string[];
}

export interface MessageMetadata {
  intent?: string;
  entities?: Record<string, any>;
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high';
}

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  inputText: string;
  isTyping: boolean;
  isTTSActive: boolean;
  isTTSSpeaking: boolean;
  isOnline: boolean;
  isNearBottom: boolean;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  language?: 'fr' | 'en';
  suggestions?: string[];
  cta?: CTAAction;
  source?: string;
  confidence?: number;
  conversationId?: string;
  timestamp?: string;
  fallback?: boolean;
  error?: string;
}

export interface SecurityConfig {
  maxMessageLength: number;
  suspiciousPatterns: RegExp[];
  rateLimitWindow: number;
  maxMessagesPerWindow: number;
}

// Enhanced context type for better integration with Google AI Studio
export interface ChatContext {
  history: ChatMessage[];
  languageDetection: 'gemini' | 'client' | 'server';
  [key: string]: unknown;
}

// Enhanced intent detection result
export interface IntentResult {
  intent: string;
  confidence: number;
  entities: string[];
}