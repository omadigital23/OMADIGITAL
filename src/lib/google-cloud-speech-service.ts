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
    // Skip Vertex AI service if only API key is available (no service account)
    // Vertex AI service with just API key has issues with WEBM OPUS format detection
    // Use direct Google Cloud Speech API instead for better format auto-detection
    const hasServiceAccount = vertexAIService.isAvailable() && 
      !!(process.env['GOOGLE_CLOUD_CLIENT_EMAIL'] && process.env['GOOGLE_CLOUD_PRIVATE_KEY']);
    
    if (hasServiceAccount) {
      try {
        console.log('🎤 Using Vertex AI with service account for STT...');
        return await vertexAIService.transcribeAudio(audioBuffer, language);
      } catch (error) {
        console.warn('Vertex AI STT failed, falling back to Google Cloud API:', error);
      }
    }

    // Use Google Cloud API Key method (better for WEBM OPUS auto-detection)
    if (!this.apiKey) {
      throw new Error('Google Cloud API Key not configured');
    }

    try {
      // Validate audio buffer
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        throw new Error('Audio buffer is empty');
      }

      // Convert audio buffer to base64
      const audioBytes = new Uint8Array(audioBuffer);
      
      console.log('🎤 Google Cloud STT: Processing audio', {
        size: audioBytes.length,
        language
      });
      
      // Convert to base64 - handle large files in chunks to avoid stack overflow
      let audioBase64: string;
      try {
        if (audioBytes.length > 100000) {
          // For large files, convert in chunks
          const chunks: string[] = [];
          const chunkSize = 50000;
          for (let i = 0; i < audioBytes.length; i += chunkSize) {
            const chunk = audioBytes.slice(i, i + chunkSize);
            chunks.push(String.fromCharCode(...chunk));
          }
          audioBase64 = btoa(chunks.join(''));
        } else {
          audioBase64 = btoa(String.fromCharCode(...audioBytes));
        }
      } catch (error) {
        console.error('❌ Error converting audio to base64:', error);
        throw new Error('Failed to encode audio data');
      }

      // Détecter le format audio automatiquement
      // Google Cloud Speech supporte: LINEAR16, FLAC, MULAW, AMR, AMR_WB, OGG_OPUS, SPEEX_WITH_HEADER_BYTE, WEBM_OPUS, MP3
      let encoding = 'WEBM_OPUS';
      let sampleRateHertz = 48000;
      
      // Essayer de détecter le format depuis les premiers bytes
      const headerBytes = audioBytes.slice(0, 20);
      const header = String.fromCharCode(...headerBytes);
      const headerHex = Array.from(headerBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log('🎤 Audio header (first 20 bytes):', headerHex);
      
      // Détection du format avec plusieurs signatures
      if (header.includes('ftyp') || headerHex.includes('66747970')) {
        // Format MP4/M4A (iOS Safari) - Google Cloud doesn't support this directly
        // We'll try encoding as WEBM_OPUS and let Google figure it out
        encoding = 'WEBM_OPUS';
        console.log('🎤 Détecté: Format MP4/M4A (iOS) - Tentative avec WEBM_OPUS');
      } else if (header.includes('RIFF') && header.includes('WAVE')) {
        // Format WAV
        encoding = 'LINEAR16';
        sampleRateHertz = 16000;
        console.log('🎤 Détecté: Format WAV/LINEAR16');
      } else if (header.includes('OggS') || headerHex.startsWith('4f676753')) {
        // Format OGG Opus
        encoding = 'OGG_OPUS';
        console.log('🎤 Détecté: Format OGG_OPUS');
      } else if (headerHex.startsWith('1a45dfa3')) {
        // Format WebM (starts with EBML header)
        encoding = 'WEBM_OPUS';
        console.log('🎤 Détecté: Format WEBM_OPUS');
      } else if (headerHex.startsWith('fffb') || headerHex.startsWith('fff3')) {
        // Format MP3
        encoding = 'MP3';
        console.log('🎤 Détecté: Format MP3');
      } else {
        // Par défaut: WEBM_OPUS (most common for modern browsers)
        encoding = 'WEBM_OPUS';
        console.log('🎤 Format par défaut: WEBM_OPUS (header inconnu)');
      }

      // Google Cloud Speech-to-Text configuration
      // Note: For OPUS codecs (WEBM_OPUS, OGG_OPUS), sample rate and channel count are auto-detected
      const config: any = {
        encoding,
        languageCode: language === 'fr' ? 'fr-FR' : 'en-US',
        // Enable automatic language detection between French and English
        alternativeLanguageCodes: language === 'fr' ? ['en-US'] : ['fr-FR'],
        enableAutomaticPunctuation: true,
        model: 'default',
        maxAlternatives: 1
      };
      
      // Only include sampleRateHertz for formats that require it
      // OPUS codecs (WEBM_OPUS, OGG_OPUS) auto-detect sample rate AND channel count
      // MP3 also auto-detects these parameters
      // CRITICAL FIX: Do NOT set audioChannelCount for ANY format
      // Different browsers (iOS Safari, Firefox) record with different channel counts (1 or 2)
      // Let Google Cloud auto-detect the channel count from the audio stream
      if (encoding === 'LINEAR16' || encoding === 'FLAC' || encoding === 'MULAW') {
        config.sampleRateHertz = sampleRateHertz;
        // DO NOT set audioChannelCount - let Google Cloud auto-detect it
      }
      // For OPUS and MP3 formats, DO NOT specify sampleRateHertz or audioChannelCount
      // as they are auto-detected from the audio stream
      
      // Remove any audioChannelCount from config to avoid conflicts
      delete config.audioChannelCount;
      
      console.log('🎤 Google Cloud STT Config:', {
        encoding: config.encoding,
        sampleRateHertz: config.sampleRateHertz,
        audioChannelCount: config.audioChannelCount,
        languageCode: config.languageCode
      });

      const requestBody = {
        config,
        audio: {
          content: audioBase64
        }
      };

      // Google Cloud Speech-to-Text endpoint
      const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`;

      console.log('🎤 Google Cloud STT: Calling API...', {
        encoding,
        sampleRateHertz,
        languageCode: config.languageCode,
        audioSize: audioBytes.length
      });

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
          statusText: response.statusText,
          error: errorText,
          encoding,
          sampleRateHertz
        });
        
        // Try to parse error for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Google Cloud STT Error JSON:', errorJson);
        } catch (e) {
          // Error text is not JSON
        }
        
        throw new Error(`Google Cloud STT API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log('🎤 Google Cloud STT: Response received', {
        hasResults: !!result.results,
        resultsCount: result.results?.length || 0
      });

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