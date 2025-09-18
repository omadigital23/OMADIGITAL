/**
 * AMÉLIORATION 2 : Service STT Optimisé avec Détection Langue Intégrée
 * Optimise le STT Hugging Face existant avec cache et fallback
 */

interface STTResult {
  text: string;
  confidence: number;
  language: 'fr' | 'en';
  processingTime: number;
}

interface AudioProcessingOptions {
  enableLanguageDetection: boolean;
  preferredLanguage?: 'fr' | 'en';
  maxDuration?: number;
  enableNoiseReduction?: boolean;
}

export class EnhancedSTTService {
  private cache: Map<string, STTResult> = new Map();
  private cacheTimeout = 600000; // 10 minutes
  private currentRequests = 0;
  private maxConcurrentRequests = 3;

  /**
   * AMÉLIORATION: Audio preprocessing optimisé
   */
  private async preprocessAudio(audioBlob: Blob): Promise<Blob> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Validation basique de l'audio
      if (arrayBuffer.byteLength < 1000) {
        throw new Error('Audio trop court (minimum 1KB)');
      }
      
      if (arrayBuffer.byteLength > 10 * 1024 * 1024) { // 10MB max
        throw new Error('Audio trop volumineux (maximum 10MB)');
      }

      // Pour une amélioration future: compression audio côté client
      // Actuellement, on retourne le blob original
      return audioBlob;
    } catch (error) {
      console.error('Audio preprocessing failed:', error);
      throw error;
    }
  }

  /**
   * AMÉLIORATION: Transcription avec détection de langue intégrée
   */
  async transcribeWithLanguageDetection(
    audioBlob: Blob,
    options: AudioProcessingOptions = { enableLanguageDetection: true }
  ): Promise<STTResult> {
    const startTime = Date.now();
    
    // Limitation des requêtes concurrentes
    if (this.currentRequests >= this.maxConcurrentRequests) {
      throw new Error('Trop de requêtes STT simultanées. Veuillez patienter.');
    }

    this.currentRequests++;

    try {
      // Cache check basé sur la taille et le timestamp approximatif
      const cacheKey = `${audioBlob.size}_${audioBlob.type}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        console.log('🚀 STT Cache hit');
        this.currentRequests--;
        return {
          ...cached,
          processingTime: Date.now() - startTime
        };
      }

      // Preprocessing audio
      const processedAudio = await this.preprocessAudio(audioBlob);

      // Transcription principale avec Hugging Face
      const transcriptionResult = await this.transcribeWithHuggingFace(processedAudio);
      
      // Détection de langue si activée
      let detectedLanguage: 'fr' | 'en' = options.preferredLanguage || 'fr';
      
      if (options.enableLanguageDetection && transcriptionResult.text.length > 10) {
        detectedLanguage = await this.detectLanguageFromText(transcriptionResult.text);
      }

      const result: STTResult = {
        text: transcriptionResult.text,
        confidence: transcriptionResult.confidence,
        language: detectedLanguage,
        processingTime: Date.now() - startTime
      };

      // Cache avec expiration
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      console.log(`✅ STT Enhanced: ${result.text.length} chars in ${result.processingTime}ms`);
      return result;

    } catch (error) {
      console.error('Enhanced STT failed:', error);
      throw error;
    } finally {
      this.currentRequests--;
    }
  }

  /**
   * AMÉLIORATION: Hugging Face STT avec retry et timeout optimisés
   */
  private async transcribeWithHuggingFace(audioBlob: Blob): Promise<{ text: string; confidence: number }> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY manquante');
    }

    // Modèle optimisé pour le français et l'anglais
    const modelUrl = 'https://api-inference.huggingface.co/models/openai/whisper-large-v2';
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');

        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Use-Cache': 'false' // Évite les problèmes de cache HF
          },
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          
          // Gestion spécifique des erreurs HF
          if (response.status === 503) {
            throw new Error('Modèle HF en cours de chargement, réessayez dans quelques secondes');
          } else if (response.status === 429) {
            throw new Error('Limite de taux HF atteinte, réessayez plus tard');
          }
          
          throw new Error(`HF API error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        // Validation de la réponse HF
        if (!result || typeof result.text !== 'string') {
          throw new Error('Réponse HF invalide ou vide');
        }

        const text = result.text.trim();
        if (text.length === 0) {
          throw new Error('Transcription vide de Hugging Face');
        }

        // Estimation de la confiance basée sur la longueur et la cohérence
        const confidence = this.estimateConfidence(text, audioBlob.size);

        return { text, confidence };

      } catch (error: any) {
        lastError = error;
        console.warn(`STT attempt ${attempt + 1} failed:`, error.message);
        
        // Si c'est la dernière tentative, on lance l'erreur
        if (attempt === maxRetries) {
          break;
        }
        
        // Délai exponentiel entre les tentatives
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('STT failed after all retries');
  }

  /**
   * AMÉLIORATION: Détection de langue via Gemini optimisée
   */
  private async detectLanguageFromText(text: string): Promise<'fr' | 'en'> {
    try {
      // Cache local pour éviter les appels répétitifs
      const cacheKey = `lang_${text.substring(0, 50)}`;
      if (this.cache.has(cacheKey)) {
        return (this.cache.get(cacheKey) as any).language;
      }

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        return this.detectLanguageFallback(text);
      }

      const prompt = `Détecte la langue de ce texte et réponds uniquement par "FR" ou "EN": "${text.substring(0, 200)}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
        
        if (result === 'FR' || result === 'EN') {
          const detectedLang = result === 'FR' ? 'fr' : 'en';
          
          // Cache du résultat
          this.cache.set(cacheKey, { language: detectedLang });
          setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 min
          
          return detectedLang;
        }
      }

      return this.detectLanguageFallback(text);
    } catch (error) {
      console.warn('Gemini language detection failed, using fallback:', error);
      return this.detectLanguageFallback(text);
    }
  }

  /**
   * Détection de langue fallback basée sur des mots-clés
   */
  private detectLanguageFallback(text: string): 'fr' | 'en' {
    const lowerText = text.toLowerCase();
    
    const frenchWords = ['bonjour', 'salut', 'merci', 'oui', 'non', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'prix', 'service', 'automatisation', 'site'];
    const englishWords = ['hello', 'hi', 'thank', 'yes', 'no', 'i', 'you', 'he', 'she', 'we', 'they', 'the', 'a', 'an', 'and', 'or', 'but', 'so', 'because', 'price', 'service', 'automation', 'website'];
    
    const frenchScore = frenchWords.filter(word => lowerText.includes(word)).length;
    const englishScore = englishWords.filter(word => lowerText.includes(word)).length;
    
    // Biais vers le français pour le marché sénégalais
    return englishScore > frenchScore + 1 ? 'en' : 'fr';
  }

  /**
   * Estimation de confiance basée sur des heuristiques
   */
  private estimateConfidence(text: string, audioSize: number): number {
    let confidence = 0.8; // Base confidence
    
    // Facteurs d'ajustement
    if (text.length < 5) confidence -= 0.3;
    if (text.length > 100) confidence += 0.1;
    if (audioSize < 5000) confidence -= 0.2; // Audio très court
    if (audioSize > 100000) confidence += 0.1; // Audio suffisant
    
    // Détection de mots cohérents
    const words = text.split(/\s+/);
    const coherentWords = words.filter(word => word.length > 2 && /^[a-zA-ZÀ-ÿ]+$/.test(word));
    const coherenceRatio = coherentWords.length / words.length;
    confidence += (coherenceRatio - 0.5) * 0.2;
    
    return Math.max(0.1, Math.min(0.99, confidence));
  }

  /**
   * Nettoyage du cache pour éviter la fuite mémoire
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 STT Cache cleared');
  }
}

// Instance singleton
export const enhancedSTT = new EnhancedSTTService();