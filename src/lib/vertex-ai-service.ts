/**
 * Service Vertex AI pour Speech-to-Text et Text-to-Speech
 * Remplace les services Hugging Face et la détection de langue locale
 */

interface VertexAISpeechConfig {
  projectId: string;
  location: string;
  credentials?: string; // JSON credentials
}

interface SpeechRecognitionConfig {
  encoding: 'LINEAR16' | 'FLAC' | 'MULAW' | 'AMR' | 'AMR_WB' | 'OGG_OPUS' | 'WEBM_OPUS' | 'SPEEX_WITH_HEADER_BYTE';
  sampleRateHertz: number;
  languageCode: 'fr-FR' | 'en-US';
  alternativeLanguageCodes?: ('fr-FR' | 'en-US')[];
  enableAutomaticPunctuation: boolean;
  enableWordTimeOffsets?: boolean;
  enableWordConfidence?: boolean;
  enableSpeakerDiarization?: boolean;
  diarizationSpeakerCount?: number;
  maxAlternatives?: number;
  profanityFilter?: boolean;
  speechContexts?: Array<{
    phrases: string[];
    boost?: number;
  }>;
}

interface SpeechSynthesisConfig {
  audioEncoding: 'LINEAR16' | 'MP3' | 'OGG_OPUS' | 'MULAW' | 'ALAW';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  sampleRateHertz?: number;
  effectsProfileId?: string[];
}

interface VoiceConfig {
  languageCode: 'fr-FR' | 'en-US';
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

// Configuration des voix recommandées pour un ton professionnel et chaleureux
// Only French and English voices supported
const VOICE_CONFIGS = {
  'fr-professional-male': {
    languageCode: 'fr-FR' as const,
    name: 'fr-FR-Standard-B', // Voix masculine très réaliste
    ssmlGender: 'MALE' as const
  },
  'fr-professional-female': {
    languageCode: 'fr-FR' as const,
    name: 'fr-FR-Standard-A', // Voix féminine douce et expressive
    ssmlGender: 'FEMALE' as const
  },
  'fr-warm-female': {
    languageCode: 'fr-FR' as const,
    name: 'fr-FR-Wavenet-C', // Voix féminine chaleureuse et naturelle
    ssmlGender: 'FEMALE' as const
  },
  'fr-friendly-male': {
    languageCode: 'fr-FR' as const,
    name: 'fr-FR-Wavenet-D', // Voix masculine amicale
    ssmlGender: 'MALE' as const
  },
  'en-professional-male': {
    languageCode: 'en-US' as const,
    name: 'en-US-Standard-B', // Voix masculine anglaise
    ssmlGender: 'MALE' as const
  },
  'en-professional-female': {
    languageCode: 'en-US' as const,
    name: 'en-US-Standard-C', // Voix féminine anglaise
    ssmlGender: 'FEMALE' as const
  },
  'en-warm-female': {
    languageCode: 'en-US' as const,
    name: 'en-US-Wavenet-C', // Voix féminine chaleureuse et expressive
    ssmlGender: 'FEMALE' as const
  },
  'en-friendly-male': {
    languageCode: 'en-US' as const,
    name: 'en-US-Wavenet-D', // Voix masculine amicale
    ssmlGender: 'MALE' as const
  }
};

class VertexAIService {
  private projectId: string;
  private location: string;
  private apiKey: string;
  private clientEmail: string;
  private clientId: string;
  private privateKey: string;
  private audioCache = new Map<string, string>(); // Cache des URLs audio

  constructor() {
    // Get configuration from environment variables
    this.projectId = process.env['GOOGLE_CLOUD_PROJECT_ID'] || '';
    this.location = process.env['GOOGLE_CLOUD_LOCATION'] || 'us-central1';
    this.apiKey = process.env['GOOGLE_AI_API_KEY'] || '';
    this.clientEmail = process.env['GOOGLE_CLOUD_CLIENT_EMAIL'] || '';
    this.clientId = process.env['GOOGLE_CLOUD_CLIENT_ID'] || '';
    this.privateKey = process.env['GOOGLE_CLOUD_PRIVATE_KEY'] || '';
    
    if (!this.projectId) {
      console.warn('Vertex AI: GOOGLE_CLOUD_PROJECT_ID not configured');
    }
    
    // Prefer service account credentials over API key if available
    if (this.clientEmail && this.privateKey) {
      console.log('Vertex AI: Using service account credentials');
    } else if (!this.apiKey) {
      console.warn('Vertex AI: No authentication method configured (API key or service account)');
    }
  }

  /**
   * Génère un hash pour le cache basé sur le texte
   */
  private generateCacheKey(text: string): string {
    return btoa(encodeURIComponent(text)).slice(0, 20);
  }

  /**
   * Nettoie le texte pour optimiser la synthèse vocale
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remplacer les émojis par des mots
      .replace(/🚀/g, ' fusée ')
      .replace(/💡/g, ' ampoule ')
      .replace(/✅/g, ' vérifié ')
      .replace(/❌/g, ' erreur ')
      .replace(/🎯/g, ' cible ')
      .replace(/📱/g, ' téléphone ')
      .replace(/💬/g, ' message ')
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
   * Transcrit un audio en texte avec Vertex AI Speech-to-Text
   */
  async transcribeAudio(
    audioBuffer: ArrayBuffer,
    language: 'fr' | 'en' = 'fr',
    options?: { encoding?: SpeechRecognitionConfig['encoding']; sampleRateHertz?: number }
  ): Promise<{
    text: string;
    confidence: number;
    language: 'fr' | 'en';
  }> {
    // Use service account credentials if available, otherwise use API key
    const useServiceAccount = this.clientEmail && this.privateKey;
    const authKey = useServiceAccount ? await this.getAccessToken() : this.apiKey;

    if (!authKey) {
      throw new Error('Vertex AI authentication not configured');
    }

    try {
      // Convert audio buffer to base64
      const audioBytes = new Uint8Array(audioBuffer);
      const audioBase64 = btoa(String.fromCharCode(...audioBytes));

      // Configuration pour la reconnaissance vocale
      const recognitionConfig: SpeechRecognitionConfig = {
        encoding: options?.encoding || 'LINEAR16',
        sampleRateHertz: options?.sampleRateHertz || 16000,
        languageCode: language === 'fr' ? 'fr-FR' : 'en-US',
        alternativeLanguageCodes: language === 'fr' ? ['en-US'] : ['fr-FR'],
        enableAutomaticPunctuation: true,
        maxAlternatives: 1,
        profanityFilter: false
      };

      // Préparer la requête
      const requestBody = {
        config: recognitionConfig,
        audio: {
          content: audioBase64
        }
      };

      // Appel à l'API Vertex AI Speech-to-Text
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${useServiceAccount ? '' : authKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(useServiceAccount ? { 'Authorization': `Bearer ${authKey}` } : {})
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI Speech-to-Text API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Extraire le texte transcrit
      const transcribedText = result.results?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = result.results?.[0]?.alternatives?.[0]?.confidence || 0.8;
      
      // Déterminer la langue détectée
      const detectedLanguage = language; // Pour l'instant, on utilise la langue demandée
      
      return {
        text: transcribedText,
        confidence: confidence,
        language: detectedLanguage
      };

    } catch (error) {
      console.error('Vertex AI Speech-to-Text Error:', error);
      throw error;
    }
  }

  /**
   * Synthétise le texte en audio avec Vertex AI Text-to-Speech
   * Only supports French and English
   */
  async synthesizeText(
    text: string, 
    language: 'fr' | 'en' = 'fr',
    useSSML: boolean = true
  ): Promise<string | null> {
    // Use service account credentials if available, otherwise use API key
    const useServiceAccount = this.clientEmail && this.privateKey;
    const authKey = useServiceAccount ? await this.getAccessToken() : this.apiKey;

    if (!authKey) {
      throw new Error('Vertex AI authentication not configured');
    }

    const cleanText = this.cleanTextForTTS(text);
    
    if (!cleanText.trim()) {
      return null;
    }

    const cacheKey = this.generateCacheKey(cleanText);
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      // Sélectionner la voix appropriée - only French and English supported
      const voiceKey = language === 'fr' 
        ? 'fr-warm-female'  // Voix plus agréable pour le français
        : 'en-warm-female'; // Voix plus agréable pour l'anglais

      // Préparer le texte avec SSML si demandé
      const finalText = useSSML ? this.addNaturalPauses(cleanText) : cleanText;
      const isSSML = useSSML && finalText !== cleanText;

      // Configuration de la voix
      const voiceConfig: VoiceConfig = VOICE_CONFIGS[voiceKey];

      // Configuration audio
      const audioConfig: SpeechSynthesisConfig = {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 2.0,
        effectsProfileId: ['telephony-class-application']
      };

      // Préparer la requête
      const requestBody = {
        input: isSSML ? { ssml: `<speak>${finalText}</speak>` } : { text: finalText },
        voice: voiceConfig,
        audioConfig: audioConfig
      };

      // Appel à l'API Vertex AI Text-to-Speech
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${useServiceAccount ? '' : authKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(useServiceAccount ? { 'Authorization': `Bearer ${authKey}` } : {})
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI Text-to-Speech API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('Vertex AI Text-to-Speech: No audio content in response');
      }

      // Créer une URL blob pour l'audio
      const audioBytes = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Mettre en cache
      this.audioCache.set(cacheKey, audioUrl);

      // Nettoyer le cache si trop volumineux (garder les 50 derniers)
      if (this.audioCache.size > 50) {
        const iterator = this.audioCache.keys().next();
        if (!iterator.done) {
          const firstKey = iterator.value as string;
          const oldUrl = this.audioCache.get(firstKey);
          if (typeof oldUrl === 'string') {
            URL.revokeObjectURL(oldUrl as string);
          }
          this.audioCache.delete(firstKey);
        }
      }

      return audioUrl;

    } catch (error) {
      console.error('Vertex AI Text-to-Speech Error:', error);
      throw error;
    }
  }

  /**
   * Generate access token for service account authentication
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have all required service account credentials
      if (!this.clientEmail || !this.privateKey || !this.projectId) {
        console.warn('Vertex AI: Missing service account credentials, falling back to API key');
        if (this.apiKey) {
          return this.apiKey;
        }
        throw new Error('No authentication method available');
      }

      const { GoogleAuth } = await import('google-auth-library');
      
      // Create auth client with service account credentials
      const auth = new GoogleAuth({
        credentials: {
          client_email: this.clientEmail,
          private_key: this.privateKey.replace(/\\n/g, '\n') // Fix escaped newlines
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      
      return accessToken.token || this.apiKey;
    } catch (error) {
      console.error('Vertex AI: Failed to get access token:', error);
      // Fallback to API key if service account auth fails
      if (this.apiKey) {
        console.log('Vertex AI: Falling back to API key authentication');
        return this.apiKey;
      }
      throw error;
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
      console.error('Vertex AI TTS Speak Error:', error);
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
    // Prefer service account credentials over API key if available
    return !!(this.clientEmail && this.privateKey && this.projectId) || 
           !!(this.apiKey && this.projectId);
  }

  /**
   * Obtient les voix disponibles
   */
  getAvailableVoices() {
    return Object.keys(VOICE_CONFIGS);
  }
}

// Instance singleton
export const vertexAIService = new VertexAIService();

// Export des types et configurations
export type { VertexAISpeechConfig, SpeechRecognitionConfig, SpeechSynthesisConfig, VoiceConfig };
export { VOICE_CONFIGS };