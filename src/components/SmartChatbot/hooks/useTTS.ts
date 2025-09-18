/**
 * Hook TTS amélioré avec intégration Google TTS
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface TTSState {
  isActive: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  currentVoice: string | null;
  volume: number;
  rate: number;
}

interface TTSHook {
  ttsState: TTSState;
  speakText: (text: string, language?: 'fr' | 'en') => Promise<void>;
  stopSpeaking: () => void;
  toggleTTS: () => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
}

export function useTTS(sessionId: string): TTSHook {
  const [ttsState, setTTSState] = useState<TTSState>({
    isActive: false, // Disabled by default per requirements
    isSpeaking: false,
    isSupported: false,
    currentVoice: null,
    volume: 0.8,
    rate: 1.0
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Vérifier le support TTS au montage
  useEffect(() => {
    const checkTTSSupport = () => {
      const speechSupported = 'speechSynthesis' in window;
      const audioSupported = 'Audio' in window;
      const userAgent = navigator.userAgent.toLowerCase();
      const isEdge = userAgent.includes('edge') || userAgent.includes('edg/');
      
      setTTSState(prev => ({
        ...prev,
        isSupported: speechSupported || audioSupported
      }));

      console.log('TTS Support:', {
        speechSynthesis: speechSupported,
        audio: audioSupported,
        isEdge,
        supported: speechSupported || audioSupported
      });
      
      // Forcer le chargement des voix pour Edge
      if (isEdge && speechSupported) {
        // CHANGED: Better Edge voice loading with retry mechanism
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            console.log('🗣️ Voices loaded for Edge:', voices.length);
          } else {
            // Retry after a short delay
            setTimeout(loadVoices, 500);
          }
        };
        
        // Load voices immediately
        loadVoices();
        
        // Also listen for voiceschanged event
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    };

    checkTTSSupport();
    
    // Cleanup event listener
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Sauvegarder les préférences TTS
  useEffect(() => {
    const savedTTSActive = localStorage.getItem('oma_tts_active');
    if (savedTTSActive !== null) {
      setTTSState(prev => ({
        ...prev,
        isActive: savedTTSActive === 'true'
      }));
    }
    // If no saved preference, keep default as false (silent by default)
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      // Arrêter l'audio Google TTS
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }

      // Arrêter la synthèse vocale native
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
        speechSynthesisRef.current = null;
      }

      // Annuler la requête en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      setTTSState(prev => ({ ...prev, isSpeaking: false }));
      console.log('TTS stopped');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }, []);

  const speakWithGoogleTTS = useCallback(async (text: string, language: 'fr' | 'en') => {
    try {
      // Créer un nouveau AbortController pour cette requête
      abortControllerRef.current = new AbortController();

      console.log('🎵 Tentative Google TTS:', { text: text.substring(0, 50), language });

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
          sessionId,
          voice: language === 'fr' ? 'fr-FR-Standard-A' : 'en-US-Standard-A',
          speed: ttsState.rate,
          volume: ttsState.volume
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`TTS API Error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Créer et jouer l'audio
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.volume = ttsState.volume;
      audio.playbackRate = ttsState.rate;

      // Gérer les événements audio
      audio.onplay = () => {
        setTTSState(prev => ({ ...prev, isSpeaking: true }));
        console.log('🎵 Google TTS started');
      };

      audio.onended = () => {
        setTTSState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        console.log('🎵 Google TTS ended');
      };

      audio.onerror = (error) => {
        console.error('🎵 Google TTS audio error:', error);
        setTTSState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        throw new Error('Audio playback failed');
      };

      // Lancer la lecture
      await audio.play();

    } catch (error) {
      console.error('🎵 Google TTS failed:', error);
      throw error;
    }
  }, [sessionId, ttsState.rate, ttsState.volume]);

  const speakWithBrowserTTS = useCallback((text: string, language: 'fr' | 'en') => {
    try {
      if (!('speechSynthesis' in window)) {
        throw new Error('Browser TTS not supported');
      }

      console.log('🗣️ Tentative Browser TTS:', { text: text.substring(0, 50), language });

      // Arrêter toute synthèse en cours
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      // Configuration de la voix
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.volume = ttsState.volume;
      utterance.rate = ttsState.rate;
      utterance.pitch = 1.0;

      // Attendre que les voix soient chargées (important pour Edge)
      const loadVoicesAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Amélioration: Meilleur mécanisme de chargement des voix avec compatibilité multi-navigateurs
        if (voices.length === 0) {
          // Pour Edge et d'autres navigateurs, parfois les voix prennent du temps à charger
          setTimeout(() => {
            const retryVoices = window.speechSynthesis.getVoices();
            if (retryVoices.length > 0) {
              selectVoiceAndSpeak(retryVoices);
            } else {
              // Si toujours aucune voix, utiliser la voix par défaut
              console.warn('No voices available, using default voice');
              utterance.rate = Math.max(0.1, Math.min(2.0, ttsState.rate));
              window.speechSynthesis.speak(utterance);
            }
          }, 300);
          return;
        }
        
        selectVoiceAndSpeak(voices);
      };
      
      // Extraction: Logique de sélection de voix améliorée
      const selectVoiceAndSpeak = (voices: SpeechSynthesisVoice[]) => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isEdge = userAgent.includes('edge') || userAgent.includes('edg/');
        const isFirefox = userAgent.includes('firefox');
        const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
        const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg/');
        
        let selectedVoice = null;
        
        // Amélioration: Sélection de voix spécifique pour chaque navigateur
        if (isEdge) {
          // Meilleure sélection de voix pour Edge
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(language === 'fr' ? 'fr' : 'en') && 
            (voice.name.includes('Microsoft') || voice.name.includes('Zira') || voice.name.includes('David'))
          );
        } else if (isFirefox) {
          // Sélection de voix pour Firefox
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(language === 'fr' ? 'fr' : 'en') &&
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex'))
          );
        } else if (isSafari) {
          // Sélection de voix pour Safari
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(language === 'fr' ? 'fr' : 'en') &&
            (voice.name.includes('Siri') || voice.name.includes('Alex') || voice.name.includes('Karen') || voice.name.includes('Thomas'))
          );
        } else if (isChrome) {
          // Sélection de voix pour Chrome
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(language === 'fr' ? 'fr' : 'en') &&
            (voice.name.includes('Google') || voice.name.includes('Microsoft'))
          );
        }
        
        // Fallback: Sélection de toute voix disponible dans la langue
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(language === 'fr' ? 'fr' : 'en')
          );
        }

        // Fallback: Sélection de la première voix disponible
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🗣️ Voice selected:', selectedVoice.name);
        }

        utterance.rate = Math.max(0.1, Math.min(2.0, ttsState.rate));

        // Gérer les événements
        utterance.onstart = () => {
          setTTSState(prev => ({ ...prev, isSpeaking: true }));
          console.log('🗣️ Browser TTS started');
        };

        utterance.onend = () => {
          setTTSState(prev => ({ ...prev, isSpeaking: false }));
          speechSynthesisRef.current = null;
          console.log('🗣️ Browser TTS ended');
        };

        utterance.onerror = (error) => {
          console.error('🗣️ Browser TTS error:', error);
          setTTSState(prev => ({ ...prev, isSpeaking: false }));
          speechSynthesisRef.current = null;
        };

        try {
          window.speechSynthesis.speak(utterance);
          
          // Amélioration: Retrait du mécanisme de retry spécifique à Edge car il est maintenant géré ci-dessus
        } catch (speakError) {
          console.error('🗣️ Speak error:', speakError);
          throw speakError;
        }
      };

      loadVoicesAndSpeak();

    } catch (error) {
      console.error('🗣️ Browser TTS failed:', error);
      throw error;
    }
  }, [ttsState.volume, ttsState.rate]);

  const speakText = useCallback(async (text: string, language: 'fr' | 'en' = 'fr') => {
    if (!ttsState.isSupported) {
      console.log('TTS skipped: not supported');
      return;
    }

    // Automatically enable TTS for voice inputs if not already enabled
    if (!ttsState.isActive) {
      console.log('TTS auto-enabled for voice input');
      setTTSState(prev => ({ ...prev, isActive: true }));
      localStorage.setItem('oma_tts_active', 'true');
    }

    if (!text?.trim() || text.trim().length < 2) {
      console.log('TTS skipped: text too short');
      return;
    }

    // Validate language parameter
    const validatedLanguage = language === 'en' ? 'en' : 'fr';
    console.log('🎵 TTS language validated:', validatedLanguage);

    // Nettoyer le texte pour la synthèse vocale
    const cleanText = text
      .replace(/[🎯🚀💡🔥✅❌⚡🎨🎁💎🏆📊📈🎪💬📱🛠️⭐]/g, '') // Supprimer emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Supprimer markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Supprimer markdown italic
      .replace(/`(.*?)`/g, '$1') // Supprimer markdown code
      .replace(/#{1,6}\s/g, '') // Supprimer markdown headers
      .replace(/\n+/g, '. ') // Remplacer retours à la ligne par points
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim();

    if (cleanText.length > 500) {
      // Tronquer les textes trop longs pour éviter les timeouts
      const truncatedText = cleanText.substring(0, 500) + '...';
      console.log('TTS text truncated for performance');
      await speakText(truncatedText, validatedLanguage);
      return;
    }

    // Arrêter toute lecture en cours
    stopSpeaking();

    // Détecter le navigateur pour choisir la meilleure stratégie
    const userAgent = navigator.userAgent.toLowerCase();
    const isEdge = userAgent.includes('edge') || userAgent.includes('edg/');
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');

    try {
      console.log('🎵 Starting TTS:', { 
        textLength: cleanText.length,
        language: validatedLanguage,
        browser: isEdge ? 'Edge' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Chrome',
        active: ttsState.isActive
      });

      // Utiliser exclusivement Google TTS (pas de fallback vers le navigateur)
      await speakWithGoogleTTS(cleanText, validatedLanguage);
      
    } catch (googleError) {
      console.error('🎵 Google TTS failed:', googleError);
      // TTS est non-critique, ne pas bloquer l'interface
      // Fallback vers le navigateur si Google TTS échoue
      try {
        console.log('🎵 Falling back to browser TTS');
        await speakWithBrowserTTS(cleanText, validatedLanguage);
      } catch (browserError) {
        console.error('🎵 Browser TTS also failed:', browserError);
      }
    }
  }, [ttsState.isActive, ttsState.isSupported, stopSpeaking, speakWithGoogleTTS]);

  const toggleTTS = useCallback(() => {
    const newState = !ttsState.isActive;
    
    // Arrêter la lecture si on désactive
    if (!newState && ttsState.isSpeaking) {
      stopSpeaking();
    }
    
    setTTSState(prev => ({ ...prev, isActive: newState }));
    
    // Sauvegarder la préférence
    localStorage.setItem('oma_tts_active', newState.toString());
    
    console.log('TTS toggled:', { 
      wasActive: ttsState.isActive,
      nowActive: newState,
      supported: ttsState.isSupported
    });
  }, [ttsState.isActive, ttsState.isSpeaking, stopSpeaking]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setTTSState(prev => ({ ...prev, volume: clampedVolume }));
    
    // Appliquer immédiatement si en cours de lecture
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = clampedVolume;
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    setTTSState(prev => ({ ...prev, rate: clampedRate }));
    
    // Appliquer immédiatement si en cours de lecture
    if (currentAudioRef.current) {
      currentAudioRef.current.playbackRate = clampedRate;
    }
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    ttsState,
    speakText,
    stopSpeaking,
    toggleTTS,
    setVolume,
    setRate
  };
}