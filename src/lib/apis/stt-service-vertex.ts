/**
 * Service STT avec Vertex AI exclusif - Version Corrigée
 * 
 * @description 100% Vertex AI STT - Aucun fallback local ou détection heuristique
 * @security Utilise Service Account authentication
 * @compliance Supprime toute détection de langue locale (INTERDIT)
 * 
 * CHANGEMENTS PAR RAPPORT À L'ANCIEN:
 * - ❌ Supprimé: nativeSTTFallback() - utilisait SpeechRecognition du navigateur
 * - ❌ Supprimé: Détection locale de langue par regex
 * - ✅ Ajouté: 100% Vertex AI Speech API
 * - ✅ Ajouté: Détection de langue par le modèle Vertex AI
 */

export interface STTResponse {
  text: string;
  confidence: number;
  language: 'fr' | 'en';
}

export class STTService {
  /**
   * Transcribe audio using Vertex AI Speech API
   * 
   * @param audioBlob Audio blob from MediaRecorder
   * @returns Transcription with language detected by Vertex AI
   * 
   * @compliance Language is detected by Vertex AI model, NOT locally
   */
  async transcribe(audioBlob: Blob): Promise<STTResponse> {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Empty audio recording');
    }

    console.log('🎤 STT Service: Transcribing with Vertex AI, size:', audioBlob.size);

    try {
      // Convert Blob to base64 for API transmission
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Call Vertex AI STT API
      const response = await fetch('/api/stt/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          language: 'fr' // Primary language, but Vertex AI will auto-detect
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `STT API error: ${response.status}`);
      }

      const result = await response.json();

      console.log('✅ STT Service: Vertex AI result:', {
        text: result.text?.substring(0, 50),
        confidence: result.confidence,
        language: result.language
      });

      return {
        text: result.text || '',
        confidence: result.confidence || 0.8,
        language: result.language || 'fr'
      };

    } catch (error) {
      console.error('❌ STT Service: Vertex AI failed:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('503')) {
          throw new Error('Service STT temporairement indisponible. Vérifiez la configuration Vertex AI.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Erreur d\'authentification Vertex AI. Vérifiez les credentials.');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Erreur réseau. Vérifiez votre connexion internet.');
        }
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const sttService = new STTService();
