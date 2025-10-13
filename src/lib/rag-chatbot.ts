/**
 * Chatbot RAG Intelligent avec Google AI Studio
 * Système de Retrieval-Augmented Generation pour OMA Digital
 */

import { createClient } from '@supabase/supabase-js';

interface ChatResponse {
  response: string;
  conversationId: string;
  language: 'fr' | 'en';
  source: string;
  confidence: number;
  retrievedContext?: string[];
}

interface KnowledgeItem {
  title: string;
  content: string;
  keywords: string[];
}

class RAGChatbot {
  private supabase;
  private knowledgeCache: any = null;
  private googleAIKey: string;

  constructor() {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
    this.googleAIKey = process.env['GOOGLE_AI_API_KEY'] || '';
  }

  /**
   * Détection de langue avancée avec scoring
   */
  private detectLanguage(text: string): 'fr' | 'en' {
    const lowerText = text.toLowerCase().trim();
    
    // Salutations prioritaires (score élevé)
    const englishGreetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'];
    const frenchGreetings = ['bonjour', 'salut', 'bonsoir', 'bonne soirée', 'bonne journée'];
    
    for (const greeting of englishGreetings) {
      if (lowerText === greeting || lowerText.startsWith(greeting + ' ') || lowerText.endsWith(' ' + greeting)) {
        return 'en';
      }
    }
    
    for (const greeting of frenchGreetings) {
      if (lowerText === greeting || lowerText.startsWith(greeting + ' ') || lowerText.endsWith(' ' + greeting)) {
        return 'fr';
      }
    }
    
    // Mots-clés avec scoring pondéré
    const englishIndicators = {
      high: ['website', 'mobile app', 'chatbot', 'automation', 'digital marketing', 'what do you do', 'services'],
      medium: ['hello', 'what', 'how', 'can', 'help', 'need', 'want', 'create', 'build'],
      low: ['the', 'a', 'an', 'in', 'on', 'at', 'for', 'with', 'you', 'i', 'we', 'they']
    };
    
    const frenchIndicators = {
      high: ['site web', 'application mobile', 'chatbot', 'automatisation', 'marketing digital', 'que faites-vous', 'services'],
      medium: ['bonjour', 'que', 'comment', 'pouvez', 'aide', 'besoin', 'veux', 'créer', 'construire'],
      low: ['le', 'la', 'les', 'un', 'une', 'dans', 'sur', 'pour', 'avec', 'vous', 'je', 'nous']
    };
    
    let englishScore = 0;
    let frenchScore = 0;
    
    // Calcul du score anglais
    englishIndicators['high'].forEach(word => {
      if (lowerText.includes(word)) englishScore += 10;
    });
    englishIndicators['medium'].forEach(word => {
      if (lowerText.includes(word)) englishScore += 5;
    });
    englishIndicators['low'].forEach(word => {
      if (lowerText.includes(word)) englishScore += 1;
    });
    
    // Calcul du score français
    frenchIndicators['high'].forEach(word => {
      if (lowerText.includes(word)) frenchScore += 10;
    });
    frenchIndicators['medium'].forEach(word => {
      if (lowerText.includes(word)) frenchScore += 5;
    });
    frenchIndicators['low'].forEach(word => {
      if (lowerText.includes(word)) frenchScore += 1;
    });
    
    // Patterns linguistiques spécifiques
    const frenchPatterns = [/\bqu['']/, /\bc['']est/, /\bj['']ai/, /\bn['']/, /\bl['']/, /tion\b/, /ment\b/];
    const englishPatterns = [/\bi['']m\b/, /\byou['']re\b/, /\bit['']s\b/, /\bdon['']t\b/, /ing\b/];
    
    frenchPatterns.forEach(pattern => {
      if (pattern.test(lowerText)) frenchScore += 3;
    });
    
    englishPatterns.forEach(pattern => {
      if (pattern.test(lowerText)) englishScore += 3;
    });
    
    console.log('🌍 Language detection:', { text: text.substring(0, 30), englishScore, frenchScore });
    
    return englishScore > frenchScore ? 'en' : 'fr';
  }

  /**
   * Récupération de la base de connaissances
   */
  private async getKnowledgeBase(): Promise<any> {
    if (this.knowledgeCache) {
      return this.knowledgeCache;
    }

    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select('metadata')
        .eq('session_id', 'oma_digital_knowledge_base')
        .single();

      if (error || !data) {
        console.warn('Knowledge base not found');
        return null;
      }

      this.knowledgeCache = data.metadata;
      return this.knowledgeCache;
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      return null;
    }
  }

  /**
   * Recherche sémantique dans la base de connaissances (RAG Retrieval)
   */
  private async retrieveRelevantContext(query: string, language: 'fr' | 'en'): Promise<KnowledgeItem[]> {
    const knowledge = await this.getKnowledgeBase();
    
    if (!knowledge) {
      return [];
    }

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const relevantItems: Array<KnowledgeItem & { score: number }> = [];

    // Recherche dans toutes les entrées de la langue appropriée
    Object.keys(knowledge).forEach(key => {
      const item = knowledge[key];
      
      // Filtrer par langue
      if (!key.endsWith(`_${language}`)) {
        return;
      }

      let score = 0;
      const itemText = (item.title + ' ' + item.content + ' ' + item.keywords.join(' ')).toLowerCase();

      // Score basé sur les mots-clés exacts
      queryWords.forEach(word => {
        const wordCount = (itemText.match(new RegExp(word, 'g')) || []).length;
        score += wordCount * 10;
      });

      // Score basé sur les mots-clés de l'item
      item.keywords.forEach((keyword: string) => {
        queryWords.forEach(word => {
          if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
            score += 15;
          }
        });
      });

      // Score basé sur la similarité sémantique simple
      const titleWords = item.title.toLowerCase().split(/\s+/);
      queryWords.forEach(word => {
        titleWords.forEach((titleWord: string) => {
          if (titleWord.includes(word) || word.includes(titleWord)) {
            score += 8;
          }
        });
      });

      if (score > 0) {
        relevantItems.push({
          title: item.title,
          content: item.content,
          keywords: item.keywords,
          score
        });
      }
    });

    // Trier par score et retourner les 3 meilleurs
    return relevantItems
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        content: item.content,
        keywords: item.keywords
      }));
  }

  /**
   * Génération de réponse avec Google AI Studio (RAG Generation)
   */
  private async generateRAGResponse(
    query: string, 
    language: 'fr' | 'en', 
    context: KnowledgeItem[]
  ): Promise<string> {
    
    if (!this.googleAIKey) {
      console.warn('Google AI Studio API key not configured, using context-based response');
      return this.generateContextBasedResponse(query, language, context);
    }

    try {
      // Construire le contexte pour Google AI
      const contextText = context.map(item => 
        `${item.title}:\n${item.content}`
      ).join('\n\n');

      const systemPrompt = language === 'fr' 
        ? `Tu es l'assistant IA officiel d'OMA Digital, spécialisé dans les solutions technologiques pour PME sénégalaises. 

CONTEXTE OFFICIEL OMA DIGITAL:
${contextText}

INSTRUCTIONS:
- Réponds UNIQUEMENT en français
- Utilise le contexte fourni pour répondre précisément
- Reste professionnel et enthousiaste
- Mentionne les bénéfices concrets pour les PME
- Si la question sort du contexte, redirige vers les services OMA
- Termine par un appel à l'action approprié
- Sois concis mais informatif (max 200 mots)`
        : `You are the official AI assistant of OMA Digital, specialized in technological solutions for Senegalese SMEs.

OFFICIAL OMA DIGITAL CONTEXT:
${contextText}

INSTRUCTIONS:
- Respond ONLY in English
- Use the provided context to answer precisely
- Stay professional and enthusiastic
- Mention concrete benefits for SMEs
- If the question is outside context, redirect to OMA services
- End with an appropriate call to action
- Be concise but informative (max 200 words)`;

      const userMessage = language === 'fr'
        ? `Question du client: ${query}`
        : `Client question: ${query}`;

      // Appel à Google AI Studio (Gemini)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.googleAIKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        console.log('🤖 RAG response generated successfully');
        return generatedText.trim();
      } else {
        throw new Error('No response generated');
      }

    } catch (error) {
      console.error('Google AI Studio error:', error);
      return this.generateContextBasedResponse(query, language, context);
    }
  }

  /**
   * Réponse basée sur le contexte (fallback)
   */
  private generateContextBasedResponse(query: string, language: 'fr' | 'en', context: KnowledgeItem[]): string {
    if (context.length === 0) {
      return language === 'fr'
        ? 'OMA Digital est votre partenaire de croissance digitale pour PME sénégalaises. Nous proposons des sites web, applications mobiles, chatbots et marketing digital. Comment puis-je vous aider avec votre projet ?'
        : 'OMA Digital is your digital growth partner for Senegalese SMEs. We offer websites, mobile apps, chatbots and digital marketing. How can I help with your project?';
    }

    // Utiliser le contexte le plus pertinent
    const primaryContext = context[0];
    let response = primaryContext.content;

    // Ajouter un CTA approprié
    const cta = language === 'fr'
      ? '\n\n💡 Intéressé par nos solutions ? Contactez OMA Digital pour une consultation gratuite !'
      : '\n\n💡 Interested in our solutions? Contact OMA Digital for a free consultation!';

    return response + cta;
  }

  /**
   * Sauvegarde de la conversation avec métadonnées RAG
   */
  private async saveConversation(
    sessionId: string,
    userMessage: string,
    botResponse: string,
    language: 'fr' | 'en',
    retrievedContext: KnowledgeItem[]
  ): Promise<string> {
    try {
      let { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (convError || !conversation) {
        const { data: newConv, error: newConvError } = await this.supabase
          .from('conversations')
          .insert({
            user_id: 'anonymous',
            session_id: sessionId,
            language,
            context: { 
              type: 'rag_conversation',
              retrieved_items: retrievedContext.length
            },
            metadata: { 
              created_by: 'rag_chatbot',
              google_ai_used: !!this.googleAIKey
            }
          })
          .select('id')
          .single();

        if (newConvError) {
          console.error('Error creating conversation:', newConvError);
          return sessionId;
        }
        conversation = newConv;
      }

      // Sauvegarder les messages avec contexte RAG
      await this.supabase.from('messages').insert([
        {
          conversation_id: conversation.id,
          content: userMessage,
          sender: 'user',
          language,
          metadata: { 
            input_type: 'user_query',
            language_detected: language
          }
        },
        {
          conversation_id: conversation.id,
          content: botResponse,
          sender: 'bot',
          language,
          metadata: { 
            source: 'rag_system',
            retrieved_context_count: retrievedContext.length,
            context_titles: retrievedContext.map(c => c.title),
            google_ai_used: !!this.googleAIKey
          }
        }
      ]);

      return conversation.id;
    } catch (error) {
      console.error('Error saving RAG conversation:', error);
      return sessionId;
    }
  }

  /**
   * Traitement principal du message avec système RAG
   */
  async processMessage(
    message: string,
    sessionId: string,
    inputMethod: 'text' | 'voice' = 'text'
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Détection de langue avancée
      const language = this.detectLanguage(message);
      
      console.log('🎯 RAG Chatbot processing:', {
        message: message.substring(0, 50),
        language,
        inputMethod,
        timestamp: new Date().toISOString()
      });

      // 2. Retrieval - Recherche du contexte pertinent
      const retrievedContext = await this.retrieveRelevantContext(message, language);
      
      console.log('📚 Retrieved context:', {
        count: retrievedContext.length,
        titles: retrievedContext.map(c => c.title)
      });

      // 3. Generation - Génération de la réponse avec IA
      const response = await this.generateRAGResponse(message, language, retrievedContext);

      // 4. Sauvegarde avec métadonnées
      const conversationId = await this.saveConversation(
        sessionId,
        message,
        response,
        language,
        retrievedContext
      );

      const processingTime = Date.now() - startTime;
      console.log(`⚡ RAG processing completed in ${processingTime}ms`);

      return {
        response,
        conversationId,
        language,
        source: retrievedContext.length > 0 ? 'rag_system' : 'fallback',
        confidence: retrievedContext.length > 0 ? 0.98 : 0.85,
        retrievedContext: retrievedContext.map(c => c.title)
      };

    } catch (error) {
      console.error('RAG Chatbot error:', error);
      
      // Fallback d'urgence
      const language = this.detectLanguage(message);
      const fallbackResponse = language === 'fr'
        ? 'OMA Digital vous accompagne dans votre transformation digitale ! Nous créons des sites web, applications mobiles, chatbots et stratégies marketing pour PME sénégalaises. Comment puis-je vous aider ?'
        : 'OMA Digital supports your digital transformation! We create websites, mobile apps, chatbots and marketing strategies for Senegalese SMEs. How can I help you?';

      return {
        response: fallbackResponse,
        conversationId: sessionId,
        language,
        source: 'emergency_fallback',
        confidence: 0.7
      };
    }
  }
}

export const ragChatbot = new RAGChatbot();