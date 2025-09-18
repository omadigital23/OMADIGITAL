/**
 * 🤖 API GEMINI + RAG OPTIMISÉE POUR OMA DIGITAL
 * Réponses courtes, précises et basées sur la base de connaissances Supabase
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { searchOMAKnowledge, formatDocumentsForGemini, detectLanguage } from '../../../src/lib/rag/enhanced-vector-search';
import { OMA_DIGITAL_MASTER_PROMPT } from '../../../src/lib/prompts/oma-digital-master-prompt';
import { generateMarketingResponse } from '../../../src/lib/prompts/marketing-cta-strategies';

interface ChatRequest {
  message: string;
  language?: 'fr' | 'en';
  sessionId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, language: userLanguage, sessionId }: ChatRequest = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 🔍 1. DÉTECTION LANGUE AUTOMATIQUE
    const detectedLanguage = detectLanguage(message);
    const finalLanguage = userLanguage || detectedLanguage;

    console.log('🤖 OMA Assistant RAG:', { 
      message: message.substring(0, 50) + '...', 
      detectedLanguage, 
      finalLanguage 
    });

    // 🔍 2. RECHERCHE RAG DANS LA BASE DE CONNAISSANCES
    const relevantDocs = await searchOMAKnowledge(message, {
      language: finalLanguage,
      limit: 3, // Limiter pour réponses courtes
      threshold: 0.1
    });

    console.log('📚 Documents RAG trouvés:', relevantDocs.length);

    // 🎯 3. CONSTRUCTION DU PROMPT AVEC RAG
    const formattedDocs = formatDocumentsForGemini(relevantDocs);
    const finalPrompt = OMA_DIGITAL_MASTER_PROMPT
      .replace('{{retrieved_documents}}', formattedDocs)
      .replace('{{chat_history}}', `Session: ${sessionId || 'new'}`)
      .replace('{{user_message}}', message);

    // 🚀 4. APPEL GEMINI API
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024, // Limiter pour réponses courtes
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Désolé, je ne peux pas répondre pour le moment. Contactez-nous au +212 701 193 811 pour une assistance immédiate.';

    // 🎨 5. EXTRACTION CTA SI PRÉSENT
    let cta = null;
    const ctaMatch = aiResponse.match(/```json\s*(\{.*?"cta".*?\})\s*```/s);
    if (ctaMatch) {
      try {
        const ctaData = JSON.parse(ctaMatch[1]);
        cta = ctaData.cta;
      } catch (e) {
        console.warn('CTA parsing failed:', e);
      }
    }

    // 🎯 6. DÉTECTION QUESTION PRIX ET STRATÉGIE MARKETING
    const isPricingQuery = message.toLowerCase().match(/prix|tarif|co[ûu]t|combien|budget|price|cost/);
    let marketingEnhancement = null;
    
    if (isPricingQuery) {
      const marketingResponse = generateMarketingResponse('pricing', finalLanguage);
      console.log('💰 Question prix détectée - Application stratégie marketing');
    }

    // 🎯 7. SUGGESTIONS CONTEXTUELLES OMA
    const suggestions = generateOMAContextualSuggestions(message, finalLanguage, relevantDocs);

    // ✅ 7. RÉPONSE FINALE
    return res.status(200).json({
      response: aiResponse.replace(/```json[\s\S]*?```/g, '').trim(),
      language: finalLanguage,
      suggestions,
      cta,
      source: 'gemini-rag',
      confidence: relevantDocs.length > 0 ? 0.9 : 0.6,
      documentsUsed: relevantDocs.length,
      sessionId: sessionId || 'new'
    });

  } catch (error) {
    console.error('❌ Erreur API Gemini RAG:', error);
    
    // Fallback avec réponse prédéfinie OMA (complète)
    const fallbackResponse = {
      fr: "Désolé, je rencontre un problème technique temporaire. Contactez-nous directement au +212 701 193 811 ou par WhatsApp pour une assistance immédiate.",
      en: "Sorry, I'm experiencing a temporary technical issue. Contact us directly at +212 701 193 811 or via WhatsApp for immediate assistance."
    };

    const errorLanguage = detectLanguage(req.body.message || '') || 'fr';
    
    return res.status(200).json({
      response: fallbackResponse[errorLanguage],
      language: errorLanguage,
      suggestions: errorLanguage === 'fr' ? 
        ["Contacter support", "Voir nos services", "Demander un devis"] :
        ["Contact support", "View our services", "Request quote"],
      source: 'fallback',
      confidence: 0.3,
      error: true
    });
  }
}

/**
 * 🎯 GÉNÉRATION SUGGESTIONS CONTEXTUELLES OMA
 */
function generateOMAContextualSuggestions(
  message: string, 
  language: 'fr' | 'en',
  docs: any[]
): string[] {
  const messageLower = message.toLowerCase();
  
  const suggestions = {
    fr: {
      whatsapp: ["Voir démo WhatsApp", "Tarifs automatisation", "Cas clients restaurants"],
      website: ["Exemples de sites", "Devis site web", "Technologies utilisées"],
      pricing: ["Demander devis personnalisé", "Voir packages", "Calculer ROI"],
      contact: ["Parler à un expert", "Prendre RDV", "Support technique"],
      general: ["Nos services", "Demander démo", "Audit gratuit"]
    },
    en: {
      whatsapp: ["View WhatsApp demo", "Automation pricing", "Restaurant case studies"],
      website: ["Website examples", "Web quote", "Technologies used"],
      pricing: ["Request personalized quote", "View packages", "Calculate ROI"],
      contact: ["Talk to expert", "Book appointment", "Technical support"],
      general: ["Our services", "Request demo", "Free audit"]
    }
  };

  // Détection contexte intelligente
  if (messageLower.includes('whatsapp') || messageLower.includes('automatisation') || messageLower.includes('automation')) {
    return suggestions[language].whatsapp;
  }
  if (messageLower.includes('site') || messageLower.includes('web') || messageLower.includes('website')) {
    return suggestions[language].website;
  }
  if (messageLower.includes('prix') || messageLower.includes('tarif') || messageLower.includes('coût') || 
      messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('combien')) {
    return suggestions[language].pricing;
  }
  if (messageLower.includes('contact') || messageLower.includes('téléphone') || messageLower.includes('phone') || 
      messageLower.includes('appeler') || messageLower.includes('call')) {
    return suggestions[language].contact;
  }

  // Si documents trouvés, adapter les suggestions au contenu
  if (docs.length > 0) {
    const docCategories = docs.map(doc => doc.category);
    if (docCategories.includes('services')) {
      return suggestions[language].general;
    }
    if (docCategories.includes('pricing')) {
      return suggestions[language].pricing;
    }
    if (docCategories.includes('contact')) {
      return suggestions[language].contact;
    }
  }

  return suggestions[language].general;
}