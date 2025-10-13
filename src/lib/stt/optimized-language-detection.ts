/**
 * AMÉLIORATION STT: Détection de langue optimisée avec cache
 * Évite les double appels Whisper + Gemini
 */

interface LanguageCache {
  text: string;
  language: 'fr' | 'en';
  confidence: number;
  timestamp: number;
}

class OptimizedLanguageDetection {
  private cache = new Map<string, LanguageCache>();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50;

  /**
   * AMÉLIORATION: Détection langue avec cache et fallback intelligent
   */
  async detectLanguageOptimized(
    text: string, 
    whisperLanguage?: string,
    useCache: boolean = true
  ): Promise<{ language: 'fr' | 'en'; confidence: number; source: string }> {
    
    if (!text || text.length < 2) {
      return { language: 'fr', confidence: 0.5, source: 'default' };
    }

    const normalizedText = text.toLowerCase().trim().substring(0, 200);
    
    // Check cache first
    if (useCache) {
      const cached = this.getCachedLanguage(normalizedText);
      if (cached) {
        return { 
          language: cached['language'], 
          confidence: cached.confidence, 
          source: 'cache' 
        };
      }
    }

    // AMÉLIORATION 1: Utiliser d'abord la détection Whisper si disponible
    if (whisperLanguage) {
      const whisperResult = this.parseWhisperLanguage(whisperLanguage);
      if (whisperResult.confidence > 0.8) {
        this.setCachedLanguage(normalizedText, whisperResult['language'], whisperResult.confidence);
        return { 
          language: whisperResult['language'], 
          confidence: whisperResult.confidence, 
          source: 'whisper' 
        };
      }
    }

    // AMÉLIORATION 2: Détection rapide par mots-clés (plus rapide que Gemini)
    const keywordResult = this.detectByKeywords(normalizedText);
    if (keywordResult.confidence > 0.9) {
      this.setCachedLanguage(normalizedText, keywordResult['language'], keywordResult.confidence);
      return { 
        language: keywordResult['language'], 
        confidence: keywordResult.confidence, 
        source: 'keywords' 
      };
    }

    // AMÉLIORATION 3: Fallback Gemini seulement si nécessaire
    try {
      const geminiResult = await this.detectWithGemini(normalizedText);
      this.setCachedLanguage(normalizedText, geminiResult['language'], geminiResult.confidence);
      return { 
        language: geminiResult['language'], 
        confidence: geminiResult.confidence, 
        source: 'gemini' 
      };
    } catch (error) {
      console.error('❌ Gemini language detection failed:', error);
      
      // Final fallback to keywords
      this.setCachedLanguage(normalizedText, keywordResult['language'], keywordResult.confidence);
      return { 
        language: keywordResult['language'], 
        confidence: keywordResult.confidence, 
        source: 'keywords_fallback' 
      };
    }
  }

  /**
   * AMÉLIORATION: Parse Whisper language output
   */
  private parseWhisperLanguage(whisperLang: string): { language: 'fr' | 'en'; confidence: number } {
    const lang = whisperLang.toLowerCase().trim();
    
    if (lang.startsWith('fr') || lang.includes('french')) {
      return { language: 'fr', confidence: 0.9 };
    }
    if (lang.startsWith('en') || lang.includes('english')) {
      return { language: 'en', confidence: 0.9 };
    }
    
    return { language: 'fr', confidence: 0.3 }; // Default to French for Senegal market
  }

  /**
   * AMÉLIORATION: Détection rapide par mots-clés
   */
  private detectByKeywords(text: string): { language: 'fr' | 'en'; confidence: number } {
    const englishKeywords = [
      'hello', 'hi', 'thank', 'thanks', 'please', 'service', 'price', 'cost', 
      'help', 'website', 'mobile', 'app', 'whatsapp', 'automation', 'contact',
      'can', 'would', 'could', 'want', 'need', 'how', 'what', 'when', 'where'
    ];
    
    const frenchKeywords = [
      'bonjour', 'salut', 'merci', 'svp', 'sil', 'vous', 'plait', 'service', 
      'prix', 'coût', 'aide', 'site', 'mobile', 'whatsapp', 'automatisation',
      'contact', 'peux', 'voudrais', 'veux', 'besoin', 'comment', 'quoi', 
      'quand', 'où', 'est', 'ce', 'que', 'vous', 'nous', 'mon', 'ma', 'mes'
    ];

    const words = text.split(/\s+/);
    let englishScore = 0;
    let frenchScore = 0;

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      if (englishKeywords.includes(cleanWord)) englishScore++;
      if (frenchKeywords.includes(cleanWord)) frenchScore++;
    });

    // Calculate confidence based on unique matches
    const totalMatches = englishScore + frenchScore;
    const confidence = Math.min(0.95, 0.6 + (totalMatches * 0.1));

    if (englishScore > frenchScore && englishScore > 0) {
      return { language: 'en', confidence };
    } else if (frenchScore > englishScore && frenchScore > 0) {
      return { language: 'fr', confidence };
    } else {
      // Default to French for Senegal/Morocco market
      return { language: 'fr', confidence: 0.6 };
    }
  }

  /**
   * AMÉLIORATION: Appel Gemini optimisé (seulement si nécessaire)
   */
  private async detectWithGemini(text: string): Promise<{ language: 'fr' | 'en'; confidence: number }> {
    const apiKey = process.env['GOOGLE_AI_API_KEY'];
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    // Prompt ultra-optimisé pour la détection de langue
    const prompt = `Language: FR or EN only.\nText: "${text.substring(0, 100)}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout (réduit de 15s)

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0, 
              maxOutputTokens: 5 // Minimal tokens
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const isEnglish = result.trim().toUpperCase().includes('EN');
      const isFrench = result.trim().toUpperCase().includes('FR');
      
      if (isEnglish && !isFrench) {
        return { language: 'en', confidence: 0.85 };
      } else if (isFrench && !isEnglish) {
        return { language: 'fr', confidence: 0.85 };
      } else {
        return { language: 'fr', confidence: 0.7 }; // Default
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Cache management
   */
  private getCachedLanguage(text: string): LanguageCache | null {
    const cacheKey = this.generateCacheKey(text);
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log('✅ Language Cache HIT:', cacheKey.substring(0, 30));
      return cached;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private setCachedLanguage(text: string, language: 'fr' | 'en', confidence: number): void {
    const cacheKey = this.generateCacheKey(text);
    
    // LRU: Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, {
      text: text.substring(0, 50),
      language,
      confidence,
      timestamp: Date.now()
    });
    
    console.log('💾 Language Cache SET:', cacheKey.substring(0, 30));
  }

  private generateCacheKey(text: string): string {
    // Simple hash for cache key
    return text.substring(0, 50).replace(/\s+/g, '_').toLowerCase();
  }

  /**
   * Cache maintenance
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
    console.log('🧹 Language Cache cleaned, remaining:', this.cache.size);
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      entries: Array.from(this.cache.values()).slice(0, 3)
    };
  }
}

// Export singleton
export const optimizedLanguageDetection = new OptimizedLanguageDetection();

// Cleanup cache periodically (server-side only)
if (typeof window === 'undefined') {
  setInterval(() => {
    optimizedLanguageDetection.clearExpiredCache();
  }, 600000); // Every 10 minutes
}