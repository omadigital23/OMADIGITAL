/**
 * RAG-FIRST SERVICE avec Vertex AI
 * 100% Vertex AI - Pas de Google AI Studio
 * Credentials depuis .env.local
 * FIXED: Meilleure recherche en anglais
 */

import { vertexAIChatbot } from '../vertex-ai-chatbot';
import { supabaseManager } from '../supabase-enhanced';

interface RAGResult {
  answer: string;
  source: 'rag_gemini' | 'gemini_fallback';
  confidence: number;
  documents: any[];
  language: 'fr' | 'en';
}

interface RAGSearchOptions {
  language?: 'fr' | 'en';
  limit?: number;
  similarity_threshold?: number;
}

class RAGFirstService {
  private readonly MIN_RAG_CONFIDENCE = 0.7;
  private readonly RAG_LIMIT = 5;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private responseCache = new Map<string, {result: RAGResult, timestamp: number}>();

  async answerQuestion(
    question: string,
    options: RAGSearchOptions = {}
  ): Promise<RAGResult> {
    const { language, limit = this.RAG_LIMIT } = options;

    const cleanQuestion = question.trim();
    
    // Vérifier le cache (économise des appels Vertex AI)
    const cacheKey = `${cleanQuestion.toLowerCase()}_${language || 'auto'}`;
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('💾 Cache hit - returning cached response');
      return cached.result;
    }
    
    // Rechercher dans les 2 langues (FR et EN) pour éviter un appel de détection
    const ragDocumentsFr = await this.searchKnowledgeBase(cleanQuestion, 'fr', limit);
    const ragDocumentsEn = await this.searchKnowledgeBase(cleanQuestion, 'en', limit);
    
    // Prendre les meilleurs résultats (peu importe la langue)
    const allDocuments = [...ragDocumentsFr, ...ragDocumentsEn];
    console.log(`📚 RAG: Found ${allDocuments.length} documents (FR: ${ragDocumentsFr.length}, EN: ${ragDocumentsEn.length})`);

    let result: RAGResult;
    
    if (allDocuments.length > 0) {
      // Vertex AI détectera la langue dans sa réponse avec [LANG:FR|EN]
      result = await this.answerWithRAGAndVertexAI(allDocuments, cleanQuestion);
    } else {
      // Fallback: Vertex AI sans RAG (détectera la langue lui-même)
      console.log('⚠️ RAG: No documents, using Vertex AI fallback');
      result = await this.answerWithVertexAIOnly(cleanQuestion);
    }
    
    // Mettre en cache le résultat
    this.responseCache.set(cacheKey, {result, timestamp: Date.now()});
    
    // Nettoyer le cache (garder max 100 entrées)
    if (this.responseCache.size > 100) {
      const oldestKey = this.responseCache.keys().next().value;
      if (oldestKey) this.responseCache.delete(oldestKey);
    }
    
    return result;
  }

  /**
   * Normaliser les accents pour la recherche
   */
  private normalizeAccents(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  /**
   * Rechercher dans Supabase - FIXED pour mieux fonctionner en anglais
   */
  private async searchKnowledgeBase(
    query: string,
    language: 'fr' | 'en',
    limit: number
  ): Promise<any[]> {
    try {
      // Normaliser la query (enlever les accents)
      const normalizedQuery = this.normalizeAccents(query);
      
      // Stopwords étendus (FR + EN)
      const stopwords = [
        // English
        'the', 'what', 'where', 'when', 'how', 'your', 'are', 'is', 'can', 'do', 'does',
        'you', 'have', 'has', 'had', 'was', 'were', 'been', 'being', 'for', 'with', 
        'from', 'this', 'that', 'these', 'those', 'and', 'but', 'not', 'all', 'any', 
        'some', 'more', 'most', 'who', 'which', 'will', 'would', 'could', 'should',
        // French
        'qui', 'que', 'quoi', 'ou', 'comment', 'votre', 'est', 'sont', 'peut', 'faire', 
        'cest', 'les', 'des', 'une', 'aux', 'dans', 'sur', 'pour', 'avec', 'sans', 'sous'
      ];
      
      // Extraire les mots-clés de la question (mots de 3+ caractères)
      const keywords = normalizedQuery
        .split(/\s+/)
        .filter(word => word.length >= 3)
        .filter(word => !stopwords.includes(word));
      
      console.log(`🔍 RAG [${language}]: Keywords extracted: ${keywords.join(', ')}`);

      const result = await supabaseManager.executeQuery(async (client) => {
        let queryBuilder = client
          .from('knowledge_base')
          .select('*')
          .eq('language', language)
          .eq('is_active', true);

        // Chercher dans title, content ET category
        if (keywords.length > 0) {
          const conditions: string[] = [];
          
          keywords.forEach(kw => {
            // Chercher dans title, content et category (plus fiable)
            conditions.push(`title.ilike.%${kw}%`);
            conditions.push(`content.ilike.%${kw}%`);
            conditions.push(`category.ilike.%${kw}%`);
          });
          
          queryBuilder = queryBuilder.or(conditions.join(','));
        } else {
          // Si pas de mots-clés, chercher la phrase complète
          queryBuilder = queryBuilder.or(`title.ilike.%${normalizedQuery}%,content.ilike.%${normalizedQuery}%`);
        }

        const { data, error } = await queryBuilder.limit(limit);
        return { data, error };
      });

      if (result.error) {
        console.error('❌ RAG search error:', result.error);
        return [];
      }

      return (result.data as any[]) || [];
    } catch (error) {
      console.error('❌ RAG search exception:', error);
      return [];
    }
  }

  /**
   * Répondre avec RAG + Vertex AI - IMPROVED prompt
   */
  private async answerWithRAGAndVertexAI(
    documents: any[],
    question: string
  ): Promise<RAGResult> {
    console.log('🤖 Using Vertex AI with RAG context');

    const ragContext = documents
      .map((doc, i) => `[Doc ${i + 1}] ${doc.title}: ${doc.content.substring(0, 400)}`)
      .join('\n\n');

    const prompt = `You are the OMA Digital assistant. Answer based on this context:

${ragContext}

User question: ${question}

IMPORTANT INSTRUCTIONS: 
1. Detect the language of the user's question automatically
2. Respond in the SAME language as the user's question (French if they ask in French, English if they ask in English)
3. Use ONLY the information from the context above to answer
4. Keep your response concise (maximum 8 sentences)
5. Start your response with [LANG:FR] if responding in French or [LANG:EN] if responding in English
6. If the context mentions offers, services, or products, provide specific details from the documents
