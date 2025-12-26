import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

// Simple keyword search in knowledge base
async function searchKnowledgeBase(query: string, limit = 3) {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content, category')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,keywords.cs.{"${query.toLowerCase()}"}`)
      .eq('is_active', true)
      .eq('language', 'fr')
      .order('priority', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Knowledge base search error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('RAG search error:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Search knowledge base first (RAG)
    const knowledgeResults = await searchKnowledgeBase(message)

    let context = ''
    if (knowledgeResults.length > 0) {
      context = knowledgeResults
        .map((result: any) => `${result.title}: ${result.content}`)
        .join('\n\n')
    }

    // Prepare conversation context
    const conversationContext = conversationHistory
      ?.slice(-6) // Last 6 messages
      ?.map((msg: Message) => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.content}`)
      ?.join('\n') || ''

    // Detect language
    const isEnglish = /\b(what|how|do|does|can|will|hello|hi)\b/i.test(message)
    const isFrench = /\b(que|comment|faire|peut|combien|bonjour|salut)\b/i.test(message)

    // Create precise system prompt
    const systemPrompt = `Assistant OMA Digital. Réponses PRÉCISES uniquement.

PRIX EXACTS:
- Site vitrine: 5 000 DH
- E-commerce: 10 000 DH
- App mobile MVP: 10 999 DH
- App mobile standard: 20 000 DH
- Chatbot IA: 10 000 DH + 500 DH/mois
- Bot WhatsApp: 3 000 DH + 500 DH/mois
- Marketing: 3 500 DH/mois
- Vidéo: 3 000 DH

CONTACT:
- Tél/WhatsApp: +212 701 193 811
- Email: omadigital23@gmail.com
- Adresse: Casablanca, Maroc

${context ? `${context}\n` : ''}

RÈGLES STRICTES:
- Langue: ${isEnglish ? 'ENGLISH' : 'FRANÇAIS'}
- Maximum 30 mots
- Réponse directe, pas d'introduction
- Prix exact si demandé
- Contact exact si demandé

Question: ${message}`

    // Generate response with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(systemPrompt)
    const response = result.response.text()

    // Simple suggestions
    const suggestions = isEnglish ? [
      "Pricing?",
      "Services?",
      "Contact?"
    ] : [
      "Tarifs ?",
      "Services ?",
      "Contact ?"
    ]

    // Save conversation to database
    await supabase
      .from('chatbot_conversations')
      .insert({
        session_id: session,
        user_message: message,
        bot_response: response,
        language: isEnglish ? 'en-US' : 'fr-FR',
        input_type: 'text',
        has_audio: false,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        referrer: request.headers.get('referer')
      })

    return NextResponse.json({
      response,
      suggestions,
      hasKnowledgeBase: knowledgeResults.length > 0,
      sessionId: session
    })

  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'API Error' }, { status: 500 })
  }
}