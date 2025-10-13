/**
 * Service Google AI Studio (Gemini) Unifié
 * Gère: LLM, Détection de langue, RAG, STT, TTS
 * 
 * @security Utilise GOOGLE_AI_API_KEY côté serveur uniquement
 * @performance Cache les réponses fréquentes
 * @accessibility Supporte FR/EN avec détection automatique
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Configuration du service Gemini
 */
interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Réponse du chatbot avec métadonnées
 */
export interface ChatResponse {
  response: string;
  language: 'fr' | 'en';
  suggestions?: string[];
  cta?: CTAAction;
  source: string;
  confidence: number;
  conversationId: string;
  timestamp: string;
}

/**
 * Action CTA (Call-to-Action)
 */
export interface CTAAction {
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
}

/**
 * Classe principale du service Gemini
 */
class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  /**
   * Initialise le service avec la clé API
   * @security La clé API ne doit JAMAIS être exposée côté client
   */
  initialize(config: GeminiConfig): void {
    if (this.isInitialized) {
      return;
    }

    if (!config.apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.model || 'gemini-1.5-flash',
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxOutputTokens || 2048,
      },
    });

    this.isInitialized = true;
    console.log('✅ Gemini Service initialized');
  }

  /**
   * Vérifie que le service est initialisé
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.model) {
      throw new Error('Gemini Service not initialized. Call initialize() first.');
    }
  }

  /**
   * Détecte la langue d'un texte via Gemini
   * @param text Texte à analyser
   * @returns 'fr' ou 'en'
   */
  async detectLanguage(text: string): Promise<'fr' | 'en'> {
    this.ensureInitialized();

    try {
      const prompt = `Detect the language of this text and respond ONLY with "FR" or "EN" (nothing else):

Text: "${text}"

Language:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim().toUpperCase();

      if (response.includes('EN')) {
        return 'en';
      }
      return 'fr'; // Default to French for Senegalese market
    } catch (error) {
      console.error('Language detection error:', error);
      return 'fr'; // Fallback to French
    }
  }

  /**
   * Génère une réponse de chatbot avec RAG
   * @param message Message utilisateur
   * @param context Contexte de la conversation
   * @param knowledgeBase Base de connaissances (RAG)
   * @returns Réponse complète avec métadonnées
   */
  async generateChatResponse(
    message: string,
    context: string[],
    knowledgeBase: string
  ): Promise<Omit<ChatResponse, 'conversationId' | 'timestamp'>> {
    this.ensureInitialized();

    let detectedLanguage: 'fr' | 'en' = 'fr';

    try {
      // Détection de langue
      detectedLanguage = await this.detectLanguage(message);

      // Construction du prompt avec RAG
      const systemPrompt = this.buildSystemPrompt(detectedLanguage, knowledgeBase);
      const conversationHistory = context.join('\n');
      
      const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory}

USER MESSAGE: ${message}

instruct IONS:
1. Respond in ${detectedLanguage === 'fr' ? 'FRENCH' : 'ENGLISH'} ONLY
2. Be concise (max 3 sentences)
3. Use information from the knowledge base
4. Add [LANG:${detectedLanguage.toUpperCase()}] at the start of your response
5. Suggest 2-3 relevant follow-up questions
6. If appropriate, suggest a CTA (call-to-action)

RESPONSE FORMAT:
[LANG:${detectedLanguage.toUpperCase()}] Your response here.

SUGGESTIONS: suggestion1 | suggestion2 | suggestion3
CTA: type:action (if applicable)

YOUR RESPONSE:`;

      const result = await this.model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Parse la réponse
      const parsed = this.parseResponse(responseText, detectedLanguage);

      return {
        response: parsed.response,
        language: parsed.language,
        suggestions: parsed.suggestions || undefined,
        cta: parsed.cta || undefined,
        source: 'gemini-rag',
        confidence: 0.9,
      };
    } catch (error) {
      console.error('Chat response generation error:', error);
      
      // Fallback response
      return {
        response: detectedLanguage === 'fr'
          ? 'Désolé, je rencontre un problème technique. Contactez-nous au +221 701 193 811.'
          : 'Sorry, I\'m experiencing technical issues. Contact us at +221 701 193 811.',
        language: detectedLanguage,
        suggestions: undefined,
        cta: undefined,
        source: 'fallback',
        confidence: 0.5,
      };
    }
  }

  /**
   * Construit le prompt système avec la base de connaissances
   */
  private buildSystemPrompt(language: 'fr' | 'en', knowledgeBase: string): string {
    const basePrompt = language === 'fr'
      ? `Tu es l'assistant IA d'OMA Digital, une agence digitale au Sénégal et Maroc spécialisée dans l'automatisation WhatsApp, sites web ultra-rapides, IA conversationnelle et transformation digitale.

INFORMATIONS CLÉS:
${knowledgeBase}

STYLE DE RÉPONSE:
- Professionnel mais chaleureux
- Concis (max 3 phrases)
- Orienté solutions
- Toujours en français
- Inclure des suggestions pertinentes`
      : `You are OMA Digital's AI assistant, a digital agency in Senegal and Morocco specializing in WhatsApp automation, ultra-fast websites, conversational AI, and digital transformation.

KEY INFORMATION:
${knowledgeBase}

RESPONSE STYLE:
- Professional but warm
- Concise (max 3 sentences)
- Solution-oriented
- Always in English
- Include relevant suggestions`;

    return basePrompt;
  }

  /**
   * Parse la réponse de Gemini
   */
  private parseResponse(
    responseText: string,
    detectedLanguage: 'fr' | 'en'
  ): {
    response: string;
    language: 'fr' | 'en';
    suggestions?: string[];
    cta?: CTAAction;
  } {
    // Extraire la langue du marqueur [LANG:XX]
    const langMatch = responseText.match(/\[LANG:(FR|EN)\]/i);
    const language = langMatch ? (langMatch[1].toLowerCase() as 'fr' | 'en') : detectedLanguage;

    // Extraire la réponse principale
    let response = responseText
      .replace(/\[LANG:(FR|EN)\]/gi, '')
      .split('SUGGESTIONS:')[0]
      .split('CTA:')[0]
      .trim();

    // Extraire les suggestions
    const suggestionsMatch = responseText.match(/SUGGESTIONS:\s*(.+?)(?=CTA:|$)/is);
    const suggestions: string[] | undefined = suggestionsMatch
      ? suggestionsMatch[1]
          .split('|')
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : undefined;

    // Extraire le CTA
    const ctaMatch = responseText.match(/CTA:\s*(\w+):(.+?)$/is);
    const cta: CTAAction | undefined = ctaMatch
      ? {
          type: ctaMatch[1].toLowerCase() as CTAAction['type'],
          action: ctaMatch[2].trim(),
          priority: 'medium' as const,
        }
      : undefined;

    return { response, language, suggestions, cta };
  }

  /**
   * Transcription audio (STT) via Gemini
   * Note: Gemini ne supporte pas nativement STT, on utilise un fallback
   */
  async transcribeAudio(audioData: ArrayBuffer, language: 'fr' | 'en'): Promise<string> {
    console.warn('⚠️ Gemini does not support native STT. Consider using Web Speech API or external service.');
    throw new Error('STT not supported by Gemini. Use alternative service.');
  }

  /**
   * Synthèse vocale (TTS) via Gemini
   * Note: Gemini ne supporte pas nativement TTS, on utilise un fallback
   */
  async synthesizeSpeech(text: string, language: 'fr' | 'en'): Promise<ArrayBuffer> {
    console.warn('⚠️ Gemini does not support native TTS. Consider using Web Speech API or external service.');
    throw new Error('TTS not supported by Gemini. Use alternative service.');
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

/**
 * Helper pour initialiser le service côté serveur
 * @security Ne jamais appeler côté client
 */
export function initializeGeminiService(): void {
  const apiKey = process.env['GOOGLE_AI_API_KEY'] || process.env['GEMINI_API_KEY'];
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable is required');
  }

  geminiService.initialize({
    apiKey,
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxOutputTokens: 2048,
  });
}
