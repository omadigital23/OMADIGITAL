/**
 * Service STT robuste avec fallback et gestion d'erreurs
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Déclaration globale pour SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[][];
  error?: string;
  message?: string;
  type?: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface STTState {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  transcript: string;
}

export function useSTT(onTranscript: (text: string) => void) {
  const [state, setState] = useState<STTState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    error: null,
    transcript: ''
  });

  const recognitionRef = useRef<any | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Vérifier le support STT
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const isSupported = !!SpeechRecognition;
      
      setState(prev => ({ ...prev, isSupported }));
      
      if (isSupported) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'fr-FR';
          recognition.maxAlternatives = 1;
          
          recognitionRef.current = recognition;
          console.log('✅ STT initialisé avec succès');
        } catch (error) {
          console.error('❌ Erreur initialisation STT:', error);
          setState(prev => ({ ...prev, isSupported: false, error: 'STT non disponible: ' + (error as Error).message }));
        }
      } else {
        console.warn('⚠️ STT non supporté dans ce navigateur');
        setState(prev => ({ ...prev, isSupported: false, error: 'Reconnaissance vocale non supportée dans ce navigateur' }));
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state.isListening) {
      console.warn('STT: Cannot start listening', {
        hasRecognition: !!recognitionRef.current,
        isListening: state.isListening
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isListening: true, error: null, transcript: '' }));

      const recognition = recognitionRef.current;

      recognition.onstart = () => {
        console.log('🎤 STT démarré avec succès');
        // Timeout de sécurité
        timeoutRef.current = setTimeout(() => {
          console.warn('STT: Timeout - aucune parole détectée après 10 secondes');
          recognition.stop();
          setState(prev => ({ ...prev, isListening: false, error: 'Timeout - aucune parole détectée après 10 secondes' }));
        }, 10000);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        try {
          // Safely extract transcript from the event results
          let transcript = '';
          if (event.results && event.results.length > 0 && event.results[0] && event.results[0].length > 0) {
            const result = event.results[0][0];
            if (result && result.transcript) {
              transcript = result.transcript.trim() || '';
            }
          }
          
          if (transcript) {
            console.log('📝 Transcription reçue:', transcript);
            setState(prev => ({ ...prev, transcript, isListening: false }));
            // Arrêter immédiatement la reconnaissance
            recognition.stop();
            // Appeler le callback pour envoi direct
            onTranscript(transcript);
          } else {
            console.warn('STT: Empty transcript received');
          }
        } catch (error) {
          console.error('STT: Error processing result', error);
          setState(prev => ({ 
            ...prev, 
            isListening: false, 
            error: 'Erreur lors du traitement de la transcription: ' + (error as Error).message 
          }));
        }
      };

      recognition.onend = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        console.log('🔇 STT arrêté');
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const error = event.error;
        let errorMessage = 'Erreur de reconnaissance vocale';

        switch (error) {
          case 'no-speech':
            errorMessage = 'Aucune parole détectée. Veuillez parler plus fort et réessayer.';
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
            errorMessage = 'Langue non supportée. Veuillez utiliser le français.';
            break;
          default:
            errorMessage = `Erreur STT: ${error}`;
        }

        console.error('❌ STT erreur:', errorMessage, {
          errorType: error,
          message: event.message
        });
        
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: errorMessage 
        }));
      };

      recognition.start();
    } catch (error) {
      console.error('❌ Erreur démarrage STT:', error);
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: 'Impossible de démarrer la reconnaissance vocale: ' + (error as Error).message 
      }));
    }
  }, [state.isListening, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [state.isListening]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening
  };
}