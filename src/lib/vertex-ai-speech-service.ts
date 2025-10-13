/**
 * Service Vertex AI Speech (STT/TTS) - 100% Vertex AI
 * 
 * @description Service exclusif pour Speech-to-Text et Text-to-Speech via Vertex AI
 * @security Utilise Service Account authentication uniquement
 * @compliance 100% Vertex AI - Aucun fallback local, Hugging Face ou AI Studio
 * 
 * Endpoints Vertex AI:
 * - STT: https://{location}-speech.googleapis.com/v1/projects/{project}/locations/{location}:recognize
 * - TTS: https://{location}-texttospeech.googleapis.com/v1/projects/{project}/locations/{location}/text:synthesize
 */

import { GoogleAuth } from 'google-auth-library';

interface VertexAISpeechConfig {
  projectId: string;
  location: string;
}

interface STTResult {
  text: string;
  confidence: number;
  language: 'fr' | 'en';
}

interface TTSResult {
  audioContent: string; // Base64 encoded audio
  audioUrl?: string; // Blob URL for playback
}

/**
 * Configuration des voix Vertex AI
 * Only French and English supported
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

class VertexAISpeechService {
  private projectId: string;
  private location: string;
  private auth: GoogleAuth | null = null;
  private audioCache = new Map<string, string>();

  constructor() {
    this.projectId = process.env['GOOGLE_CLOUD_PROJECT_ID'] || '';
    this.location = process.env['GOOGLE_CLOUD_LOCATION'] || 'us-central1';

    if (!this.projectId) {
      console.error('❌ Vertex AI Speech: GOOGLE_CLOUD_PROJECT_ID not configured');
    }
  }

  /**
   * Initialize Google Auth with service account
   * @private
   */
  private async getAuth(): Promise<GoogleAuth> {
    if (this.auth) {
      return this.auth;
    }

    try {
      // Check for base64 credentials (production)
      if (process.env['GOOGLE_CLOUD_CREDENTIALS_BASE64']) {
        const credentials = JSON.parse(
          Buffer.from(process.env['GOOGLE_CLOUD_CREDENTIALS_BASE64'], 'base64').toString('utf-8')
        );
        
        this.auth = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        console.log('✅ Vertex AI Speech: Using base64 credentials');
        return this.auth;
      }

      // Check for credentials file path (development)
      if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
        this.auth = new GoogleAuth({
          keyFilename: process.env['GOOGLE_APPLICATION_CREDENTIALS'],
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        console.log('✅ Vertex AI Speech: Using credentials file');
        return this.auth;
      }

      // Use default credentials (Cloud Run, GCE, etc.)
      this.auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      
      console.log('✅ Vertex AI Speech: Using default credentials');
      return this.auth;

    } catch (error) {
      console.error('❌ Vertex AI Speech: Authentication failed:', error);
      throw new Error('Vertex AI authentication not configured');
    }
  }

  /**
   * Get access token for API calls
   * @private
   */
  private async getAccessToken(): Promise<string> {
    const auth = await this.getAuth();
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken || !accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    return accessToken.token;
  }

  /**
   * Transcribe audio using Vertex AI Speech-to-Text
   * 
   * @param audioBuffer Audio data as ArrayBuffer
   * @param language Primary language ('fr' or 'en')
   * @param options Optional encoding and sample rate
   * @returns Transcription result with detected language
   * 
   * @security Uses Service Account authentication
   * @compliance 100% Vertex AI - No local detection
   */
  async transcribeAudio(
    audioBuffer: ArrayBuffer,
    language: 'fr' | 'en' = 'fr',
    options?: {
      encoding?: 'LINEAR16' | 'FLAC' | 'MULAW' | 'AMR' | 'AMR_WB' | 'OGG_OPUS' | 'WEBM_OPUS';
      sampleRateHertz?: number;
    }
  ): Promise<STTResult> {
    if (!this.projectId) {
      throw new Error('Vertex AI Speech: Project ID not configured');
    }

    try {
      const accessToken = await this.getAccessToken();

      // Convert audio buffer to base64
      const audioBytes = new Uint8Array(audioBuffer);
      const audioBase64 = btoa(String.fromCharCode(...audioBytes));

      // Vertex AI Speech-to-Text configuration
      const config = {
        encoding: options?.encoding || 'WEBM_OPUS',
        sampleRateHertz: options?.sampleRateHertz || 48000,
        languageCode: language === 'fr' ? 'fr-FR' : 'en-US',
        // Enable automatic language detection between French and English
        alternativeLanguageCodes: language === 'fr' ? ['en-US'] : ['fr-FR'],
        enableAutomaticPunctuation: true,
        model: 'latest_long', // Best model for conversational speech
        useEnhanced: true, // Use enhanced model for better accuracy
        maxAlternatives: 1
      };

      const requestBody = {
        config,
        audio: {
          content: audioBase64
        }
      };

      // Vertex AI Speech-to-Text endpoint
      const endpoint = `https://${this.location}-speech.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}:recognize`;

      console.log('🎤 Vertex AI STT: Calling endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vertex AI STT Error:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Vertex AI STT API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Extract transcription
      const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = result.results?.[0]?.alternatives?.[0]?.confidence || 0.8;
      
      // Detect language from result (Vertex AI provides this)
      const detectedLanguageCode = result.results?.[0]?.languageCode || config.languageCode;
      const detectedLanguage: 'fr' | 'en' = detectedLanguageCode.startsWith('fr') ? 'fr' : 'en';

      console.log('✅ Vertex AI STT Success:', {
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
      console.error('❌ Vertex AI STT Error:', error);
      throw error;
    }
  }

  /**
   * Synthesize text to speech using Vertex AI Text-to-Speech
   * 
   * @param text Text to synthesize
   * @param language Language ('fr' or 'en')
   * @param returnBlobUrl If true, returns blob URL for playback
   * @returns Audio content (base64) and optional blob URL
   * 
   * @security Uses Service Account authentication
   * @compliance 100% Vertex AI - No local synthesis
   */
  async synthesizeText(
    text: string,
    language: 'fr' | 'en' = 'fr',
    returnBlobUrl: boolean = true
  ): Promise<TTSResult> {
    if (!this.projectId) {
      throw new Error('Vertex AI Speech: Project ID not configured');
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
      const accessToken = await this.getAccessToken();

      // Select voice configuration
      const voiceConfig = VOICE_CONFIGS[language];

      // Audio configuration
      const audioConfig = {
        audioEncoding: 'MP3',
        speakingRate: 0.95, // Slightly slower for clarity
        pitch: 0.0,
        volumeGainDb: 2.0,
        effectsProfileId: ['telephony-class-application']
      };

      const requestBody = {
        input: { text: cleanText },
        voice: voiceConfig,
        audioConfig
      };

      // Vertex AI Text-to-Speech endpoint
      const endpoint = `https://${this.location}-texttospeech.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/text:synthesize`;

      console.log('🔊 Vertex AI TTS: Calling endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vertex AI TTS Error:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Vertex AI TTS API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.audioContent) {
        throw new Error('No audio content in Vertex AI TTS response');
      }

      console.log('✅ Vertex AI TTS Success');

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
          const oldUrl = this.audioCache.get(firstKey);
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          this.audioCache.delete(firstKey);
        }
      }

      return {
        audioContent: data.audioContent,
        audioUrl
      };

    } catch (error) {
      console.error('❌ Vertex AI TTS Error:', error);
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
    return !!this.projectId && 
           (!!process.env['GOOGLE_CLOUD_CREDENTIALS_BASE64'] || 
            !!process.env['GOOGLE_APPLICATION_CREDENTIALS']);
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
export const vertexAISpeechService = new VertexAISpeechService();

// Export types
export type { VertexAISpeechConfig, STTResult, TTSResult };
