/**
 * API Route pour Google AI Studio (Gemini) - Version Simplifiée
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { searchOMAKnowledge, formatDocumentsForGemini, detectLanguage } from '../../../src/lib/rag/enhanced-vector-search';
import { OMA_DIGITAL_MASTER_PROMPT } from '../../../src/lib/prompts/oma-digital-master-prompt';

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

// Enhanced fallback language detection
function detectFallbackLanguage(text: string): 'fr' | 'en' {
  const lowerText = text.toLowerCase();
  const englishWords = ['hello', 'hi', 'thank', 'please', 'service', 'price', 'cost', 'help'];
  const frenchWords = ['bonjour', 'salut', 'merci', 'svp', 'service', 'prix', 'coût', 'aide'];
  
  const englishScore = englishWords.filter(word => lowerText.includes(word)).length;
  const frenchScore = frenchWords.filter(word => lowerText.includes(word)).length;
  
  return englishScore > frenchScore ? 'en' : 'fr';
}

// Enhanced fallback response generator
function generateEnhancedFallback(message: string, language: 'fr' | 'en'): string {
  const lowerMessage = message.toLowerCase();
  
  if (language === 'en') {
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Our WhatsApp automation starts at 50,000 CFA/month with guaranteed 200% ROI. Contact us at +212 701 193 811 for a personalized quote! 💰';
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('what')) {
      return 'We offer WhatsApp automation (200% ROI), ultra-fast websites, mobile apps, and AI assistants. Contact +212 701 193 811 to transform your business! 🚀';
    }
    return 'Hello! I\'m OMADIGITAL, your AI assistant. We deliver 200% ROI with WhatsApp automation. Contact us at +212 701 193 811 for immediate assistance! 👋';
  } else {
    if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût')) {
      return 'Notre automatisation WhatsApp commence à 50 000 CFA/mois avec un ROI garanti de 200%. Contactez-nous au +212 701 193 811 pour un devis personnalisé ! 💰';
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('que') || lowerMessage.includes('quoi')) {
      return 'Nous proposons l\'automatisation WhatsApp (ROI 200%), sites web ultra-rapides, apps mobiles et assistants IA. Appelez +212 701 193 811 pour transformer votre business ! 🚀';
    }
    return 'Bonjour ! Je suis OMADIGITAL, votre assistant IA. Nous livrons un ROI de 200% avec l\'automatisation WhatsApp. Contactez-nous au +212 701 193 811 ! 👋';
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
    const detectedLang = detectFallbackLanguage(req.body?.message || '');
    const errorMsg = detectedLang === 'en' 
      ? 'Too many requests. Please wait 1 minute.'
      : 'Trop de requêtes. Attendez 1 minute.';
    
    return res.status(429).json({ 
      error: errorMsg,
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }
  
  // Add request start time for performance tracking
  req.headers['x-request-start'] = Date.now().toString();

  // Declare variables that need to be accessible in catch block
  let message = '';
  let sessionId = '';
  let sanitizedMessage = '';
  let detectedLang = 'fr';

  try {
    const { message: reqMessage, sessionId: reqSessionId, detectedLanguage: reqDetectedLanguage }: ChatRequest & { detectedLanguage?: 'fr' | 'en' } = req.body;
    message = reqMessage;
    sessionId = reqSessionId;

    const validation = securityManager.validateAndSanitize(message, 'chat');
    
    if (!validation.isValid) {
      detectedLang = detectFallbackLanguage(message);
      const errorMsg = detectedLang === 'en' 
        ? 'Invalid message content detected'
        : 'Contenu de message invalide détecté';
      
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
      detectedLang = detectFallbackLanguage(req.body?.message || '');
      const errorMsg = detectedLang === 'en' ? 'Message required' : 'Message requis';
      return res.status(400).json({ error: errorMsg });
    }

    // Enhanced Gemini call with RAG and circuit breaker pattern
    let response: string;
    // Use the detected language from the frontend if available, otherwise default to French
    let detectedLanguage: 'fr' | 'en' = reqDetectedLanguage || 'fr';
    let source = 'gemini_rag';
    let confidence = 0.9;
    const startTime = Date.now();
    
    try {
      console.log('🎵 Using detected language for Gemini API:', detectedLanguage);
      const geminiResult = await callGeminiAPI(sanitizedMessage, detectedLanguage);
      response = geminiResult.response;
      
      // Enhanced response validation
      if (!response || response.length < 10) {
        throw new Error('Response too short');
      }
      
      // Check for inappropriate content
      const inappropriatePatterns = [/\b(spam|scam|hack)\b/i];
      if (inappropriatePatterns.some(pattern => pattern.test(response))) {
        throw new Error('Inappropriate response detected');
      }
      
      console.log(`Gemini response generated in ${Date.now() - startTime}ms`);
      
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Enhanced fallback with language detection
      detectedLanguage = detectFallbackLanguage(sanitizedMessage);
      response = generateEnhancedFallback(sanitizedMessage, detectedLanguage);
      source = 'enhanced_fallback';
      confidence = 0.7;
      
      console.log(`Fallback response generated in ${Date.now() - startTime}ms`);
    }

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
      console.error('CTA generation error:', ctaError);
      // CTA is optional, continue without it
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
      
      const trackingData = {
        session_id: sessionId,
        user_message: sanitizedMessage.substring(0, 1000), // Limit message length
        bot_response: response.substring(0, 2000), // Limit response length
        language: detectedLanguage,
        source,
        confidence,
        response_time_ms: Date.now() - parseInt(req.headers['x-request-start'] as string || '0'),
        ip_address: ip,
        user_agent: req.headers['user-agent']?.substring(0, 200) || null,
        security_validated: true,
        created_at: new Date().toISOString()
      };
      
      // Use upsert to handle potential conflicts
      const { error: trackingError } = await supabase
        .from('chatbot_interactions')
        .insert(trackingData);
        
      if (trackingError) {
        console.error('Tracking error:', trackingError);
        // Don't throw - tracking failure shouldn't break the response
      }
      
      // ALSO SAVE TO THE NEWER CONVERSATIONS/MESSAGES TABLES for admin dashboard
      try {
        // Create or get conversation
        let { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', sessionId)
          .single();

        if (convError || !conversation) {
          const { data: newConv, error: newConvError } = await supabase
            .from('conversations')
            .insert({
              user_id: null,
              session_id: sessionId,
              language: detectedLanguage,
              context: { 
                type: 'gemini_chat',
                source: source
              },
              metadata: { 
                created_by: 'gemini_api',
                confidence: confidence
              }
            })
            .select('id')
            .single();

          if (newConvError) {
            console.error('Error creating conversation:', newConvError);
          } else {
            conversation = newConv;
          }
        }

        // Save messages if conversation exists
        if (conversation) {
          await supabase.from('messages').insert([
            {
              conversation_id: conversation.id,
              content: sanitizedMessage,
              sender: 'user',
              language: detectedLanguage,
              metadata: { 
                input_type: 'user_query',
                source: 'gemini_api'
              }
            },
            {
              conversation_id: conversation.id,
              content: response,
              sender: 'bot',
              language: detectedLanguage,
              metadata: { 
                source: source,
                confidence: confidence,
                suggestions: suggestions.slice(0, 3),
                cta: cta
              }
            }
          ]);
        }
      } catch (conversationError) {
        console.error('Error saving to conversations/messages tables:', conversationError);
        // Don't throw - this is for admin dashboard only
      }
    } catch (trackingError) {
      console.error('Tracking system error:', trackingError);
      // Continue execution - tracking is not critical
    }

    res.status(200).json(chatResponse);

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
        user_message: sanitizedMessage?.substring(0, 500) || 'N/A',
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
    
    // Enhanced error handling with specific error types
    let errorMessage = 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.';
    let errorCode = 500;
    detectedLang = detectFallbackLanguage(message || sanitizedMessage);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('GOOGLE_AI_API_KEY')) {
        errorMessage = detectedLang === 'en' 
          ? 'Service temporarily unavailable. Our technical team has been notified.'
          : 'Service temporairement indisponible. Notre équipe technique a été notifiée.';
        errorCode = 503;
      } else if (error.message.includes('rate limit')) {
        errorMessage = detectedLang === 'en'
          ? 'Too many requests. Please wait a few minutes before trying again.'
          : 'Trop de requêtes. Veuillez patienter quelques minutes avant de réessayer.';
        errorCode = 429;
      } else if (error.message.includes('network')) {
        errorMessage = detectedLang === 'en'
          ? 'Connection problem. Please check your internet connection.'
          : 'Problème de connexion. Veuillez vérifier votre connexion internet.';
        errorCode = 503;
      }
    }
    
    // Intelligent fallback with language detection
    const fallbackResponse = generateEnhancedFallback(message || sanitizedMessage, detectedLang as "fr" | "en");
    
    res.status(errorCode).json({
      response: errorMessage,
      language: detectedLang,
      source: 'emergency_fallback',
      confidence: 0.3,
      fallback_response: fallbackResponse,
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}

/**
 * Appel à l'API Gemini avec RAG et détection automatique de langue
 */
async function callGeminiAPI(message: string, detectedLanguage?: 'fr' | 'en'): Promise<{response: string, language: 'fr' | 'en'}> {
  const apiKey = process.env['GOOGLE_AI_API_KEY'];
  
  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY manquante dans .env.local');
    throw new Error('Configuration Google AI manquante');
  }
  
  console.log('Utilisation Google AI API pour message de longueur:', message.length);

  // Récupération du contexte RAG
  const ragContext = await retrieveRAGContext(message);
  const prompt = createAutoDetectPrompt(message, ragContext, detectedLanguage);
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  // Enhanced fetch with timeout and retry logic
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Enhanced response validation
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response candidates from Gemini');
    }
    
    const candidate = data.candidates[0];
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Response blocked by safety filters');
    }
    
    const fullResponse = candidate?.content?.parts?.[0]?.text;
    if (!fullResponse || fullResponse.trim().length < 5) {
      throw new Error('Empty or invalid response from Gemini');
    }
    
    // Extraire la langue et la réponse
    return parseGeminiResponse(fullResponse);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new Error('Request timeout - Gemini API took too long to respond');
    }
    
    throw error;
  }
}

/**
 * Récupération du contexte RAG depuis Supabase
 */
async function retrieveRAGContext(message: string): Promise<string> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
      process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
    );

    // Détection de la langue pour filtrer les documents
    const detectedLang = detectFallbackLanguage(message);
    const lowerMessage = message.toLowerCase();
    
    // Recherche par mots-clés dans la base de connaissances
    let query = supabase
      .from('knowledge_base')
      .select('title, content, category, keywords')
      .eq('is_active', true)
      .eq('language', detectedLang);

    // Filtrage par mots-clés pertinents
    if (lowerMessage.includes('whatsapp') || lowerMessage.includes('automatisation') || lowerMessage.includes('chatbot')) {
      query = query.contains('keywords', ['whatsapp']);
    } else if (lowerMessage.includes('site') || lowerMessage.includes('web') || lowerMessage.includes('mobile')) {
      query = query.contains('keywords', ['site web']);
    } else if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût')) {
      query = query.contains('keywords', ['prix']);
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('téléphone')) {
      query = query.contains('keywords', ['contact']);
    }
    
    const { data: documents, error } = await query.limit(2);

    if (error || !documents || documents.length === 0) {
      // Fallback: récupérer les documents les plus généraux
      const { data: fallbackDocs } = await supabase
        .from('knowledge_base')
        .select('title, content, category')
        .eq('is_active', true)
        .eq('language', detectedLang)
        .eq('category', 'services')
        .limit(1);
      
      if (fallbackDocs && fallbackDocs.length > 0) {
        return fallbackDocs
          .map(doc => `**${doc.title}**:\n${doc.content}`)
          .join('\n\n');
      }
      return '';
    }

    // Formatage du contexte RAG
    return documents
      .map(doc => `**${doc.title}**:\n${doc.content}`)
      .join('\n\n');
  } catch (error) {
    console.error('Erreur RAG:', error);
    return '';
  }
}



/**
 * Création d'un prompt avec RAG et détection automatique de langue améliorée
 */
function createAutoDetectPrompt(message: string, ragContext: string = '', detectedLanguage?: 'fr' | 'en'): string {
  // Message is already sanitized by SecurityManager
  const sanitizedMessage = message
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 500); // Limit length for prompt
  
  // Validate sanitized message
  if (!sanitizedMessage || sanitizedMessage.length < 1) {
    throw new Error('Invalid message after sanitization');
  }
  
  const ragSection = ragContext ? `

**Documents de référence (issus du RAG) :**
${ragContext}

**PRIORITÉ ABSOLUE :** Utilise *exclusivement* les informations fournies dans les documents de référence pour répondre. Si l'information n'est pas dans les documents, indique clairement que tu n'as pas l'information et propose le contact OMA Digital.` : '';

  return `Tu es OMADIGITAL, l'assistant IA d'OMA Digital (Sénégal/Maroc).

SERVICES PRINCIPAUX:
• Automatisation WhatsApp Business (50k CFA/mois, ROI 200%)
• Sites web ultra-rapides (150k+ CFA)
• Applications mobiles (iOS/Android)
• Assistants IA personnalisés (75k+ CFA/mois)
• Branding digital complet (200k+ CFA)

Contact: +212 701 193 811 | omasenegal25@gmail.com${ragSection}

INSTRUCTIONS CRITIQUES:
1. UTILISE la langue ${detectedLanguage === 'en' ? 'anglaise' : 'française'} fournie
2. RÉPONDS EXCLUSIVEMENT dans cette langue
3. Commence OBLIGATOIREMENT par [LANG:${detectedLanguage?.toUpperCase() || 'FR'}]
4. **CONCISION ABSOLUE :** Max 2 phrases courtes et directes
5. **PERTINENCE RAG :** Oriente toujours vers les offres OMA Digital des documents
6. Mentionne le ROI de 200% pour WhatsApp
7. Propose toujours le contact +212 701 193 811
8. **SOURCE UNIQUE :** Ne spécule jamais, utilise uniquement les documents de référence
9. REFUSE les questions non liées à nos services
10. Ne génère JAMAIS de contenu inapproprié

Message utilisateur: "${sanitizedMessage}"

Réponse:`;
}

/**
 * Enhanced Gemini response parsing with improved fallback detection
 */
function parseGeminiResponse(fullResponse: string): {response: string, language: 'fr' | 'en'} {
  // Primary: Look for language marker
  const langMatch = fullResponse.match(/\[LANG:(FR|EN)\]/i);
  let detectedLang: 'fr' | 'en' = 'fr'; // Default to French for Senegal market
  
  if (langMatch && langMatch[1]) {
    detectedLang = langMatch[1].toUpperCase() === 'FR' ? 'fr' : 'en';
  } else {
    // Fallback: Analyze response content for language indicators
    const response = fullResponse.toLowerCase();
    const englishIndicators = ['hello', 'thank you', 'please', 'service', 'contact us', 'we offer', 'whatsapp', 'automation'];
    const frenchIndicators = ['bonjour', 'merci', 'service', 'nous offrons', 'contactez', 'salut', 'whatsapp', 'automatisation'];
    
    const englishScore = englishIndicators.filter(word => response.includes(word)).length;
    const frenchScore = frenchIndicators.filter(word => response.includes(word)).length;
    
    // Use a threshold to avoid false positives
    if (englishScore > frenchScore && englishScore >= 2) {
      detectedLang = 'en';
    } else {
      detectedLang = 'fr';
    }
  }
  
  // Clean response
  const cleanResponse = fullResponse
    .replace(/\[LANG:(FR|EN)\]\s*/i, '')
    .trim();
  
  return {
    response: cleanResponse || 'Désolé, je rencontre un problème technique. Contactez-nous au +212 701 193 811.',
    language: detectedLang
  };
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