/**
 * Recherche vectorielle RAG avec Supabase pgvector
 */

import { supabase } from '../analytics';

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    category?: string;
  };
  similarity?: number;
}

/**
 * Recherche de documents pertinents via similarité vectorielle
 */
export async function searchRelevantDocuments(
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<RAGDocument[]> {
  try {
    // Essayer d'abord la recherche vectorielle si disponible
    const embedding = await generateEmbedding(query);
    
    if (embedding.length > 0) {
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit
      });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
    
    // Fallback: recherche par mots-clés
    return await searchByKeywords(query, limit);
    
  } catch (error) {
    console.error('Erreur recherche RAG:', error);
    // Fallback final: recherche par mots-clés
    return await searchByKeywords(query, limit);
  }
}

/**
 * Recherche simple par mots-clés (fallback sans embeddings)
 */
async function searchByKeywords(query: string, limit: number = 5): Promise<RAGDocument[]> {
  try {
    const { data, error } = await supabase
      .from('chatbot_knowledge_base')
      .select('id, content, title, category')
      .textSearch('content', query)
      .limit(limit);

    if (error) {
      console.error('Erreur recherche par mots-clés:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      content: item.content,
      metadata: {
        title: item.title,
        category: item.category
      }
    }));
  } catch (error) {
    console.error('Erreur recherche par mots-clés:', error);
    return [];
  }
}

/**
 * Génère un embedding pour la requête (à implémenter selon votre service)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Implémenter avec votre service d'embedding
  // Exemple avec OpenAI, Cohere, ou service local
  return [];
}

/**
 * Formate les documents trouvés pour le prompt
 */
export function formatDocumentsForPrompt(documents: RAGDocument[]): string {
  if (!documents.length) {
    return 'Aucun document de référence disponible.';
  }

  return documents
    .map((doc, index) => {
      const title = doc.metadata.title || `Document ${index + 1}`;
      const source = doc.metadata.source ? ` (Source: ${doc.metadata.source})` : '';
      return `**${title}**${source}\n${doc.content}`;
    })
    .join('\n\n---\n\n');
}