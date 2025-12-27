import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// Check if API key exists
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Supabase is optional for basic chat functionality
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

// Simple keyword search in knowledge base (optional)
async function searchKnowledgeBase(query: string, limit = 3) {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content, category')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit)

    if (error) {
      console.warn('Knowledge base search error (table may not exist):', error.message)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('RAG search error:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini is configured
    if (!genAI) {
      return NextResponse.json({
        error: 'Gemini API not configured. Please set GEMINI_API_KEY environment variable.'
      }, { status: 500 })
    }

    const { message, conversationHistory, sessionId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Search knowledge base first (RAG) - optional
    const knowledgeResults = await searchKnowledgeBase(message)

    let context = ''
    if (knowledgeResults.length > 0) {
      context = knowledgeResults
        .map((result: any) => `${result.title}: ${result.content}`)
        .join('\n\n')
    }

    // Detect language
    const isEnglish = /\b(what|how|do|does|can|will|hello|hi)\b/i.test(message)

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
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

    // Save conversation to database (optional, don't fail if it doesn't work)
    if (supabase) {
      try {
        await supabase
          .from('chatbot_conversations')
          .insert({
            session_id: session,
            user_message: message,
            bot_response: response,
            language: isEnglish ? 'en-US' : 'fr-FR',
            input_type: 'text',
            has_audio: false
          })
      } catch (dbError) {
        console.warn('Failed to save conversation (table may not exist):', dbError)
      }
    }

    return NextResponse.json({
      response,
      suggestions,
      hasKnowledgeBase: knowledgeResults.length > 0,
      sessionId: session
    })

  } catch (error: any) {
    console.error('Gemini API error:', error?.message || error)
    return NextResponse.json({
      error: `API Error: ${error?.message || 'Unknown error'}`
    }, { status: 500 })
  }
}