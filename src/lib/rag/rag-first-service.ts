/**
 * RAG-FIRST SERVICE avec Vertex AI
 * 100% Vertex AI - Pas de Google AI Studio
 * Credentials depuis .env.local
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
    const ragDocumentsFr = await this.searchKnowledgeBase(cleanQuestion, 'fr', limit * 2);
    const ragDocumentsEn = await this.searchKnowledgeBase(cleanQuestion, 'en', limit * 2);
    
    // Fusionner puis classer par pertinence selon l'intention
    let allDocuments = [...ragDocumentsFr, ...ragDocumentsEn];
    console.log(`📚 RAG: Found ${allDocuments.length} documents (FR: ${ragDocumentsFr.length}, EN: ${ragDocumentsEn.length})`);

    if (allDocuments.length > 0) {
      const normalized = this.normalizeAccents(cleanQuestion);
      const isOfferIntent = this.isOffersServicesIntent(normalized);
      const baseKeywords = normalized.split(/\s+/).filter((w: string) => w.length >= 3);
      const expanded = this.expandKeywords(baseKeywords, 'en');
      allDocuments = this.rankDocuments(allDocuments, expanded, isOfferIntent).slice(0, limit);
    }

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
   * Étend la liste de mots-clés avec variantes singulier/pluriel et synonymes FR/EN
   */
  private expandKeywords(base: string[], language: 'fr' | 'en'): string[] {
    const variants = new Set<string>();

    const add = (w: string) => {
      const k = w.trim().toLowerCase();
      if (k) variants.add(k);
    };

    // Synonymes dédiés services/offres en FR et EN
    const synonymsMap: Record<string, string[]> = {
      // EN + generic
      'offer': ['offers', 'service', 'services', 'proposal', 'package', 'plans'],
      'offers': ['offer', 'service', 'services', 'proposal', 'package', 'plans'],
      'service': ['services', 'offer', 'offers', 'solutions', 'offre', 'offres'],
      'services': ['service', 'offer', 'offers', 'solutions', 'offre', 'offres'],
      // FR specific
      'offre': ['offres', 'service', 'services', 'proposition', 'forfait', 'packs'],
      'offres': ['offre', 'service', 'services', 'proposition', 'forfait', 'packs']
    };

    const isPluralCandidate = (w: string) => /[a-z]$/.test(w) && !/(ss|us|is)$/.test(w);

    for (const w of base) {
      add(w);

      // Basculer singulier/pluriel simple
      if (w.endsWith('s') && w.length > 3) {
        add(w.slice(0, -1));
      } else if (isPluralCandidate(w)) {
        add(`${w}s`);
      }

      // Ajouter synonymes si connus
      if (synonymsMap[w]) {
        for (const s of synonymsMap[w]) add(s);
      }

      // Synonymes spécifiques par langue
      if (language === 'en') {
        if (w === 'pricing' || w === 'prices' || w === 'price') {
          add('plans'); add('packages'); add('offer'); add('offers');
        }
      } else {
        if (w === 'tarif' || w === 'tarifs' || w === 'prix') {
          add('offre'); add('offres'); add('packs');
        }
      }
    }

    return Array.from(variants);
  }

  /**
   * Détecte si la question concerne les offres/services
   */
  private isOffersServicesIntent(normalized: string): boolean {
    return /(offer|offers|service|services|offre|offres|prestations)/i.test(normalized);
  }

  /**
   * Classe les documents par pertinence en privilégiant la catégorie services
   * et en démotant la catégorie contact pour les requêtes d'offres/services
   */
  private rankDocuments(docs: any[], keywords: string[], isOfferIntent: boolean): any[] {
    const kwSet = new Set(keywords.map(k => k.toLowerCase()));

    const scoreOf = (doc: any): number => {
      let score = 0;

      const title: string = (doc.title || '').toLowerCase();
      const content: string = (doc.content || '').toLowerCase();
      const category: string = (doc.category || '').toLowerCase();
      const kwords: string[] = Array.isArray(doc.keywords) ? doc.keywords.map((k: string) => String(k).toLowerCase()) : [];

      // Poids catégorie
      if (isOfferIntent) {
        if (category === 'services') score += 8; // booster services
        if (category === 'contact') score -= 4;  // éviter site officiel pour cette intention
        if (category === 'about') score -= 2;
      }

      // Occurrences dans title/content/keywords
      for (const k of kwSet) {
        if (!k) continue;
        if (title.includes(k)) score += 3;
        if (content.includes(k)) score += 1.5;
        if (kwords.includes(k)) score += 2;
      }

      // Mots-clés directs utiles
      const direct = /(offer|offers|service|services|offre|offres)/;
      if (direct.test(title)) score += 3;
      if (direct.test(content)) score += 1.5;

      return score;
    };

    return [...docs].sort((a, b) => scoreOf(b) - scoreOf(a));
  }

  /**
   * Rechercher dans Supabase
   */
  private async searchKnowledgeBase(
    query: string,
    language: 'fr' | 'en',
    limit: number
  ): Promise<any[]> {
    try {
      // Normaliser la query (enlever les accents)
      const normalizedQuery = this.normalizeAccents(query);
      
      // Extraire les mots-clés de la question (mots de 3+ caractères)
      const baseKeywords = normalizedQuery
        .split(/\s+/)
        .filter((word: string) => word.length >= 3)
        .filter((word: string) => !['the', 'what', 'where', 'when', 'how', 'your', 'are', 'is', 'can', 'do', 'does', 'qui', 'que', 'quoi', 'ou', 'comment', 'votre', 'est', 'sont', 'peut', 'faire', 'cest'].includes(word));

      // Étendre avec variantes singulier/pluriel + synonymes
      const keywords = this.expandKeywords(baseKeywords, language);
      
      console.log(`🔍 RAG: Keywords expanded: ${keywords.join(', ')}`);

      const result = await supabaseManager.executeQuery(async (client) => {
        // Recherche dans le champ keywords (array) avec l'opérateur @>
        let queryBuilder = client
          .from('knowledge_base')
          .select('*')
          .eq('language', language)
          .eq('is_active', true);

        // Chercher dans keywords (array) ET dans title/content
        if (keywords.length > 0) {
          // Construire une requête OR correcte pour Supabase
          // Pour chaque mot-clé, chercher dans keywords, title ET content
          const conditions: string[] = [];

          keywords.forEach((kw: string) => {
            const safeKw = kw.replace(/[",{}]/g, '');
            // Chercher dans le tableau keywords (text[]) avec l'opérateur contains
            // Format PostgREST: keywords.cs.{"value"}
            if (safeKw && !/\s/.test(safeKw)) {
              conditions.push(`keywords.cs.{"${safeKw}"}`);
            }
            // Aussi chercher dans title et content (ILIKE)
            const like = safeKw.replace(/%/g, '');
            conditions.push(`title.ilike.%${like}%`);
            conditions.push(`content.ilike.%${like}%`);
          });

          queryBuilder = queryBuilder.or(conditions.join(','));
        } else {
          // Si pas de mots-clés, chercher la phrase complète
          const likeAll = normalizedQuery.replace(/%/g, '');
          queryBuilder = queryBuilder.or(`title.ilike.%${likeAll}%,content.ilike.%${likeAll}%`);
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
   * Répondre avec RAG + Vertex AI
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

User: ${question}

IMPORTANT: 
1. Detect the language of the user's question automatically
2. Respond in the SAME language as the user's question (French if they write in French, English if they write in English)
3. Keep your response to maximum 8 sentences. Be concise.
4. Start your response with [LANG:FR] if responding in French or [LANG:EN] if responding in English

Assistant:`;

    const response = await vertexAIChatbot.generateContent(prompt);

    return {
      answer: response.answer,
      source: 'rag_gemini',
      confidence: 0.8,
      documents,
      language: response.language
    };
  }

  /**
   * Répondre avec Vertex AI seulement (sans RAG)
   */
  private async answerWithVertexAIOnly(
    question: string
  ): Promise<RAGResult> {
    console.log('🤖 Using Vertex AI only (no RAG)');

    const prompt = `You are the OMA Digital assistant.

User: ${question}

IMPORTANT: 
1. Detect the language of the user's question automatically
2. Respond in the SAME language as the user's question (French if they write in French, English if they write in English)
3. Keep your response to maximum 8 sentences. Be concise.
4. Start your response with [LANG:FR] if responding in French or [LANG:EN] if responding in English

Assistant:`;

    const response = await vertexAIChatbot.generateContent(prompt);

    return {
      answer: response.answer,
      source: 'gemini_fallback',
      confidence: 0.6,
      documents: [],
      language: response.language
    };
  }
}

// Export singleton
export const ragFirstService = new RAGFirstService();
