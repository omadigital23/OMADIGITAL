/**
 * Chatbot avec Données Réelles OMA Digital
 * Utilise les données configurées dans Supabase
 */

import { createClient } from '@supabase/supabase-js';

interface ChatResponse {
  response: string;
  conversationId: string;
  language: 'fr' | 'en';
  source: string;
  confidence: number;
}

class RealDataChatbot {
  private supabase;
  private knowledgeCache: any = null;

  constructor() {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  /**
   * Détecte la langue du message
   */
  private detectLanguage(text: string): 'fr' | 'en' {
    const lowerText = text.toLowerCase().trim();
    
    // Salutations prioritaires
    const englishGreetings = ['hello', 'hi', 'hey', 'good morning', 'good evening'];
    const frenchGreetings = ['bonjour', 'salut', 'bonsoir'];
    
    for (const greeting of englishGreetings) {
      if (lowerText === greeting || lowerText.startsWith(greeting + ' ')) {
        return 'en';
      }
    }
    
    for (const greeting of frenchGreetings) {
      if (lowerText === greeting || lowerText.startsWith(greeting + ' ')) {
        return 'fr';
      }
    }
    
    // Mots-clés anglais/français
    const englishWords = ['hello', 'what', 'how', 'price', 'cost', 'service', 'help', 'want', 'need', 'can', 'automation', 'website'];
    const frenchWords = ['bonjour', 'que', 'comment', 'prix', 'coût', 'service', 'aide', 'veux', 'besoin', 'peux', 'automatisation', 'site'];
    
    const englishScore = englishWords.filter(word => lowerText.includes(word)).length;
    const frenchScore = frenchWords.filter(word => lowerText.includes(word)).length;
    
    return englishScore > frenchScore ? 'en' : 'fr';
  }

  /**
   * Détecte l'intention de l'utilisateur (basée sur les services officiels OMA)
   */
  private detectIntent(text: string, language: 'fr' | 'en'): string {
    const lowerText = text.toLowerCase();
    
    // Salutations - rediriger vers présentation
    if (language === 'en') {
      if (['hello', 'hi', 'hey', 'good morning', 'good evening'].some(g => lowerText.includes(g))) {
        return 'presentation';
      }
    } else {
      if (['bonjour', 'salut', 'bonsoir'].some(g => lowerText.includes(g))) {
        return 'presentation';
      }
    }
    
    // Sites web
    if (language === 'en') {
      if (['website', 'site', 'web', 'online presence', 'seo', 'local seo'].some(k => lowerText.includes(k))) {
        return 'websites';
      }
    } else {
      if (['site', 'web', 'site web', 'présence en ligne', 'référencement', 'seo'].some(k => lowerText.includes(k))) {
        return 'sites_web';
      }
    }
    
    // Applications mobiles
    if (language === 'en') {
      if (['mobile', 'app', 'application', 'smartphone', 'mobile app'].some(k => lowerText.includes(k))) {
        return 'mobile_apps';
      }
    } else {
      if (['mobile', 'application', 'app', 'smartphone', 'application mobile'].some(k => lowerText.includes(k))) {
        return 'applications_mobiles';
      }
    }
    
    // Chatbots et automatisation
    if (language === 'en') {
      if (['chatbot', 'automation', 'whatsapp', 'support', 'customer service', 'bot'].some(k => lowerText.includes(k))) {
        return 'chatbots';
      }
    } else {
      if (['chatbot', 'automatisation', 'whatsapp', 'support', 'service client', 'bot'].some(k => lowerText.includes(k))) {
        return 'chatbots';
      }
    }
    
    // Marketing digital
    if (language === 'en') {
      if (['marketing', 'digital marketing', 'social media', 'advertising', 'campaigns'].some(k => lowerText.includes(k))) {
        return 'digital_marketing';
      }
    } else {
      if (['marketing', 'marketing digital', 'réseaux sociaux', 'publicité', 'campagnes'].some(k => lowerText.includes(k))) {
        return 'marketing_digital';
      }
    }
    
    // Services généraux
    if (language === 'en') {
      if (['service', 'what do you do', 'what do you offer', 'services', 'solutions'].some(k => lowerText.includes(k))) {
        return 'services';
      }
    } else {
      if (['service', 'que faites-vous', 'que proposez-vous', 'services', 'solutions'].some(k => lowerText.includes(k))) {
        return 'services';
      }
    }
    
    // Contact
    if (language === 'en') {
      if (['contact', 'reach', 'consultation', 'discuss', 'project'].some(k => lowerText.includes(k))) {
        return 'contact';
      }
    } else {
      if (['contact', 'contacter', 'consultation', 'discuter', 'projet'].some(k => lowerText.includes(k))) {
        return 'contact';
      }
    }
    
    // Par défaut, présenter OMA Digital
    return language === 'en' ? 'presentation' : 'presentation';
  }

  /**
   * Récupère les données de la knowledge base
   */
  private async getKnowledgeData(): Promise<any> {
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
        console.warn('Knowledge base not found, using fallback');
        return null;
      }

      this.knowledgeCache = data.metadata;
      return this.knowledgeCache;
    } catch (error) {
      console.error('Error fetching knowledge data:', error);
      return null;
    }
  }

  /**
   * Recherche dans les données réelles
   */
  private async searchRealData(intent: string, language: 'fr' | 'en'): Promise<any> {
    const knowledge = await this.getKnowledgeData();
    
    if (!knowledge) {
      return null;
    }

    const key = `${intent}_${language}`;
    return knowledge[key] || null;
  }

  /**
   * Génère une réponse personnalisée avec les données réelles
   */
  private generateRealResponse(intent: string, language: 'fr' | 'en', data: any): string {
    if (!data) {
      return this.getFallbackResponse(intent, language);
    }

    let response = data.content;

    // Ajouter un CTA personnalisé
    response += this.getPersonalizedCTA(intent, language);

    return response;
  }

  /**
   * Génère un CTA personnalisé selon l'intention
   */
  private getPersonalizedCTA(intent: string, language: 'fr' | 'en'): string {
    const ctas = {
      fr: {
        services: '\n\n🚀 Intéressé par nos solutions ? Contactez-nous : +212 701 193 811',
        pricing: '\n\n💰 Devis gratuit personnalisé : +212 701 193 811',
        contact: '\n\n📱 Nous sommes là pour vous accompagner !',
        general: '\n\n✨ Plus d\'infos ? Appelez-nous : +212 701 193 811'
      },
      en: {
        services: '\n\n🚀 Interested in our solutions? Contact us: +212 701 193 811',
        pricing: '\n\n💰 Free personalized quote: +212 701 193 811',
        contact: '\n\n📱 We\'re here to support you!',
        general: '\n\n✨ More info? Call us: +212 701 193 811'
      }
    };

    return ctas[language][intent as keyof typeof ctas.fr] || ctas[language].general;
  }

  /**
   * Réponse de fallback si pas de données réelles
   */
  private getFallbackResponse(intent: string, language: 'fr' | 'en'): string {
    const fallbacks = {
      fr: {
        services: 'OMA Digital propose des solutions complètes d\'automatisation WhatsApp pour PME sénégalaises :\n\n🤖 Chatbots intelligents 24/7\n🚀 Sites web ultra-rapides\n📊 Transformation digitale\n💰 À partir de 50 000 CFA/mois\n\n📞 +212 701 193 811',
        pricing: 'Nos tarifs démarrent à 50 000 CFA/mois pour l\'automatisation WhatsApp.\n\n💰 Devis personnalisé gratuit\n📈 ROI garanti 200% en 6 mois\n💳 Paiement flexible\n\n📞 +212 701 193 811',
        contact: 'Contactez OMA Digital :\n\n📞 +212 701 193 811\n📧 omadigital23@gmail.com\n📍 Liberté 6, Dakar\n\n🕒 Lun-Ven: 8h-18h\n⚡ Support 24/7',
        general: 'OMA Digital vous accompagne dans votre transformation digitale !\n\n✨ Automatisation WhatsApp\n🚀 Développement web/mobile\n📊 Solutions sur mesure\n\n📞 +212 701 193 811'
      },
      en: {
        services: 'OMA Digital offers complete WhatsApp automation solutions for Senegalese SMEs:\n\n🤖 24/7 intelligent chatbots\n🚀 Ultra-fast websites\n📊 Digital transformation\n💰 Starting at 50,000 CFA/month\n\n📞 +212 701 193 811',
        pricing: 'Our rates start at 50,000 CFA/month for WhatsApp automation.\n\n💰 Free personalized quote\n📈 Guaranteed 200% ROI in 6 months\n💳 Flexible payment\n\n📞 +212 701 193 811',
        contact: 'Contact OMA Digital:\n\n📞 +212 701 193 811\n📧 omadigital23@gmail.com\n📍 Liberté 6, Dakar\n\n🕒 Mon-Fri: 8am-6pm\n⚡ 24/7 Support',
        general: 'OMA Digital supports you in your digital transformation!\n\n✨ WhatsApp automation\n🚀 Web/mobile development\n📊 Custom solutions\n\n📞 +212 701 193 811'
      }
    };

    return fallbacks[language][intent as keyof typeof fallbacks.fr] || fallbacks[language].general;
  }

  /**
   * Sauvegarde la conversation
   */
  private async saveConversation(
    sessionId: string, 
    userMessage: string, 
    botResponse: string, 
    language: 'fr' | 'en',
    intent: string
  ): Promise<string> {
    try {
      // Créer ou récupérer la conversation
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
            context: { intent },
            metadata: { created_by: 'real_data_chatbot' }
          })
          .select('id')
          .single();

        if (newConvError) {
          console.error('Error creating conversation:', newConvError);
          return sessionId;
        }
        conversation = newConv;
      }

      // Sauvegarder les messages
      await this.supabase.from('messages').insert([
        {
          conversation_id: conversation.id,
          content: userMessage,
          sender: 'user',
          language,
          metadata: { intent }
        },
        {
          conversation_id: conversation.id,
          content: botResponse,
          sender: 'bot',
          language,
          metadata: { intent, source: 'real_data_chatbot' }
        }
      ]);

      return conversation.id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return sessionId;
    }
  }

  /**
   * Traite un message utilisateur avec données réelles
   */
  async processMessage(
    message: string, 
    sessionId: string, 
    inputMethod: 'text' | 'voice' = 'text'
  ): Promise<ChatResponse> {
    try {
      // Détecter la langue
      const language = this.detectLanguage(message);
      
      // Détecter l'intention
      const intent = this.detectIntent(message, language);
      
      console.log('🎯 Real data chatbot processing:', { 
        message: message.substring(0, 30), 
        language, 
        intent 
      });
      
      // Rechercher dans les données réelles
      const realData = await this.searchRealData(intent, language);
      
      // Générer la réponse
      const response = this.generateRealResponse(intent, language, realData);
      
      // Sauvegarder la conversation
      const conversationId = await this.saveConversation(sessionId, message, response, language, intent);
      
      // Calculer la confiance
      const confidence = realData ? 0.95 : 0.8;
      const source = realData ? 'real_data' : 'fallback';
      
      return {
        response,
        conversationId,
        language,
        source,
        confidence
      };
      
    } catch (error) {
      console.error('Real data chatbot error:', error);
      
      // Fallback d'urgence
      const language = this.detectLanguage(message);
      const intent = this.detectIntent(message, language);
      
      return {
        response: this.getFallbackResponse(intent, language),
        conversationId: sessionId,
        language,
        source: 'emergency_fallback',
        confidence: 0.6
      };
    }
  }
}

export const realDataChatbot = new RealDataChatbot();