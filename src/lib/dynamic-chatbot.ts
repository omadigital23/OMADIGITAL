/**
 * Chatbot Dynamique OMA Digital
 * Utilise les données réelles de Supabase pour des réponses contextuelles
 */

import { createClient } from '@supabase/supabase-js';

interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  language: 'fr' | 'en';
  keywords: string[];
  metadata?: any;
}

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  language: string;
  tags: string[];
  published_at: string;
}

interface ChatResponse {
  response: string;
  conversationId: string;
  language: 'fr' | 'en';
  source: string;
  confidence: number;
  relatedContent?: any[];
}

class DynamicChatbot {
  private supabase;

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
    
    // Mots-clés anglais
    const englishWords = ['hello', 'hi', 'what', 'how', 'price', 'cost', 'service', 'help', 'want', 'need', 'can', 'automation', 'website'];
    const frenchWords = ['bonjour', 'salut', 'quoi', 'comment', 'prix', 'coût', 'service', 'aide', 'veux', 'besoin', 'peux', 'automatisation', 'site'];
    
    const englishScore = englishWords.filter(word => lowerText.includes(word)).length;
    const frenchScore = frenchWords.filter(word => lowerText.includes(word)).length;
    
    return englishScore > frenchScore ? 'en' : 'fr';
  }

  /**
   * Détecte l'intention de l'utilisateur
   */
  private detectIntent(text: string, language: 'fr' | 'en'): string {
    const lowerText = text.toLowerCase();
    
    // Salutations
    if (language === 'en') {
      if (['hello', 'hi', 'hey', 'good morning', 'good evening'].some(g => lowerText.includes(g))) {
        return 'greeting';
      }
    } else {
      if (['bonjour', 'salut', 'bonsoir'].some(g => lowerText.includes(g))) {
        return 'greeting';
      }
    }
    
    // Services
    if (language === 'en') {
      if (['service', 'what do you do', 'automation', 'whatsapp', 'website', 'development'].some(k => lowerText.includes(k))) {
        return 'services';
      }
    } else {
      if (['service', 'que faites-vous', 'automatisation', 'whatsapp', 'site web', 'développement'].some(k => lowerText.includes(k))) {
        return 'services';
      }
    }
    
    // Prix
    if (language === 'en') {
      if (['price', 'cost', 'pricing', 'quote', 'budget', 'how much'].some(k => lowerText.includes(k))) {
        return 'pricing';
      }
    } else {
      if (['prix', 'tarif', 'coût', 'devis', 'budget', 'combien'].some(k => lowerText.includes(k))) {
        return 'pricing';
      }
    }
    
    // Contact
    if (language === 'en') {
      if (['contact', 'phone', 'email', 'appointment', 'meet'].some(k => lowerText.includes(k))) {
        return 'contact';
      }
    } else {
      if (['contact', 'téléphone', 'email', 'rendez-vous', 'rencontrer'].some(k => lowerText.includes(k))) {
        return 'contact';
      }
    }
    
    return 'general';
  }

  /**
   * Recherche dans la base de connaissances
   */
  private async searchKnowledgeBase(query: string, language: 'fr' | 'en', intent: string): Promise<KnowledgeBaseItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_base')
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Knowledge base search error:', error);
        return [];
      }

      if (!data) return [];

      // Filtrer par intention et mots-clés
      const queryWords = query.toLowerCase().split(' ');
      
      return data
        .filter((item: KnowledgeBaseItem) => {
          // Filtrer par catégorie selon l'intention
          const categoryMatch = this.matchCategoryToIntent(item.category, intent);
          
          // Calculer le score de pertinence
          const keywordScore = item.keywords?.filter(keyword => 
            queryWords.some(word => keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase()))
          ).length || 0;
          
          const contentScore = queryWords.filter(word => 
            item.content.toLowerCase().includes(word) || item.title.toLowerCase().includes(word)
          ).length;
          
          return categoryMatch && (keywordScore > 0 || contentScore > 0);
        })
        .sort((a, b) => {
          // Trier par pertinence
          const scoreA = this.calculateRelevanceScore(a, queryWords, intent);
          const scoreB = this.calculateRelevanceScore(b, queryWords, intent);
          return scoreB - scoreA;
        })
        .slice(0, 3); // Top 3 résultats
        
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  /**
   * Associe une catégorie à une intention
   */
  private matchCategoryToIntent(category: string, intent: string): boolean {
    const categoryIntentMap: Record<string, string[]> = {
      'services': ['services', 'general', 'greeting'],
      'pricing': ['pricing'],
      'contact': ['contact'],
      'faq': ['general', 'services', 'pricing'],
      'use_cases': ['services', 'general'],
      'technical': ['services', 'general']
    };
    
    return categoryIntentMap[category]?.includes(intent) || false;
  }

  /**
   * Calcule le score de pertinence
   */
  private calculateRelevanceScore(item: KnowledgeBaseItem, queryWords: string[], intent: string): number {
    let score = 0;
    
    // Score par catégorie
    if (item.category === intent) score += 10;
    
    // Score par mots-clés
    const keywordMatches = item.keywords?.filter(keyword => 
      queryWords.some(word => keyword.toLowerCase().includes(word))
    ).length || 0;
    score += keywordMatches * 5;
    
    // Score par contenu
    const contentMatches = queryWords.filter(word => 
      item.content.toLowerCase().includes(word) || item.title.toLowerCase().includes(word)
    ).length;
    score += contentMatches * 2;
    
    return score;
  }

  /**
   * Recherche dans les articles de blog
   */
  private async searchBlogArticles(query: string, language: 'fr' | 'en'): Promise<BlogArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_articles')
        .select('*')
        .eq('language', language)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Blog search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Blog search error:', error);
      return [];
    }
  }

  /**
   * Génère une réponse personnalisée
   */
  private generatePersonalizedResponse(
    intent: string, 
    language: 'fr' | 'en', 
    knowledgeItems: KnowledgeBaseItem[],
    blogArticles: BlogArticle[]
  ): string {
    
    if (knowledgeItems.length === 0) {
      return this.getFallbackResponse(intent, language);
    }

    const primaryItem = knowledgeItems[0];
    let response = primaryItem.content;

    // Ajouter des articles de blog pertinents
    if (blogArticles.length > 0 && intent === 'services') {
      const blogSection = language === 'en' 
        ? '\n\n📖 Related articles:'
        : '\n\n📖 Articles connexes :';
      
      response += blogSection;
      blogArticles.slice(0, 2).forEach(article => {
        response += `\n• ${article.title}`;
      });
    }

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
        greeting: '\n\n🚀 Comment puis-je vous aider à transformer votre business aujourd\'hui ?',
        services: '\n\n📞 Intéressé ? Contactez-nous : +212 701 193 811',
        pricing: '\n\n💰 Devis gratuit sous 24h : +212 701 193 811',
        contact: '\n\n📱 Nous sommes là pour vous aider !',
        general: '\n\n✨ Besoin de plus d\'infos ? Appelez-nous : +212 701 193 811'
      },
      en: {
        greeting: '\n\n🚀 How can I help transform your business today?',
        services: '\n\n📞 Interested? Contact us: +212 701 193 811',
        pricing: '\n\n💰 Free quote within 24h: +212 701 193 811',
        contact: '\n\n📱 We\'re here to help!',
        general: '\n\n✨ Need more info? Call us: +212 701 193 811'
      }
    };

    return ctas[language][intent as keyof typeof ctas.fr] || ctas[language].general;
  }

  /**
   * Réponse de fallback
   */
  private getFallbackResponse(intent: string, language: 'fr' | 'en'): string {
    const fallbacks = {
      fr: {
        greeting: 'Bonjour ! 👋 Je suis l\'assistant IA d\'OMA Digital.\n\nNous aidons les PME sénégalaises avec :\n🤖 Automatisation WhatsApp\n🚀 Sites web ultra-rapides\n📊 Transformation digitale\n\nComment puis-je vous aider ?',
        services: 'OMA Digital propose des solutions complètes :\n\n🤖 Automatisation WhatsApp (50 000 CFA/mois)\n🚀 Sites web modernes et rapides\n📱 Applications mobiles\n📊 Transformation digitale\n\nROI garanti de 200% en 6 mois !\n\n📞 +212 701 193 811',
        pricing: 'Nos tarifs démarrent à 50 000 CFA/mois pour l\'automatisation WhatsApp.\n\n💰 Devis personnalisé gratuit\n📈 ROI moyen de 200% en 6 mois\n💳 Paiement flexible\n🎯 Adapté aux PME sénégalaises\n\n📞 +212 701 193 811',
        contact: 'Contactez OMA Digital :\n\n📞 +212 701 193 811\n📧 omasenegal25@gmail.com\n📍 Liberté 6, Dakar\n\n🕒 Lun-Ven: 9h-18h\n⚡ Support 24/7\n💬 Réponse sous 2h',
        general: 'Je suis là pour vous aider avec vos projets digitaux !\n\nOMA Digital vous accompagne dans :\n✨ Automatisation business\n🚀 Développement web/mobile\n📊 Transformation digitale\n\n📞 +212 701 193 811'
      },
      en: {
        greeting: 'Hello! 👋 I\'m OMA Digital\'s AI assistant.\n\nWe help Senegalese SMEs with:\n🤖 WhatsApp Automation\n🚀 Ultra-fast Websites\n📊 Digital Transformation\n\nHow can I help you?',
        services: 'OMA Digital offers complete solutions:\n\n🤖 WhatsApp Automation (50,000 CFA/month)\n🚀 Modern and fast websites\n📱 Mobile applications\n📊 Digital transformation\n\nGuaranteed 200% ROI in 6 months!\n\n📞 +212 701 193 811',
        pricing: 'Our rates start at 50,000 CFA/month for WhatsApp automation.\n\n💰 Free personalized quote\n📈 Average ROI of 200% in 6 months\n💳 Flexible payment\n🎯 Adapted to Senegalese SMEs\n\n📞 +212 701 193 811',
        contact: 'Contact OMA Digital:\n\n📞 +212 701 193 811\n📧 omasenegal25@gmail.com\n📍 Liberté 6, Dakar\n\n🕒 Mon-Fri: 9am-6pm\n⚡ 24/7 Support\n💬 Response within 2h',
        general: 'I\'m here to help with your digital projects!\n\nOMA Digital supports you with:\n✨ Business automation\n🚀 Web/mobile development\n📊 Digital transformation\n\n📞 +212 701 193 811'
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
            session_id: sessionId,
            language,
            context: { intent },
            metadata: { created_by: 'dynamic_chatbot' }
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
          metadata: { intent, source: 'dynamic_chatbot' }
        }
      ]);

      return conversation.id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return sessionId;
    }
  }

  /**
   * Traite un message utilisateur
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
      
      console.log('🎯 Dynamic chatbot processing:', { message: message.substring(0, 30), language, intent });
      
      // Rechercher dans la base de connaissances
      const knowledgeItems = await this.searchKnowledgeBase(message, language, intent);
      
      // Rechercher dans les articles de blog
      const blogArticles = await this.searchBlogArticles(message, language);
      
      // Générer la réponse
      const response = this.generatePersonalizedResponse(intent, language, knowledgeItems, blogArticles);
      
      // Sauvegarder la conversation
      const conversationId = await this.saveConversation(sessionId, message, response, language, intent);
      
      // Calculer la confiance
      const confidence = knowledgeItems.length > 0 ? 0.9 : 0.7;
      
      return {
        response,
        conversationId,
        language,
        source: knowledgeItems.length > 0 ? 'knowledge_base' : 'fallback',
        confidence,
        relatedContent: [...knowledgeItems, ...blogArticles]
      };
      
    } catch (error) {
      console.error('Dynamic chatbot error:', error);
      
      // Fallback d'urgence
      const language = this.detectLanguage(message);
      const intent = this.detectIntent(message, language);
      
      return {
        response: this.getFallbackResponse(intent, language),
        conversationId: sessionId,
        language,
        source: 'emergency_fallback',
        confidence: 0.5
      };
    }
  }
}

export const dynamicChatbot = new DynamicChatbot();