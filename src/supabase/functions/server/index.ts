import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Hono } from 'npm:hono@4.2.7';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://localhost:3000', '*'],
  allowHeaders: ['authorization', 'content-type', 'x-requested-with'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false,
}));

app.use('*', logger(console.log));

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Google AI API configuration
const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const DEEPGRAM_API_KEY = Deno.env.get('DEEPGRAM_API_KEY');

// RAG Knowledge Base for OMA
const OMA_KNOWLEDGE_BASE = {
  services: [
    {
      name: "Automatisation WhatsApp Business",
      description: "Chatbots intelligents 24/7 pour PME sénégalaises. ROI moyen +200% en 6 mois.",
      features: ["Réponses automatiques", "Gestion commandes", "Qualification prospects", "Analytics détaillés"],
      pricing: "À partir de 50 000 FCFA/mois",
      roi: "ROI moyen +200% en 6 mois"
    },
    {
      name: "Sites Web Ultra-Rapides",
      description: "Sites performants <1.5s optimisés pour le marché sénégalais et mobile-first.",
      features: ["Vitesse <1.5s", "SEO Dakar optimisé", "Mobile-first", "Analytics intégrés"],
      pricing: "À partir de 150 000 FCFA",
      roi: "+15 positions Google en moyenne"
    },
    {
      name: "Assistant IA Personnalisé", 
      description: "IA conversationnelle en français pour automatiser le service client.",
      features: ["Français", "Apprentissage continu", "Intégration CRM", "Vocal disponible"],
      pricing: "À partir de 75 000 FCFA/mois",
      roi: "-70% temps service client"
    },
    {
      name: "Branding Authentique",
      description: "Identité visuelle forte pour PME africaines avec design system complet.",
      features: ["Logo professionnel", "Charte graphique", "Supports marketing", "Brand guidelines"],
      pricing: "À partir de 100 000 FCFA",
      roi: "+40% reconnaissance marque"
    },
    {
      name: "Dashboards Analytics",
      description: "Tableaux de bord business intelligence pour pilotage data-driven.",
      features: ["KPIs temps réel", "Rapports automatisés", "Prédictions IA", "Mobile responsive"],
      pricing: "À partir de 80 000 FCFA/mois", 
      roi: "+25% efficacité décisions"
    }
  ],
  company: {
    name: "OMA Digital",
    location: "Liberté 6 Extension, Dakar, Sénégal",
    phone: "+221 701 193 811",
    email: "omasenegal25@gmail.com",
    specialties: ["IA", "Automatisation", "Transformation digitale PME"],
    languages: ["Français", "Anglais"],
    clients: "150+ PME sénégalaises",
    experience: "Spécialisé marché africain depuis 2020"
  },
  process: [
    "1. Audit gratuit de vos besoins digitaux",
    "2. Prototype personnalisé sous 48h", 
    "3. Développement avec feedback continu",
    "4. Formation équipe et optimisation continue"
  ]
};

// Generate contextual response using Google AI
async function generateAIResponse(message: string, context: string = '', inputMethod: string = 'text'): Promise<string> {
  try {
    // Determine if this is a voice input for optimized response
    const isVoiceInput = inputMethod === 'voice';
    
    const basePrompt = `Tu es l'assistant IA d'OMA Digital, entreprise leader en automatisation et IA pour PME sénégalaises basée à Dakar.

CONTEXTE ENTREPRISE:
- Spécialiste automatisation WhatsApp, sites ultra-rapides, IA conversationnelle
- 150+ clients PME sénégalaises, ROI moyen +200% en 6 mois  
- Basé Liberté 6 Extension, Dakar - Tel: +221 701 193 811
- Email: omasenegal25@gmail.com
- Langues: Français, support 24/7

SERVICES PHARES:
1. Automatisation WhatsApp (50k FCFA/mois, ROI +200%)
2. Sites ultra-rapides (150k FCFA, +15 positions Google)
3. Assistant IA français (75k FCFA/mois, -70% temps service)
4. Branding authentique (100k FCFA, +40% reconnaissance)
5. Dashboards analytics (80k FCFA/mois, +25% efficacité)

PROCESSUS: Audit gratuit → Prototype 48h → Développement → Formation

CONTEXTE CONVERSATION: ${context}

MESSAGE CLIENT: ${message}`;

    const voiceInstructions = `
INSTRUCTIONS SPÉCIALES RÉPONSE VOCALE:
- OBLIGATOIRE: Réponds UNIQUEMENT en français, jamais en anglais
- Réponds en français naturel et fluide, comme dans une conversation téléphonique
- Ton chaleureux et professionnel, adapté à l'oral
- AUCUN emoji, symbole ou formatage (pas de •, -, →, etc.)
- Phrases courtes et claires pour la synthèse vocale
- Maximum 80 mots pour éviter les réponses trop longues à l'oral
- Utilise des transitions naturelles comme "Alors", "En fait", "Justement"
- Mentionne les chiffres de façon naturelle: "deux cents pour cent" au lieu de "200%"
- Termine par une question ouverte pour encourager la conversation
- Focus sur UN service principal par réponse pour rester clair à l'oral
- Même si le client écrit en anglais, réponds en français (marché sénégalais)

Réponds maintenant de façon conversationnelle EN FRANÇAIS:`;

    const textInstructions = `
INSTRUCTIONS RÉPONSE TEXTE:
- OBLIGATOIRE: Réponds UNIQUEMENT en français, jamais en anglais
- Réponds en français naturel, ton professionnel mais accessible
- Mets en avant les bénéfices concrets pour PME sénégalaises  
- Utilise des chiffres/ROI quand pertinents
- Encourage vers WhatsApp (+212701193811) ou RDV pour devis
- Reste focalisé sur transformation digitale PME Sénégal/Dakar
- Maximum 150 mots, structuré avec emojis appropriés
- Même si le client écrit en anglais, réponds en français (marché sénégalais)

Réponds maintenant EN FRANÇAIS:`;

    const prompt = basePrompt + (isVoiceInput ? voiceInstructions : textInstructions);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           "Désolé, je rencontre un problème technique. Contactez-nous directement au +221 701 193 811 ou omasenegal25@gmail.com 📞";

  } catch (error) {
    console.error('Google AI API error:', error);
    return "Je vous connecte avec notre équipe ! 🚀\n\nContactez-nous directement :\n📞 +221 701 193 811\n📧 omasenegal25@gmail.com\n\nOu via WhatsApp pour une réponse immédiate ! 💬";
  }
}

// Chat endpoint
app.post('/make-server-8066848d/chat', async (c) => {
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
    
    if (!message?.trim()) {
      return c.json({ error: 'Message required' }, 400);
    }

    // Get conversation context
    let context = '';
    if (conversationId) {
      const contextData = await kv.get(`conversation:${conversationId}`);
      if (contextData) {
        context = JSON.stringify(contextData).slice(-500); // Last 500 chars
      }
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, context, inputMethod);

    // Store conversation
    const timestamp = new Date().toISOString();
    const conversationData = {
      messages: [
        { role: 'user', content: message, timestamp, inputMethod },
        { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
      ],
      lastActivity: timestamp
    };

    if (conversationId) {
      const existing = await kv.get(`conversation:${conversationId}`) || { messages: [] };
      existing.messages = [...(existing.messages || []).slice(-20), ...conversationData.messages];
      existing.lastActivity = timestamp;
      await kv.set(`conversation:${conversationId}`, existing);
    } else {
      const newConversationId = `conv_${Date.now()}`;
      await kv.set(`conversation:${newConversationId}`, conversationData);
    }

    // Analytics tracking
    await kv.set(`analytics:chat:${Date.now()}`, {
      message: message.slice(0, 100),
      inputMethod,
      timestamp,
      responseLength: aiResponse.length
    });

    return c.json({
      response: aiResponse,
      conversationId: conversationId || `conv_${Date.now()}`
    });

  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ 
      error: 'Service temporairement indisponible. Contactez +221 701 193 811' 
    }, 500);
  }
});

// Deepgram STT endpoint
app.post('/make-server-8066848d/transcribe', async (c) => {
  
  try {
    if (!DEEPGRAM_API_KEY) {
      return c.json({ error: 'Deepgram not configured' }, 500);
    }

    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return c.json({ error: 'Audio file required' }, 400);
    }

    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&detect_language=true&language=fr&language=en&smart_format=true&punctuate=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': audioFile.type
      },
      body: await audioFile.arrayBuffer()
    });

    if (!response.ok) {
      throw new Error(`Deepgram error: ${response.status}`);
    }

    const result = await response.json();
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const detectedLanguage = result.results?.channels?.[0]?.detected_language || 'fr';
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0.9;

    return c.json({ 
      transcript, 
      language: detectedLanguage,
      confidence 
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return c.json({ error: 'Erreur transcription audio' }, 500);
  }
});

// Blog article generation
app.post('/make-server-8066848d/generate-article', async (c) => {
  try {
    const { topic, targetKeywords } = await c.json();

    if (!topic) {
      return c.json({ error: 'Topic required' }, 400);
    }

    const prompt = `Génère un article de blog complet pour OMA Digital, entreprise d'automatisation IA pour PME sénégalaises.

SUJET: ${topic}
MOTS-CLÉS: ${targetKeywords || 'IA PME Dakar, automatisation Sénégal'}

STRUCTURE REQUISE:
- Titre accrocheur avec "Dakar" ou "Sénégal"
- Introduction (problème PME locales)
- 3-4 sections pratiques avec H2
- Exemples concrets secteur sénégalais
- Conclusion avec CTA OMA

STYLE:
- Français professionnel mais accessible
- Orienté ROI et résultats concrets
- Références locales (Dakar, Sénégal, FCFA)
- 800-1200 mots
- Optimisé SEO local

Génère l'article complet maintenant:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Generate meta data
    const metaPrompt = `Pour cet article blog, génère en JSON:
{
  "title": "titre SEO optimisé (max 60 chars)",
  "description": "meta description (max 160 chars)",
  "slug": "url-slug-propre",
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "résumé 2 phrases"
}

Article: ${content.slice(0, 500)}...`;

    const metaResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: metaPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 }
      })
    });

    let metadata = {
      title: topic,
      description: `Guide complet sur ${topic} pour PME sénégalaises par OMA Digital Dakar`,
      slug: topic.toLowerCase().replace(/\s+/g, '-'),
      tags: ['IA', 'PME', 'Dakar'],
      summary: content.slice(0, 200) + '...'
    };

    if (metaResponse.ok) {
      try {
        const metaData = await metaResponse.json();
        const metaText = metaData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = metaText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          metadata = { ...metadata, ...JSON.parse(jsonMatch[0]) };
        }
      } catch (e) {
        console.log('Meta generation fallback used');
      }
    }

    return c.json({
      content,
      metadata,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Article generation error:', error);
    return c.json({ error: 'Erreur génération article' }, 500);
  }
});

// Analytics endpoint
app.get('/make-server-8066848d/analytics', async (c) => {
  try {
    const period = c.req.query('period') || '7d';
    
    // Get chat analytics
    const chatData = await kv.getByPrefix('analytics:chat:');
    
    // Calculate metrics
    const totalChats = chatData.length;
    const voiceChats = chatData.filter((item: any) => item.inputMethod === 'voice').length;
    const avgResponseTime = 1.5; // Simulated
    
    const analytics = {
      period,
      chats: {
        total: totalChats,
        voice: voiceChats,
        text: totalChats - voiceChats,
        avgResponseTime
      },
      performance: {
        uptime: '99.9%',
        avgLoadTime: '0.8s',
        errorRate: '0.1%'
      },
      generated: new Date().toISOString()
    };

    return c.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ error: 'Erreur récupération analytics' }, 500);
  }
});

// Health check
app.get('/make-server-8066848d/health', (c) => {
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
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      googleAI: !!GOOGLE_AI_API_KEY,
      deepgram: !!DEEPGRAM_API_KEY
    }
  });
});

console.log('OMA Digital Server starting...');
Deno.serve(app.fetch);