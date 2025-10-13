/**
 * API Route pour Google AI Studio (Gemini) - Version Simplifiée
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { searchOMAKnowledge, formatDocumentsForGemini } from '../../../src/lib/rag/enhanced-vector-search';
import { OMA_DIGITAL_MASTER_PROMPT } from '../../../src/lib/prompts/oma-digital-master-prompt';
import { selectSmartCTA, MARKETING_CTA_STRATEGIES } from '../../../src/lib/prompts/marketing-cta-strategies';

interface ChatRequest {
  message: string;
  sessionId: string;
  context?: {
    history: any[];
  };
}

interface ChatResponse {
  response: string;
  language: 'fr' | 'en';
  suggestions?: string[];
  cta?: any;
  source: string;
  confidence: number;
  timestamp?: string;
  response_time_ms?: number;
}

// Configuration des mots-clés pour améliorer les performances
const KEYWORDS = {
  en: {
    mobile: ['app', 'mobile'],
    whatsapp: ['whatsapp', 'automation'],
    website: ['website', 'web'],
    pricing: ['price', 'cost', 'tarif']
  },
  fr: {
    mobile: ['app', 'mobile', 'application'],
    whatsapp: ['whatsapp', 'automatisation'],
    website: ['site', 'web'],
    pricing: ['prix', 'coût', 'tarif']
  }
};

const SUGGESTIONS = {
  en: {
    mobile: ['Get mobile app quote', 'See app portfolio', 'Discuss app features'],
    whatsapp: ['Request WhatsApp demo', 'See automation pricing', 'View success stories'],
    website: ['Get website quote', 'See performance examples', 'Schedule consultation'],
    pricing: ['View all pricing', 'Get custom quote', 'Compare packages'],
    default: ['Discover all services', 'Request free consultation', 'See client results']
  },
  fr: {
    mobile: ['Obtenir devis app mobile', 'Voir portfolio apps', 'Discuter fonctionnalités'],
    whatsapp: ['Demander démo WhatsApp', 'Voir tarifs automatisation', 'Voir cas de succès'],
    website: ['Obtenir devis site', 'Voir exemples performance', 'Planifier consultation'],
    pricing: ['Voir tous les tarifs', 'Obtenir devis personnalisé', 'Comparer les packages'],
    default: ['Découvrir tous les services', 'Demander consultation gratuite', 'Voir résultats clients']
  }
};

// Enhanced rate limiting with progressive penalties
const rateLimitMap = new Map();
const suspiciousIPs = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  let maxRequests = 20;
  
  // Check if IP is suspicious (reduce limit)
  if (suspiciousIPs.has(ip)) {
    const suspiciousData = suspiciousIPs.get(ip);
    if (now - suspiciousData.timestamp < 300000) { // 5 minutes penalty
      maxRequests = 5;
    } else {
      suspiciousIPs.delete(ip);
    }
  }
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip).filter((time: number) => time > now - windowMs);
  
  if (requests.length >= maxRequests) {
    // Mark as suspicious after multiple violations
    if (requests.length >= 30) {
      suspiciousIPs.set(ip, { timestamp: now, violations: (suspiciousIPs.get(ip)?.violations || 0) + 1 });
    }
    return false;
  }
  
  requests.push(now);
  rateLimitMap.set(ip, requests);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupRateLimitMaps(now);
  }
  
  return true;
}

function cleanupRateLimitMaps(now: number) {
  // Clean rate limit map
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter((time: number) => time > now - 60000);
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
  
  // Clean suspicious IPs map
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.timestamp > 300000) {
      suspiciousIPs.delete(ip);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enhanced security and rate limiting
  const { securityManager } = await import('../../../src/lib/security-enhanced');
  
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
           req.socket.remoteAddress || 
           'unknown';
  
  // Basic IP validation
  if (ip !== 'unknown' && !/^[0-9a-f.:]+$/i.test(ip)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // Check IP status
  const ipStatus = securityManager.getIPStatus(ip);
  if (ipStatus.blocked) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Enhanced rate limiting
  const rateLimitResult = securityManager.checkRateLimit(ip, 'chat');
  if (!rateLimitResult.allowed) {
    // Static French to avoid any local detection
    return res.status(429).json({ 
      error: 'Trop de requêtes. Attendez 1 minute.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }
  
  // Add request start time for performance tracking
  req.headers['x-request-start'] = Date.now().toString();

  // Declare variables that need to be accessible in catch block
  let message = '';
  let sessionId = '';
  let sanitizedMessage = '';

  try {
    const { message: reqMessage, sessionId: reqSessionId }: ChatRequest = req.body;
    message = reqMessage;
    sessionId = reqSessionId;

    const validation = securityManager.validateAndSanitize(message, 'chat');
    
    if (!validation.isValid) {
      const errorMsg = 'Contenu de message invalide détecté';
      
      // Log security threat
      console.warn('Security threat detected:', {
        ip,
        threats: validation.threats,
        riskLevel: validation.riskLevel,
        originalMessage: message.substring(0, 100)
      });
      
      return res.status(400).json({ 
        error: errorMsg,
        code: 'SECURITY_VALIDATION_FAILED'
      });
    }
    
    // Use sanitized message
    sanitizedMessage = validation.sanitized;
    
    if (!sanitizedMessage?.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Vertex call with RAG and circuit breaker pattern
    let response: string;
    // Do not use any local detection; default will be replaced by model output parsing
    let detectedLanguage: 'fr' | 'en' = 'fr';
    let source = 'vertex_rag';
    let confidence = 0.9;
    const startTime = Date.now();
    
    try {
      const vertexResult = await callVertexGenerateContent(sanitizedMessage);
      response = vertexResult.response;
      // Adopt model-detected language
      detectedLanguage = vertexResult.language;
      
      // Enhanced response validation
      if (!response || response.length < 10) {
        throw new Error('Response too short');
      }
      
      // Check for inappropriate content
      const inappropriatePatterns = [/\b(spam|scam|hack)\b/i];
      if (inappropriatePatterns.some(pattern => pattern.test(response))) {
        throw new Error('Inappropriate response detected');
      }
      
      console.log(`Vertex response generated in ${Date.now() - startTime}ms`);
      
    } catch (error) {
      console.error('Vertex API error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check if it's a permission error and provide specific guidance
      if (error instanceof Error && error.message.includes('Permission')) {
        console.error('VERTEX AI PERMISSION ERROR: Please ensure the service account has the following roles:');
        console.error('- Vertex AI User (roles/aiplatform.user)');
        console.error('- Service Account Token Creator (roles/iam.serviceAccountTokenCreator)');
        console.error('Visit: https://cloud.google.com/vertex-ai/docs/general/access-control');
      }
      
      // Check if it's a model not found error and provide specific guidance
      if (error instanceof Error && (error.message.includes('NOT_FOUND') || error.message.includes('404'))) {
        console.error('VERTEX AI MODEL NOT FOUND ERROR: Please take these steps:');
        console.error('1. Enable Vertex AI API:');
        console.error('   Go to https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com');
        console.error('2. Enable a model in Google Cloud Console:');
        console.error('   Go to https://console.cloud.google.com/vertex-ai/model-garden');
        console.error('   Search for and enable one of these models:');
        console.error('   - gemini-1.0-pro');
        console.error('   - gemini-pro');
        console.error('   - text-bison');
        console.error('   - chat-bison');
        console.error('3. Ensure your service account has the Vertex AI User role');
        console.error('4. Wait a few minutes for the model to be provisioned');
      }
      
      // No local detection; respond with static French fallback
      detectedLanguage = 'fr';
      response = 'Désolé, je rencontre un problème technique avec l\'accès à l\'IA. Veuillez vérifier que les APIs Google Cloud sont correctement configurés.';
      source = 'error_fallback';
      confidence = 0.7;
      console.log(`Fallback response generated in ${Date.now() - startTime}ms`);
    }

    // 🎯 DÉTECTION PRIX ET GÉNÉRATION CTA MARKETING
    const smartCTA = selectSmartCTA(sanitizedMessage, detectedLanguage);
    const hasPriceQuery = MARKETING_CTA_STRATEGIES.PRICE_TRIGGERS.some(
      trigger => sanitizedMessage.toLowerCase().includes(trigger)
    );

    // Enhanced suggestions and CTA generation with error handling
    let suggestions: string[] = [];
    let cta: any = null;
    
    try {
      suggestions = generateSuggestions(sanitizedMessage, detectedLanguage);
    } catch (suggestionError) {
      console.error('Suggestion generation error:', suggestionError);
      // Use default suggestions
      suggestions = detectedLanguage === 'en' 
        ? ['Contact us', 'View services', 'Get quote']
        : ['Nous contacter', 'Voir services', 'Obtenir devis'];
    }
    
    try {
      cta = await generateCTA(sanitizedMessage, detectedLanguage);
    } catch (ctaError) {
      console.error('Erreur lors de la récupération des CTAs:', ctaError);
      // CTA is optional, continue without it (don't throw)
      cta = null;
    }

    // Final response validation and assembly
    const chatResponse: ChatResponse = {
      response: response.trim(),
      language: detectedLanguage,
      suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
      cta,
      source,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime
    };
    
    // Validate final response
    if (!chatResponse.response || chatResponse.response.length < 5) {
      throw new Error('Invalid final response');
    }

    // Enhanced tracking with security metadata
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
        process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
      );
      
      // Use the correct table names that exist in the database
      const trackingData = {
        session_id: sessionId,
        user_message: sanitizedMessage.substring(0, 1000), // Limit message length
        bot_response: response.substring(0, 2000),
        language: detectedLanguage,
        input_type: 'text',
        confidence: confidence,
        ip_address: ip,
        user_agent: req.headers['user-agent']?.substring(0, 200) || null,
        created_at: new Date().toISOString()
      };
      
      // Insert into chatbot_conversations table (this table exists based on our check)
      const { error: trackingError } = await supabase
        .from('chatbot_conversations')
        .insert(trackingData);
        
      if (trackingError) {
        console.warn('Tracking error:', trackingError.message);
      }
      
      // ALSO SAVE TO THE MESSAGES TABLE for admin dashboard (this table exists)
      try {
        // First, check if a conversation already exists for this session
        let { data: existingConversation, error: convCheckError } = await supabase
          .from('chatbot_conversations')
          .select('id')
          .eq('session_id', sessionId)
          .single();

        // If no conversation exists, create one
        if (convCheckError || !existingConversation) {
          const { data: newConversation, error: newConvError } = await supabase
            .from('chatbot_conversations')
            .insert({
              session_id: sessionId,
              language: detectedLanguage,
              input_type: 'gemini_chat',
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (newConvError) {
            console.error('Error creating conversation:', newConvError);
          } else {
            existingConversation = newConversation;
          }
        }

        // Save messages to the messages table (this table exists)
        if (existingConversation) {
          const { error: messageError } = await supabase.from('messages').insert([
            {
              conversation_id: existingConversation.id,
              content: sanitizedMessage,
              sender: 'user',
              message_type: 'text',
              language: detectedLanguage,
              metadata: { 
                input_type: 'user_query',
                source: 'gemini_api'
              }
            },
            {
              conversation_id: existingConversation.id,
              content: response,
              sender: 'bot',
              message_type: 'text',
              language: detectedLanguage,
              metadata: { 
                source: source,
                confidence: confidence,
                suggestions: suggestions.slice(0, 3),
                cta: cta
              }
            }
          ]);
          
          if (messageError) {
            console.error('Error saving messages:', messageError);
          }
        }
      } catch (conversationError) {
        console.error('Error saving to conversations/messages tables:', conversationError);
      }
    } catch (trackingError) {
      console.error('Tracking system error:', trackingError);
    }

    // 🎯 AJOUT CTA MARKETING À LA RÉPONSE FINALE
    let finalResponse = chatResponse.response;
    
    // Si pas de CTA naturel dans la réponse, ajouter le CTA marketing
    if (!finalResponse.includes('💡') && !finalResponse.includes('👉') && smartCTA && smartCTA.cta) {
      finalResponse += `\n\n💡 **${smartCTA.cta}**`;
    }

    // Réponse finale avec CTA marketing intégré
    const enhancedChatResponse = {
      ...chatResponse,
      response: finalResponse,
      cta_triggered: hasPriceQuery,
      marketing_technique: smartCTA ? smartCTA.technique : null
    };

    res.status(200).json(enhancedChatResponse);

  } catch (error) {
    console.error('Erreur API Chat:', error);
    
    // Enhanced error logging with security context
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
        process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
      );
      
      await supabase.from('error_logs').insert({
        error_type: 'chatbot_api_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_message: sanitizedMessage?.substring(0, 500) || message?.substring(0, 500) || 'N/A',
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        ip_address: ip,
        user_agent: req.headers['user-agent']?.substring(0, 200) || null,
        security_context: {
          rateLimitRemaining: rateLimitResult?.remaining || 0,
          ipSuspicious: ipStatus?.suspicious || false,
          requestPath: req.url || '/api/chat/gemini'
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    // Static French error to avoid local detection
    const errorMessage = 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.';
    const errorCode = 500;
    
    res.status(errorCode).json({
      response: errorMessage,
      language: 'fr',
      source: 'emergency_fallback',
      confidence: 0.3,
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}

/**
 * Vertex AI GenerateContent with auto language detection via prompt marker
 */
async function callVertexGenerateContent(message: string): Promise<{response: string, language: 'fr' | 'en'}> {
  // Use Google AI Studio API key from environment variables
  const apiKey = process.env['GOOGLE_AI_API_KEY'];
  if (!apiKey) {
    throw new Error('Google AI Studio API key not configured');
  }

  // RAG context (language-neutral)
  const ragContext = await retrieveRAGContext(message);

  const prompt = createAutoDetectPrompt(message, ragContext);

  // Use gemini-2.5-flash as it's working with your API key
  const model = 'gemini-2.5-flash';
  let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Google AI Studio API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const fullResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!fullResponse || fullResponse.trim().length < 1) {
      throw new Error('Empty or invalid response from Google AI Studio');
    }
    return parseModelResponse(fullResponse);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'AbortError') {
      throw new Error('Request timeout - Google AI Studio API took too long to respond');
    }
    throw error;
  }
}

/**
 * AMÉLIORATION: Récupération RAG optimisée avec cache et recherche hybride
 */
async function retrieveRAGContext(message: string): Promise<string> {
  try {
    // Import du système RAG optimisé
    const { optimizedRAG } = await import('../../../src/lib/rag/optimized-vector-search');
    
    console.log('🔍 RAG Search starting for:', message.substring(0, 50));
    
    // Utilisation du système RAG amélioré
    const searchResult = await optimizedRAG.searchKnowledgeOptimized(message, {
      language: 'fr',
      limit: 3, // Augmenté de 2 à 3 pour plus de contexte
      useCache: true,
      similarity_threshold: 0.7
    });

    const { data: documents, metadata } = searchResult;
    
    // Log des métriques de performance
    console.log('📊 RAG Performance:', {
      found: documents.length,
      latency: metadata.latency,
      cached: metadata.cached,
      source: metadata.source
    });

    if (!documents || documents.length === 0) {
      console.log('⚠️ RAG: No documents found');
      return '';
    }

    // AMÉLIORATION: Formatage optimisé du contexte
    return documents
      .map(doc => `**${doc.title}**:\n${doc.content.substring(0, 300)}`) // Limiter la longueur
      .join('\n\n');
      
  } catch (error) {
    console.error('❌ RAG Error:', error);
    return '';
  }
}

/**
 * Parse model response using only explicit [LANG:FR|EN] marker. Default to 'fr' if missing.
 */
function parseModelResponse(fullResponse: string): {response: string, language: 'fr' | 'en'} {
  const langMatch = fullResponse.match(/\[LANG:(FR|EN)\]/i);
  const code = langMatch && langMatch[1] ? langMatch[1].toUpperCase() : undefined;
  const detectedLang: 'fr' | 'en' = code === 'EN' ? 'en' : 'fr';

  const cleanResponse = fullResponse
    .replace(/\[LANG:(FR|EN)\]\s*/i, '')
    .trim();

  return {
    response: cleanResponse || 'Désolé, je rencontre un problème technique. Contactez-nous au +212 701 193 811.',
    language: detectedLang
  };
}

/**
 * Création d'un prompt avec RAG et détection automatique de langue améliorée
 */
function createAutoDetectPrompt(
  message: string, 
  ragContext: string = ''
): string {
  const sanitizedMessage = message
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
  const ragSection = ragContext ? `

**Documents de référence (issus du RAG) :**
${ragContext}

**PRIORITÉ ABSOLUE :** Utilise exclusivement les informations fournies dans les documents de référence pour répondre. Si l'information n'est pas dans les documents, indique clairement que tu ne l'as pas et propose le contact OMA Digital.` : '';

  return `Tu es OMADIGITAL, l'assistant IA d'OMA Digital (Sénégal/Maroc).

SERVICES PRINCIPAUX:
• Automatisation WhatsApp Business (ROI 200% garanti en 90 jours)
• Sites web ultra-rapides (performance garantie)
• Applications mobiles (iOS/Android sur mesure)
• Assistants IA personnalisés (solutions qui se remboursent)
• Branding digital complet (transformation garantie)

Contact: +212 701 193 811 | omadigital23@gmail.com${ragSection}

INSTRUCTIONS CRITIQUES:
1. Détecte automatiquement la langue (FR ou EN) du message utilisateur
2. Réponds exclusivement dans la langue détectée
3. Commence OBLIGATOIREMENT par [LANG:FR] ou [LANG:EN]
4. **Concision absolue :** Max 2 phrases courtes et directes
5. **Pertinence RAG :** Oriente toujours vers les offres OMA Digital des documents
6. **Interdiction absolue :** Jamais de prix, coûts, tarifs ou montants exacts
7. **Source unique :** N'utilise que les documents de référence
8. Refuse les questions non liées à nos services
9. N'engendre jamais de contenu inapproprié
10. Termine toujours par une action concrète

Message utilisateur: "${sanitizedMessage}"

Réponse:`;
}

/**
 * Génération de suggestions contextuelles intelligentes
 */
function generateSuggestions(message: string, language: 'fr' | 'en'): string[] {
  const lowerMessage = message.toLowerCase();
  const keywords = KEYWORDS[language];
  const suggestions = SUGGESTIONS[language];
  
  // Utilisation d'une approche plus efficace avec find()
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    if (categoryKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return suggestions[category as keyof typeof suggestions] || suggestions.default;
    }
  }
  
  return suggestions.default;
}

/**
 * Génération de CTA intelligent avec Supabase
 */
async function generateCTA(message: string, language: 'fr' | 'en'): Promise<any> {
  try {
    // Import dynamique pour éviter les erreurs SSR
    const { ctaService } = await import('../../../src/lib/cta-service');
    const bestCTA = await ctaService.findBestCTA(message, language);
    
    if (bestCTA) {
      return {
        id: bestCTA.id,
        type: bestCTA.type,
        action: bestCTA.action,
        priority: bestCTA.priority,
        data: bestCTA.data
      };
    }
  } catch (error) {
    console.error('Erreur génération CTA:', error);
    return null;
  }
  
  return null;
}