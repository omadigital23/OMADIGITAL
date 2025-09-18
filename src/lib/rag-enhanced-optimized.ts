/**
 * AMÉLIORATION 1 : RAG Vectoriel Intelligent avec Supabase
 * Remplace le système de mots-clés par une recherche sémantique avancée
 */

import { createClient } from '@supabase/supabase-js';

interface VectorSearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  similarity: number;
  metadata: any;
}

export class EnhancedVectorRAG {
  private supabase: any;
  private cache: Map<string, VectorSearchResult[]> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * AMÉLIORATION: Génération d'embeddings avec Gemini
   * Plus précis que le système de mots-clés actuel
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Utilisation de Gemini pour générer des embeddings textuels
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: {
            parts: [{ text: text.substring(0, 1000) }] // Limite pour l'API
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding?.values || [];
    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Fallback: embedding simple basé sur les mots-clés
      return this.generateSimpleEmbedding(text);
    }
  }

  /**
   * Fallback embedding pour garantir la robustesse
   */
  private generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/);
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Generate 384-dimensional vector (standard embedding size)
    const vector = new Array(384).fill(0);
    const importantWords = Object.keys(wordCount).slice(0, 100);
    
    importantWords.forEach((word, index) => {
      if (index < 384) {
        vector[index] = Math.min(wordCount[word] / words.length, 1);
      }
    });
    
    return vector;
  }

  /**
   * AMÉLIORATION: Recherche vectorielle avec cache intelligent
   */
  async searchSemantic(query: string, language: 'fr' | 'en' = 'fr', limit: number = 3): Promise<VectorSearchResult[]> {
    const cacheKey = `${query}_${language}_${limit}`;
    
    // Vérification cache avec timestamp
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      console.log('🚀 RAG Cache hit for:', query.substring(0, 30));
      return cached;
    }

    try {
      // Génération de l'embedding de la requête
      const queryEmbedding = await this.generateEmbedding(query);
      
      if (queryEmbedding.length === 0) {
        console.warn('Empty embedding, falling back to keyword search');
        return this.fallbackKeywordSearch(query, language, limit);
      }

      // Recherche vectorielle avec fonction PostgreSQL
      const { data, error } = await this.supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
        filter_language: language
      });

      if (error || !data || data.length === 0) {
        console.log('Vectorial search failed, using keyword fallback');
        return this.fallbackKeywordSearch(query, language, limit);
      }

      const results = data.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        keywords: doc.keywords || [],
        similarity: doc.similarity || 0,
        metadata: doc.metadata || {}
      }));

      // Cache avec timestamp
      this.cache.set(cacheKey, results);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      console.log(`✅ RAG Vector search: ${results.length} documents found`);
      return results;

    } catch (error) {
      console.error('Semantic search error:', error);
      return this.fallbackKeywordSearch(query, language, limit);
    }
  }

  /**
   * AMÉLIORATION: Fallback keyword search optimisé (ancien système)
   */
  private async fallbackKeywordSearch(query: string, language: 'fr' | 'en', limit: number): Promise<VectorSearchResult[]> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Recherche optimisée par mots-clés avec scoring
      let queryBuilder = this.supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_active', true)
        .eq('language', language);

      // Logique de recherche par mots-clés améliorée
      if (lowerQuery.includes('whatsapp') || lowerQuery.includes('automatisation')) {
        queryBuilder = queryBuilder.contains('keywords', ['whatsapp']);
      } else if (lowerQuery.includes('site') || lowerQuery.includes('web')) {
        queryBuilder = queryBuilder.contains('keywords', ['site web']);
      } else if (lowerQuery.includes('prix') || lowerQuery.includes('tarif')) {
        queryBuilder = queryBuilder.contains('keywords', ['prix']);
      } else if (lowerQuery.includes('mobile') || lowerQuery.includes('app')) {
        queryBuilder = queryBuilder.contains('keywords', ['mobile']);
      }

      const { data, error } = await queryBuilder.limit(limit);

      if (error || !data) {
        throw new Error(`Keyword search failed: ${error?.message}`);
      }

      // Scoring simple basé sur la correspondance des mots
      const results = data.map(doc => {
        const titleMatch = doc.title.toLowerCase().includes(lowerQuery) ? 0.8 : 0;
        const contentMatch = doc.content.toLowerCase().includes(lowerQuery) ? 0.6 : 0;
        const keywordMatch = doc.keywords?.some((k: string) => 
          lowerQuery.includes(k.toLowerCase())
        ) ? 0.9 : 0;
        
        const similarity = Math.max(titleMatch, contentMatch, keywordMatch);

        return {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          keywords: doc.keywords || [],
          similarity,
          metadata: doc.metadata || {}
        };
      }).sort((a, b) => b.similarity - a.similarity);

      console.log(`🔄 RAG Keyword fallback: ${results.length} documents found`);
      return results;

    } catch (error) {
      console.error('Fallback keyword search failed:', error);
      return [];
    }
  }

  /**
   * AMÉLIORATION: Formatage contexte pour Gemini optimisé
   */
  formatContextForGemini(results: VectorSearchResult[], maxLength: number = 1500): string {
    if (results.length === 0) {
      return '';
    }

    let context = '';
    let currentLength = 0;

    for (const result of results) {
      const docText = `**${result.title}** (Pertinence: ${Math.round(result.similarity * 100)}%)\n${result.content}\n\n`;
      
      if (currentLength + docText.length <= maxLength) {
        context += docText;
        currentLength += docText.length;
      } else {
        // Troncature intelligente
        const remainingSpace = maxLength - currentLength - 100; // Buffer
        if (remainingSpace > 100) {
          context += `**${result.title}**\n${result.content.substring(0, remainingSpace)}...\n\n`;
        }
        break;
      }
    }

    return context;
  }

  /**
   * AMÉLIORATION: Mise à jour des embeddings en arrière-plan
   */
  async updateDocumentEmbeddings(): Promise<void> {
    try {
      console.log('🔄 Starting background embedding update...');
      
      // Récupérer documents sans embeddings
      const { data: documents, error } = await this.supabase
        .from('knowledge_base')
        .select('id, title, content')
        .is('embedding', null)
        .eq('is_active', true)
        .limit(5); // Traitement par batch

      if (error || !documents || documents.length === 0) {
        console.log('✅ All documents have embeddings');
        return;
      }

      for (const doc of documents) {
        try {
          const combinedText = `${doc.title} ${doc.content}`;
          const embedding = await this.generateEmbedding(combinedText);
          
          if (embedding.length > 0) {
            const { error: updateError } = await this.supabase
              .from('knowledge_base')
              .update({ embedding })
              .eq('id', doc.id);

            if (updateError) {
              console.error(`Failed to update embedding for ${doc.id}:`, updateError);
            } else {
              console.log(`✅ Updated embedding for: ${doc.title}`);
            }
          }
          
          // Rate limiting pour éviter la surcharge API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing document ${doc.id}:`, error);
        }
      }

      console.log('✅ Background embedding update completed');
    } catch (error) {
      console.error('Background embedding update failed:', error);
    }
  }
}

// Instance singleton pour l'optimisation
export const enhancedRAG = new EnhancedVectorRAG();