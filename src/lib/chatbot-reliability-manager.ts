/**
 * Chatbot Reliability & Error Recovery Manager
 * Provides robust error handling, circuit breaker patterns, and graceful degradation
 */

import { logger, chatbotLogger } from './logger';
import { withRetry, safeAsync } from '@/utils/error-handling';

// ============================================================================
// Types
// ============================================================================

export interface ReliabilityConfig {
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringWindow: number;
  };
  retry: {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
  };
  fallback: {
    enableSmartFallbacks: boolean;
    contextualResponses: boolean;
    offlineMode: boolean;
  };
  monitoring: {
    enableHealthChecks: boolean;
    metricsCollection: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      availability: number;
    };
  };
}

export interface ChatbotHealthMetrics {
  availability: number;
  averageResponseTime: number;
  errorRate: number;
  successfulInteractions: number;
  failedInteractions: number;
  lastHealthCheck: string;
  services: {
    gemini: 'healthy' | 'degraded' | 'down';
    supabase: 'healthy' | 'degraded' | 'down';
    stt: 'healthy' | 'degraded' | 'down';
    tts: 'healthy' | 'degraded' | 'down';
  };
}

export interface ErrorContext {
  sessionId: string;
  userMessage: string;
  errorType: 'api' | 'network' | 'timeout' | 'validation' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  timestamp: string;
}

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private name: string,
    private config: ReliabilityConfig['circuitBreaker']
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'half-open';
        this.successCount = 0;
        logger.info(`Circuit breaker ${this.name} entering half-open state`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is open`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'closed';
        logger.info(`Circuit breaker ${this.name} recovered - closing circuit`);
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
      logger.warn(`Circuit breaker ${this.name} opened due to failures`, undefined, {
        failures: this.failures,
        threshold: this.config.failureThreshold,
      });
    }
  }

  getState(): { state: string; failures: number; lastFailure: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime,
    };
  }
}

// ============================================================================
// Smart Fallback System
// ============================================================================

class SmartFallbackSystem {
  private contextualResponses: Map<string, string[]> = new Map();
  private lastUserIntents: Map<string, string> = new Map();

  constructor() {
    this.initializeFallbackResponses();
  }

  private initializeFallbackResponses(): void {
    // French fallbacks
    this.contextualResponses.set('greeting_fr', [
      'Bonjour ! Je rencontre actuellement des difficultés techniques, mais je peux vous aider avec les informations de base sur OMA Digital.',
      'Salut ! Bien que mes services soient temporairement limités, je peux vous orienter vers nos services principaux.',
    ]);

    this.contextualResponses.set('pricing_fr', [
      'Pour les tarifs détaillés, je vous invite à contacter directement notre équipe au +212 70 119 38 11.',
      'Les prix varient selon vos besoins. Contactez-nous au +212 70 119 38 11 pour un devis personnalisé.',
    ]);

    this.contextualResponses.set('services_fr', [
      'OMA Digital propose : sites web, applications mobiles, automatisation WhatsApp, et chatbots IA. Contactez +212 70 119 38 11.',
      'Nos services incluent la transformation digitale complète. Plus d\'infos : +212 70 119 38 11.',
    ]);

    this.contextualResponses.set('whatsapp_fr', [
      'Notre automatisation WhatsApp garantit +200% d\'engagement client. Démo gratuite : +212 70 119 38 11.',
      'WhatsApp Business automatisé à partir de 50,000 CFA/mois. Contactez : +212 70 119 38 11.',
    ]);

    // English fallbacks
    this.contextualResponses.set('greeting_en', [
      'Hello! I\'m experiencing technical difficulties but can help with basic OMA Digital information.',
      'Hi! While my services are temporarily limited, I can guide you to our main services.',
    ]);

    this.contextualResponses.set('pricing_en', [
      'For detailed pricing, please contact our team directly at +212 70 119 38 11.',
      'Prices vary based on your needs. Contact us at +212 70 119 38 11 for a custom quote.',
    ]);

    this.contextualResponses.set('services_en', [
      'OMA Digital offers: websites, mobile apps, WhatsApp automation, and AI chatbots. Contact: +212 70 119 38 11.',
      'Our services include complete digital transformation. More info: +212 70 119 38 11.',
    ]);

    this.contextualResponses.set('whatsapp_en', [
      'Our WhatsApp automation guarantees +200% customer engagement. Free demo: +212 70 119 38 11.',
      'Automated WhatsApp Business from 50,000 CFA/month. Contact: +212 70 119 38 11.',
    ]);

    // Default fallbacks
    this.contextualResponses.set('default_fr', [
      'Difficultés techniques. Pour assistance immédiate: +212 70 119 38 11.',
      'Problème technique. Notre équipe est disponible au +212 70 119 38 11.',
    ]);

    this.contextualResponses.set('default_en', [
      'Technical difficulties. For immediate assistance: +212 70 119 38 11.',
      'Technical issue. Our team is available at +212 70 119 38 11.',
    ]);
  }

  generateContextualFallback(
    userMessage: string,
    sessionId: string,
    language: 'fr' | 'en',
    errorContext?: ErrorContext
  ): string {
    const intent = this.detectIntent(userMessage, language);
    const contextKey = `${intent}_${language}`;
    
    // Store user intent for session continuity
    this.lastUserIntents.set(sessionId, intent);

    // Get appropriate fallback responses
    const responses = this.contextualResponses.get(contextKey) || 
                     this.contextualResponses.get(`default_${language}`) || 
                     ['Technical error. Contact: +212 70 119 38 11'];

    // Select random response to avoid repetition
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

    // Log fallback usage for monitoring
    chatbotLogger.error(
      new Error('Using smart fallback'),
      sessionId,
      {
        intent,
        language,
        errorType: errorContext?.errorType,
        userMessage: userMessage.substring(0, 100),
      }
    );

    return selectedResponse;
  }

  private detectIntent(message: string, language: 'fr' | 'en'): string {
    const lowerMessage = message.toLowerCase();

    // Greeting detection
    const greetings = {
      fr: ['bonjour', 'salut', 'bonsoir', 'bonne'],
      en: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    };
    
    if (greetings[language].some(greeting => lowerMessage.includes(greeting))) {
      return 'greeting';
    }

    // Pricing intent
    const pricingKeywords = {
      fr: ['prix', 'coût', 'tarif', 'combien', 'budget'],
      en: ['price', 'cost', 'pricing', 'how much', 'budget'],
    };
    
    if (pricingKeywords[language].some(keyword => lowerMessage.includes(keyword))) {
      return 'pricing';
    }

    // WhatsApp intent
    if (lowerMessage.includes('whatsapp') || lowerMessage.includes('automatisation')) {
      return 'whatsapp';
    }

    // Services intent
    const serviceKeywords = {
      fr: ['service', 'offre', 'solution', 'aide', 'que faites-vous'],
      en: ['service', 'offer', 'solution', 'help', 'what do you do'],
    };
    
    if (serviceKeywords[language].some(keyword => lowerMessage.includes(keyword))) {
      return 'services';
    }

    return 'default';
  }

  getSessionContext(sessionId: string): { lastIntent?: string } {
    return {
      lastIntent: this.lastUserIntents.get(sessionId),
    };
  }
}

// ============================================================================
// Health Monitoring System
// ============================================================================

class HealthMonitor {
  private metrics: ChatbotHealthMetrics = {
    availability: 100,
    averageResponseTime: 0,
    errorRate: 0,
    successfulInteractions: 0,
    failedInteractions: 0,
    lastHealthCheck: new Date().toISOString(),
    services: {
      gemini: 'healthy',
      supabase: 'healthy',
      stt: 'healthy',
      tts: 'healthy',
    },
  };

  private responseTimes: number[] = [];
  private readonly maxSamples = 100;

  recordSuccess(responseTime: number): void {
    this.metrics.successfulInteractions++;
    this.recordResponseTime(responseTime);
    this.updateMetrics();
  }

  recordFailure(errorType: string, responseTime: number): void {
    this.metrics.failedInteractions++;
    this.recordResponseTime(responseTime);
    this.updateServiceHealth(errorType);
    this.updateMetrics();
  }

  private recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    if (this.responseTimes.length > this.maxSamples) {
      this.responseTimes.shift();
    }
  }

  private updateMetrics(): void {
    const total = this.metrics.successfulInteractions + this.metrics.failedInteractions;
    
    if (total > 0) {
      this.metrics.availability = (this.metrics.successfulInteractions / total) * 100;
      this.metrics.errorRate = (this.metrics.failedInteractions / total) * 100;
    }

    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    }

    this.metrics.lastHealthCheck = new Date().toISOString();
  }

  private updateServiceHealth(errorType: string): void {
    switch (errorType) {
      case 'gemini_api':
        this.metrics.services.gemini = 'degraded';
        break;
      case 'supabase':
        this.metrics.services.supabase = 'degraded';
        break;
      case 'stt':
        this.metrics.services.stt = 'degraded';
        break;
      case 'tts':
        this.metrics.services.tts = 'degraded';
        break;
    }
  }

  async performHealthCheck(): Promise<ChatbotHealthMetrics> {
    try {
      // Check Supabase connectivity
      await this.checkSupabaseHealth();
      
      // Check if browser APIs are available (client-side only)
      if (typeof window !== 'undefined') {
        this.checkBrowserAPIs();
      }

      // Reset services to healthy if checks pass
      this.resetHealthyServices();

    } catch (error) {
      logger.error('Health check failed', error as Error, {
        component: 'health_monitor',
      });
    }

    return { ...this.metrics };
  }

  private async checkSupabaseHealth(): Promise<void> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env['NEXT_PUBLIC_SUPABASE_URL']!,
        process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
      );

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id')
        .limit(1);

      if (error) throw error;
      this.metrics.services.supabase = 'healthy';

    } catch (error) {
      this.metrics.services.supabase = 'down';
      throw error;
    }
  }

  private checkBrowserAPIs(): void {
    // Check Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.metrics.services.stt = SpeechRecognition ? 'healthy' : 'down';

    // Check Speech Synthesis
    this.metrics.services.tts = 'speechSynthesis' in window ? 'healthy' : 'down';
  }

  private resetHealthyServices(): void {
    // Only reset services that weren't explicitly marked as down
    Object.keys(this.metrics.services).forEach(service => {
      if (this.metrics.services[service as keyof typeof this.metrics.services] === 'degraded') {
        this.metrics.services[service as keyof typeof this.metrics.services] = 'healthy';
      }
    });
  }

  getMetrics(): ChatbotHealthMetrics {
    return { ...this.metrics };
  }

  isHealthy(): boolean {
    return this.metrics.availability > 90 && this.metrics.errorRate < 10;
  }
}

// ============================================================================
// Main Reliability Manager
// ============================================================================

export class ChatbotReliabilityManager {
  private config: ReliabilityConfig;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private fallbackSystem = new SmartFallbackSystem();
  private healthMonitor = new HealthMonitor();

  constructor(config?: Partial<ReliabilityConfig>) {
    this.config = {
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minute
        monitoringWindow: 300000, // 5 minutes
      },
      retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      },
      fallback: {
        enableSmartFallbacks: true,
        contextualResponses: true,
        offlineMode: true,
      },
      monitoring: {
        enableHealthChecks: true,
        metricsCollection: true,
        alertThresholds: {
          errorRate: 15,
          responseTime: 5000,
          availability: 95,
        },
      },
      ...config,
    };

    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    const services = ['gemini', 'supabase', 'stt', 'tts'];
    
    services.forEach(service => {
      this.circuitBreakers.set(
        service,
        new CircuitBreaker(service, this.config.circuitBreaker)
      );
    });
  }

  /**
   * Execute chatbot operation with reliability safeguards
   */
  async executeWithReliability<T>(
    operation: () => Promise<T>,
    context: {
      service: string;
      sessionId: string;
      userMessage: string;
      language?: 'fr' | 'en';
    }
  ): Promise<T> {
    const startTime = performance.now();
    const { service, sessionId, userMessage, language = 'fr' } = context;

    try {
      const circuitBreaker = this.circuitBreakers.get(service);
      
      if (!circuitBreaker) {
        throw new Error(`No circuit breaker found for service: ${service}`);
      }

      // Execute with circuit breaker protection
      const result = await circuitBreaker.execute(async () => {
        return withRetry(
          operation,
          this.config.retry.maxAttempts,
          this.config.retry.baseDelay
        );
      });

      // Record success
      const responseTime = performance.now() - startTime;
      this.healthMonitor.recordSuccess(responseTime);

      return result;

    } catch (error) {
      const responseTime = performance.now() - startTime;
      const errorContext: ErrorContext = {
        sessionId,
        userMessage,
        errorType: this.classifyError(error as Error),
        severity: this.assessErrorSeverity(error as Error, service),
        recoverable: this.isRecoverableError(error as Error),
        timestamp: new Date().toISOString(),
      };

      // Record failure
      this.healthMonitor.recordFailure(service, responseTime);

      // Log error with context
      logger.error(`Service ${service} failed`, error as Error, {
        component: 'reliability_manager',
        ...errorContext,
      });

      // Try fallback if enabled and error is recoverable
      if (this.config.fallback.enableSmartFallbacks && errorContext.recoverable) {
        const fallbackResponse = this.fallbackSystem.generateContextualFallback(
          userMessage,
          sessionId,
          language,
          errorContext
        );

        // Return fallback as if it were a successful response
        return fallbackResponse as unknown as T;
      }

      throw error;
    }
  }

  /**
   * Get smart fallback response
   */
  getFallbackResponse(
    userMessage: string,
    sessionId: string,
    language: 'fr' | 'en',
    errorContext?: ErrorContext
  ): string {
    return this.fallbackSystem.generateContextualFallback(
      userMessage,
      sessionId,
      language,
      errorContext
    );
  }

  /**
   * Perform health check on all systems
   */
  async performHealthCheck(): Promise<ChatbotHealthMetrics> {
    return this.healthMonitor.performHealthCheck();
  }

  /**
   * Get current system metrics
   */
  getHealthMetrics(): ChatbotHealthMetrics {
    return this.healthMonitor.getMetrics();
  }

  /**
   * Check if system is healthy
   */
  isSystemHealthy(): boolean {
    return this.healthMonitor.isHealthy();
  }

  /**
   * Get circuit breaker states
   */
  getCircuitBreakerStates(): Record<string, any> {
    const states: Record<string, any> = {};
    
    this.circuitBreakers.forEach((breaker, service) => {
      states[service] = breaker.getState();
    });

    return states;
  }

  private classifyError(error: Error): ErrorContext['errorType'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('api') || message.includes('service')) {
      return 'api';
    }
    
    return 'system';
  }

  private assessErrorSeverity(error: Error, service: string): ErrorContext['severity'] {
    const criticalServices = ['gemini', 'supabase'];
    const message = error.message.toLowerCase();
    
    if (criticalServices.includes(service)) {
      return 'high';
    }
    
    if (message.includes('timeout') || message.includes('network')) {
      return 'medium';
    }
    
    return 'low';
  }

  private isRecoverableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Non-recoverable errors
    const nonRecoverable = [
      'authentication',
      'authorization',
      'permission denied',
      'invalid api key',
      'quota exceeded',
    ];
    
    return !nonRecoverable.some(term => message.includes(term));
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const chatbotReliabilityManager = new ChatbotReliabilityManager();

export default chatbotReliabilityManager;