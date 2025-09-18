/**
 * Service STT avec fallbacks robustes
 */

export interface STTResponse {
  text: string;
  confidence?: number;
  language?: string;
}

export class STTService {
  async transcribe(audioBlob?: Blob): Promise<STTResponse> {
    try {
      // If we have recorded audio, use Hugging Face STT via our API
      if (audioBlob && audioBlob.size > 0) {
        console.log('STT Service: Using Hugging Face STT with recorded audio, size:', audioBlob.size);

        // Convert Blob to base64 using FileReader (browser-safe)
        const base64Audio: string = await new Promise((resolve, reject) => {
          try {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const result = reader.result as string;
                // result is a data URL: data:audio/<type>;base64,<base64>
                const base64 = result.includes(',') ? result.split(',')[1] : result;
                resolve(base64 || '');
              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(audioBlob);
          } catch (e) {
            reject(e);
          }
        });

        const response = await fetch('/api/stt/huggingface', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData: base64Audio })
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.warn('STT Service: HF API returned non-OK status:', response.status, errorText);
          return await this.nativeSTTFallback();
        }

        const data = await response.json();
        const language = (data.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
        return {
          text: data.text || '',
          confidence: typeof data.confidence === 'number' ? data.confidence : 0.9,
          language
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
        // Fallback to Hugging Face API
        console.log('STT Native Fallback: Browser not supported, using Hugging Face API');
        
        // Create a simple audio recording mechanism
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              
              try {
                // Send to Hugging Face API via our endpoint
                const response = await fetch('/api/stt/huggingface', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    audioData: await this.blobToBase64(audioBlob)
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Hugging Face API error');
                }
                
                const data = await response.json();
                resolve({
                  text: data.text || '',
                  confidence: data.confidence || 0.9,
                  language: data.language || 'fr'
                });
              } catch (error) {
                reject(new Error(`Hugging Face transcription failed: ${(error as Error).message}`));
              }
            };
            
            mediaRecorder.start();
            
            // Stop recording after 5 seconds
            setTimeout(() => {
              mediaRecorder.stop();
              stream.getTracks().forEach(track => track.stop());
            }, 5000);
          })
          .catch(error => {
            reject(new Error(`Microphone access failed: ${(error as Error).message}`));
          });
        
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

  // Add helper method for blob to base64 conversion
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

}
