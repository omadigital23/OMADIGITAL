/**
 * Service Google Text-to-Speech avec voix Studio pour un chatbot humanisé
 * Utilise les voix les plus naturelles disponibles
 */

interface GoogleTTSConfig {
  apiKey: string;
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
    effectsProfileId?: string[];
  };
}

// Configuration des voix recommandées pour un ton professionnel et chaleureux
const VOICE_CONFIGS = {
  'fr-professional-male': {
    languageCode: 'fr-FR',
    name: 'fr-FR-Studio-B', // Voix masculine très réaliste
    ssmlGender: 'MALE' as const
  },
  'fr-professional-female': {
    languageCode: 'fr-FR',
    name: 'fr-FR-Studio-A', // Voix féminine douce et expressive
    ssmlGender: 'FEMALE' as const
  },
  'fr-wavenet-male': {
    languageCode: 'fr-FR',
    name: 'fr-FR-Wavenet-D', // Fallback masculin fluide
    ssmlGender: 'MALE' as const
  },
  'fr-wavenet-female': {
    languageCode: 'fr-FR',
    name: 'fr-FR-Wavenet-E', // Fallback féminin dynamique
    ssmlGender: 'FEMALE' as const
  },
  'en-professional-male': {
    languageCode: 'en-US',
    name: 'en-US-Studio-M', // Voix masculine anglaise
    ssmlGender: 'MALE' as const
  },
  'en-professional-female': {
    languageCode: 'en-US',
    name: 'en-US-Studio-O', // Voix féminine anglaise
    ssmlGender: 'FEMALE' as const
  }
};

// Configuration audio optimisée pour un chatbot professionnel
const AUDIO_CONFIG = {
  audioEncoding: 'MP3' as const,
  speakingRate: 0.95, // Légèrement plus lent pour la clarté
  pitch: 0.0, // Ton naturel
  volumeGainDb: 2.0, // Légèrement plus fort
  effectsProfileId: ['telephony-class-application'] // Optimisé pour les applications
};

class GoogleTTSService {
  private apiKey: string;
  private baseUrl: string;
  private audioCache = new Map<string, string>(); // Cache des URLs audio
  private currentVoice: keyof typeof VOICE_CONFIGS = 'fr-professional-female';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '';
    this.baseUrl = process.env.GOOGLE_TTS_API_URL || 'https://texttospeech.googleapis.com/v1/text:synthesize';
    
    if (!this.apiKey) {
      console.warn('Google TTS: Clé API manquante. Utilisation du TTS natif en fallback.');
    }
  }

  /**
   * Change la voix utilisée pour le TTS
   */
  setVoice(voiceKey: keyof typeof VOICE_CONFIGS) {
    this.currentVoice = voiceKey;
  }

  /**
   * Obtient la voix actuelle
   */
  getCurrentVoice() {
    return this.currentVoice;
  }

  /**
   * Génère un hash pour le cache basé sur le texte et la voix
   */
  private generateCacheKey(text: string, voiceKey: string): string {
    return `${voiceKey}-${btoa(text).slice(0, 20)}`;
  }

  /**
   * Nettoie le texte pour optimiser la synthèse vocale
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remplacer les émojis par des mots
      .replace(/🚀/g, ' ')
      .replace(/💡/g, ' ')
      .replace(/✅/g, ' ')
      .replace(/❌/g, ' ')
      .replace(/🎯/g, ' ')
      .replace(/📱/g, ' ')
      .replace(/💬/g, ' ')
      // Améliorer la prononciation
      .replace(/WhatsApp/g, 'WhatsApp')
      .replace(/IA/g, 'I.A.')
      .replace(/ROI/g, 'R.O.I.')
      .replace(/SEO/g, 'S.E.O.')
      .replace(/PME/g, 'P.M.E.')
      .replace(/FCFA/g, 'francs CFA')
      // Nettoyer les caractères spéciaux
      .replace(/[*_`]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Ajoute des pauses naturelles au texte avec SSML
   */
  private addNaturalPauses(text: string): string {
    return text
      // Pauses après les points
      .replace(/\./g, '.<break time="0.5s"/>')
      // Pauses après les virgules
      .replace(/,/g, ',<break time="0.3s"/>')
      // Pauses après les deux-points
      .replace(/:/g, ':<break time="0.4s"/>')
      // Emphase sur les mots importants
      .replace(/\b(automatisation|IA|intelligence artificielle|chatbot)\b/gi, '<emphasis level="moderate">$1</emphasis>')
      .replace(/\b(gratuit|offert|inclus)\b/gi, '<emphasis level="strong">$1</emphasis>');
  }

  /**
   * Synthétise le texte en audio avec Google TTS
   */
  async synthesizeText(
    text: string, 
    language: 'fr' | 'en' = 'fr',
    useSSML: boolean = true
  ): Promise<string | null> {
    if (!this.apiKey) {
      console.warn('Google TTS: Pas de clé API, utilisation du TTS natif');
      return await this.fallbackToNativeTTS(text, language);
    }

    // Nettoyer le texte
    const cleanText = this.cleanTextForTTS(text);
    
    if (!cleanText.trim()) {
      return null;
    }

    // Sélectionner la voix appropriée
    const voiceKey = language === 'fr' 
      ? this.currentVoice.startsWith('fr-') ? this.currentVoice : 'fr-professional-female'
      : 'en-professional-female';

    // Vérifier le cache
    const cacheKey = this.generateCacheKey(cleanText, voiceKey);
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      // Préparer le texte avec SSML si demandé
      const finalText = useSSML ? this.addNaturalPauses(cleanText) : cleanText;
      const isSSML = useSSML && finalText !== cleanText;

      // 1) Try server-side proxy first (avoid exposing API key)
      try {
        const proxyRes = await fetch('/api/tts/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, language, useSSML })
        });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (proxyData?.audioContent) {
            const audioBytes = Uint8Array.from(atob(proxyData.audioContent), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBytes], { type: proxyData.contentType || 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Cache and shrink cache if needed
            const cacheKey = this.generateCacheKey(cleanText, voiceKey);
            this.audioCache.set(cacheKey, audioUrl);
            if (this.audioCache.size > 50) {
              const firstKey = this.audioCache.keys().next().value;
              const oldUrl = this.audioCache.get(firstKey);
              if (oldUrl) URL.revokeObjectURL(oldUrl);
              this.audioCache.delete(firstKey);
            }
            return audioUrl;
          }
        } else {
          const t = await proxyRes.text().catch(() => '');
          console.warn('Google TTS proxy error:', proxyRes.status, t);
        }
      } catch (proxyErr) {
        // Ignore and attempt client-side
        if (process.env.NODE_ENV === 'development') {
          console.warn('Google TTS proxy call failed, attempting client-side:', proxyErr);
        }
      }

      const requestBody = {
        input: isSSML ? { ssml: `<speak>${finalText}</speak>` } : { text: finalText },
        voice: VOICE_CONFIGS[voiceKey],
        audioConfig: AUDIO_CONFIG
      };

      console.log('Google TTS: Sending direct client request with text length:', cleanText.length);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Google TTS: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Google TTS Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Fallback to native TTS on API error
        return await this.fallbackToNativeTTS(text, language);
      }

      const data = await response.json();
      console.log('Google TTS: Response data received');
      
      if (!data.audioContent) {
        console.error('Google TTS: Pas de contenu audio dans la réponse');
        return await this.fallbackToNativeTTS(text, language);
      }

      // Créer une URL blob pour l'audio
      const audioBytes = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Mettre en cache
      this.audioCache.set(cacheKey, audioUrl);

      // Nettoyer le cache si trop volumineux (garder les 50 derniers)
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        const oldUrl = this.audioCache.get(firstKey);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
        this.audioCache.delete(firstKey);
      }

      return audioUrl;

    } catch (error) {
      console.error('Google TTS Synthesis Error:', error);
      // Fallback to native TTS on exception
      return await this.fallbackToNativeTTS(text, language);
    }
  }

  /**
   * Joue l'audio synthétisé
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    });
  }

  /**
   * Synthétise et joue le texte directement
   */
  async speakText(
    text: string, 
    language: 'fr' | 'en' = 'fr',
    useSSML: boolean = true
  ): Promise<boolean> {
    try {
      const audioUrl = await this.synthesizeText(text, language, useSSML);
      
      if (!audioUrl) {
        return false;
      }

      await this.playAudio(audioUrl);
      return true;

    } catch (error) {
      console.error('Google TTS Speak Error:', error);
      return false;
    }
  }

  /**
   * Nettoie le cache audio
   */
  clearCache() {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): boolean {
    return !!this.apiKey && typeof window !== 'undefined';
  }

  /**
   * Obtient les voix disponibles
   */
  getAvailableVoices() {
    return Object.keys(VOICE_CONFIGS);
  }

  /**
   * Fallback to native browser TTS
   */
  private async fallbackToNativeTTS(text: string, language: 'fr' | 'en'): Promise<string | null> {
    console.log('Google TTS: Using native TTS fallback');
    
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Native TTS not available');
      return null;
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      
      // Set voice if available
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(language === 'fr' ? 'fr-' : 'en-')
        ) || voices[0];
        utterance.voice = preferredVoice;
      }
      
      // Set speech parameters
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Create a temporary audio element to generate a blob URL
      utterance.onend = () => {
        console.log('Native TTS completed');
        // For native TTS, we can't create a blob URL, so we return null
        // but the speech has already been played
        resolve(null);
      };
      
      utterance.onerror = (event) => {
        console.error('Native TTS Error:', event);
        resolve(null);
      };
      
      // Play the utterance
      speechSynthesis.speak(utterance);
      
      // Return null since we can't create a blob URL for native TTS
      resolve(null);
    });
  }
}

// Instance singleton
export const googleTTS = new GoogleTTSService();

// Export des types et configurations
export type { GoogleTTSConfig };
export { VOICE_CONFIGS, AUDIO_CONFIG };