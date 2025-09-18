/**
 * Serveur Hono pour le chatbot multimodal OMA
 * 
 * Architecture conforme au cahier des charges :
 * - Backend Node.js (Serverless) pour orchestration RAG et API
 * - Supabase PostgreSQL avec pgvector pour embeddings
 * - Google AI Studio (Gemini) pour génération LLM
 * - Deepgram API pour transcription STT
 * - Stockage sécurisé avec RLS
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Configuration Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration APIs
const googleAIKey = Deno.env.get('GOOGLE_AI_API_KEY');
const deepgramKey = Deno.env.get('DEEPGRAM_API_KEY');

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

/**
 * Base de connaissances OMA pour le système RAG
 * Contient les informations contextuelles sur OMA Digital
 */
const OMA_KNOWLEDGE_BASE = [
  {
    id: 'oma-services-1',
    content: 'OMA Digital est spécialisée dans l\'automatisation et les solutions IA pour PME sénégalaises à Dakar. Services : automatisation WhatsApp Business, sites web ultra-rapides, solutions IA sur mesure, transformation digitale.',
    category: 'services',
    context: 'Dakar, Sénégal, PME, automatisation'
  },
  {
    id: 'oma-results-1', 
    content: 'Résultats clients OMA : +200% ROI moyen en 6 mois, 150+ clients satisfaits à Dakar, réduction 80% temps de traitement, amélioration 300% engagement client.',
    category: 'results',
    context: 'ROI, performance, clients, Dakar'
  },
  {
    id: 'oma-whatsapp-1',
    content: 'Automatisation WhatsApp Business OMA : chatbots intelligents, réponses automatiques 24/7, gestion commandes, suivi clients, intégration CRM, analytics avancés.',
    category: 'whatsapp',
    context: 'WhatsApp, automatisation, chatbot, 24/7'
  },
  {
    id: 'oma-web-1',
    content: 'Sites web OMA : performance <1.5s, design responsive, SEO optimisé Dakar/Sénégal, hébergement sécurisé, maintenance incluse, SSL gratuit.',
    category: 'web',
    context: 'site web, performance, SEO, Dakar'
  },
  {
    id: 'oma-contact-1',
    content: 'Contact OMA Digital : Bureau Liberté 6, Dakar, Sénégal. WhatsApp +221 77 123 45 67, Email omasenegal25@gmail.com. Consultation gratuite disponible.',
    category: 'contact',
    context: 'contact, Dakar, Liberté, consultation'
  },
  {
    id: 'oma-pricing-1',
    content: 'Tarifs OMA adaptés PME sénégalaises : site vitrine 150.000 FCFA, e-commerce 300.000 FCFA, automatisation WhatsApp 100.000 FCFA, pack complet 500.000 FCFA. Facilités de paiement.',
    category: 'pricing',
    context: 'prix, tarifs, FCFA, PME, paiement'
  }
];

/**
 * Fonction de recherche RAG simplifiée
 * Recherche dans la base de connaissances selon la requête
 */
function searchKnowledgeBase(query: string, limit = 3): any[] {
  const queryLower = query.toLowerCase();
  
  // Score de pertinence basé sur les mots-clés
  const scoredResults = OMA_KNOWLEDGE_BASE.map(item => {
    let score = 0;
    const contentLower = item.content.toLowerCase();
    const contextLower = item.context.toLowerCase();
    
    // Mots-clés de recherche
    const keywords = queryLower.split(' ').filter(word => word.length > 2);
    
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 2;
      if (contextLower.includes(keyword)) score += 1;
      if (item.category.includes(keyword)) score += 3;
    });
    
    return { ...item, score };
  });
  
  // Retourner les résultats triés par score
  return scoredResults
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Génération de prompt enrichi avec contexte RAG
 */
function createEnrichedPrompt(userMessage: string, knowledge: any[], conversationHistory: any[] = []): string {
  const contextInfo = knowledge.map(k => k.content).join('\n\n');
  
  return `Tu es l'assistant IA d'OMA Digital, entreprise spécialisée dans l'automatisation et les solutions IA pour PME sénégalaises à Dakar.

CONTEXTE ENTREPRISE :
${contextInfo}

HISTORIQUE CONVERSATION :
${conversationHistory.slice(-3).map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

CONSIGNES :
- Réponds en français avec un ton professionnel mais chaleureux
- Utilise des émojis appropriés (🤖✨🎯🏢💬⚡💰📅)
- Mentionne les bénéfices concrets (+200% ROI, <1.5s performance)
- Propose des actions (devis, RDV, démo)
- Contextualise pour le marché sénégalais et Dakar
- Garde les réponses concises (max 3 paragraphes)

QUESTION CLIENT : ${userMessage}

RÉPONSE ASSISTANT OMA :`;
}

/**
 * Route de chat IA avec Google AI et base de connaissances
 */
app.post("/make-server-8066848d/chat", async (c) => {
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  c.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  try {
    const { message, conversationId, inputMethod = 'text' } = await c.req.json();
    const userAgent = c.req.header('User-Agent') || 'Unknown';
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'Unknown';
    
    if (!message?.trim()) {
      return c.json({ error: 'Message requis' }, 400);
    }

    console.log(`Chat request: ${inputMethod} - "${message.slice(0, 50)}..."`);

    // 1. Recherche RAG dans la base de connaissances
    const relevantKnowledge = searchKnowledgeBase(message);
    console.log(`Found ${relevantKnowledge.length} relevant knowledge items`);

    // 2. Récupération de l'historique de conversation 
    let conversationHistory: any[] = [];
    let newConversationId = conversationId;
    
    if (conversationId) {
      try {
        const history = await kv.get(`conversation:${conversationId}`);
        if (history) {
          conversationHistory = JSON.parse(history);
        }
      } catch (error) {
        console.log('Error fetching conversation history:', error);
      }
    } else {
      // Créer nouvel ID de conversation
      newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 3. Génération du prompt enrichi
    const enrichedPrompt = createEnrichedPrompt(message, relevantKnowledge, conversationHistory);

    // 4. Appel à Google AI Studio/Gemini
    let botResponse = '';
    
    if (googleAIKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleAIKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: enrichedPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erreur de génération.';
        } else {
          throw new Error(`Google AI API error: ${response.status}`);
        }
      } catch (error) {
        console.error('Google AI error:', error);
        botResponse = getFallbackResponse(message);
      }
    } else {
      botResponse = getFallbackResponse(message);
    }

    // 5. Sauvegarder la conversation
    const newMessages = [
      ...conversationHistory,
      { sender: 'user', text: message, timestamp: new Date().toISOString(), isVoice: inputMethod === 'voice' },
      { sender: 'bot', text: botResponse, timestamp: new Date().toISOString() }
    ];

    // Garder seulement les 20 derniers messages pour éviter la surcharge
    const trimmedMessages = newMessages.slice(-20);
    
    try {
      await kv.set(`conversation:${newConversationId}`, JSON.stringify(trimmedMessages));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }

    // 6. Réponse finale
    return c.json({
      response: botResponse,
      conversationId: newConversationId,
      inputMethod,
      timestamp: new Date().toISOString(),
      knowledgeUsed: relevantKnowledge.length > 0
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return c.json({ 
      error: 'Erreur serveur. Contactez OMA Digital au +221 77 123 45 67.',
      response: getFallbackResponse('')
    }, 500);
  }
});

/**
 * Route de transcription audio avec Deepgram
 */
app.post("/make-server-8066848d/transcribe", async (c) => {
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  c.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return c.json({ error: 'Fichier audio requis' }, 400);
    }

    console.log(`Transcription request: ${audioFile.type}, ${audioFile.size} bytes`);

    if (!deepgramKey) {
      return c.json({ 
        error: 'Service transcription non configuré',
        transcript: '' 
      }, 500);
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return c.json({ 
        error: 'Fichier trop volumineux (max 10MB)',
        transcript: '' 
      }, 400);
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.type)) {
      return c.json({ 
        error: 'Format audio non supporté',
        transcript: '' 
      }, 400);
    }

    // Appel à Deepgram API with enhanced options - detect language automatically
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&detect_language=true&smart_format=true&utterances=true&paragraphs=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramKey}`,
        'Content-Type': audioFile.type
      },
      body: audioFile
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Deepgram API error: ${response.status} - ${errorText}`);
      throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
    // Detect the language from the response
    const detectedLanguage = data.results?.channels?.[0]?.alternatives?.[0]?.languages?.[0] || 'fr';
    
    console.log(`Transcription result: "${transcript}" with confidence: ${confidence}, language: ${detectedLanguage}`);

    // Filter out low confidence transcriptions
    if (confidence < 0.3 && transcript.length > 0) {
      console.warn(`Low confidence transcription (${confidence}): "${transcript}"`);
      return c.json({
        transcript: '',
        confidence: confidence,
        warning: 'Low confidence transcription',
        language: detectedLanguage
      });
    }

    return c.json({
      transcript: transcript.trim(),
      confidence: confidence,
      language: detectedLanguage,
      duration: data.metadata?.duration || 0
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return c.json({ 
      error: 'Erreur transcription',
      transcript: '',
      details: error.message
    }, 500);
  }
});

/**
 * Réponses de secours si les APIs externes ne fonctionnent pas
 */
function getFallbackResponse(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('whatsapp')) {
    return `Excellente question sur WhatsApp ! 💬

OMA Digital automatise WhatsApp Business pour les PME à Dakar :
• Chatbots intelligents 24/7
• Réponses automatiques personnalisées  
• Gestion commandes et suivi clients
• +200% d'engagement client en moyenne

💰 À partir de 100.000 FCFA/mois
📅 Consultation gratuite disponible

Voulez-vous une démo personnalisée ?`;
  }
  
  if (messageLower.includes('site') || messageLower.includes('web')) {
    return `Parfait pour votre site web ! ⚡

OMA crée des sites ultra-rapides (<1.5s) pour PME à Dakar :
• Performance optimisée Google
• Design responsive mobile
• SEO local Dakar/Sénégal
• Hébergement sécurisé inclus

💰 Site vitrine : 150.000 FCFA
💰 E-commerce : 300.000 FCFA

Prêt à booster votre présence en ligne ?`;
  }
  
  if (messageLower.includes('prix') || messageLower.includes('tarif') || messageLower.includes('coût')) {
    return `Nos tarifs PME sénégalaises 💰

🌟 Site vitrine : 150.000 FCFA
🛒 E-commerce : 300.000 FCFA  
💬 WhatsApp Auto : 100.000 FCFA/mois
🚀 Pack complet : 500.000 FCFA

✨ Facilités de paiement disponibles
📞 Consultation gratuite

ROI moyen : +200% en 6 mois !
Quel service vous intéresse ?`;
  }
  
  if (messageLower.includes('contact') || messageLower.includes('rdv')) {
    return `Contactez OMA Digital ! 📞

📍 Bureau : Liberté 6, Dakar, Sénégal
📱 WhatsApp : +221 77 123 45 67
📧 Email : omasenegal25@gmail.com

🆓 Consultation gratuite disponible
⏰ Réponse garantie sous 2h

Comment préférez-vous être contacté ?`;
  }
  
  return `Salut ! Bienvenue chez OMA Digital ! 🤖

Votre partenaire automatisation IA à Dakar :
✨ Solutions PME sénégalaises
🎯 +200% ROI en 6 mois
🏢 150+ clients satisfaits

🚀 Services : WhatsApp Auto, Sites rapides, IA sur mesure

Comment puis-je vous aider à transformer votre business ?`;
}

// Health check endpoint
app.get("/make-server-8066848d/health", (c) => {
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  c.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      supabase: !!supabaseUrl,
      googleAI: !!googleAIKey,
      deepgram: !!deepgramKey
    }
  });
});

// Gestion des erreurs globales
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    error: 'Erreur serveur interne',
    message: 'Contactez OMA Digital au +221 77 123 45 67'
  }, 500);
});

Deno.serve(app.fetch);