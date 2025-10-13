/**
 * Service STT avec Vertex AI exclusif
 */

import { vertexAIService } from '../vertex-ai-service';

export interface STTResponse {
  text: string;
  confidence?: number;
  language?: string;
}

export class STTService {
  async transcribe(audioBlob?: Blob): Promise<STTResponse> {
    try {
      // If we have recorded audio, use Vertex AI STT
      if (audioBlob && audioBlob.size > 0) {
        console.log('STT Service: Using Vertex AI STT with recorded audio, size:', audioBlob.size);

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Use Vertex AI for transcription
        const result = await vertexAIService.transcribeAudio(arrayBuffer, 'fr');
        
        return {
          text: result.text || '',
          confidence: result.confidence || 0.9,
          language: result.language || 'fr'
        };
      }

      // Otherwise, use native browser STT as a fallback
      console.log('STT Service: Starting live speech recognition (native fallback)');
      return await this.nativeSTTFallback();
    } catch (error) {
      console.error('STT Service failed:', error);
      return {
        text: '',
        confidence: 0,
        language: 'fr'
      };
    }
  }

  private async nativeSTTFallback(): Promise<STTResponse> {
    return new Promise((resolve, reject) => {
      // Check browser compatibility first
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Browser STT not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      
      // Configure recognition for auto-detection between French and English
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      
      // Try to detect language automatically
      let detectedLanguage = 'fr';

      recognition.onerror = (event: any) => {
        console.error('STT Native Fallback: Recognition error', {
          error: event.error,
          message: event.message,
          type: event.type
        });
        
        let errorMessage = 'Erreur de reconnaissance vocale';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Aucune parole détectée. Veuillez parler plus fort.';
            break;
          case 'audio-capture':
            errorMessage = 'Impossible d\'accéder au microphone. Veuillez vérifier les permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Permission microphone refusée. Veuillez autoriser l\'accès au microphone dans les paramètres du navigateur.';
            break;
          case 'network':
            errorMessage = 'Erreur réseau. Veuillez vérifier votre connexion internet.';
            break;
          case 'aborted':
            errorMessage = 'Reconnaissance vocale interrompue.';
            break;
          case 'language-not-supported':
            errorMessage = 'Langue non supportée. Veuillez utiliser le français ou l\'anglais uniquement.';
            break;
          default:
            errorMessage = `Erreur STT: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      let hasResult = false;

      recognition.onresult = (event: any) => {
        try {
          if (event.results && event.results[0] && event.results[0][0]) {
            hasResult = true;
            const result = event.results[0][0];
            const transcript = result.transcript || '';
            
            // Simple language detection based on common words
            const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|this|that|these|those|what|when|where|who|why|how|yes|no|hello|hi|thank|thanks|please|sorry|excuse|help|good|bad|big|small|new|old|first|last|long|short|high|low|right|wrong|true|false)\b/gi;
            const frenchWords = /\b(le|la|les|un|une|des|de|du|et|ou|mais|dans|sur|à|pour|avec|par|depuis|vers|pendant|avant|après|au-dessus|en-dessous|entre|parmi|sous|est|sont|était|étaient|être|été|étant|avoir|avait|faire|fait|fera|ferait|pourrait|devrait|peut|pourra|doit|ce|cette|ces|quoi|quand|où|qui|pourquoi|comment|oui|non|bonjour|salut|merci|s'il|vous|plaît|désolé|excusez|aide|bon|mauvais|grand|petit|nouveau|vieux|premier|dernier|long|court|haut|bas|droite|gauche|vrai|faux)\b/gi;
            
            const englishMatches = (transcript.match(englishWords) || []).length;
            const frenchMatches = (transcript.match(frenchWords) || []).length;
            
            // Determine language based on word matches
            if (englishMatches > frenchMatches && englishMatches > 0) {
              detectedLanguage = 'en';
            } else {
              detectedLanguage = 'fr';
            }
            
            console.log('STT Native Fallback: Recognition result', {
              transcript,
              confidence: result.confidence,
              detectedLanguage,
              englishMatches,
              frenchMatches
            });
            
            resolve({
              text: transcript,
              confidence: result.confidence || 0.8,
              language: detectedLanguage
            });
          }
        } catch (error) {
          console.error('STT Native Fallback: Error processing result', error);
          reject(new Error(`Error processing recognition result: ${(error as Error).message}`));
        }
      };

      recognition.onend = () => {
        console.log('STT Native Fallback: Recognition ended');
        if (!hasResult) {
          resolve({
            text: '',
            confidence: 0,
            language: detectedLanguage
          });
        }
      };

      recognition.onstart = () => {
        console.log('STT Native Fallback: Recognition started');
      };

      recognition.onaudiostart = () => {
        console.log('STT Native Fallback: Audio capture started');
      };

      recognition.onaudioend = () => {
        console.log('STT Native Fallback: Audio capture ended');
      };

      try {
        console.log('STT Native Fallback: Starting recognition with lang:', recognition.lang);
        recognition.start();
      } catch (error) {
        console.error('STT Native Fallback: Failed to start recognition', error);
        reject(new Error(`Failed to start native STT: ${(error as Error).message}`));
      }
    });
  }
}