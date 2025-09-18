/**
 * AI Integration Optimization Manager
 * Enhances chatbot performance, RAG system, and AI reliability
 */

import { logger, chatbotLogger, performanceLogger } from './logger';
import { securityManager } from './security-enhanced';
import { withRetry } from '@/utils/error-handling';

// ============================================================================
// Types
// ============================================================================

export interface OptimizedRAGResult {
  documents: RelevantDocument[];
  searchStrategy: 'keyword' | 'semantic' | 'hybrid';
  confidence: number;
  processingTime: number;
}

export interface RelevantDocument {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  category: string;
  language: 'fr' | 'en';
  keywords: string[];
}

export interface EnhancedChatResponse {
  response: string;
  language: 'fr' | 'en';
  confidence: number;
  source: 'rag' | 'fallback' | 'direct';
  suggestions: string[];
  cta?: {
    type: 'contact' | 'demo' | 'appointment' | 'quote';
    action: string;
    priority: 'low' | 'medium' | 'high';
    data?: any;
  };
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    ragDocuments: number;
    strategy: string;
  };
}

export interface PromptOptimizationConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
}

// ============================================================================
// Enhanced RAG System
// ============================================================================

export class OptimizedRAGManager {
  private documentCache = new Map<string, RelevantDocument[]>();
  private embeddingCache = new Map<string, number[]>();
  private cacheTTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Enhanced document search with multiple strategies
   */
  async searchRelevantDocuments(
    query: string,
    language: 'fr' | 'en',
    options: {
      strategy?: 'keyword' | 'semantic' | 'hybrid';
      maxDocuments?: number;
      minRelevanceScore?: number;
    } = {}
  ): Promise<OptimizedRAGResult> {
    const startTime = performance.now();
    const { strategy = 'hybrid', maxDocuments = 5, minRelevanceScore = 0.1 } = options;

    try {
      let documents: RelevantDocument[] = [];

      switch (strategy) {
        case 'keyword':
          documents = await this.keywordSearch(query, language, maxDocuments);
          break;
        case 'semantic':
          documents = await this.semanticSearch(query, language, maxDocuments);
          break;
        case 'hybrid':
          documents = await this.hybridSearch(query, language, maxDocuments);
          break;
      }

      // Filter by minimum relevance score
      documents = documents.filter(doc => doc.relevanceScore >= minRelevanceScore);

      const processingTime = performance.now() - startTime;
      
      performanceLogger.timing('rag_search', startTime, {
        component: 'rag_manager',
      });

      return {
        documents,
        searchStrategy: strategy,
        confidence: this.calculateSearchConfidence(documents),
        processingTime,
      };

    } catch (error) {
      logger.error('RAG search failed', error as Error, {
        component: 'rag_manager',
        query: query.substring(0, 100),
        strategy,
      });

      return {
        documents: [],
        searchStrategy: strategy,
        confidence: 0,
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Keyword-based document search
   */
  private async keywordSearch(
    query: string,
    language: 'fr' | 'en',
    maxResults: number
  ): Promise<RelevantDocument[]> {
    // Enhanced keyword extraction
    const keywords = this.extractKeywords(query, language);
    const cacheKey = `keyword_${language}_${keywords.join('_')}`;

    if (this.documentCache.has(cacheKey)) {
      const cached = this.documentCache.get(cacheKey)!;
      return cached.slice(0, maxResults);
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Build dynamic query based on keywords
      let supabaseQuery = supabase
        .from('knowledge_base')
        .select('*')
        .eq('language', language)
        .eq('is_active', true);

      // Add keyword matching using text search
      if (keywords.length > 0) {
        const searchQuery = keywords.join(' | ');
        supabaseQuery = supabaseQuery.textSearch('content', searchQuery);
      }

      const { data, error } = await supabaseQuery.limit(maxResults * 2); // Get more for scoring

      if (error) throw error;

      const documents = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        language: doc.language,
        keywords: doc.keywords || [],
        relevanceScore: this.calculateKeywordRelevance(query, doc.content, keywords),
      })).sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Cache results
      this.documentCache.set(cacheKey, documents);
      setTimeout(() => this.documentCache.delete(cacheKey), this.cacheTTL);

      return documents.slice(0, maxResults);

    } catch (error) {
      logger.error('Keyword search failed', error as Error);
      return [];
    }
  }

  /**
   * Semantic search using embeddings (simulated for now)
   */
  private async semanticSearch(
    query: string,
    language: 'fr' | 'en',
    maxResults: number
  ): Promise<RelevantDocument[]> {
    // For now, fallback to keyword search with semantic scoring
    // In production, this would use actual embeddings
    const keywordResults = await this.keywordSearch(query, language, maxResults * 2);
    
    // Apply semantic scoring (simplified)
    return keywordResults
      .map(doc => ({
        ...doc,
        relevanceScore: this.calculateSemanticRelevance(query, doc.content),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  /**
   * Hybrid search combining keyword and semantic approaches
   */
  private async hybridSearch(
    query: string,
    language: 'fr' | 'en',
    maxResults: number
  ): Promise<RelevantDocument[]> {
    const [keywordResults, semanticResults] = await Promise.all([
      this.keywordSearch(query, language, maxResults),
      this.semanticSearch(query, language, maxResults),
    ]);

    // Combine and deduplicate results
    const combinedMap = new Map<string, RelevantDocument>();

    keywordResults.forEach(doc => {
      combinedMap.set(doc.id, {
        ...doc,
        relevanceScore: doc.relevanceScore * 0.6, // Weight keyword results
      });
    });

    semanticResults.forEach(doc => {
      if (combinedMap.has(doc.id)) {
        // Boost score for documents found in both searches
        const existing = combinedMap.get(doc.id)!;
        existing.relevanceScore = Math.min(
          existing.relevanceScore + (doc.relevanceScore * 0.4),
          1.0
        );
      } else {
        combinedMap.set(doc.id, {
          ...doc,
          relevanceScore: doc.relevanceScore * 0.4, // Weight semantic results
        });
      }
    });

    return Array.from(combinedMap.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  /**
   * Extract meaningful keywords from query
   */
  private extractKeywords(query: string, language: 'fr' | 'en'): string[] {
    const stopWords = {
      fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'mes', 'mon', 'votre', 'vos'],
      en: ['the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about'],
    };

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords[language].includes(word)
      )
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Calculate keyword-based relevance score
   */
  private calculateKeywordRelevance(query: string, content: string, keywords: string[]): number {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    let score = 0;
    
    // Exact query match (high weight)
    if (contentLower.includes(queryLower)) {
      score += 0.5;
    }

    // Keyword matches
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length * 0.1;
      }
    });

    // Title boost (if content contains title indicators)
    if (contentLower.includes('title:') || contentLower.includes('titre:')) {
      score *= 1.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate semantic relevance score (simplified)
   */
  private calculateSemanticRelevance(query: string, content: string): number {
    // Simplified semantic analysis
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    const commonWords = queryWords.filter(word => 
      contentWords.some(cWord => 
        cWord.includes(word) || word.includes(cWord)
      )
    );

    return Math.min(commonWords.length / queryWords.length, 1.0);
  }

  /**
   * Calculate overall search confidence
   */
  private calculateSearchConfidence(documents: RelevantDocument[]): number {
    if (documents.length === 0) return 0;
    
    const avgScore = documents.reduce((sum, doc) => sum + doc.relevanceScore, 0) / documents.length;
    const coverageBonus = Math.min(documents.length / 3, 1) * 0.2; // Bonus for having multiple relevant docs
    
    return Math.min(avgScore + coverageBonus, 1.0);
  }
}

// ============================================================================
// Enhanced Prompt Manager
// ============================================================================

export class PromptOptimizer {
  private readonly configs: Record<string, PromptOptimizationConfig> = {
    conversational: {
      maxTokens: 150,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
      stopSequences: ['\n\n', 'User:', 'Assistant:'],
    },
    technical: {
      maxTokens: 200,
      temperature: 0.3,
      topP: 0.8,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      stopSequences: ['\n\n'],
    },
    sales: {
      maxTokens: 180,
      temperature: 0.8,
      topP: 0.95,
      frequencyPenalty: 0.2,
      presencePenalty: 0.1,
      stopSequences: ['\n\n', 'Prix:', 'Tarif:'],
    },
  };

  /**
   * Build optimized prompt based on context and intent
   */
  buildOptimizedPrompt(
    userMessage: string,
    ragDocuments: RelevantDocument[],
    conversationHistory: any[] = [],
    language: 'fr' | 'en',
    intent?: string
  ): { prompt: string; config: PromptOptimizationConfig } {
    const ragSection = this.buildRAGContext(ragDocuments, language);
    const historySection = this.buildHistoryContext(conversationHistory, language);
    const configType = this.determineConfigType(intent, userMessage);
    
    const basePrompt = language === 'fr' ? 
      this.buildFrenchPrompt(userMessage, ragSection, historySection) :
      this.buildEnglishPrompt(userMessage, ragSection, historySection);

    return {
      prompt: basePrompt,
      config: this.configs[configType],
    };
  }

  private buildRAGContext(documents: RelevantDocument[], language: 'fr' | 'en'): string {
    if (documents.length === 0) {
      return language === 'fr' ? 
        'Aucun document de référence disponible.' : 
        'No reference documents available.';
    }

    const header = language === 'fr' ? 
      '### Documents de référence OMA Digital:' : 
      '### OMA Digital Reference Documents:';

    const docSections = documents.map((doc, index) => {
      return `**Document ${index + 1}** (Pertinence: ${Math.round(doc.relevanceScore * 100)}%)\n${doc.content}`;
    }).join('\n\n');

    return `${header}\n\n${docSections}`;
  }

  private buildHistoryContext(history: any[], language: 'fr' | 'en'): string {
    if (history.length === 0) return '';

    const header = language === 'fr' ? 
      '### Historique récent:' : 
      '### Recent History:';

    const recent = history.slice(-3).map(msg => {
      const role = msg.sender === 'user' ? 
        (language === 'fr' ? 'Utilisateur' : 'User') : 
        (language === 'fr' ? 'Assistant' : 'Assistant');
      return `${role}: ${msg.text}`;
    }).join('\n');

    return `${header}\n${recent}`;
  }

  private buildFrenchPrompt(userMessage: string, ragSection: string, historySection: string): string {
    return `Tu es **OMA Assistant**, l'assistant IA d'OMA Digital, spécialisé dans la transformation digitale des PME sénégalaises.

### Règles essentielles:
1. **Concision**: Réponses courtes, claires et actionables (max 2-3 phrases)
2. **Source unique**: Utilise UNIQUEMENT les documents de référence fournis
3. **Contact**: Toujours proposer +212 701 193 811 pour plus d'informations
4. **Focus ROI**: Mentionner le ROI de 200% pour l'automatisation WhatsApp quand pertinent
5. **CTA**: Proposer des actions concrètes liées aux services OMA

${ragSection}

${historySection}

**Message utilisateur**: ${userMessage}

**Réponse** (commence par [LANG:FR]):`;
  }

  private buildEnglishPrompt(userMessage: string, ragSection: string, historySection: string): string {
    return `You are **OMA Assistant**, the AI assistant for OMA Digital, specialized in digital transformation for Senegalese SMEs.

### Essential Rules:
1. **Conciseness**: Short, clear, actionable responses (max 2-3 sentences)
2. **Single Source**: Use ONLY the provided reference documents
3. **Contact**: Always offer +212 701 193 811 for more information
4. **Focus ROI**: Mention 200% ROI for WhatsApp automation when relevant
5. **CTA**: Propose concrete actions related to OMA services

${ragSection}

${historySection}

**User Message**: ${userMessage}

**Response** (start with [LANG:EN]):`;
  }

  private determineConfigType(intent?: string, message?: string): keyof typeof this.configs {
    if (!intent && !message) return 'conversational';

    const lowerMessage = message?.toLowerCase() || '';
    
    // Technical queries
    if (intent?.includes('technical') || 
        lowerMessage.includes('comment') || 
        lowerMessage.includes('how') ||
        lowerMessage.includes('api') ||
        lowerMessage.includes('intégration')) {
      return 'technical';
    }

    // Sales-oriented queries  
    if (intent?.includes('quote') || 
        intent?.includes('pricing') ||
        lowerMessage.includes('prix') ||
        lowerMessage.includes('coût') ||
        lowerMessage.includes('tarif') ||
        lowerMessage.includes('price') ||
        lowerMessage.includes('cost')) {
      return 'sales';
    }

    return 'conversational';
  }
}

// ============================================================================
// STT/TTS Enhancement Manager
// ============================================================================

export class SpeechOptimizer {
  /**
   * Enhanced STT with better error handling and fallbacks
   */
  async optimizeSTTResponse(audioBlob: Blob, language: 'fr' | 'en'): Promise<{
    text: string;
    confidence: number;
    processing_time: number;
    method: 'native' | 'fallback';
  }> {
    const startTime = performance.now();

    try {
      // Try native Web Speech API first
      const nativeResult = await this.tryNativeSTT(language);
      
      return {
        text: nativeResult.text,
        confidence: nativeResult.confidence,
        processing_time: performance.now() - startTime,
        method: 'native',
      };

    } catch (error) {
      logger.warn('Native STT failed, using fallback', undefined, { error });

      // Fallback to basic processing
      return {
        text: '',
        confidence: 0,
        processing_time: performance.now() - startTime,
        method: 'fallback',
      };
    }
  }

  private async tryNativeSTT(language: 'fr' | 'en'): Promise<{ text: string; confidence: number }> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let timeout = setTimeout(() => {
        recognition.stop();
        reject(new Error('STT timeout'));
      }, 10000); // 10 second timeout

      recognition.onresult = (event: any) => {
        clearTimeout(timeout);
        const result = event.results[0][0];
        resolve({
          text: result.transcript,
          confidence: result.confidence || 0.8,
        });
      };

      recognition.onerror = (event: any) => {
        clearTimeout(timeout);
        reject(new Error(`STT error: ${event.error}`));
      };

      recognition.start();
    });
  }

  /**
   * Enhanced TTS with better voice selection and error handling
   */
  async optimizeTTS(text: string, language: 'fr' | 'en'): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('TTS not supported');
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced voice selection
      const voices = speechSynthesis.getVoices();
      const preferredVoice = this.selectBestVoice(voices, language);
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Optimize speech parameters
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = language === 'fr' ? 0.9 : 1.0; // Slightly slower for French
      utterance.pitch = 1.1;
      utterance.volume = 0.85;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`TTS error: ${event.error}`));

      speechSynthesis.speak(utterance);
    });
  }

  private selectBestVoice(voices: SpeechSynthesisVoice[], language: 'fr' | 'en'): SpeechSynthesisVoice | null {
    const langCode = language === 'fr' ? 'fr' : 'en';
    
    // Prefer local voices
    const localVoices = voices.filter(voice => 
      voice.lang.startsWith(langCode) && voice.localService
    );
    
    if (localVoices.length > 0) {
      // Prefer female voices for better engagement
      const femaleVoice = localVoices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('marie') ||
        voice.name.toLowerCase().includes('sarah')
      );
      
      return femaleVoice || localVoices[0];
    }

    // Fallback to any voice in the language
    return voices.find(voice => voice.lang.startsWith(langCode)) || null;
  }
}

// ============================================================================
// Main AI Optimization Manager
// ============================================================================

export class AIOptimizationManager {
  private ragManager = new OptimizedRAGManager();
  private promptOptimizer = new PromptOptimizer();
  private speechOptimizer = new SpeechOptimizer();

  async optimizeResponse(
    userMessage: string,
    sessionId: string,
    options: {
      language?: 'fr' | 'en';
      conversationHistory?: any[];
      intent?: string;
      useRAG?: boolean;
    } = {}
  ): Promise<EnhancedChatResponse> {
    const startTime = performance.now();
    const { language = 'fr', conversationHistory = [], intent, useRAG = true } = options;

    try {
      // 1. Sanitize input
      const sanitizedMessage = securityManager.validateAndSanitizeInput(userMessage, 1000);
      if (!sanitizedMessage.sanitized) {
        throw new Error('Invalid input detected');
      }

      // 2. Perform RAG search if enabled
      let ragResult: OptimizedRAGResult = {
        documents: [],
        searchStrategy: 'keyword',
        confidence: 0,
        processingTime: 0,
      };

      if (useRAG) {
        ragResult = await this.ragManager.searchRelevantDocuments(
          sanitizedMessage.sanitized,
          language,
          { strategy: 'hybrid', maxDocuments: 3 }
        );
      }

      // 3. Build optimized prompt
      const { prompt, config } = this.promptOptimizer.buildOptimizedPrompt(
        sanitizedMessage.sanitized,
        ragResult.documents,
        conversationHistory,
        language,
        intent
      );

      // 4. Generate response (this would call Gemini API)
      // For now, return a structured response
      const response = await this.generateAIResponse(prompt, config);

      const totalProcessingTime = performance.now() - startTime;

      // 5. Log performance metrics
      performanceLogger.timing('ai_optimization_total', startTime, {
        component: 'ai_optimization_manager',
      });

      chatbotLogger.interaction(sessionId, 'bot', response.response, {
        language,
        intent,
        ragDocuments: ragResult.documents.length,
        processingTime: totalProcessingTime,
      });

      return {
        response: response.response,
        language,
        confidence: Math.min(ragResult.confidence + 0.3, 1.0),
        source: ragResult.documents.length > 0 ? 'rag' : 'direct',
        suggestions: this.generateSuggestions(sanitizedMessage.sanitized, language),
        cta: response.cta,
        metadata: {
          processingTime: totalProcessingTime,
          tokensUsed: response.tokensUsed,
          ragDocuments: ragResult.documents.length,
          strategy: ragResult.searchStrategy,
        },
      };

    } catch (error) {
      logger.error('AI optimization failed', error as Error, {
        component: 'ai_optimization_manager',
        sessionId,
        userMessage: userMessage.substring(0, 100),
      });

      // Return fallback response
      return this.getFallbackResponse(language, performance.now() - startTime);
    }
  }

  private async generateAIResponse(prompt: string, config: PromptOptimizationConfig): Promise<{
    response: string;
    tokensUsed?: number;
    cta?: any;
  }> {
    // This would integrate with the actual Gemini API
    // For now, return a structured response
    return {
      response: 'Response would be generated by Gemini API using the optimized prompt',
      tokensUsed: 150,
      cta: undefined,
    };
  }

  private generateSuggestions(message: string, language: 'fr' | 'en'): string[] {
    const suggestions = {
      fr: ['Découvrir nos services', 'Demander un devis', 'Réserver une démo', 'Parler à un conseiller'],
      en: ['Discover our services', 'Request a quote', 'Book a demo', 'Talk to an advisor'],
    };

    // Could be enhanced with intent-based suggestions
    return suggestions[language];
  }

  private getFallbackResponse(language: 'fr' | 'en', processingTime: number): EnhancedChatResponse {
    const fallbackText = language === 'fr' ?
      'Désolé, je rencontre un problème technique. Contactez-nous au +212 701 193 811 pour une assistance immédiate.' :
      'Sorry, I\'m experiencing technical difficulties. Contact us at +212 701 193 811 for immediate assistance.';

    return {
      response: fallbackText,
      language,
      confidence: 0.1,
      source: 'fallback',
      suggestions: [],
      metadata: {
        processingTime,
        tokensUsed: 0,
        ragDocuments: 0,
        strategy: 'fallback',
      },
    };
  }

  // Speech optimization methods
  async optimizeSTT(audioBlob: Blob, language: 'fr' | 'en') {
    return this.speechOptimizer.optimizeSTTResponse(audioBlob, language);
  }

  async optimizeTTS(text: string, language: 'fr' | 'en') {
    return this.speechOptimizer.optimizeTTS(text, language);
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const aiOptimizationManager = new AIOptimizationManager();

export default aiOptimizationManager;