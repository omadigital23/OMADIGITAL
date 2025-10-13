/**
 * Hook TTS amélioré avec sanitisation et nettoyage du texte
 * Lecture vocale optimisée sans caractères spéciaux
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { googleTTS } from '../../../lib/google-tts';

interface EnhancedTTSConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  preferredVoices?: {
    fr: string;
    en: string;
  };
}

const DEFAULT_CONFIG: EnhancedTTSConfig = {
  voice: 'fr-FR',
  rate: 0.9,
  pitch: 1.0,
  volume: 0.85
};

/**
 * Sanitise le texte pour la lecture TTS
 */
function sanitizeTextForTTS(text: string): string {
  return text
    .replace(/\*\*/g, '') // Enlever les ** markdown
    .replace(/\*/g, '') // Enlever les * markdown
    .replace(/#{1,6}\s/g, '') // Enlever les # markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remplacer les liens par le texte
    .replace(/`([^`]+)`/g, '$1') // Enlever les backticks
    .replace(/\n{2,}/g, '. ') // Remplacer les doubles retours par des points
    .replace(/\n/g, ', ') // Remplacer les retours simples par des virgules
    .replace(/[\r\n\t]/g, ' ') // Nettoyer les caractères de contrôle
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
}

export interface EnhancedTTSState {
  isActive: boolean;
  isSpeaking: boolean;
  isNativeTTSSupported: boolean;
  currentVoice: string;
  error?: string; // Make error property optional
}

export function useEnhancedTTS(sessionId: string) {
  const [ttsState, setTTSState] = useState<EnhancedTTSState>({
    isActive: true, // Default to active
    isSpeaking: false,
    isNativeTTSSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    currentVoice: DEFAULT_CONFIG.voice
  });

  // Google TTS initialization
  useEffect(() => {
    setTTSState(prev => ({ 
      ...prev, 
      isActive: true,
      isNativeTTSSupported: true, // May fallback to native if Google fails
      currentVoice: 'google-tts'
    }));
  }, []);

  const configRef = useRef<EnhancedTTSConfig>(DEFAULT_CONFIG);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  /**
   * Arrête la synthèse vocale Hugging Face
   */
  const stopSpeaking = useCallback(() => {
    setTTSState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  /**
   * Synthèse vocale avec Google TTS (fallback natif si nécessaire)
   */
  const speakWithGoogleTTS = useCallback(async (
    text: string,
    language: 'fr' | 'en' = 'fr'
  ): Promise<boolean> => {
    try {
      const sanitizedText = sanitizeTextForTTS(text);
      
      if (!sanitizedText.trim()) {
        console.warn('TTS: No text to speak after sanitization');
        return false;
      }

      setTTSState(prev => ({ ...prev, isSpeaking: true }));

      const success = await googleTTS.speakText(sanitizedText, language);
      
      if (!success) {
        setTTSState(prev => ({ 
          ...prev, 
          error: 'Erreur Google TTS. Vérifiez votre connexion.' 
        }));
      }
      
      setTTSState(prev => ({ ...prev, isSpeaking: false }));
      return success;

    } catch (error) {
      setTTSState(prev => ({ 
        ...prev, 
        isSpeaking: false,
        error: `Erreur TTS: ${(error as Error).message}`
      }));
      return false;
    }
  }, []);

  /**
   * Fonction principale de synthèse vocale - Google TTS
   */
  const speakText = useCallback(async (
    text: string,
    language: 'fr' | 'en' = 'fr'
  ): Promise<void> => {
    if (!text.trim()) {
      return;
    }

    stopSpeaking();
    await new Promise(resolve => setTimeout(resolve, 100));

    const success = await speakWithGoogleTTS(text, language);
    
    if (success) {
      fetch('/api/chat/track-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          language,
          textLength: text.length
        })
      }).catch(() => {});
    }
  }, [
    sessionId, 
    stopSpeaking, 
    speakWithGoogleTTS
  ]);

  /**
   * Active/désactive la synthèse vocale
   */
  const toggleTTS = useCallback(() => {
    if (ttsState.isSpeaking) {
      stopSpeaking();
    } else {
      setTTSState(prev => ({ ...prev, isActive: !prev.isActive }));
    }
  }, [ttsState.isSpeaking, stopSpeaking]);

  /**
   * Met à jour la configuration
   */
  const updateConfig = useCallback((newConfig: Partial<EnhancedTTSConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
  }, []);

  return {
    ttsState,
    speakText,
    stopSpeaking,
    toggleTTS,
    updateConfig
  };
}