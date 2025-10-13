interface EmbeddingVector {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export class SimpleRAG {
  private vectors: EmbeddingVector[] = [];
  
  // Simple cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // Simple text to vector (TF-IDF approximation)
  private textToVector(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/);
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Convert to simple vector (first 100 most common words)
    const commonWords = Object.keys(wordCount).slice(0, 100);
    return commonWords.map(word => wordCount[word] || 0);
  }
  
  addDocument(id: string, content: string, metadata: Record<string, any> = {}) {
    const embedding = this.textToVector(content);
    this.vectors.push({ id, content, embedding, metadata });
  }
  
  search(query: string, limit: number = 5): EmbeddingVector[] {
    const queryVector = this.textToVector(query);
    
    return this.vectors
      .map(vec => ({
        ...vec,
        similarity: this.cosineSimilarity(queryVector, vec.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

export const ragSystem = new SimpleRAG();