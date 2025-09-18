/**
 * AMÉLIORATION 3 : Service TTS Optimisé avec Voices Naturelles
 * Optimise le TTS Gemini existant avec cache et qualité améliorée
 */

interface TTSOptions {
  language: 'fr' | 'en';
  speed?: number;
  pitch?: number;
  voice?: 'male' | 'female' | 'auto';
  enableCache?: boolean;
}

interface TTSResult {
  audioUrl: string;
  duration: number;
  language: 'fr' | 'en';
  processingTime: number;
  cacheHit: boolean;
}

export class EnhancedTTSService {
  private audioCache: Map<string, { url: string; timestamp: number; duration: number }> = new Map();
  private cacheTimeout = 1800000; // 30 minutes
  private speechSynthesis: SpeechSynthesis | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  /**
   * AMÉLIORATION: Chargement des voix optimisé avec priorité
   */
  private loadVoices(): void {
    if (!this.speechSynthesis) return;

    const updateVoices = () => {
      this.availableVoices = this.speechSynthesis!.getVoices();
      console.log(`🎵 TTS: ${this.availableVoices.length} voices loaded`);
    };

    // Chargement initial
    updateVoices();

    // Écoute des changements (nécessaire sur certains navigateurs)
    if (this.availableVoices.length === 0) {
      this.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  /**
   * AMÉLIORATION: Sélection intelligente de voix par langue
   */
  private selectOptimalVoice(language: 'fr' | 'en', preferredGender: 'male' | 'female' | 'auto' = 'auto'): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }

    // Priorités de voix par langue avec qualité
    const voicePriorities = {
      fr: [
        'Microsoft Hortense - French (France)',
        'Google français',
        'Amélie',
        'Thomas',
        'Virginie',
        // Fallback
        'French'
      ],
      en: [
        'Microsoft Zira - English (United States)',
        'Google US English',
        'Alex',
        'Samantha',
        'Daniel',
        'Karen',
        // Fallback
        'English'
      ]
    };

    const priorities = voicePriorities[language];
    
    // Recherche par priorité exacte
    for (const priority of priorities) {
      const voice = this.availableVoices.find(v => 
        v.name.includes(priority) && v.lang.startsWith(language)
      );
      if (voice) {
        console.log(`🎵 Selected voice: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }

    // Recherche par langue et genre si spécifié
    if (preferredGender !== 'auto') {
      const genderKeywords = {
        female: ['female', 'femme', 'woman', 'zira', 'amélie', 'virginie', 'samantha', 'karen'],
        male: ['male', 'homme', 'man', 'thomas', 'daniel', 'alex']
      };

      const voice = this.availableVoices.find(v => {
        const isCorrectLang = v.lang.startsWith(language);
        const matchesGender = genderKeywords[preferredGender].some(keyword => 
          v.name.toLowerCase().includes(keyword)
        );
        return isCorrectLang && matchesGender;
      });

      if (voice) {
        console.log(`🎵 Selected ${preferredGender} voice: ${voice.name}`);
        return voice;
      }
    }

    // Fallback: première voix de la langue
    const fallback = this.availableVoices.find(v => v.lang.startsWith(language));
    if (fallback) {
      console.log(`🎵 Fallback voice: ${fallback.name}`);
      return fallback;
    }

    console.warn(`⚠️ No suitable voice found for ${language}`);
    return null;
  }

  /**
   * AMÉLIORATION: TTS avec cache intelligent et fallback
   */
  async synthesizeOptimized(text: string, options: TTSOptions): Promise<TTSResult> {
    const startTime = Date.now();
    
    // Validation et nettoyage du texte
    const cleanText = this.cleanTextForTTS(text);
    if (!cleanText || cleanText.length < 2) {
      throw new Error('Texte trop court pour la synthèse vocale');
    }

    // Clé de cache
    const cacheKey = `${cleanText}_${options.language}_${options.speed || 1}_${options.pitch || 1}_${options.voice || 'auto'}`;
    
    // Vérification cache
    if (options.enableCache !== false && this.audioCache.has(cacheKey)) {
      const cached = this.audioCache.get(cacheKey)!;
      const isValid = Date.now() - cached.timestamp < this.cacheTimeout;
      
      if (isValid) {
        console.log('🚀 TTS Cache hit');
        return {
          audioUrl: cached.url,
          duration: cached.duration,
          language: options.language,
          processingTime: Date.now() - startTime,
          cacheHit: true
        };
      } else {
        this.audioCache.delete(cacheKey);
      }
    }

    try {
      // Tentative avec Gemini TTS API en premier
      const geminiResult = await this.synthesizeWithGemini(cleanText, options);
      
      // Cache du résultat
      if (options.enableCache !== false) {
        this.audioCache.set(cacheKey, {
          url: geminiResult.audioUrl,
          timestamp: Date.now(),
          duration: geminiResult.duration
        });
      }

      return {
        ...geminiResult,
        processingTime: Date.now() - startTime,
        cacheHit: false
      };

    } catch (geminiError) {
      console.warn('Gemini TTS failed, using browser fallback:', geminiError);
      
      // Fallback vers SpeechSynthesis du navigateur
      return this.synthesizeWithBrowser(cleanText, options, startTime);
    }
  }

  /**
   * AMÉLIORATION: TTS Gemini avec voix naturelles
   */
  private async synthesizeWithGemini(text: string, options: TTSOptions): Promise<Omit<TTSResult, 'processingTime' | 'cacheHit'>> {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google AI API key not available');
    }

    // Configuration des voix Gemini par langue
    const voiceConfigs = {
      fr: {
        languageCode: 'fr-FR',
        name: 'fr-FR-Neural2-A', // Voix féminine naturelle
        ssmlGender: 'FEMALE'
      },
      en: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F', // Voix féminine naturelle
        ssmlGender: 'FEMALE'
      }
    };

    const voiceConfig = voiceConfigs[options.language];
    
    try {
      // Appel à l'API Text-to-Speech de Google
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.ssmlGender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: options.speed || 1.0,
            pitch: (options.pitch || 1.0) * 2 - 2, // Conversion 0-2 vers -2 à +2
            volumeGainDb: 0.0
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini TTS API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received from Gemini TTS');
      }

      // Conversion base64 vers blob et URL
      const audioBytes = atob(data.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Estimation de la durée (approximative)
      const duration = this.estimateAudioDuration(text, options.speed || 1.0);

      console.log('✅ Gemini TTS synthesis completed');
      
      return {
        audioUrl,
        duration,
        language: options.language
      };

    } catch (error) {
      console.error('Gemini TTS synthesis failed:', error);
      throw error;
    }
  }

  /**
   * AMÉLIORATION: Fallback TTS navigateur optimisé
   */
  private async synthesizeWithBrowser(
    text: string, 
    options: TTSOptions, 
    startTime: number
  ): Promise<TTSResult> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configuration de la voix
      const voice = this.selectOptimalVoice(options.language, options.voice);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.lang = options.language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = 1.0;

      // Gestion des événements
      utterance.onstart = () => {
        console.log('🎵 Browser TTS started');
      };

      utterance.onend = () => {
        const duration = this.estimateAudioDuration(text, options.speed || 1.0);
        console.log('✅ Browser TTS synthesis completed');
        
        resolve({
          audioUrl: '', // Browser TTS doesn't provide URL
          duration,
          language: options.language,
          processingTime: Date.now() - startTime,
          cacheHit: false
        });
      };

      utterance.onerror = (event) => {
        console.error('Browser TTS error:', event.error);
        reject(new Error(`Browser TTS failed: ${event.error}`));
      };

      // Arrêt de toute synthèse en cours
      this.speechSynthesis.cancel();
      
      // Démarrage de la synthèse
      this.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Nettoyage du texte pour optimiser la synthèse
   */
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/[^\w\s.,!?;:'"()àáâäçéèêëïîôöùúûüÿñæœ-]/g, '') // Garde uniquement les caractères utiles
      .replace(/\s+/g, ' ') // Normalise les espaces
      .replace(/([.!?]){2,}/g, '$1') // Évite la répétition de ponctuation
      .trim()
      .substring(0, 500); // Limite la longueur pour éviter les timeouts
  }

  /**
   * Estimation de la durée audio basée sur le texte et la vitesse
   */
  private estimateAudioDuration(text: string, speed: number): number {
    // Estimation basée sur ~150 mots par minute pour le français, ~180 pour l'anglais
    const wordsPerMinute = 150 / speed;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, (wordCount / wordsPerMinute) * 60); // En secondes
  }

  /**
   * AMÉLIORATION: Arrêt de la synthèse en cours
   */
  stopSynthesis(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      console.log('🛑 TTS synthesis stopped');
    }
  }

  /**
   * Vérification de la disponibilité TTS
   */
  isAvailable(): boolean {
    return !!this.speechSynthesis;
  }

  /**
   * Nettoyage du cache pour éviter les fuites mémoire
   */
  clearCache(): void {
    // Libération des URLs d'objets
    for (const cached of this.audioCache.values()) {
      if (cached.url.startsWith('blob:')) {
        URL.revokeObjectURL(cached.url);
      }
    }
    
    this.audioCache.clear();
    console.log('🧹 TTS Cache cleared');
  }

  /**
   * Statistiques du cache
   */
  getCacheStats(): { size: number; totalDuration: number } {
    let totalDuration = 0;
    for (const cached of this.audioCache.values()) {
      totalDuration += cached.duration;
    }
    
    return {
      size: this.audioCache.size,
      totalDuration
    };
  }
}

// Instance singleton
export const enhancedTTS = new EnhancedTTSService();