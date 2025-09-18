/**
 * Chatbot RAG Ultra-Intelligent OMA Digital
 * Système avancé avec détection précise, réponses contextuelles et CTA intelligents
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseCacheFix } from './supabase-cache-fix';
import { MASTER_PROMPT } from './prompts/master-prompt';

interface ChatResponse {
  response: string;
  conversationId: string;
  language: 'fr' | 'en';
  source: string;
  confidence: number;
  suggestions: string[];
  cta?: {
    type: 'contact' | 'demo' | 'appointment' | 'quote';
    action: string;
    data?: any;
  };
}

interface IntentResult {
  intent: string;
  confidence: number;
  entities: string[];
}

interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  language: 'fr' | 'en';
  keywords: string[];
  embedding?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Use the imported master prompt
// const MASTER_PROMPT = MASTER_PROMPT; // Removed duplicate declaration - this line was causing a build error

class UltraIntelligentRAG {
  private supabase;
  private knowledgeCache: any = null;
  private googleAIKey: string;

  constructor() {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      db: { schema: 'public' },
      global: {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    });
    this.googleAIKey = process.env['GOOGLE_AI_API_KEY'] || '';
    
    // Initialize cache fix
    this.initializeCacheFix();
  }

  /**
   * Initialize cache fix system
   */
  private async initializeCacheFix(): Promise<void> {
    try {
      const result = await supabaseCacheFix.initialize();
      if (result.success) {
        console.log('✅ Cache fix initialized for Ultra-Intelligent RAG');
      } else {
        console.warn('⚠️ Cache fix initialization failed:', result.message);
      }
    } catch (error) {
      console.warn('⚠️ Cache fix initialization error:', error);
    }
  }

  /**
   * Détection de langue ultra-précise avec intégration Google AI Studio
   * Utilise exclusivement l'API Google pour la détection de langue
   */
  private async detectLanguageAdvanced(text: string): Promise<'fr' | 'en'> {
    const lowerText = text.toLowerCase().trim();
    
    // Patterns de salutations exactes (priorité maximale)
    const exactEnglishGreetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'];
    const exactFrenchGreetings = ['bonjour', 'salut', 'bonsoir', 'bonne soirée', 'bonne journée'];
    
    // Special handling for exact matches
    if (exactEnglishGreetings.includes(lowerText)) {
      return 'en';
    }
    
    if (exactFrenchGreetings.includes(lowerText)) {
      return 'fr';
    }
    
    // Check for greetings with additional text
    for (const greeting of exactEnglishGreetings) {
      if (lowerText.startsWith(greeting + ' ') || lowerText.endsWith(' ' + greeting)) {
        return 'en';
      }
    }
    
    for (const greeting of exactFrenchGreetings) {
      if (lowerText.startsWith(greeting + ' ') || lowerText.endsWith(' ' + greeting)) {
        return 'fr';
      }
    }

    // Enhanced detection for mixed-language scenarios
    // Count occurrences of language-specific words and phrases
    const frenchIndicators = [
      // Pronouns
      'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
      // Articles and determiners
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'dans', 'sur', 'sous', 'entre', 'chez', 'avec', 'pour', 'par', 'sans', 'vers', 'jusque', 'durant',
      // Common words
      'bonjour', 'salut', 'bonsoir', 'merci', 's\'il vous plaît', 'svp', 's\'il te plaît', 'stp', 'au revoir', 'à bientôt', 's\'il', 'plaît',
      'prix', 'devis', 'contact', 'site', 'web', 'internet', 'application', 'mobile', 'numéro', 'téléphone', 'email', 'e-mail', 'adresse',
      'comment', 'quoi', 'pourquoi', 'quand', 'où', 'qui', 'combien', 'combien ça coûte', 'combien coûtent', 'combien valent',
      'veux', 'voulez', 'voudriez', 'aimerais', 'aimerait', 'souhaite', 'souhaitez', 'souhaiterait',
      'créer', 'faire', 'avoir', 'être', 'aller', 'venir', 'partir', 'arriver', 'commencer', 'finir', 'terminer',
      'votre', 'vos', 'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'notre', 'nos', 'leur', 'leurs',
      'automatisation', 'whatsapp', 'business', 'entreprise', 'société', 'compagnie', 'organisation', 'association',
      'service', 'solution', 'tarif', 'coût', 'budget', 'gratuit', 'gratuite', 'gratuits', 'gratuites', 'payant', 'payante', 'payants', 'payantes',
      'rapide', 'rapides', 'efficace', 'efficaces', 'professionnel', 'professionnelle', 'professionnels', 'professionnelles', 'qualité', 'performance',
      'dakar', 'sénégal', 'afrique', 'fcfa', 'cfa', 'franc', 'francs', 'pme', 'startup', 'entrepreneur', 'entrepreneuse',
      'rendez-vous', 'rdv', 'meeting', 'réunion', 'consultation', 'conseil', 'conseils', 'assistance', 'aide', 'support'
    ];

    const englishIndicators = [
      // Pronouns
      'i', 'you', 'he', 'she', 'we', 'they', 'it',
      // Articles and determiners
      'the', 'a', 'an', 'this', 'that', 'these', 'those', 'in', 'on', 'at', 'by', 'for', 'with', 'without', 'from', 'to', 'of', 'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'during', 'except', 'inside', 'into', 'outside', 'over', 'through', 'throughout', 'till', 'toward', 'under', 'until', 'upon', 'within', 'without',
      // Common words
      'hello', 'hi', 'hey', 'good', 'morning', 'evening', 'afternoon', 'thanks', 'thank', 'please', 'goodbye', 'bye', 'see you', 'see you later',
      'price', 'quote', 'contact', 'website', 'internet', 'application', 'app', 'mobile', 'number', 'phone', 'email', 'e-mail', 'address',
      'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'will', 'do', 'does', 'did', 'have', 'has', 'had', 'get', 'got', 'gotten',
      'want', 'need', 'like', 'love', 'hate', 'prefer', 'enjoy', 'dislike',
      'create', 'make', 'have', 'get', 'go', 'come', 'leave', 'arrive', 'start', 'finish', 'end',
      'your', 'my', 'his', 'her', 'our', 'their', 'its',
      'automation', 'business', 'company', 'enterprise', 'corporation', 'organization', 'association',
      'service', 'solution', 'cost', 'budget', 'free', 'pricing', 'help', 'please', 'yes', 'no',
      'fast', 'quick', 'efficient', 'professional', 'quality', 'performance', 'about', 'more', 'less', 'better', 'worse',
      'senegal', 'africa', 'sme', 'startup', 'entrepreneur', 'digital', 'technology', 'whatsapp', 'website',
      'appointment', 'meeting', 'consultation', 'advice', 'assistance', 'help', 'support'
    ];

    // Count matches with weighted scoring
    let frenchScore = 0;
    let englishScore = 0;
    
    // Weight words based on their importance
    const getWordWeight = (word: string): number => {
      if (word.length > 6) return 3; // Longer words are more indicative
      if (word.length > 4) return 2;
      return 1;
    };

    frenchIndicators.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        frenchScore += matches.length * getWordWeight(word);
      }
    });

    englishIndicators.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        englishScore += matches.length * getWordWeight(word);
      }
    });

    // Additional patterns for French
    const frPatterns = [
      /\bqu['']/, // qu'est-ce, qu'il, etc.
      /\bc['']est/, // c'est
      /\bj['']ai/, // j'ai
      /\bn['']/, // n'est, n'ai, etc.
      /\bl['']/, // l'est, l'ai, etc.
      /\bd['']/, // d'habitude, d'accord, etc.
      /\bs['']/, // s'il, s'ils, etc.
      /\bça\b/, // ça
      /\bvoilà\b/, // voilà
      /\bmerci\b/, // merci
      /\bsvp\b/, // s'il vous plaît
      /\bstp\b/, // s'il te plaît
      /tion\b/, // words ending in -tion
      /ment\b/, // words ending in -ment
      /eur\b/, // words ending in -eur
      /euse\b/, // words ending in -euse
      /ais\b/, // words ending in -ais
      /ait\b/, // words ending in -ait
      /ons\b/, // words ending in -ons
      /ez\b/, // words ending in -ez
      /[àâäéèêëïîôöùûüÿç]/ // French accented characters
    ];

    // Additional patterns for English
    const enPatterns = [
      /\bi['']m\b/, // I'm
      /\byou['']re\b/, // you're
      /\bit['']s\b/, // it's
      /\bhe['']s\b/, // he's
      /\bshe['']s\b/, // she's
      /\bwe['']re\b/, // we're
      /\bthey['']re\b/, // they're
      /\bthat['']s\b/, // that's
      /\bthere['']s\b/, // there's
      /\bdon['']t\b/, // don't
      /\bcan['']t\b/, // can't
      /\bwon['']t\b/, // won't
      /\baren['']t\b/, // aren't
      /\bisn['']t\b/, // isn't
      /\bdoesn['']t\b/, // doesn't
      /\bdidn['']t\b/, // didn't
      /\bhaven['']t\b/, // haven't
      /\bhasn['']t\b/, // hasn't
      /\bhadn['']t\b/, // hadn't
      /\bwouldn['']t\b/, // wouldn't
      /\bcouldn['']t\b/, // couldn't
      /\bshouldn['']t\b/, // shouldn't
      /ing\b/, // words ending in -ing
      /tion\b/, // words ending in -tion (also in English)
      /\bthe\b/, // the (very common)
      /[aeiou]/ // English vowels
    ];

    // Count pattern matches with higher weight
    frPatterns.forEach(pattern => {
      const matches = lowerText.match(pattern);
      if (matches) {
        frenchScore += matches.length * 3;
      }
    });

    enPatterns.forEach(pattern => {
      const matches = lowerText.match(pattern);
      if (matches) {
        englishScore += matches.length * 3;
      }
    });

    // Special case: if message contains French accented characters but no English contractions, likely French
    const hasFrenchAccents = /[àâäéèêëïîôöùûüÿç]/.test(lowerText);
    const hasEnglishContractions = /\b\w+'(s|t|re|ve|ll|d|m|re)\b/.test(lowerText);

    if (hasFrenchAccents && !hasEnglishContractions) {
      frenchScore += 15;
    }

    // Special case: if message contains English contractions but no French accented characters, likely English
    if (hasEnglishContractions && !hasFrenchAccents) {
      englishScore += 15;
    }

    // Handle mixed-language scenarios - look at the dominant language in key phrases
    // Extract key phrases (3+ words) and detect language for each
    const phrases = lowerText.match(/\b(\w+\s+){2,}\w+\b/g) || [];
    if (phrases.length > 0) {
      let phraseFrenchScore = 0;
      let phraseEnglishScore = 0;
      
      phrases.forEach(phrase => {
        // Count indicators in each phrase
        frenchIndicators.forEach(word => {
          if (phrase.includes(word)) phraseFrenchScore += getWordWeight(word);
        });
        
        englishIndicators.forEach(word => {
          if (phrase.includes(word)) phraseEnglishScore += getWordWeight(word);
        });
      });
      
      // If phrases show a strong language preference, boost that language's score
      if (Math.abs(phraseFrenchScore - phraseEnglishScore) > 5) {
        if (phraseFrenchScore > phraseEnglishScore) {
          frenchScore += 10;
        } else {
          englishScore += 10;
        }
      }
    }

    console.log('🌍 Advanced language detection:', { 
      text: text.substring(0, 50), 
      englishScore, 
      frenchScore,
      detected: englishScore > frenchScore ? 'en' : 'fr'
    });

    return englishScore > frenchScore ? 'en' : 'fr';
  }

  /**
   * Détection de langue ultra-précise avec intégration Google AI Studio
   * Utilise exclusivement l'API Google pour la détection de langue
   */
  private async detectLanguageWithGoogleAPI(text: string): Promise<'fr' | 'en'> {
    try {
      // Préparer le texte pour la détection
      const preparedText = this.prepareTextForLanguageDetection(text);
      
      if (!preparedText || preparedText.trim().length === 0) {
        return 'fr'; // Défaut pour le marché sénégalais
      }

      // Appeler l'API de détection de langue
      const response = await fetch(`/api/language/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: preparedText.substring(0, 500) }) // Limiter la longueur pour l'API
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.language) {
          return data.language === 'en' ? 'en' : 'fr';
        }
      }
      
      // En cas d'erreur, utiliser la détection locale comme fallback
      console.warn('Google language detection failed, using local detection as fallback');
      return this.detectLanguageSimple(text);
    } catch (error) {
      console.error('Language detection API error:', error);
      // En cas d'erreur API, utiliser la détection locale comme fallback
      return this.detectLanguageSimple(text);
    }
  }

  /**
   * Préparation du texte pour la détection de langue
   */
  private prepareTextForLanguageDetection(text: string): string {
    // Enlever les URLs, emails et numéros de téléphone
    return text
      .replace(/https?:\/\/[^\s]+/g, '') // URLs
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '') // Emails
      .replace(/\+?[0-9][\d\s\-\(\)]{7,}/g, '') // Numéros de téléphone
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  /**
   * Détection d'intention ultra-précise avec entités
   */
  private detectIntentAdvanced(text: string, language: 'fr' | 'en'): IntentResult {
    const lowerText = text.toLowerCase();
    const entities: string[] = [];
    
    // Check for specific contact information requests first
    if (lowerText.includes('email') || lowerText.includes('mail') || lowerText.includes('e-mail') || lowerText.includes('@')) {
      return { 
        intent: 'contact_email', 
        confidence: 0.95, 
        entities: ['email'] 
      };
    }
    
    if (lowerText.includes('phone') || lowerText.includes('téléphone') || lowerText.includes('numéro') || lowerText.includes('+212') || lowerText.includes('whatsapp')) {
      return { 
        intent: 'contact_phone', 
        confidence: 0.95, 
        entities: ['phone'] 
      };
    }
    
    // Intentions spécifiques avec patterns plus détaillés
    const intentPatterns = {
      contact_email: {
        fr: ['email', 'e-mail', 'adresse mail', 'contact email', 'votre email', 'envoyer un mail', 'écrire'],
        en: ['email', 'e-mail', 'email address', 'contact email', 'your email', 'send email', 'write']
      },
      contact_phone: {
        fr: ['téléphone', 'numéro', 'appeler', 'contact téléphone', 'votre numéro', 'whatsapp', 'appelle-moi', 'joindre'],
        en: ['phone', 'number', 'call', 'contact phone', 'your number', 'whatsapp', 'call me', 'reach']
      },
      contact_general: {
        fr: ['contact', 'joindre', 'contacter', 'coordonnées', 'parler', 'discuter'],
        en: ['contact', 'reach', 'get in touch', 'contact details', 'talk', 'discuss']
      },
      demo_request: {
        fr: ['démo', 'démonstration', 'voir démo', 'montrer', 'présentation', 'exemple', 'tester'],
        en: ['demo', 'demonstration', 'show demo', 'show me', 'presentation', 'example', 'test']
      },
      pricing: {
        fr: ['prix', 'tarif', 'coût', 'combien', 'devis', 'budget', 'payer', 'facturation', 'gratuit'],
        en: ['price', 'cost', 'pricing', 'how much', 'quote', 'budget', 'pay', 'billing', 'free']
      },
      appointment: {
        fr: ['rendez-vous', 'rdv', 'rencontrer', 'planifier', 'réserver', 'meeting', 'visio'],
        en: ['appointment', 'meeting', 'schedule', 'book', 'arrange', 'meet']
      },
      services_website: {
        fr: ['site web', 'site internet', 'création site', 'développement web', 'site vitrine', 'ecommerce'],
        en: ['website', 'web development', 'create website', 'web design', 'showcase site', 'ecommerce']
      },
      services_mobile: {
        fr: ['application mobile', 'app mobile', 'développement mobile', 'appli', 'android', 'ios'],
        en: ['mobile app', 'mobile application', 'app development', 'app', 'android', 'ios']
      },
      services_chatbot: {
        fr: ['chatbot', 'bot', 'automatisation', 'assistant virtuel', 'répondre automatiquement'],
        en: ['chatbot', 'bot', 'automation', 'virtual assistant', 'automatic response']
      },
      services_marketing: {
        fr: ['marketing digital', 'marketing', 'publicité', 'réseaux sociaux', 'facebook', 'instagram'],
        en: ['digital marketing', 'marketing', 'advertising', 'social media', 'facebook', 'instagram']
      },
      whatsapp_automation: {
        fr: ['whatsapp', 'automatisation whatsapp', 'commander', 'acheter', 'commande', 'achat', 'solution whatsapp', 'service whatsapp', 'combien', 'prix', 'tarif', 'coût', 'comment', 'je pourrais', 'crée', 'automatiser', 'business', 'client', 'vente', 'commande'],
        en: ['whatsapp', 'whatsapp automation', 'order', 'buy', 'purchase', 'whatsapp solution', 'whatsapp service', 'how much', 'price', 'cost', 'how', 'i could', 'create', 'automate', 'business', 'customer', 'sale', 'order']
      },
      digital_transformation: {
        fr: ['transformation digitale', 'digitalisation', 'modernisation', 'entreprise', 'numérique'],
        en: ['digital transformation', 'digitalization', 'modernization', 'business', 'digital']
      }
    };

    let bestIntent = 'general';
    let bestConfidence = 0;

    // Analyser chaque intention
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      const relevantPatterns = patterns[language] || [];
      let score = 0;
      
      relevantPatterns.forEach(pattern => {
        // Use word boundaries for more accurate matching
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        if (regex.test(lowerText)) {
          // Weight longer patterns more heavily
          score += pattern.length > 4 ? 3 : 2;
          entities.push(pattern);
        }
      });

      // Bonus for multiple matches
      if (score > 0) {
        const matchCount = relevantPatterns.filter(pattern => 
          new RegExp(`\\b${pattern}\\b`, 'i').test(lowerText)
        ).length;
        
        if (matchCount > 1) {
          score += matchCount; // Additional points for multiple matches
        }
      }

      if (score > bestConfidence) {
        bestConfidence = score;
        bestIntent = intent;
      }
    });

    // Special handling for specific high-value intents
    if (bestIntent === 'whatsapp_automation' && bestConfidence > 10) {
      bestConfidence = Math.min(bestConfidence * 1.2, 100); // Boost confidence for WhatsApp automation
    }

    // Normaliser la confiance
    const confidence = Math.min(bestConfidence / 15, 1.0); // Adjusted normalization factor

    console.log('🎯 Intent detection:', { 
      text: text.substring(0, 50), 
      intent: bestIntent, 
      confidence, 
      entities 
    });

    return { intent: bestIntent, confidence, entities };
  }

  /**
   * Traitement principal ultra-intelligent avec RAG
   */
  async processMessage(
    message: string,
    sessionId: string,
    inputMethod: 'text' = 'text',
    context?: any // Enhanced context from the frontend
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      // Ensure cache fix is healthy
      const healthCheck = await supabaseCacheFix.healthCheck();
      if (!healthCheck.success) {
        console.warn('⚠️ Cache system unhealthy, attempting refresh:', healthCheck.message);
        await supabaseCacheFix.refreshKnowledgeBaseCache();
      }

      console.log('🧠 Ultra-intelligent processing started:', {
        message: message.substring(0, 50),
        inputMethod,
        cacheHealthy: healthCheck.success,
        timestamp: new Date().toISOString()
      });

      // 1. Déléguer la détection de langue à Gemini (pas de détection côté serveur)
      // Gemini analysera la langue dans le prompt maître et répondra en conséquence
      
      // 2. Get conversation history for personalization
      const conversationHistory = await this.getConversationHistory(sessionId);
      
      // 3. Détection d'intention simplifiée (sans langue spécifique)
      const intentResult = this.detectIntentSimplified(message);
      
      // 4. Génération de réponse avec RAG + Gemini (délégation complète de la langue)
      const response = await this.generateResponseWithRAG(
        message,
        conversationHistory,
        context
      );

      // 5. Détection de langue de la réponse pour les métadonnées
      const responseLanguage = this.detectLanguageSimple(response.substring(0, 100));
      
      // 6. Extraction des CTA depuis la réponse (si présents)
      const { cleanResponse, cta } = this.extractCTAFromResponse(response);
      
      // 7. Génération de suggestions basées sur le contexte
      const suggestions = this.generateContextualSuggestions(responseLanguage);

      // 8. Sauvegarde simplifiée
      const conversationId = await this.saveConversation(
        sessionId,
        message,
        cleanResponse,
        responseLanguage,
        { intent: 'general', confidence: 0.9, entities: [] }
      );

      const processingTime = Date.now() - startTime;
      
      console.log('✨ Ultra-intelligent processing completed:', {
        language: responseLanguage,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        suggestions: suggestions.length,
        processingTime: `${processingTime}ms`
      });

      return {
        response: cleanResponse,
        conversationId,
        language: responseLanguage,
        source: 'ultra_intelligent_rag',
        confidence: 0.95,
        suggestions,
        cta
      };

    } catch (error) {
      console.error('Ultra-intelligent RAG error:', error);
      
      // Fallback ultra-robuste with more personality
      const fallbackLanguage = this.detectLanguageSimple(message);
      const fallbackResponse = this.getFallbackResponse(message, fallbackLanguage);
      const fallbackSuggestions = this.generateSmartSuggestions('general', fallbackLanguage);
      const fallbackCTA = this.generateSmartCTA('contact_general', fallbackLanguage);

      return {
        response: fallbackResponse,
        conversationId: sessionId,
        language: fallbackLanguage,
        source: 'ultra_fallback',
        confidence: 0.8,
        suggestions: fallbackSuggestions,
        cta: fallbackCTA
      };
    }
  }

  /**
   * Fallback responses with personality when AI fails
   */
  private getFallbackResponse(message: string, language: 'fr' | 'en'): string {
    // Try to detect intent even in fallback
    const intentResult = this.detectIntentAdvanced(message, language);
    
    if (language === 'fr') {
      switch (intentResult.intent) {
        case 'contact_email':
          return `📧 **Email OMA Digital :**

✉️ **omasenegal25@gmail.com**

Désolée, je rencontre un petit souci technique ! 😅 Mais je peux quand même te donner nos coordonnées.

Tu peux nous écrire pour :
• Demander un devis personnalisé 💰
• Poser des questions techniques 🛠️
• Planifier une consultation 📅
• Discuter de ton projet 💡

Je réponds généralement sous 2h en semaine !`;
        
        case 'contact_phone':
          return `📞 **Téléphone OMA Digital :**

📱 **+212 701 193 811**

Oops, j'ai un petit bug technique ! 🐞 Mais je suis toujours là pour t'aider.

Appelle-nous pour :
• Consultation gratuite immédiate ⚡
• Support technique urgent 🔧
• Prise de rendez-vous rapide 🕒

Disponible :
• Lundi - Vendredi : 8h - 18h
• Samedi : 9h - 13h
• WhatsApp 24/7 📱`;
        
        case 'pricing':
          return `💰 **Tarifs OMA Digital :**

Désolée, je ne peux pas afficher nos tarifs en détail pour le moment ! 🙏

Mais je peux te dire que nos services sont adaptés aux PME sénégalaises avec :
• 🔍 **Consultation gratuite** pour comprendre tes besoins
• 💸 **Devis personnalisé** sous 24h
• 👨‍🏫 **Formation de ton équipe** incluse
• 🛠️ **Support technique** 6 mois

Contacte-nous directement pour un tarif adapté à ton budget !`;
        
        case 'demo_request':
          return `🎥 **Démonstration OMA Digital :**

Je peux pas programmer une démo automatiquement pour le moment, mais je suis super motivée de te la présenter ! 🌟

Envoie-nous un message à :
📧 **omasenegal25@gmail.com** ou appelle le 📱 **+212 701 193 811**

Tu pourras voir en direct comment nos solutions transforment les businesses sénégalais !`;
        
        default:
          return `🚀 **OMA Digital - Votre partenaire de croissance digitale**

Oops, j'ai un petit souci technique ! 😅 Pas de panique, je suis toujours là pour t'aider.

Hey entrepreneur ! 👋 Je suis OMADIGITAL, ton assistant digital. Même si je ne peux pas répondre parfaitement en ce moment, je veux vraiment t'aider à réussir.

🎯 **Nos services pour ton succès :**
• Sites web qui convertissent 🌐
• Apps mobiles intuitives 📱
• Chatbots intelligents 24/7 🤖
• Marketing digital performant 📈

📞 **Contactez-moi directement :** +212 701 193 811
📧 **Email :** omasenegal25@gmail.com`;

      }
    } else {
      switch (intentResult.intent) {
        case 'contact_email':
          return `📧 **OMA Digital Email:**

✉️ **omasenegal25@gmail.com**

Sorry, I'm having a small technical issue! 😅 But I can still give you our contact details.

You can write to us for:
• Personalized quote 💰
• Technical questions 🛠️
• Scheduling a consultation 📅
• Discussing your project 💡

We usually respond within 2h on weekdays!`;
        
        case 'contact_phone':
          return `📞 **OMA Digital Phone:**

📱 **+212 701 193 811**

Oops, I have a small technical bug! 🐞 But I'm still here to help you.

Call us for:
• Immediate free consultation ⚡
• Urgent technical support 🔧
• Quick appointment booking 🕒

Available:
• Monday - Friday: 8am - 6pm
• Saturday: 9am - 1pm
• WhatsApp 24/7 📱`;
        
        case 'pricing':
          return `💰 **OMA Digital Pricing:**

Sorry, I can't display our detailed pricing right now! 🙏

But I can tell you that our services are tailored for Senegalese SMEs with:
• 🔍 **Free consultation** to understand your needs
• 💸 **Personalized quote** within 24h
• 👨‍🏫 **Team training** included
• 🛠️ **6-month technical support**

Contact us directly for a price adapted to your budget!`;
        
        case 'demo_request':
          return `🎥 **OMA Digital Demonstration:**

I can't schedule a demo automatically right now, but I'm super excited to show it to you! 🌟

Send us a message at:
📧 **omasenegal25@gmail.com** or call 📱 **+212 701 193 811**

You'll see firsthand how our solutions transform Senegalese businesses!`;
        
        default:
          return `🚀 **OMA Digital - Your digital growth partner**

Oops, I'm having a small technical issue! 😅 No worries, I'm still here to help you.

Hey entrepreneur! 👋 I'm OMADIGITAL, your digital assistant. Even though I can't respond perfectly right now, I really want to help you succeed.

🎯 **Our services for your success:**
• High-converting websites 🌐
• Intuitive mobile apps 📱
• Smart 24/7 chatbots 🤖
• Performance-driven digital marketing 📈

📞 **Contact me directly:** +212 701 193 811
📧 **Email:** omasenegal25@gmail.com`;
      }
    }
  }

  /**
   * Get conversation history for personalization
   */
  private async getConversationHistory(sessionId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('content, sender, created_at')
        .eq('conversation_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(10); // Get last 10 messages for context

      if (error) {
        console.warn('Conversation history fetch error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Conversation history error:', error);
      return [];
    }
  }

  /**
   * Génération de réponse simplifiée avec RAG (délégation complète à Gemini)
   */
  private async generateResponseWithRAG(
    userMessage: string,
    conversationHistory: any[] = [],
    context?: any
  ): Promise<string> {
    // 1. Rechercher dans la base de connaissances (bilingue)
    const contextItems = await this.searchKnowledgeBase(userMessage, 'fr'); // Recherche en français par défaut
    const contextItemsEn = await this.searchKnowledgeBase(userMessage, 'en'); // Recherche en anglais aussi
    const allContextItems = [...contextItems, ...contextItemsEn];
    
    // 2. Générer la réponse avec Gemini (qui gère la langue automatiquement)
    const aiResponse = await this.generateAIResponseWithGemini(userMessage, allContextItems, conversationHistory, context);
    
    return aiResponse;
  }

  /**
   * Détection d'intention simplifiée (sans langue)
   */
  private detectIntentSimplified(text: string): IntentResult {
    const lowerText = text.toLowerCase();
    
    // Patterns universels (français + anglais)
    const intentPatterns = {
      contact: ['contact', 'téléphone', 'phone', 'email', 'mail', 'joindre', 'reach'],
      pricing: ['prix', 'tarif', 'price', 'cost', 'combien', 'how much', 'devis', 'quote'],
      demo: ['démo', 'demo', 'démonstration', 'demonstration', 'voir', 'show'],
      services: ['service', 'solution', 'automatisation', 'automation', 'site', 'website', 'app'],
      whatsapp: ['whatsapp', 'wa', 'automatisation whatsapp', 'whatsapp automation']
    };

    let bestIntent = 'general';
    let bestScore = 0;

    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      let score = 0;
      patterns.forEach(pattern => {
        if (lowerText.includes(pattern)) {
          score += pattern.length;
        }
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    });

    return {
      intent: bestIntent,
      confidence: Math.min(bestScore / 10, 1.0),
      entities: []
    };
  }

  /**
   * Génération de réponse avec Gemini (architecture simplifiée)
   */
  private async generateAIResponseWithGemini(
    userMessage: string,
    contextItems: KnowledgeBaseItem[],
    conversationHistory: any[] = [],
    enhancedContext?: any
  ): Promise<string> {
    if (!this.googleAIKey) {
      console.log('❌ Google AI API key not found, using fallback response');
      // Default to French for Senegalese market
      return this.getGeneralResponse('fr');
    }

    try {
      console.log('🤖 Generating AI response with Google AI Studio');
      
      // Construire le contexte à partir des résultats de la base de connaissances
      const contextText = contextItems.map(item => 
        `Document #${item.id} (${item.title} — ${item.category}): ${item.content.substring(0, 200)}...`
      ).join('\n\n');

      // Build conversation history context
      let historyText = '';
      if (conversationHistory.length > 0) {
        // Take last 6-10 messages as specified in requirements
        const recentHistory = conversationHistory.slice(-8);
        historyText = recentHistory.map(msg => 
          `${msg.sender === 'user' ? 'Client' : 'Assistant'}: ${msg.content}`
        ).join('\n');
      }

      // Determine optimal response length based on user message
      const messageLength = userMessage.length;
      let maxTokens = 400; // Default
      
      // Short questions get shorter responses, longer questions get more detailed responses
      if (messageLength < 20) {
        maxTokens = 250; // Very short response for short questions
      } else if (messageLength > 100) {
        maxTokens = 500; // Longer response for detailed questions
      }

      // Prompt maître simplifié - Gemini gère la détection de langue
      const systemPrompt = MASTER_PROMPT
        .replace('{{retrieved_documents}}', contextText || 'Aucun document trouvé')
        .replace('{{chat_history}}', historyText || 'Aucun historique')
        .replace('{{user_message}}', userMessage);

      console.log('📝 Sending request to Google AI API');
      console.log('📏 Max tokens:', maxTokens);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleAIKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nVeuillez répondre en respectant les règles ci-dessus.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 40
          }
        })
      });

      console.log('📡 Google AI API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Google AI API response data:', JSON.stringify(data, null, 2));
        
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedText?.trim()) {
          console.log('✅ Successfully generated AI response');
          
          // Clean up the response to ensure it follows our guidelines
          let cleanResponse = generatedText.trim();
          
          // Ensure response ends with a question to encourage conversation
          if (!/[?؟]$/.test(cleanResponse)) {
            // Detect the language of the response to add the appropriate question
            const responseLanguage = this.detectLanguageSimple(cleanResponse.substring(0, 50));
            if (responseLanguage === 'fr') {
              cleanResponse += " Comment puis-je t'aider davantage ?";
            } else {
              cleanResponse += " How else can I help you?";
            }
          }
          
          console.log('🧹 Cleaned response:', cleanResponse);
          return cleanResponse;
        } else {
          console.log('⚠️ No generated text found in response');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Google AI API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('💥 AI generation error:', error);
    }

    console.log('🔄 Falling back to general response');
    // Default to French for Senegalese market
    return this.getGeneralResponse('fr');
  }

  /**
   * Extraction des CTA depuis la réponse Gemini
   */
  private extractCTAFromResponse(response: string): { cleanResponse: string; cta?: any } {
    // Chercher les CTA JSON dans la réponse
    const ctaRegex = /```json\s*\{\s*"cta":\s*\[(.*?)\]\s*\}\s*```/s;
    const match = response.match(ctaRegex);
    
    if (match) {
      try {
        const ctaData = JSON.parse(`{"cta":[${match[1]}]}`);
        const cleanResponse = response.replace(ctaRegex, '').trim();
        
        return {
          cleanResponse,
          cta: {
            type: 'contact',
            action: ctaData.cta[0] || 'Nous contacter',
            data: { 
              phone: '+212701193811', 
              email: 'omasenegal25@gmail.com',
              suggestions: ctaData.cta
            }
          }
        };
      } catch (error) {
        console.warn('Erreur parsing CTA JSON:', error);
      }
    }
    
    return { cleanResponse: response };
  }

  /**
   * Génération de suggestions contextuelles basées sur la langue
   */
  private generateContextualSuggestions(language: 'fr' | 'en'): string[] {
    if (language === 'en') {
      return [
        '📞 Contact us',
        '💰 Our services', 
        '📅 Free consultation',
        '🤖 WhatsApp automation',
        '📋 Our offers',
        '📅 Book appointment',
        '📝 Request quote',
        '💰 Pricing',
        '🎥 See demo',
        '💬 Talk about your project'
      ];
    } else {
      return [
        '📞 Nous contacter',
        '💰 Nos services',
        '📅 Consultation gratuite', 
        '🤖 Automatisation WhatsApp',
        '📋 Nos offres',
        '📅 Prendre rendez-vous',
        '📝 Demander un devis',
        '💰 Tarifs',
        '🎥 Voir la démo',
        '💬 Parlons de votre projet'
      ];
    }
  }

  /**
   * Génération de réponses ultra-contextuelles selon l'intention (fallback to predefined responses)
   */
  private generateContextualResponse(intent: string, language: 'fr' | 'en', entities: string[]): string {
    // Handle specific contact information requests
    if (intent === 'contact_email_specific') {
      return language === 'fr' ? 'omasenegal25@gmail.com' : 'omasenegal25@gmail.com';
    }
    
    if (intent === 'contact_phone_specific') {
      return language === 'fr' ? '+212701193811' : '+212701193811';
    }
    
    const responses = {
      contact_email: {
        en: `📧 **OMA Digital Email:**

✉️ **omasenegal25@gmail.com**

We usually respond within 2h on weekdays.

You can write to us for:
• Request a personalized quote
• Ask technical questions
• Schedule a consultation
• Discuss your project`,
        fr: `📧 **Email OMA Digital :**

✉️ **omasenegal25@gmail.com**

Nous répondons généralement sous 2h en semaine.

Vous pouvez nous écrire pour :
• Demander un devis personnalisé
• Poser des questions techniques
• Planifier une consultation
• Discuter de votre projet`
      },
      contact_phone: {
        en: `📞 **OMA Digital Phone:**

📱 **+212 701 193 811**

Available:
• Monday - Friday: 8am - 6pm
• Saturday: 9am - 1pm
• WhatsApp 24/7

Call us for:
• Immediate free consultation
• Urgent technical support
• Quick appointment booking`,
        fr: `📞 **Téléphone OMA Digital :**

📱 **+212 701 193 811**

Disponible :
• Lundi - Vendredi : 8h - 18h
• Samedi : 9h - 13h
• WhatsApp 24/7

Appellez-nous pour :
• Consultation gratuite immédiate
• Support technique urgent
• Prise de rendez-vous rapide`
      },
      contact_general: {
        en: `📞 **Contact OMA Digital:**

📱 **Phone/WhatsApp:** +212 701 193 811
📧 **Email:** omasenegal25@gmail.com
📍 **Address:** Liberté 6, Dakar, Senegal

🕒 **Hours:**
• Monday - Friday: 8am - 6pm
• Saturday: 9am - 1pm
• WhatsApp Support 24/7

💬 **Response guaranteed within 2h!**`,
        fr: `📞 **Contactez OMA Digital :**

📱 **Téléphone/WhatsApp :** +212 701 193 811
📧 **Email :** omasenegal25@gmail.com
📍 **Adresse :** Liberté 6, Dakar, Sénégal

🕒 **Horaires :**
• Lundi - Vendredi : 8h - 18h
• Samedi : 9h - 13h
• Support WhatsApp 24/7

💬 **Réponse garantie sous 2h !**`
      },
      demo_request: {
        en: `🎥 **OMA Digital Demonstration:**

We'd be happy to show you our solutions in action!

📅 **Book your free demo:**
• Duration: 30 minutes
• Customized to your needs
• Concrete case presentations
• Live Q&A

📞 **Schedule now:** +212 701 193 811
📧 **Or by email:** omasenegal25@gmail.com`,
        fr: `🎥 **Démonstration OMA Digital :**

Nous serions ravis de vous montrer nos solutions en action !

📅 **Réservez votre démo gratuite :**
• Durée : 30 minutes
• Personnalisée selon vos besoins
• Présentation de cas concrets
• Questions/réponses en direct

📞 **Planifier maintenant :** +212 701 193 811
📧 **Ou par email :**omasenegal25@gmail.com`
      },
      pricing: {
        en: `💰 **OMA Digital Pricing:**

🌐 **Websites:** From 200,000 CFA
📱 **Mobile Apps:** From 500,000 CFA
🤖 **Chatbots:** From 50,000 CFA/month
📈 **Digital Marketing:** From 75,000 CFA/month

✨ **Included:**
• Free consultation
• Personalized quote within 24h
• Team training
• 6-month technical support

📞 **Free quote:** +212 701 193 811`,
        fr: `💰 **Tarifs OMA Digital :**

🌐 **Sites Web :** À partir de 200 000 CFA
📱 **Applications Mobiles :** À partir de 500 000 CFA
🤖 **Chatbots :** À partir de 50 000 CFA/mois
📈 **Marketing Digital :** À partir de 75 000 CFA/mois

✨ **Inclus :**
• Consultation gratuite
• Devis personnalisé sous 24h
• Formation de votre équipe
• Support technique 6 mois

📞 **Devis gratuit :** +212 701 193 811`
      },
      appointment: {
        en: `📅 **OMA Digital Appointment Booking:**

Let's schedule a slot to discuss your project!

⏰ **Available slots:**
• Monday - Friday: 9am - 5pm
• Duration: 30-60 minutes based on your needs
• In-person or video conference

📞 **Book now:** +212 701 193 811
📧 **Or by email:**omasenegal25@gmail.com

💡 **Free consultation with no commitment!**`,
        fr: `📅 **Prise de Rendez-vous OMA Digital :**

Réservons un créneau pour discuter de votre projet !

⏰ **Créneaux disponibles :**
• Lundi - Vendredi : 9h - 17h
• Durée : 30-60 minutes selon vos besoins
• En présentiel ou visioconférence

📞 **Réserver maintenant :** +212 701 193 811
📧 **Ou par email :**omasenegal25@gmail.com

💡 **Consultation gratuite et sans engagement !**`
      },
      whatsapp_automation: {
        en: `🤖 **OMA Digital WhatsApp Automation - Transform Your Business!**

Tired of missing customer messages and manual responses? Our proven WhatsApp automation solution is designed specifically for Senegalese businesses like yours!

💰 **Investment:** Only 50,000 CFA/month
📈 **Guaranteed ROI:** +200% increase in customer engagement within 6 months

✨ **What You Get:**
• 24/7 automated customer service that never sleeps
• Instant responses to frequently asked questions
• Automatic order processing and payment collection
• Lead qualification and smart follow-up sequences
• Complete sales funnel automation
• Real-time performance analytics dashboard

📦 **Easy Ordering Process:**
1. Contact us today: 📞 +212 701 193 811
2. Free consultation & needs analysis (30 minutes)
3. Custom setup within 48 hours
4. Team training & ongoing support

🎯 **Perfect For:**
• Restaurants taking orders via WhatsApp
• Retail shops managing customer inquiries
• Service providers scheduling appointments
• E-commerce businesses processing payments

📅 Ready to transform your customer service and boost sales? Call us now for your free consultation!

*Limited time offer: First 10 clients get 1 month free!*`,
        fr: `🤖 **Automatisation WhatsApp OMA Digital - Transformez Votre Business !**

Fatigué(e) de rater les messages de vos clients et de répondre manuellement ? Notre solution d'automatisation WhatsApp éprouvée est conçue spécialement pour les entreprises sénégalaises comme la vôtre !

💰 **Investissement :** Seulement 50 000 CFA/mois
📈 **ROI Garanti :** +200% d'engagement client en 6 mois

✨ **Ce Que Vous Obtenez :**
• Service client automatisé 24/7 qui ne dort jamais
• Réponses instantanées aux questions fréquentes
• Traitement automatique des commandes et collecte de paiement
• Qualification des prospects et séquences de suivi intelligentes
• Automatisation complète du tunnel de vente
• Tableau de bord analytique en temps réel

📦 **Processus de Commande Simple :**
1. Contactez-nous dès aujourd'hui : 📞 +212 701 193 811
2. Consultation gratuite & analyse des besoins (30 minutes)
3. Installation personnalisée sous 48 heures
4. Formation de votre équipe & support continu

🎯 **Parfait Pour :**
• Restaurants prenant les commandes via WhatsApp
• Boutiques gérant les demandes clients
• Prestataires planifiant les rendez-vous
• Entreprises e-commerce traitant les paiements

📅 Prêt à transformer votre service client et booster vos ventes ? Appelez-nous maintenant pour votre consultation gratuite !

*Offre limitée : Les 10 premiers clients bénéficient d'1 mois gratuit !*`
      }
    };

    const serviceResponses = {
      services_website: {
        en: `🌐 **OMA Digital Website Creation:**

We create professional websites that capture your brand's essence.

✨ **Your benefits:**
• Powerful online presence
• SEO optimization for Dakar/Senegal
• Convert visitors to customers
• Mobile-first responsive design

💰 **From 200,000 CFA**
📞 **Free quote:** +212 701 193 811`,
        fr: `🌐 **Création de Sites Web OMA Digital :**

Nous créons des sites web professionnels qui capturent l'essence de votre marque.

✨ **Votre gain :**
• Présence en ligne percutante
• Optimisation SEO pour Dakar/Sénégal
• Conversion visiteurs en clients
• Design responsive mobile-first

💰 **À partir de 200 000 CFA**
📞 **Devis gratuit :** +212 701 193 811`
      },
      services_mobile: {
        en: `📱 **OMA Digital Mobile Applications:**

We create intuitive mobile apps to engage your customers directly on their smartphones.

✨ **Your benefits:**
• Increased customer loyalty
• Direct sales channel
• Unique user experience
• Personalized push notifications

💰 **From 500,000 CFA**
📞 **Free consultation:** +212 701 193 811`,
        fr: `📱 **Applications Mobiles OMA Digital :**

Nous créons des applications mobiles intuitives pour engager vos clients directement sur leurs smartphones.

✨ **Votre gain :**
• Fidélisation accrue de vos clients
• Canal de vente direct
• Expérience utilisateur unique
• Notifications push personnalisées

💰 **À partir de 500 000 CFA**
📞 **Consultation gratuite :** +212 701 193 811`
      },
      services_chatbot: {
        en: `🤖 **OMA Digital Chatbots & Automation:**

We create simple and multimodal chatbots that interact through text and voice.

✨ **Your benefits:**
• Instant 24/7 customer support
• Automatic prospect qualification
• WhatsApp and social media automation
• Never miss a single request

💰 **From 50,000 CFA/month**
📞 **Free demo:** +212 701 193 811`,
        fr: `🤖 **Chatbots & Automatisation OMA Digital :**

Nous créons des chatbots simples et multimodaux qui interagissent par texte et par la voix.

✨ **Votre gain :**
• Support client instantané 24/7
• Qualification automatique des prospects
• Automatisation WhatsApp et réseaux sociaux
• Ne plus perdre une seule demande

💰 **À partir de 50 000 CFA/mois**
📞 **Démo gratuite :** +212 701 193 811`
      },
      services_marketing: {
        en: `📈 **OMA Digital Marketing:**

We create custom marketing strategies focused on performance.

✨ **Your benefits:**
• Increased visibility on social networks
• New customer acquisition
• Advertising campaigns that generate concrete results
• Measurable and optimized ROI

💰 **From 75,000 CFA/month**
📞 **Free strategy:** +212 701 193 811`,
        fr: `📈 **Marketing Digital OMA Digital :**

Nous créons des stratégies de marketing sur mesure, axées sur la performance.

✨ **Votre gain :**
• Visibilité accrue sur les réseaux sociaux
• Acquisition de nouveaux clients
• Campagnes publicitaires qui génèrent des résultats concrets
• ROI mesurable et optimisé

💰 **À partir de 75 000 CFA/mois**
📞 **Stratégie gratuite :** +212 701 193 811`
      }
    };

    // Combiner les réponses selon l'intention
    const allResponses = { ...responses, ...serviceResponses };
    
    return allResponses[intent as keyof typeof allResponses]?.[language] || 
           this.getGeneralResponse(language);
  }

  /**
   * Réponse générale si aucune intention spécifique détectée
   */
  private getGeneralResponse(language: 'fr' | 'en'): string {
    if (language === 'fr') {
      return `🚀 **OMA Digital - Votre partenaire de croissance digitale**

Hey entrepreneur ! 👋 Je suis OMADIGITAL, votre assistant digital chez OMA Digital. Je suis là pour vous aider à transformer votre business grâce à la technologie.

🎯 **Nos services pour votre succès :**
• Sites web qui convertissent 🌐
• Applications mobiles intuitives 📱
• Chatbots intelligents 24/7 🤖
• Marketing digital performant 📈

💡 Prêt à passer à la vitesse supérieure ? Parlons-en !

📞 **Contactez-moi :** +212 701 193 811
📧 **Email :** omasenegal25@gmail.com`;

    } else {
      return `🚀 **OMA Digital - Your digital growth partner**

Hey entrepreneur! 👋 I'm OMADIGITAL, your digital assistant at OMA Digital. I'm here to help you transform your business through technology.

🎯 **Our services for your success:**
• High-converting websites 🌐
• Intuitive mobile apps 📱
• Smart 24/7 chatbots 🤖
• Performance-driven digital marketing 📈

💡 Ready to take it to the next level? Let's talk!

📞 **Contact me:** +212 701 193 811
📧 **Email:** omasenegal25@gmail.com`;
    }
  }

  /**
   * Génération de suggestions intelligentes selon l'intention
   */
  private generateSmartSuggestions(intent: string, language: 'fr' | 'en'): string[] {
    const suggestions = {
      contact_email: {
        en: ['📧 Get email address', '📋 Copy to clipboard', '📱 WhatsApp instead', '📅 Schedule meeting'],
        fr: ['📧 Obtenir l\'email', '📋 Copier dans le presse-papier', '📱 WhatsApp à la place', '📅 Planifier un rendez-vous']
      },
      contact_phone: {
        en: ['📞 Call now', '📱 WhatsApp message', '📧 Email instead', '📅 Book appointment'],
        fr: ['📞 Appeler maintenant', '📱 Message WhatsApp', '📧 Email à la place', '📅 Réserver un rendez-vous']
      },
      contact_general: {
        en: ['📞 Call us', '📧 Send email', '📱 WhatsApp support', '📅 Free consultation'],
        fr: ['📞 Nous appeler', '📧 Nous envoyer un email', '📱 Support WhatsApp', '📅 Consultation gratuite']
      },
      demo_request: {
        en: ['🎥 See demo video', '📅 Schedule live demo', '💰 Pricing details', '📦 Order now'],
        fr: ['🎥 Voir la démo vidéo', '📅 Planifier une démo en direct', '💰 Détails des tarifs', '📦 Commander maintenant']
      },
      pricing: {
        en: ['💰 See detailed pricing', '📅 Free quote', '📦 Order service', '🎥 Book demo'],
        fr: ['💰 Voir les tarifs détaillés', '📅 Devis gratuit', '📦 Commander un service', '🎥 Réserver une démo']
      },
      appointment: {
        en: ['📅 Book now', '📞 Call to schedule', '📧 Email request', '💰 Pricing info'],
        fr: ['📅 Réserver maintenant', '📞 Appeler pour planifier', '📧 Demande par email', '💰 Info tarifs']
      },
      whatsapp_automation: {
        en: ['📅 Free consultation', '💰 Pricing details', '📦 Order now', '🎥 See demo', '📊 ROI calculator'],
        fr: ['📅 Consultation gratuite', '💰 Détails tarifs', '📦 Commander maintenant', '🎥 Voir démo', '📊 Calculateur de ROI']
      },
      services_website: {
        en: ['🌐 See website examples', '💰 Pricing', '📅 Free quote', '📦 Order now', '🎨 Design options'],
        fr: ['🌐 Voir exemples de sites', '💰 Tarifs', '📅 Devis gratuit', '📦 Commander', '🎨 Options de design']
      },
      services_mobile: {
        en: ['📱 See app examples', '💰 Pricing', '📅 Free consultation', '📦 Order now', '📱 iOS & Android'],
        fr: ['📱 Voir exemples d\'apps', '💰 Tarifs', '📅 Consultation gratuite', '📦 Commander', '📱 iOS & Android']
      },
      services_chatbot: {
        en: ['🤖 See chatbot examples', '💰 Pricing', '📅 Free demo', '📦 Order now', '💬 Multi-language'],
        fr: ['🤖 Voir exemples de chatbots', '💰 Tarifs', '📅 Démo gratuite', '📦 Commander', '💬 Multi-langues']
      },
      services_marketing: {
        en: ['📈 See campaign examples', '💰 Pricing', '📅 Free strategy call', '📦 Order now', '📊 Performance reports'],
        fr: ['📈 Voir exemples de campagnes', '💰 Tarifs', '📅 Appel stratégique gratuit', '📦 Commander', '📊 Rapports de performance']
      },
      digital_transformation: {
        en: ['🔄 See transformation cases', '📅 Free audit', '💰 Investment calculator', '📞 Strategy call'],
        fr: ['🔄 Voir cas de transformation', '📅 Audit gratuit', '💰 Calculateur d\'investissement', '📞 Appel stratégique']
      },
      general: {
        en: ['📞 Contact us', '💰 Our services', '📅 Free consultation', '🤖 WhatsApp automation', '📋 Our offers', '📅 Book appointment', '📝 Request quote', '💰 Pricing', '🎥 See demo'],
        fr: ['📞 Nous contacter', '💰 Nos services', '📅 Consultation gratuite', '🤖 Automatisation WhatsApp', '📋 Nos offres', '📅 Prendre rendez-vous', '📝 Demander un devis', '💰 Tarifs', '🎥 Voir la démo']
      }
    };

    // Return specific suggestions based on intent, or general ones if no specific match
    return suggestions[intent as keyof typeof suggestions]?.[language] || suggestions.general[language];
  }

  /**
   * Génération de CTA intelligents selon l'intention
   */
  private generateSmartCTA(intent: string, language: 'fr' | 'en'): { type: 'contact' | 'demo' | 'appointment' | 'quote'; action: string; data?: any } {
    const ctas: Record<string, { type: 'contact' | 'demo' | 'appointment' | 'quote'; action: string; data?: any }> = {
      contact_email: {
        type: 'contact',
        action: language === 'fr' ? '📧 Envoyer un email maintenant' : '📧 Send email now',
        data: { email: 'omasenegal25@gmail.com', subject: language === 'fr' ? 'Demande d\'information' : 'Information request' }
      },
      contact_phone: {
        type: 'contact',
        action: language === 'fr' ? '📞 Appeler maintenant' : '📞 Call now',
        data: { phone: '+212701193811', type: 'call' }
      },
      contact_general: {
        type: 'contact',
        action: language === 'fr' ? '📞 Nous contacter' : '📞 Contact us',
        data: { phone: '+212701193811', email: 'omasenegal25@gmail.com' }
      },
      demo_request: {
        type: 'demo',
        action: language === 'fr' ? '🎥 Réserver ma démo gratuite' : '🎥 Book my free demo',
        data: { duration: 30, type: 'demo_booking' }
      },
      pricing: {
        type: 'quote',
        action: language === 'fr' ? '📝 Demander un devis gratuit' : '📝 Request free quote',
        data: { type: 'quote_request', response_time: '24h' }
      },
      appointment: {
        type: 'appointment',
        action: language === 'fr' ? '📅 Réserver un rendez-vous' : '📅 Book appointment',
        data: { type: 'appointment_booking', duration: '30-60min' }
      },
      whatsapp_automation: {
        type: 'quote',
        action: language === 'fr' ? '🚀 Commander l\'automatisation WhatsApp' : '🚀 Order WhatsApp Automation',
        data: { 
          type: 'whatsapp_automation', 
          price: '50000 CFA/month',
          roi: '+200% in 6 months',
          offer: 'First 10 clients get 1 month free'
        }
      },
      services_website: {
        type: 'quote',
        action: language === 'fr' ? '🌐 Commander un site web' : '🌐 Order a website',
        data: { 
          type: 'website_development',
          price: 'From 200,000 CFA',
          features: 'Responsive design, SEO optimization, Local payment integration'
        }
      },
      services_mobile: {
        type: 'quote',
        action: language === 'fr' ? '📱 Commander une application mobile' : '📱 Order a mobile app',
        data: { 
          type: 'mobile_app_development',
          price: 'From 500,000 CFA',
          platforms: 'iOS & Android',
          features: 'Cross-platform, Offline functionality, Push notifications'
        }
      },
      services_chatbot: {
        type: 'demo',
        action: language === 'fr' ? '🤖 Voir une démo de chatbot' : '🤖 See chatbot demo',
        data: { 
          type: 'chatbot_demo',
          capabilities: '24/7 customer service, Lead qualification, Order processing'
        }
      },
      services_marketing: {
        type: 'appointment',
        action: language === 'fr' ? '📈 Planifier une stratégie marketing' : '📈 Schedule marketing strategy',
        data: { 
          type: 'digital_marketing_strategy',
          channels: 'Social media, SEO, Paid advertising',
          roi: 'Measurable results'
        }
      },
      digital_transformation: {
        type: 'appointment',
        action: language === 'fr' ? '🔄 Planifier un audit digital' : '🔄 Schedule digital audit',
        data: { 
          type: 'digital_transformation_audit',
          duration: '60-90 minutes',
          includes: 'Digital strategy, Process optimization, Tool implementation'
        }
      }
    };

    // Handle general CTA with specific actions
    if (intent === 'general') {
      return {
        type: 'contact',
        action: language === 'fr' ? '📞 Parlons de votre projet' : '📞 Let\'s discuss your project',
        data: { phone: '+212701193811', email: 'omasenegal25@gmail.com' }
      };
    }

    return ctas[intent] || {
      type: 'contact',
      action: language === 'fr' ? '📞 Parlons de votre projet' : '📞 Let\'s discuss your project',
      data: { phone: '+212701193811', email: 'omasenegal25@gmail.com' }
    };
  }

  /**
   * Rechercher dans la base de connaissances avec améliorations
   */
  private async searchKnowledgeBase(query: string, language: 'fr' | 'en', limit: number = 5): Promise<KnowledgeBaseItem[]> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Special handling for phone/email requests
      if (lowerQuery.includes('phone') || lowerQuery.includes('téléphone') || lowerQuery.includes('numéro')) {
        const phoneItems = SIMULATED_KNOWLEDGE_BASE.filter(item => 
          item.language === language && 
          item.category === 'contact' &&
          item.keywords.some(keyword => keyword.includes('phone') || keyword.includes('téléphone') || keyword.includes('+212701193811'))
        );
        if (phoneItems.length > 0) {
          return [phoneItems[0] as KnowledgeBaseItem]; // Return only the phone information
        }
      }
      
      // Use enhanced search from cache fix for general queries
      const results = await supabaseCacheFix.searchKnowledgeBase(query, language, limit);
      
      if (results.length > 0) {
        console.log(`📚 Found ${results.length} knowledge base items for query: ${query.substring(0, 30)}`);
        return results;
      }

      // Fallback to direct Supabase query if cache fix fails
      console.log('🔄 Falling back to direct Supabase query');
      const { data, error } = await this.supabase
        .from('knowledge_base')
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .textSearch('content', query, { type: 'websearch' })
        .limit(limit);

      if (error) {
        console.error('Knowledge base search error:', error);
        // Fallback to simulated knowledge base
        return this.searchSimulatedKnowledgeBase(query, language, limit);
      }

      return data || [];
    } catch (error) {
      console.error('Knowledge base search error:', error);
      // Fallback to simulated knowledge base
      return this.searchSimulatedKnowledgeBase(query, language, limit);
    }
  }

  /**
   * Search in simulated knowledge base as fallback
   */
  private searchSimulatedKnowledgeBase(query: string, language: 'fr' | 'en', limit: number = 5): KnowledgeBaseItem[] {
    const lowerQuery = query.toLowerCase();
    
    // Score items based on keyword matches
    const scoredItems = SIMULATED_KNOWLEDGE_BASE
      .filter(item => item.language === language && item.is_active)
      .map(item => {
        let score = 0;
        
        // Check for exact keyword matches
        item.keywords.forEach(keyword => {
          if (lowerQuery.includes(keyword)) {
            score += 3;
          }
        });
        
        // Check for partial matches in title and content
        if (item.title.toLowerCase().includes(lowerQuery)) {
          score += 2;
        }
        
        if (item.content.toLowerCase().includes(lowerQuery)) {
          score += 1;
        }
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item as KnowledgeBaseItem); // Cast to KnowledgeBaseItem type
    
    return scoredItems.slice(0, limit);
  }

  /**
   * Sauvegarde enrichie avec métadonnées ultra-détaillées
   */
  private async saveConversation(
    sessionId: string,
    userMessage: string,
    botResponse: string,
    language: 'fr' | 'en',
    intentResult: IntentResult
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
              type: 'ultra_intelligent_rag',
              intent: intentResult.intent,
              confidence: intentResult.confidence
            },
            metadata: { 
              created_by: 'ultra_intelligent_rag',
              entities_detected: intentResult.entities.length,
              language_detection: 'advanced'
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

      // Sauvegarder les messages avec métadonnées ultra-détaillées
      await this.supabase.from('messages').insert([
        {
          conversation_id: conversation.id,
          content: userMessage,
          sender: 'user',
          language,
          metadata: { 
            input_type: 'user_query',
            detected_language: language,
            detected_intent: intentResult.intent,
            intent_confidence: intentResult.confidence,
            entities: intentResult.entities
          }
        },
        {
          conversation_id: conversation.id,
          content: botResponse,
          sender: 'bot',
          language,
          metadata: { 
            source: 'ultra_intelligent_rag',
            intent_processed: intentResult.intent,
            entities_used: intentResult.entities,
            response_type: 'contextual',
            confidence_score: Math.max(0.95, intentResult.confidence)
          }
        }
      ]);

      return conversation.id;
    } catch (error) {
      console.error('Error saving ultra-intelligent conversation:', error);
      return sessionId;
    }
  }

  /**
   * Simple language detection for fallback purposes
   */
  private detectLanguageSimple(text: string): 'fr' | 'en' {
    const lowerText = text.toLowerCase();
    
    // French indicators
    const frenchIndicators = [
      'bonjour', 'salut', 'merci', 's\'il vous plaît', 'svp', 'au revoir', 'dakar', 'sénégal', 'fcfa', 'cfa',
      'prix', 'tarif', 'service', 'whatsapp', 'automatisation', 'entreprise', 'pme', 'business'
    ];
    
    // English indicators
    const englishIndicators = [
      'hello', 'hi', 'thank you', 'please', 'goodbye', 'senegal', 'price', 'service', 'whatsapp', 'automation'
    ];
    
    let frenchScore = 0;
    let englishScore = 0;
    
    frenchIndicators.forEach(word => {
      if (lowerText.includes(word)) frenchScore++;
    });
    
    englishIndicators.forEach(word => {
      if (lowerText.includes(word)) englishScore++;
    });
    
    // Default to French for Senegalese market
    return englishScore > frenchScore ? 'en' : 'fr';
  }
}

export const ultraIntelligentRAG = new UltraIntelligentRAG();

// Simulated knowledge base with specific information about OMA Digital services
const SIMULATED_KNOWLEDGE_BASE = [
  {
    id: '1',
    title: 'Contact Information',
    content: 'Email: omasenegal25@gmail.com. Phone: +212701193811. WhatsApp: +212701193811. Business hours: Monday-Friday 8am-6pm, Saturday 9am-1pm. WhatsApp support available 24/7. Response time: Within 2 hours on business days. Address: Liberté 6, Dakar, Senegal.',
    category: 'contact',
    language: 'en',
    keywords: ['email', 'phone', 'contact', 'omasenegal25@gmail.com', '+212701193811', 'whatsapp', 'business hours', 'address', 'dakar', 'senegal'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Informations de Contact',
    content: 'Email : omasenegal25@gmail.com. Téléphone : +212701193811. WhatsApp : +212701193811. Horaires : Lundi-Vendredi 8h-18h, Samedi 9h-13h. Support WhatsApp disponible 24/7. Temps de réponse : Sous 2 heures en semaine. Adresse : Liberté 6, Dakar, Sénégal.',
    category: 'contact',
    language: 'fr',
    keywords: ['email', 'téléphone', 'contact', 'omasenegal25@gmail.com', '+212701193811', 'whatsapp', 'horaires', 'adresse', 'dakar', 'sénégal'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Web Development Services',
    content: 'We create professional websites that capture your brand\'s essence and convert visitors into customers. Our websites are optimized for the Senegalese market with local SEO, mobile-first design, and fast loading times. Technologies: React, Next.js, Tailwind CSS. Features: Responsive design, SEO optimization for Dakar/Senegal, Integration with local payment methods (Orange Money, Wave, Free Money), Contact forms, Social media integration, Analytics. Pricing: From 200,000 CFA for basic sites. Free consultation: +212 701 193 811.',
    category: 'services',
    language: 'en',
    keywords: ['website', 'web development', 'sites web', 'développement web', 'pricing', 'tarifs', 'react', 'nextjs', 'seo', 'mobile'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Services de Développement Web',
    content: 'Nous créons des sites web professionnels qui capturent l\'essence de votre marque et convertissent les visiteurs en clients. Nos sites sont optimisés pour le marché sénégalais avec un SEO local, un design mobile-first et des temps de chargement rapides. Technologies : React, Next.js, Tailwind CSS. Fonctionnalités : Design responsive, Optimisation SEO pour Dakar/Sénégal, Intégration des moyens de paiement locaux (Orange Money, Wave, Free Money), Formulaires de contact, Intégration réseaux sociaux, Analytics. Tarification : À partir de 200 000 CFA pour les sites basiques. Consultation gratuite : +212 701 193 811.',
    category: 'services',
    language: 'fr',
    keywords: ['site web', 'développement web', 'website', 'web development', 'tarification', 'pricing', 'react', 'nextjs', 'seo', 'mobile'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Mobile App Development',
    content: 'We create intuitive mobile apps to engage your customers directly on their smartphones. Perfect for businesses that want to provide services on-the-go. Technologies: React Native, Flutter. Features: Cross-platform compatibility (iOS & Android), Offline functionality, Push notifications, Local payment integration (Orange Money, Wave, Free Money), User authentication, Analytics dashboard. Pricing: From 500,000 CFA for basic apps. Free consultation: +212 701 193 811.',
    category: 'services',
    language: 'en',
    keywords: ['mobile app', 'application mobile', 'apps', 'applications', 'pricing', 'tarifs', 'react native', 'flutter', 'ios', 'android'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Développement d\'Applications Mobiles',
    content: 'Nous créons des applications mobiles intuitives pour engager vos clients directement sur leurs smartphones. Parfait pour les entreprises qui souhaitent fournir des services en déplacement. Technologies : React Native, Flutter. Fonctionnalités : Compatibilité multiplateforme (iOS & Android), Fonctionnalité hors-ligne, Notifications push, Intégration des paiements locaux (Orange Money, Wave, Free Money), Authentification utilisateur, Tableau de bord analytique. Tarification : À partir de 500 000 CFA pour les applications basiques. Consultation gratuite : +212 701 193 811.',
    category: 'services',
    language: 'fr',
    keywords: ['application mobile', 'mobile app', 'applications', 'apps', 'tarification', 'pricing', 'react native', 'flutter', 'ios', 'android'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    title: 'WhatsApp Automation',
    content: 'Our proven WhatsApp automation solution is designed specifically for Senegalese businesses. Transform your customer service and boost sales with 24/7 automated responses. Investment: Only 50,000 CFA/month. Guaranteed ROI: +200% increase in customer engagement within 6 months. Features: 24/7 automated customer service that never sleeps, Instant responses to frequently asked questions, Automatic order processing and payment collection, Lead qualification and smart follow-up sequences, Complete sales funnel automation, Real-time performance analytics dashboard, Integration with local payment methods (Orange Money, Wave, Free Money). Setup process: 1. Contact us today: 📞 +212 701 193 811, 2. Free consultation & needs analysis (30 minutes), 3. Custom setup within 48 hours, 4. Team training & ongoing support. Perfect for: Restaurants taking orders via WhatsApp, Retail shops managing customer inquiries, Service providers scheduling appointments, E-commerce businesses processing payments. Limited time offer: First 10 clients get 1 month free!',
    category: 'services',
    language: 'en',
    keywords: ['whatsapp', 'automation', 'automatisation', 'whatsapp automation', 'whatsapp automatisation', 'pricing', 'tarifs', 'roi', 'chatbot', '24/7'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    title: 'Automatisation WhatsApp',
    content: 'Notre solution d\'automatisation WhatsApp éprouvée est conçue spécialement pour les entreprises sénégalaises. Transformez votre service client et boostez vos ventes avec des réponses automatisées 24/7. Investissement : Seulement 50 000 CFA/mois. ROI Garanti : +200% d\'engagement client en 6 mois. Fonctionnalités : Service client automatisé 24/7 qui ne dort jamais, Réponses instantanées aux questions fréquentes, Traitement automatique des commandes et collecte de paiement, Qualification des prospects et séquences de suivi intelligentes, Automatisation complète du tunnel de vente, Tableau de bord analytique en temps réel, Intégration des moyens de paiement locaux (Orange Money, Wave, Free Money). Processus de mise en place : 1. Contactez-nous dès aujourd\'hui : 📞 +212 701 193 811, 2. Consultation gratuite & analyse des besoins (30 minutes), 3. Installation personnalisée sous 48 heures, 4. Formation de votre équipe & support continu. Parfait pour : Restaurants prenant les commandes via WhatsApp, Boutiques gérant les demandes clients, Prestataires planifiant les rendez-vous, Entreprises e-commerce traitant les paiements. Offre limitée : Les 10 premiers clients bénéficient d\'1 mois gratuit !',
    category: 'services',
    language: 'fr',
    keywords: ['whatsapp', 'automatisation', 'automation', 'whatsapp automatisation', 'whatsapp automation', 'tarification', 'pricing', 'roi', 'chatbot', '24/7'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    title: 'Pricing Information',
    content: 'Our services are tailored for Senegalese SMEs with competitive pricing and guaranteed ROI. Websites: From 200,000 CFA for basic professional sites. Mobile Apps: From 500,000 CFA for cross-platform applications. Chatbots: From 50,000 CFA/month for WhatsApp automation with 200% ROI guarantee. Digital Marketing: From 75,000 CFA/month for performance-driven campaigns. All our services include: Free consultation, Personalized quote within 24h, Team training, 6-month technical support, Performance monitoring. Payment options: Monthly, quarterly, or annual plans available. Contact: +212 701 193 811 for a free quote.',
    category: 'pricing',
    language: 'en',
    keywords: ['pricing', 'tarifs', 'price', 'prix', 'cost', 'coût', 'quote', 'devis', 'roi', 'guarantee'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10',
    title: 'Informations sur les Tarifs',
    content: 'Nos services sont adaptés aux PME sénégalaises avec des tarifs compétitifs et un ROI garanti. Sites Web : À partir de 200 000 CFA pour des sites professionnels basiques. Applications Mobiles : À partir de 500 000 CFA pour des applications multiplateformes. Chatbots : À partir de 50 000 CFA/mois pour l\'automatisation WhatsApp avec une garantie de ROI de 200%. Marketing Digital : À partir de 75 000 CFA/mois pour des campagnes axées sur la performance. Tous nos services incluent : Consultation gratuite, Devis personnalisé sous 24h, Formation de votre équipe, Support technique 6 mois, Surveillance des performances. Options de paiement : Plans mensuels, trimestriels ou annuels disponibles. Contactez : +212 701 193 811 pour un devis gratuit.',
    category: 'pricing',
    language: 'fr',
    keywords: ['tarification', 'pricing', 'prix', 'price', 'coût', 'cost', 'devis', 'quote', 'roi', 'garantie'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '11',
    title: 'Digital Transformation Services',
    content: 'Complete digital transformation services for Senegalese SMEs. We help businesses modernize their operations and reach more customers online. Services include: Digital strategy consulting, Business process optimization, Employee digital training, Implementation of digital tools, Performance monitoring and reporting. Our approach: 1. Digital audit of your current operations, 2. Custom transformation roadmap, 3. Implementation of recommended solutions, 4. Ongoing support and optimization. Perfect for traditional businesses looking to expand their digital presence. Contact: +212 701 193 811 for a free digital transformation consultation.',
    category: 'services',
    language: 'en',
    keywords: ['digital transformation', 'transformation digitale', 'consulting', 'strategy', 'sme', 'senegal'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '12',
    title: 'Services de Transformation Digitale',
    content: 'Services complets de transformation digitale pour les PME sénégalaises. Nous aidons les entreprises à moderniser leurs opérations et à toucher plus de clients en ligne. Services inclus : Conseil en stratégie digitale, Optimisation des processus métier, Formation numérique des employés, Mise en œuvre d\'outils digitaux, Surveillance et reporting des performances. Notre approche : 1. Audit digital de vos opérations actuelles, 2. Feuille de route de transformation personnalisée, 3. Mise en œuvre des solutions recommandées, 4. Support continu et optimisation. Parfait pour les entreprises traditionnelles souhaitant étendre leur présence digitale. Contactez : +212 701 193 811 pour une consultation gratuite en transformation digitale.',
    category: 'services',
    language: 'fr',
    keywords: ['transformation digitale', 'digital transformation', 'conseil', 'stratégie', 'pme', 'sénégal'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '13',
    title: 'Chatbot Development Services',
    content: 'We create intelligent chatbots that can handle customer inquiries 24/7, qualify leads, and even process orders. Our chatbots are available in both text and voice formats. Features: Natural language processing, Multi-language support (French and English), Integration with WhatsApp and websites, Lead qualification and follow-up, Order processing capabilities, Analytics dashboard. Pricing: From 50,000 CFA/month for basic chatbots. Contact: +212 701 193 811 for a custom chatbot solution.',
    category: 'services',
    language: 'en',
    keywords: ['chatbot', 'chatbot development', 'ai', 'artificial intelligence', 'customer service', 'lead qualification'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '14',
    title: 'Services de Développement de Chatbots',
    content: 'Nous créons des chatbots intelligents capables de gérer les demandes clients 24/7, qualifier les prospects et même traiter les commandes. Nos chatbots sont disponibles en formats texte et vocal. Fonctionnalités : Traitement du langage naturel, Support multilingue (français et anglais), Intégration avec WhatsApp et les sites web, Qualification de leads et suivi, Capacités de traitement des commandes, Tableau de bord analytique. Tarification : À partir de 50 000 CFA/mois pour les chatbots basiques. Contactez : +212 701 193 811 pour une solution de chatbot personnalisée.',
    category: 'services',
    language: 'fr',
    keywords: ['chatbot', 'développement de chatbot', 'ia', 'intelligence artificielle', 'service client', 'qualification de leads'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];