/**
 * API Route pour Chatbot OMA Digital
 * RAG pour questions spécifiques, Vertex AI Gemini pour questions générales
 * 100% Vertex AI - Pas de Google AI Studio
 * Architecture: RAG-first → Vertex AI avec contexte → Vertex AI sans contexte
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ragFirstService } from '../../../src/lib/rag/rag-first-service';
import { selectSmartCTA, MARKETING_CTA_STRATEGIES } from '../../../src/lib/prompts/marketing-cta-strategies';
import { vertexAIChatbot } from '../../../src/lib/vertex-ai-chatbot';

interface ChatRequest {
  message: string;
  sessionId: string;
  context?: { history: any[] };
}

interface ChatResponseBody {
  response: string;
  language: 'fr' | 'en';
  suggestions?: string[];
  cta?: any;
  source: 'rag' | 'gemini';
  confidence: number;
  timestamp: string;
  response_time_ms: number;
}

const SUGGESTIONS = {
  en: {
    mobile: ['Get mobile app quote', 'See app portfolio', 'Discuss app features'],
    whatsapp: ['Request WhatsApp demo', 'See automation pricing', 'View success stories'],
    website: ['Get website quote', 'See performance examples', 'Schedule consultation'],
    pricing: ['View all pricing', 'Get custom quote', 'Compare packages'],
    default: ['Discover all services', 'Request free consultation', 'Get our email address']
  },
  fr: {
    mobile: ['Obtenir devis app mobile', 'Voir portfolio apps', 'Discuter fonctionnalités'],
    whatsapp: ['Demander démo WhatsApp', 'Voir tarifs automatisation', 'Voir cas de succès'],
    website: ['Obtenir devis site', 'Voir exemples performance', 'Planifier consultation'],
    pricing: ['Voir tous les tarifs', 'Obtenir devis personnalisé', 'Comparer les packages'],
    default: ['Découvrir tous les services', 'Demander consultation gratuite', "Obtenir notre adresse email"]
  }
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const startTime = Date.now();
  try {
    const { message, sessionId }: ChatRequest = req.body || {};
    if (!message || !sessionId) return res.status(400).json({ error: 'message and sessionId required' });

    const sanitizedMessage = String(message).trim();
    if (!sanitizedMessage) return res.status(400).json({ error: 'Empty message' });

    // Pas de détection locale - Gemini détecte via [LANG:FR|EN]
    // On passe null pour forcer Gemini à détecter
    const ragResult = await ragFirstService.answerQuestion(sanitizedMessage, {
      language: undefined as any, // Gemini détectera
      limit: 5,
      similarity_threshold: 0.7,
    });

    // RAG retourne déjà une réponse de Vertex AI (avec ou sans contexte RAG)
    // Pas besoin d'appeler Gemini une deuxième fois
    let finalText = ragResult.answer?.trim() || '';
    let language: 'fr' | 'en' = ragResult.language;
    let source: 'rag' | 'gemini' = ragResult.source === 'rag_gemini' ? 'rag' : 'gemini';
    let confidence = ragResult.confidence ?? 0.7;

    // Validation minimale - si vraiment pas de réponse, message d'erreur
    if (!finalText || finalText.length < 5) {
      finalText = language === 'fr' 
        ? 'Désolé, je ne peux pas répondre pour le moment.' 
        : 'Sorry, I cannot answer at the moment.';
      confidence = 0.3;
    }

    // Suggestions only (no CTA)
    const suggestions = generateSuggestions(sanitizedMessage, language);
    
    // CTA désactivé - réponse pure sans marketing
    const responseText = finalText;

    const body: ChatResponseBody = {
      response: responseText,
      language,
      suggestions: suggestions.slice(0, 3),
      cta: null, // CTA désactivé
      source,
      confidence: Math.round(confidence * 100) / 100,
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
    };

    return res.status(200).json(body);

  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Détecter la langue de la question pour le message d'erreur
    const isFrench = /bonjour|salut|merci|comment|quoi|pourquoi|où|français|numero|telephone|adresse|cest/i.test(req.body?.message || '');
    const errorLanguage: 'fr' | 'en' = isFrench ? 'fr' : 'en';
    
    // Message d'erreur avec contact direct (Vertex AI uniquement, pas de fallback)
    const errorMessage = errorLanguage === 'fr'
      ? 'Service temporairement indisponible. Contactez-nous directement au +221 701 193 811 (WhatsApp) ou omadigital23@gmail.com pour une réponse immédiate.'
      : 'Service temporarily unavailable. Contact us directly at +221 701 193 811 (WhatsApp) or omadigital23@gmail.com for immediate assistance.';
    
    return res.status(500).json({
      response: errorMessage,
      language: errorLanguage,
      source: 'gemini',
      confidence: 0.3,
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
    });
  }
}

// Fonctions supprimées - plus besoin de callGeminiGeneral
// Le RAG utilise déjà Vertex AI pour toutes les réponses

function generateSuggestions(message: string, language: 'fr' | 'en'): string[] {
  const lower = message.toLowerCase();
  const keys = language === 'en' ? {
    mobile: ['app', 'mobile'],
    whatsapp: ['whatsapp', 'automation'],
    website: ['website', 'web'],
    pricing: ['price', 'cost', 'quote']
  } : {
    mobile: ['app', 'mobile', 'application'],
    whatsapp: ['whatsapp', 'automatisation'],
    website: ['site', 'web'],
    pricing: ['prix', 'coût', 'devis']
  };

  for (const [cat, words] of Object.entries(keys)) {
    if (words.some(w => lower.includes(w))) {
      return (SUGGESTIONS as any)[language][cat] || (SUGGESTIONS as any)[language].default;
    }
  }
  return (SUGGESTIONS as any)[language].default;
}