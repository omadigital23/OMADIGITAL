/**
 * Service Google Cloud Speech & TTS avec API Key
 * 
 * @description Utilise Google Cloud Speech-to-Text et Text-to-Speech APIs
 * @security API Key côté serveur uniquement (jamais exposée côté client)
 * @compliance Alternative simple à Vertex AI Speech pour STT/TTS
 */

import { vertexAIService } from './vertex-ai-service';

interface STTResult {
  text: string;
  confidence: number;
  language: 'fr' | 'en';
}

interface TTSResult {
  audioContent: string; // Base64 encoded audio
  audioUrl?: string | undefined; // Blob URL for playback
}

/**
 * Configuration des voix Google Cloud TTS
 */
const VOICE_CONFIGS = {
  'fr': {
    languageCode: 'fr-FR',
    name: 'fr-FR-Wavenet-C', // Voix féminine chaleureuse
    ssmlGender: 'FEMALE'
  },
  'en': {
    languageCode: 'en-US',
    name: 'en-US-Wavenet-C', // Voix féminine chaleureuse
    ssmlGender: 'FEMALE'
  }
} as const;

class GoogleCloudSpeechService {
  private apiKey: string;
  private audioCache = new Map<string, string>();

  constructor() {
    this.apiKey = process.env['GOOGLE_CLOUD_API_KEY'] || '';

    if (!this.apiKey) {
      console.warn('⚠️  Google Cloud API Key not configured');
    }
  }

  /**
   * Transcribe audio using Google Cloud Speech-to-Text API
   * 
   * @param audioBuffer Audio data as ArrayBuffer
   * @param language Primary language ('fr' or 'en')
   * @returns Transcription result with detected language
   */
  async transcribeAudio(
    audioBuffer: ArrayBuffer,
    language: 'fr' | 'en' = 'fr'
  ): Promise<STTResult> {
    // First try Vertex AI service if available
    if (vertexAIService.isAvailable()) {
      try {
        console.log('🎤 Using Vertex AI for STT...');
        return await vertexAIService.transcribeAudio(audioBuffer, language);
      } catch (error) {
        console.warn('Vertex AI STT failed, falling back to Google Cloud API:', error);
      }
    }

    // Fallback to Google Cloud API Key method
    if (!this.apiKey) {
      throw new Error('Google Cloud API Key not configured');
    }

    try {
      // Convert audio buffer to base64
      const audioBytes = new Uint8Array(audioBuffer);
      const audioBase64 = btoa(String.fromCharCode(...audioBytes));

      // Détecter le format audio automatiquement
      // Google Cloud Speech supporte: LINEAR16, FLAC, MULAW, AMR, AMR_WB, OGG_OPUS, SPEEX_WITH_HEADER_BYTE, WEBM_OPUS, MP3
      let encoding = 'WEBM_OPUS';
      let sampleRateHertz = 48000;
      
      // Essayer de détecter le format depuis les premiers bytes
      const header = String.fromCharCode(...audioBytes.slice(0, 12));
      
      if (header.includes('ftyp')) {
        // Format MP4/M4A (iOS Safari)
        encoding = 'MP3'; // Google Cloud accepte MP3 pour les conteneurs MP4
        console.log('🎤 Détecté: Format MP4/M4A (iOS)');
      } else if (header.includes('RIFF') && header.includes('WAVE')) {
        // Format WAV
        encoding = 'LINEAR16';
        sampleRateHertz = 16000;
        console.log('🎤 Détecté: Format WAV');
      } else if (header.includes('OggS')) {
        // Format OGG
        encoding = 'OGG_OPUS';
        console.log('🎤 Détecté: Format OGG');
      } else {
        // Par défaut: WEBM_OPUS
        console.log('🎤 Format par défaut: WEBM_OPUS');
      }

      // Google Cloud Speech-to-Text configuration
      const config = {
        encoding,
        sampleRateHertz,
        languageCode: language === 'fr' ? 'fr-FR' : 'en-US',
        // Enable automatic language detection between French and English
        alternativeLanguageCodes: language === 'fr' ? ['en-US'] : ['fr-FR'],
        enableAutomaticPunctuation: true,
        model: 'default',
        maxAlternatives: 1
      };

      const requestBody = {
        config,
        audio: {
          content: audioBase64
        }
      };

      // Google Cloud Speech-to-Text endpoint
      const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`;

      console.log('🎤 Google Cloud STT: Calling API...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Cloud STT Error:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Google Cloud STT API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Extract transcription
      const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = result.results?.[0]?.alternatives?.[0]?.confidence || 0.8;
      
      // Detect language from result
      const detectedLanguageCode = result.results?.[0]?.languageCode || config.languageCode;
      const detectedLanguage: 'fr' | 'en' = detectedLanguageCode.startsWith('fr') ? 'fr' : 'en';

      console.log('✅ Google Cloud STT Success:', {
        transcript: transcript.substring(0, 50),
        confidence,
        detectedLanguage
      });

      return {
        text: transcript,
        confidence,
        language: detectedLanguage
      };

    } catch (error) {
      console.error('❌ Google Cloud STT Error:', error);
      throw error;
    }
  }

  /**
   * Synthesize text to speech using Google Cloud Text-to-Speech API
   * 
   * @param text Text to synthesize
   * @param language Language ('fr' or 'en')
   * @param returnBlobUrl If true, returns blob URL for playback
   * @returns Audio content (base64) and optional blob URL
   */
  async synthesizeText(
    text: string,
    language: 'fr' | 'en' = 'fr',
    returnBlobUrl: boolean = true
  ): Promise<TTSResult> {
    // First try Vertex AI service if available
    if (vertexAIService.isAvailable()) {
      try {
        console.log('🔊 Using Vertex AI for TTS...');
        const audioUrl = await vertexAIService.synthesizeText(text, language, true);
        if (audioUrl) {
          return {
            audioContent: '',
            audioUrl
          };
        }
      } catch (error) {
        console.warn('Vertex AI TTS failed, falling back to Google Cloud API:', error);
      }
    }

    // Fallback to Google Cloud API Key method
    if (!this.apiKey) {
      throw new Error('Google Cloud API Key not configured');
    }

    const cleanText = this.cleanTextForTTS(text);
    
    if (!cleanText.trim()) {
      throw new Error('Text is empty after cleaning');
    }

    // Check cache
    const cacheKey = `${language}:${cleanText.substring(0, 50)}`;
    if (this.audioCache.has(cacheKey)) {
      return {
        audioContent: '',
        audioUrl: this.audioCache.get(cacheKey)
      };
    }

    try {
      // Select voice configuration
      const voiceConfig = VOICE_CONFIGS[language];

      // Audio configuration
      const audioConfig = {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: 0.0,
        volumeGainDb: 2.0,
        effectsProfileId: ['telephony-class-application']
      };

      const requestBody = {
        input: { text: cleanText },
        voice: voiceConfig,
        audioConfig
      };

      // Google Cloud Text-to-Speech endpoint
      const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;

      console.log('🔊 Google Cloud TTS: Calling API...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Cloud TTS Error:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Google Cloud TTS API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.audioContent) {
        throw new Error('No audio content in Google Cloud TTS response');
      }

      console.log('✅ Google Cloud TTS Success');

      // Create blob URL if requested
      let audioUrl: string | undefined;
      if (returnBlobUrl) {
        const audioBytes = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
        audioUrl = URL.createObjectURL(audioBlob);

        // Cache the URL
        this.audioCache.set(cacheKey, audioUrl);

        // Limit cache size
        if (this.audioCache.size > 50) {
          const firstKey = this.audioCache.keys().next().value;
          if (firstKey) {
            const oldUrl = this.audioCache.get(firstKey);
            if (oldUrl) {
              URL.revokeObjectURL(oldUrl);
            }
            this.audioCache.delete(firstKey);
          }
        }
      }

      return {
        audioContent: data.audioContent,
        audioUrl
      };

    } catch (error) {
      console.error('❌ Google Cloud TTS Error:', error);
      throw error;
    }
  }

  /**
   * Clean text for optimal TTS synthesis
   * @private
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remove emojis
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      // Remove markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      // Improve pronunciation
      .replace(/WhatsApp/g, 'WhatsApp')
      .replace(/\bIA\b/g, 'I.A.')
      .replace(/\bROI\b/g, 'R.O.I.')
      .replace(/\bSEO\b/g, 'S.E.O.')
      .replace(/\bPME\b/g, 'P.M.E.')
      // Normalize whitespace
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    // Prefer Vertex AI if available, otherwise fallback to Google Cloud API Key
    return vertexAIService.isAvailable() || !!this.apiKey;
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): string[] {
    return Object.keys(VOICE_CONFIGS);
  }
}

// Singleton instance
export const googleCloudSpeechService = new GoogleCloudSpeechService();

// Export types
export type { STTResult, TTSResult };