/**
 * Service de chatbot intelligent connecté à Supabase
 * Détection de langue, recherche sémantique, génération de réponses contextuelles
 */

import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env-public';
import { GOOGLE_AI_API_KEY } from './env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

export interface ChatMessage {
  id?: string;
  conversationId: string;
  content: string;
  sender: 'user' | 'bot';
  messageType: 'text' | 'voice' | 'image';
  language: 'fr' | 'en';
  confidence?: number;
  metadata?: any;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  language: 'fr' | 'en';
  context: any;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  language: 'fr' | 'en';
  keywords: string[];
  confidence?: number;
}

export class IntelligentChatbot {
  private googleAIKey: string;
  
  constructor() {
    this.googleAIKey = GOOGLE_AI_API_KEY;
  }

  /**
   * Détection intelligente de la langue
   */
  detectLanguage(text: string): 'fr' | 'en' {
    const lowerText = text.toLowerCase().trim();
    
    // Mots-clés français forts
    const strongFrench = [
      'bonjour', 'salut', 'bonsoir', 'merci', 'oui', 'non', 'comment', 'quoi', 'que', 'qui',
      'où', 'quand', 'pourquoi', 'combien', 'je suis', 'je veux', 'j\'ai', 'pouvez-vous',
      'êtes-vous', 'qu\'est-ce que', 'automatisation', 'prix', 'tarif', 'services'
    ];
    
    // Mots-clés anglais forts
    const strongEnglish = [
      'hello', 'hi', 'good morning', 'good evening', 'thank you', 'thanks', 'yes', 'no',
      'what', 'how', 'when', 'where', 'why', 'who', 'which', 'i am', 'i want', 'i need',
      'can you', 'do you', 'are you', 'what is', 'automation', 'price', 'cost', 'services'
    ];
    
    let frenchScore = 0;
    let englishScore = 0;
    
    // Scoring pondéré
    strongFrench.forEach(word => {
      if (lowerText.includes(word)) frenchScore += 2;
    });
    
    strongEnglish.forEach(word => {
      if (lowerText.includes(word)) englishScore += 2;
    });
    
    // Cas spéciaux
    if (lowerText.startsWith('hello') || lowerText.startsWith('hi ')) return 'en';
    if (lowerText.startsWith('bonjour') || lowerText.startsWith('salut')) return 'fr';
    
    return englishScore > frenchScore ? 'en' : 'fr';
  }

  /**
   * Détection d'intention utilisateur
   */
  detectIntent(message: string, language: 'fr' | 'en'): string {
    const lowerMessage = message.toLowerCase();
    
    // Intentions communes
    const intents = {
      greeting: language === 'fr' 
        ? ['bonjour', 'salut', 'bonsoir', 'hello']
        : ['hello', 'hi', 'good morning', 'good evening'],
      
      services: language === 'fr'
        ? ['service', 'que faites-vous', 'quels services', 'automatisation', 'whatsapp']
        : ['service', 'what do you do', 'what services', 'automation', 'whatsapp'],
      
      pricing: language === 'fr'
        ? ['prix', 'tarif', 'coût', 'combien', 'devis']
        : ['price', 'cost', 'pricing', 'how much', 'quote'],
      
      contact: language === 'fr'
        ? ['contact', 'téléphone', 'email', 'joindre', 'rendez-vous']
        : ['contact', 'phone', 'email', 'reach', 'appointment'],
      
      technical: language === 'fr'
        ? ['comment ça marche', 'technique', 'installation', 'formation']
        : ['how it works', 'technical', 'installation', 'training']
    };
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  /**
   * Recherche dans la base de connaissances
   */
  async searchKnowledgeBase(query: string, language: 'fr' | 'en', limit: number = 3): Promise<KnowledgeBaseItem[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .textSearch('content', query, { type: 'websearch' })
        .limit(limit);

      if (error) {
        console.error('Knowledge base search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  /**
   * Génération de réponse avec IA
   */
  async generateAIResponse(
    userMessage: string, 
    language: 'fr' | 'en', 
    context: KnowledgeBaseItem[], 
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    if (!this.googleAIKey) {
      return this.getFallbackResponse(userMessage, language);
    }

    try {
      const systemPrompt = language === 'fr' ? `
Tu es l'assistant virtuel d'OMA Digital, spécialisé dans l'automatisation WhatsApp pour PME sénégalaises.

CONTEXTE ENTREPRISE:
- OMA Digital: Solutions d'automatisation WhatsApp et transformation digitale
- Marché: PME sénégalaises (restaurants, boutiques, services)
- Prix: 50 000 CFA/mois pour automatisation WhatsApp
- ROI garanti: 200% en 6 mois
- Contact: +212 701 193 811, omadigital23@gmail.com

INSTRUCTIONS:
1. Réponds UNIQUEMENT en français
2. Sois professionnel mais chaleureux
3. Mets en avant les bénéfices concrets (ROI, gain de temps, augmentation ventes)
4. Utilise les informations du contexte fourni
5. Encourage le contact direct pour les détails
6. Évite les sujets non liés à OMA Digital
7. Sois concis (max 150 mots)

CONTEXTE DISPONIBLE:
${context.map(item => `- ${item.title}: ${item.content}`).join('\n')}
` : `
You are OMA Digital's virtual assistant, specialized in WhatsApp automation for Senegalese SMEs.

COMPANY CONTEXT:
- OMA Digital: WhatsApp automation solutions and digital transformation
- Market: Senegalese SMEs (restaurants, shops, services)
- Price: 50,000 CFA/month for WhatsApp automation
- Guaranteed ROI: 200% in 6 months
- Contact: +212 701 193 811, omadigital23@gmail.com

INSTRUCTIONS:
1. Respond ONLY in English
2. Be professional but warm
3. Highlight concrete benefits (ROI, time savings, sales increase)
4. Use information from provided context
5. Encourage direct contact for details
6. Avoid topics unrelated to OMA Digital
7. Be concise (max 150 words)

AVAILABLE CONTEXT:
${context.map(item => `- ${item.title}: ${item.content}`).join('\n')}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleAIKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nQuestion utilisateur: ${userMessage}\n\nRéponds de manière personnalisée et utile:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedText?.trim()) {
          return generatedText.trim();
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
    }

    return this.getFallbackResponse(userMessage, language);
  }

  /**
   * Réponse de fallback intelligente
   */
  private getFallbackResponse(message: string, language: 'fr' | 'en'): string {
    const intent = this.detectIntent(message, language);
    
    if (language === 'fr') {
      switch (intent) {
        case 'greeting':
          return "Bonjour ! Je suis l'assistant d'OMA Digital. Nous spécialisons l'automatisation WhatsApp pour PME sénégalaises avec un ROI de 200%. Comment puis-je vous aider ?";
        
        case 'services':
          return "OMA Digital propose :\n\n• Automatisation WhatsApp (50 000 CFA/mois)\n• Développement web et mobile\n• Transformation digitale PME\n• ROI garanti 200% en 6 mois\n\nContactez-nous : +212 701 193 811";
        
        case 'pricing':
          return "Nos tarifs démarrent à 50 000 CFA/mois pour l'automatisation WhatsApp avec ROI garanti de 200%. Devis gratuit personnalisé. Contactez-nous : +212 701 193 811";
        
        case 'contact':
          return "Contactez OMA Digital :\n\n📞 +212 701 193 811\n📧 omadigital23@gmail.com\n🕒 Lun-Ven 9h-18h\n\nDevis gratuit sous 24h !";
        
        default:
          return "Merci pour votre message ! Pour une réponse personnalisée sur nos services d'automatisation WhatsApp, contactez-nous :\n\n📞 +212 701 193 811\n📧 omadigital23@gmail.com";
      }
    } else {
      switch (intent) {
        case 'greeting':
          return "Hello! I'm OMA Digital's assistant. We specialize in WhatsApp automation for Senegalese SMEs with 200% ROI. How can I help you?";
        
        case 'services':
          return "OMA Digital offers:\n\n• WhatsApp Automation (50,000 CFA/month)\n• Web and mobile development\n• Digital transformation for SMEs\n• Guaranteed 200% ROI in 6 months\n\nContact us: +212 701 193 811";
        
        case 'pricing':
          return "Our rates start at 50,000 CFA/month for WhatsApp automation with guaranteed 200% ROI. Free personalized quote. Contact us: +212 701 193 811";
        
        case 'contact':
          return "Contact OMA Digital:\n\n📞 +212 701 193 811\n📧 omadigital23@gmail.com\n🕒 Mon-Fri 9am-6pm\n\nFree quote within 24h!";
        
        default:
          return "Thank you for your message! For a personalized response about our WhatsApp automation services, contact us:\n\n📞 +212 701 193 811\n📧 omadigital23@gmail.com";
      }
    }
  }

  /**
   * Créer ou récupérer une conversation
   */
  async getOrCreateConversation(sessionId: string, language: 'fr' | 'en'): Promise<Conversation> {
    try {
      // Chercher conversation existante
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existing) {
        return existing;
      }

      // Créer nouvelle conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          session_id: sessionId,
          language,
          context: {},
          metadata: { created_by: 'chatbot' }
        })
        .select()
        .single();

      if (error) throw error;
      return newConversation;
    } catch (error) {
      console.error('Conversation error:', error);
      // Fallback conversation
      return {
        id: `fallback-${Date.now()}`,
        sessionId,
        language,
        context: {}
      };
    }
  }

  /**
   * Sauvegarder un message
   */
  async saveMessage(message: ChatMessage): Promise<void> {
    try {
      await supabase.from('messages').insert({
        conversation_id: message.conversationId,
        content: message.content,
        sender: message.sender,
        message_type: message.messageType,
        language: message['language'],
        confidence: message.confidence || 1.0,
        metadata: message.metadata || {}
      });
    } catch (error) {
      console.error('Save message error:', error);
    }
  }

  /**
   * Traitement principal du message
   */
  async processMessage(
    userMessage: string,
    sessionId: string,
    messageType: 'text' | 'voice' = 'text'
  ): Promise<{ response: string; language: 'fr' | 'en'; conversationId: string }> {
    try {
      // 1. Détecter la langue
      const language = this.detectLanguage(userMessage);
      
      // 2. Créer/récupérer conversation
      const conversation = await this.getOrCreateConversation(sessionId, language);
      
      // 3. Sauvegarder message utilisateur
      await this.saveMessage({
        conversationId: conversation.id,
        content: userMessage,
        sender: 'user',
        messageType,
        language,
        metadata: { intent: this.detectIntent(userMessage, language) }
      });
      
      // 4. Rechercher dans la base de connaissances
      const knowledgeContext = await this.searchKnowledgeBase(userMessage, language);
      
      // 5. Générer réponse IA
      const response = await this.generateAIResponse(userMessage, language, knowledgeContext);
      
      // 6. Sauvegarder réponse bot
      await this.saveMessage({
        conversationId: conversation.id,
        content: response,
        sender: 'bot',
        messageType: 'text',
        language,
        metadata: { 
          source: knowledgeContext.length > 0 ? 'knowledge_base' : 'ai_generated',
          context_items: knowledgeContext.length
        }
      });
      
      return {
        response,
        language,
        conversationId: conversation.id
      };
      
    } catch (error) {
      console.error('Process message error:', error);
      
      // Fallback
      const language = this.detectLanguage(userMessage);
      return {
        response: this.getFallbackResponse(userMessage, language),
        language,
        conversationId: `fallback-${Date.now()}`
      };
    }
  }
}

export const intelligentChatbot = new IntelligentChatbot();