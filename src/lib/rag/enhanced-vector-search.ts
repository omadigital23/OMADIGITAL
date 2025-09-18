/**
 * 🔍 SYSTÈME RAG OPTIMISÉ POUR OMA DIGITAL + SUPABASE
 * Recherche vectorielle et par mots-clés avec scoring intelligent
 */

import { supabase } from '../analytics';

export interface OMADocument {
  id: string;
  title: string;
  content: string;
  category: string;
  language: 'fr' | 'en';
  keywords: string[];
  similarity?: number;
  relevance_score?: number;
}

export interface RAGSearchOptions {
  language?: 'fr' | 'en';
  category?: string;
  limit?: number;
  threshold?: number;
  hybrid?: boolean; // Recherche hybride mots-clés + sémantique
}

/**
 * 🎯 RECHERCHE RAG PRINCIPALE - OPTIMISÉE POUR OMA DIGITAL
 */
export async function searchOMAKnowledge(
  query: string,
  options: RAGSearchOptions = {}
): Promise<OMADocument[]> {
  const {
    language = 'fr',
    category,
    limit = 5,
    threshold = 0.1,
    hybrid = true
  } = options;

  try {
    console.log('🔍 RAG Search:', { query, language, category, limit });

    // 1. Recherche hybride pour meilleure pertinence
    // Create options object properly to satisfy TypeScript with exactOptionalPropertyTypes
    const hybridSearchOptions: RAGSearchOptions = {
      language,
      limit: limit * 2, // Chercher plus pour filtrer ensuite
      threshold
    };
    
    // Only add category if it's defined
    if (category !== undefined) {
      hybridSearchOptions.category = category;
    }
    
    const results = await hybridSearch(query, hybridSearchOptions);

    // 2. Scoring et ranking intelligent
    const scoredResults = scoreDocuments(results, query, language);

    // 3. Filtrage final et limitation
    return scoredResults.slice(0, limit);

  } catch (error) {
    console.error('❌ Erreur RAG search:', error);
    
    // Fallback: recherche simple par mots-clés
    // Create fallback options object properly
    const fallbackOptions: RAGSearchOptions = {
      language,
      limit
    };
    
    // Only add category if it's defined
    if (category !== undefined) {
      fallbackOptions.category = category;
    }
    
    return await fallbackKeywordSearch(query, fallbackOptions);
  }
}

/**
 * 🔄 RECHERCHE HYBRIDE - Mots-clés + Full-Text + Similarité
 */
async function hybridSearch(
  query: string, 
  options: RAGSearchOptions
): Promise<OMADocument[]> {
  const { language, category, limit } = options;

  try {
    // CHANGED: Add caching mechanism for better performance
    const cacheKey = `rag_${language}_${category || 'all'}_${query}`;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Check if cache is less than 5 minutes old
          if (Date.now() - parsed.timestamp < 300000) {
            console.log('🔍 Using cached RAG results');
            return parsed.data;
          }
        }
      } catch (cacheError) {
        console.warn('⚠️ Cache read error:', cacheError);
      }
    }

    // Utiliser la fonction SQL optimisée si disponible
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      search_query: query,
      search_language: language,
      result_limit: limit
    });

    if (!error && data?.length > 0) {
      const formattedData = data.map(formatDocument);
      
      // CHANGED: Cache results for better performance
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: formattedData,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          console.warn('⚠️ Cache write error:', cacheError);
        }
      }
      
      return formattedData;
    }

    throw new Error('RPC search failed, using fallback');

  } catch (error) {
    console.warn('⚠️ RPC search failed, using manual search:', error);
    
    // Fallback manuel si RPC non disponible
    return await manualHybridSearch(query, options);
  }
}

/**
 * 🔧 RECHERCHE HYBRIDE MANUELLE (fallback)
 */
async function manualHybridSearch(
  query: string,
  options: RAGSearchOptions
): Promise<OMADocument[]> {
  const { language, category, limit } = options;

  // Construction de la requête avec filtres
  let queryBuilder = supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .eq('language', language);

  // Only add category filter if it's defined
  if (category !== undefined) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  // Recherche par mots-clés dans le contenu ET titre
  const searchTerms = extractKeywords(query);
  const searchPattern = searchTerms.join(' | '); // PostgreSQL OR pattern

  // Amélioration: recherche plus flexible avec correspondances partielles
  const keywordPatterns = searchTerms.map(term => `keywords.cs.{${term}}`).join(',');
  const contentPatterns = searchTerms.map(term => `content.ilike.%${term}%`).join(',');
  const titlePatterns = searchTerms.map(term => `title.ilike.%${term}%`).join(',');

  const { data, error } = await queryBuilder
    .or(`${contentPatterns},${titlePatterns},${keywordPatterns},content.ilike.%${query}%,title.ilike.%${query}%`)
    .limit(limit || 10);

  if (error) {
    throw error;
  }

  return (data || []).map(formatDocument);
}

/**
 * 📊 SCORING INTELLIGENT DES DOCUMENTS
 */
function scoreDocuments(
  documents: OMADocument[],
  query: string,
  language: 'fr' | 'en'
): OMADocument[] {
  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  return documents
    .map(doc => {
      let score = 0;

      // 1. Correspondance exacte dans le titre (poids fort)
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // 2. Correspondance dans le contenu (poids moyen)
      const contentMatches = (doc.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
      score += contentMatches * 3;

      // 3. Correspondance des mots-clés (poids fort)
      const keywordMatches = queryKeywords.filter(kw => 
        doc.keywords.some(docKw => docKw.toLowerCase().includes(kw.toLowerCase()))
      ).length;
      score += keywordMatches * 5;

      // 4. Bonus catégorie spécifique
      if (isServiceQuery(query) && doc.category === 'services') score += 5;
      if (isPricingQuery(query) && doc.category === 'pricing') score += 5;
      if (isContactQuery(query) && doc.category === 'contact') score += 5;

      // 5. Bonus langue correspondante
      if (doc.language === language) score += 2;

      return { ...doc, relevance_score: score };
    })
    .filter(doc => doc.relevance_score! > 0)
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
}

/**
 * 🔤 EXTRACTION MOTS-CLÉS INTELLIGENTE
 */
function extractKeywords(query: string): string[] {
  const stopWords = {
    fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'pour', 'avec', 'sur', 'dans'],
    en: ['the', 'a', 'an', 'and', 'or', 'for', 'with', 'on', 'in', 'at', 'by', 'to']
  };

  // Extraire mots individuels
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !stopWords.fr.includes(word) && !stopWords.en.includes(word));

  // Ajouter des termes composés pour mobile app queries
  const keywords = [...words];
  
  // Ajouter termes composés spécifiques
  if (words.includes('mobile') && words.includes('app')) {
    keywords.push('mobile app', 'application mobile');
  }
  if (words.includes('application') && words.includes('mobile')) {
    keywords.push('application mobile', 'mobile app');
  }
  if (words.includes('react') && words.includes('native')) {
    keywords.push('react native');
  }
  
  return keywords.slice(0, 15); // Augmenter la limite pour termes composés
}

/**
 * 🎯 DÉTECTION TYPE DE REQUÊTE
 */
function isServiceQuery(query: string): boolean {
  const serviceTerms = ['service', 'automatisation', 'whatsapp', 'site web', 'développement', 'chatbot'];
  return serviceTerms.some(term => query.toLowerCase().includes(term));
}

function isPricingQuery(query: string): boolean {
  const pricingTerms = ['prix', 'tarif', 'coût', 'price', 'cost', 'combien', 'budget'];
  return pricingTerms.some(term => query.toLowerCase().includes(term));
}

function isContactQuery(query: string): boolean {
  const contactTerms = ['contact', 'téléphone', 'email', 'joindre', 'appeler'];
  return contactTerms.some(term => query.toLowerCase().includes(term));
}

/**
 * 🔄 RECHERCHE FALLBACK SIMPLE
 */
async function fallbackKeywordSearch(
  query: string,
  options: RAGSearchOptions
): Promise<OMADocument[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true)
      .eq('language', options.language || 'fr')
      .ilike('content', `%${query}%`)
      .limit(options.limit || 5);

    if (error) throw error;

    return (data || []).map(formatDocument);
  } catch (error) {
    console.error('❌ Fallback search failed:', error);
    return [];
  }
}

/**
 * 📝 FORMATAGE DOCUMENT STANDARDISÉ
 */
function formatDocument(rawDoc: any): OMADocument {
  return {
    id: rawDoc.id,
    title: rawDoc.title || 'Document OMA',
    content: rawDoc.content || '',
    category: rawDoc.category || 'general',
    language: rawDoc.language || 'fr',
    keywords: Array.isArray(rawDoc.keywords) ? rawDoc.keywords : [],
    similarity: rawDoc.similarity || 0,
    relevance_score: rawDoc.relevance_score || 0
  };
}

/**
 * 🎨 FORMATAGE POUR PROMPT GEMINI
 */
export function formatDocumentsForGemini(documents: OMADocument[]): string {
  if (!documents.length) {
    return '❌ **Aucune information trouvée dans la base de connaissances OMA Digital.**\n\nVeuillez contacter notre équipe pour plus de détails.';
  }

  return documents
    .map((doc, index) => {
      const relevanceIndicator = doc.relevance_score ? ` (Score: ${doc.relevance_score})` : '';
      return `## 📄 ${doc.title}${relevanceIndicator}

${doc.content}

**Catégorie**: ${doc.category} | **Langue**: ${doc.language}`;
    })
    .join('\n\n---\n\n');
}

/**
 * 🧪 DÉTECTION LANGUE AUTOMATIQUE
 */
// This function is kept for backward compatibility but should not be used for primary language detection
// Language detection should be handled by the Gemini API in the chat route
export function detectLanguage(text: string): 'fr' | 'en' {
  // Simple fallback detection - should be replaced by Gemini API
  const frenchWords = ['le', 'la', 'les', 'un', 'une', 'et', 'ou', 'pour', 'avec', 'comment', 'quoi', 'qui'];
  const englishWords = ['the', 'a', 'an', 'and', 'or', 'for', 'with', 'how', 'what', 'who'];

  const words = text.toLowerCase().split(/\s+/);
  
  const frenchCount = words.filter(word => frenchWords.includes(word)).length;
  const englishCount = words.filter(word => englishWords.includes(word)).length;

  return frenchCount > englishCount ? 'fr' : 'en';
}

export default searchOMAKnowledge;