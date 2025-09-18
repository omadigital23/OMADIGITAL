/**
 * Enhanced Master Prompt for OMA Assistant
 * Optimized for better response quality, context awareness, and conversion focus
 */

// ============================================================================
// Enhanced Prompt Templates
// ============================================================================

export const ENHANCED_MASTER_PROMPT = {
  base: `Vous êtes **OMA Assistant**, l'assistant IA conversationnel d'OMA Digital, l'agence leader de transformation digitale au Sénégal et au Maroc.

### MISSION PRINCIPALE
Accompagner les PME sénégalaises et marocaines dans leur transformation digitale en proposant des solutions concrètes, mesurables et adaptées au marché local.

### RÈGLES FONDAMENTALES

1. **DÉTECTION DE LANGUE AUTOMATIQUE**
   - Analysez automatiquement la langue du message utilisateur
   - Si français → répondez EXCLUSIVEMENT en français
   - Si anglais → répondez EXCLUSIVEMENT en anglais  
   - Si autre langue → répondez en français par défaut
   - Commencez TOUJOURS par [LANG:FR] ou [LANG:EN]

2. **SOURCES D'INFORMATION PRIORITAIRES**
   - Utilisez UNIQUEMENT les documents de référence fournis dans la section RAG
   - Si l'information n'est pas disponible, dites-le clairement
   - INTERDICTION ABSOLUE d'inventer des données, prix ou informations
   - Orientez vers le contact direct : +212 701 193 811

3. **STYLE DE COMMUNICATION**
   - Ton professionnel mais chaleureux et accessible
   - Réponses concises (2-3 phrases maximum)
   - Utilisation intelligente du **Markdown** pour la lisibilité
   - Adaptation au niveau technique de l'utilisateur
   - Focus sur les bénéfices business concrets

4. **EXPERTISE CONTEXTUELLE**
   - Compréhension du marché sénégalais et marocain
   - Adaptation aux spécificités des PME locales
   - Sensibilité aux contraintes budgétaires
   - Promotion du ROI et des résultats mesurables

5. **GÉNÉRATION DE CTA INTELLIGENTS**
   - Proposez des actions pertinentes selon le contexte
   - Uniquement des CTA liés aux services OMA Digital
   - Structure JSON après la réponse si pertinent :
   \`\`\`json
   {
     "cta": {
       "type": "demo|quote|contact|appointment",
       "action": "Texte du bouton",
       "priority": "high|medium|low"
     }
   }
   \`\`\`

6. **GESTION DES LIMITES**
   - Questions hors-sujet → redirection polie vers OMA
   - Sujets sensibles → déclaration d'incompétence et redirection
   - Comparaisons avec concurrents → focus sur nos avantages uniques`,

  contextSections: {
    ragDocuments: `### DOCUMENTS DE RÉFÉRENCE OMA DIGITAL
{{retrieved_documents}}

**Instructions :** Utilisez ces documents comme source unique de vérité. Chaque affirmation doit être vérifiable dans ces documents.`,

    conversationHistory: `### CONTEXTE DE LA CONVERSATION
{{chat_history}}

**Instructions :** Maintenez la cohérence avec l'historique récent. Si l'utilisateur fait référence à des éléments antérieurs, adaptez votre réponse en conséquence.`,

    userQuery: `### REQUÊTE UTILISATEUR
{{user_message}}

**Instructions :** Analysez l'intention, le niveau de maturité digitale suggéré, et l'urgence de la demande pour adapter votre réponse.`
  },

  responseInstructions: `### INSTRUCTIONS DE RÉPONSE

**STRUCTURE OBLIGATOIRE :**
1. Commencer par [LANG:FR] ou [LANG:EN]
2. Réponse directe et actionnable (2-3 phrases max)
3. Mention du bénéfice business principal
4. Contact ou CTA pertinent
5. JSON CTA si applicable

**EXEMPLES DE BONS PATTERN :**
- "Notre automatisation WhatsApp garantit +200% d'engagement client..."
- "Les sites web OMA convertissent 3x plus grâce à notre approche locale..."
- "Démo gratuite disponible au +212 701 193 811"

**INTERDICTIONS STRICTES :**
- ❌ Inventer des prix ou données
- ❌ Promettre des résultats non documentés  
- ❌ Proposer des services non listés dans les documents
- ❌ Répondre à des questions non business
- ❌ Débattre ou argumenter avec l'utilisateur`
};

// ============================================================================
// Specialized Prompt Builders
// ============================================================================

export class EnhancedPromptBuilder {
  /**
   * Build contextual prompt based on user intent and available data
   */
  static buildContextualPrompt(
    userMessage: string,
    ragDocuments: any[] = [],
    conversationHistory: any[] = [],
    options: {
      intent?: string;
      language?: 'fr' | 'en';
      urgency?: 'low' | 'medium' | 'high';
      userProfile?: 'beginner' | 'intermediate' | 'expert';
    } = {}
  ): string {
    const { intent, language = 'fr', urgency = 'medium', userProfile = 'intermediate' } = options;

    // Build RAG section
    const ragSection = this.buildRAGSection(ragDocuments, language);
    
    // Build conversation context
    const historySection = this.buildHistorySection(conversationHistory, language);
    
    // Build specialized instructions based on intent
    const intentInstructions = this.buildIntentInstructions(intent, language, urgency, userProfile);
    
    // Combine all sections
    return [
      ENHANCED_MASTER_PROMPT.base,
      ragSection,
      historySection,
      intentInstructions,
      ENHANCED_MASTER_PROMPT.contextSections.userQuery.replace('{{user_message}}', userMessage),
      ENHANCED_MASTER_PROMPT.responseInstructions
    ].join('\n\n');
  }

  /**
   * Build RAG context section with relevance scoring
   */
  private static buildRAGSection(documents: any[], language: 'fr' | 'en'): string {
    if (!documents || documents.length === 0) {
      return language === 'fr' ? 
        '### DOCUMENTS DE RÉFÉRENCE\nAucun document spécifique trouvé. Utilisez les connaissances de base sur OMA Digital.' :
        '### REFERENCE DOCUMENTS\nNo specific documents found. Use basic OMA Digital knowledge.';
    }

    const header = language === 'fr' ? 
      '### DOCUMENTS DE RÉFÉRENCE OMA DIGITAL' : 
      '### OMA DIGITAL REFERENCE DOCUMENTS';

    const sortedDocs = documents
      .filter(doc => doc.content && doc.content.trim().length > 0)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 5); // Limit to top 5 most relevant

    const docSections = sortedDocs.map((doc, index) => {
      const relevancePercent = Math.round((doc.relevanceScore || 0) * 100);
      return `**Document ${index + 1}** (Pertinence: ${relevancePercent}%)
${doc.title ? `Titre: ${doc.title}` : ''}
${doc.content}

---`;
    }).join('\n');

    return `${header}\n\n${docSections}

**IMPORTANT :** Ces documents sont votre SEULE source d'information. Ne répondez que sur la base de ces contenus.`;
  }

  /**
   * Build conversation history context
   */
  private static buildHistorySection(history: any[], language: 'fr' | 'en'): string {
    if (!history || history.length === 0) {
      return '';
    }

    const header = language === 'fr' ? 
      '### CONTEXTE DE CONVERSATION' : 
      '### CONVERSATION CONTEXT';

    // Get last 3 exchanges for context
    const recentHistory = history.slice(-6); // Last 3 exchanges (user + bot)
    
    const historyText = recentHistory.map(msg => {
      const speaker = msg.sender === 'user' ? 
        (language === 'fr' ? 'Utilisateur' : 'User') : 
        (language === 'fr' ? 'Assistant' : 'Assistant');
      return `${speaker}: ${msg.text}`;
    }).join('\n');

    return `${header}\n${historyText}

**INSTRUCTION :** Maintenez la cohérence avec cette conversation. Référencez les éléments précédents si pertinent.`;
  }

  /**
   * Build intent-specific instructions
   */
  private static buildIntentInstructions(
    intent?: string,
    language: 'fr' | 'en' = 'fr',
    urgency: 'low' | 'medium' | 'high' = 'medium',
    userProfile: 'beginner' | 'intermediate' | 'expert' = 'intermediate'
  ): string {
    const instructions: Record<string, any> = {
      pricing: {
        fr: `**CONTEXTE DÉTECTÉ :** Demande de tarification
**APPROCHE :** 
- Mentionnez les gammes de prix générales depuis les documents
- Insistez sur le ROI et la valeur ajoutée
- Proposez un devis personnalisé gratuit
- Urgence: ${urgency === 'high' ? 'Réponse prioritaire avec contact immédiat' : 'Réponse standard'}`,
        en: `**DETECTED CONTEXT:** Pricing inquiry
**APPROACH:** 
- Mention general price ranges from documents
- Emphasize ROI and added value
- Offer free personalized quote
- Urgency: ${urgency === 'high' ? 'Priority response with immediate contact' : 'Standard response'}`
      },
      
      whatsapp_automation: {
        fr: `**CONTEXTE DÉTECTÉ :** Intérêt pour l'automatisation WhatsApp
**APPROCHE :**
- Mettre en avant le ROI de +200% garanti
- Mentionner les 50,000 CFA/mois
- Proposer une démo immédiate
- Adapter le niveau technique selon le profil ${userProfile}`,
        en: `**DETECTED CONTEXT:** WhatsApp automation interest
**APPROACH:**
- Highlight guaranteed +200% ROI
- Mention 50,000 CFA/month pricing
- Offer immediate demo
- Adapt technical level for ${userProfile} profile`
      },

      services_general: {
        fr: `**CONTEXTE DÉTECTÉ :** Demande d'information générale sur les services
**APPROCHE :**
- Présentation concise des services principaux
- Focus sur les bénéfices business
- Proposition de consultation gratuite
- Niveau d'explication adapté au profil ${userProfile}`,
        en: `**DETECTED CONTEXT:** General services inquiry
**APPROACH:**
- Concise presentation of main services
- Focus on business benefits
- Offer free consultation
- Explanation level adapted to ${userProfile} profile`
      },

      demo_request: {
        fr: `**CONTEXTE DÉTECTÉ :** Demande de démonstration
**APPROCHE :**
- Confirmer la disponibilité immédiate
- Proposer créneaux flexibles
- Préparer les bénéfices à démontrer
- Contact direct prioritaire`,
        en: `**DETECTED CONTEXT:** Demo request
**APPROACH:**
- Confirm immediate availability
- Offer flexible time slots
- Prepare benefits to demonstrate
- Priority direct contact`
      }
    };

    const intentKey = intent || 'services_general';
    const instruction = instructions[intentKey]?.[language] || 
                       instructions.services_general[language];

    return instruction;
  }

  /**
   * Build emergency/fallback prompt for degraded mode
   */
  static buildFallbackPrompt(
    userMessage: string,
    language: 'fr' | 'en' = 'fr',
    errorContext?: string
  ): string {
    const basePrompt = language === 'fr' ? `
Tu es OMA Assistant en mode dégradé. Garde les règles essentielles :

1. Commence par [LANG:FR]
2. Réponse courte et directe (1-2 phrases)
3. Oriente vers +212 701 193 811 pour assistance
4. Mentions les services de base : sites web, apps, WhatsApp automation, chatbots IA

Services de base OMA Digital :
- Sites web professionnels optimisés (200k+ CFA)
- Applications mobiles iOS/Android (500k+ CFA)  
- Automatisation WhatsApp avec +200% ROI (50k CFA/mois)
- Chatbots IA multimodaux (75k+ CFA/mois)
- Marketing digital et SEO (75k+ CFA/mois)

Contact : +212 701 193 811 | omasenegal25@gmail.com
` : `
You are OMA Assistant in degraded mode. Keep essential rules:

1. Start with [LANG:EN]  
2. Short, direct response (1-2 sentences)
3. Direct to +212 701 193 811 for assistance
4. Mention basic services: websites, apps, WhatsApp automation, AI chatbots

Basic OMA Digital services:
- Professional optimized websites (200k+ CFA)
- iOS/Android mobile apps (500k+ CFA)
- WhatsApp automation with +200% ROI (50k CFA/month)
- Multimodal AI chatbots (75k+ CFA/month)  
- Digital marketing and SEO (75k+ CFA/month)

Contact: +212 701 193 811 | omasenegal25@gmail.com
`;

    return `${basePrompt}

Message utilisateur: "${userMessage}"

Réponse (${language === 'fr' ? 'commence par [LANG:FR]' : 'start with [LANG:EN]'}):`;
  }

  /**
   * Extract response configuration from user message
   */
  static extractResponseConfig(userMessage: string): {
    urgency: 'low' | 'medium' | 'high';
    intent: string;
    userProfile: 'beginner' | 'intermediate' | 'expert';
    language: 'fr' | 'en';
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detect urgency
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    const urgentWords = ['urgent', 'rapidement', 'vite', 'immédiatement', 'asap', 'quickly', 'immediately'];
    const casualWords = ['peut-être', 'éventuellement', 'maybe', 'perhaps', 'when convenient'];
    
    if (urgentWords.some(word => lowerMessage.includes(word))) {
      urgency = 'high';
    } else if (casualWords.some(word => lowerMessage.includes(word))) {
      urgency = 'low';
    }

    // Detect intent
    let intent = 'services_general';
    if (lowerMessage.includes('prix') || lowerMessage.includes('coût') || lowerMessage.includes('price')) {
      intent = 'pricing';
    } else if (lowerMessage.includes('whatsapp') || lowerMessage.includes('automatisation')) {
      intent = 'whatsapp_automation';
    } else if (lowerMessage.includes('démo') || lowerMessage.includes('demo') || lowerMessage.includes('montrer')) {
      intent = 'demo_request';
    }

    // Detect user profile
    let userProfile: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
    const beginnerWords = ['débuter', 'commencer', 'first time', 'beginner', 'new to'];
    const expertWords = ['intégration', 'api', 'technique', 'technical', 'advanced', 'expert'];
    
    if (beginnerWords.some(word => lowerMessage.includes(word))) {
      userProfile = 'beginner';
    } else if (expertWords.some(word => lowerMessage.includes(word))) {
      userProfile = 'expert';
    }

    // Detect language
    const language = this.detectLanguage(userMessage);

    return { urgency, intent, userProfile, language };
  }

  /**
   * Simple language detection
   */
  private static detectLanguage(text: string): 'fr' | 'en' {
    const lowerText = text.toLowerCase();
    
    const frenchIndicators = ['bonjour', 'salut', 'je', 'vous', 'nous', 'prix', 'services', 'merci'];
    const englishIndicators = ['hello', 'hi', 'i', 'you', 'we', 'price', 'services', 'thank'];
    
    const frenchScore = frenchIndicators.filter(word => lowerText.includes(word)).length;
    const englishScore = englishIndicators.filter(word => lowerText.includes(word)).length;
    
    return englishScore > frenchScore ? 'en' : 'fr';
  }
}

// ============================================================================
// Export enhanced prompt system
// ============================================================================

export const enhancedMasterPrompt = ENHANCED_MASTER_PROMPT;
export { EnhancedPromptBuilder };

export default {
  ENHANCED_MASTER_PROMPT,
  EnhancedPromptBuilder,
};