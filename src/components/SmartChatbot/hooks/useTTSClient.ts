/**
 * TTS Hook for client-side usage with Vertex AI API
 * Avoids importing server-side libraries in client code
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface TTSState {
  isActive: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
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

export function useTTSClient(sessionId: string): TTSHook {
  const [ttsState, setTTSState] = useState<TTSState>({
    isActive: true,
    isSpeaking: false,
    isSupported: true, // Assume API is supported
    volume: 0.8,
    rate: 1.0
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check TTS support on mount
  useEffect(() => {
    const checkTTSSupport = async () => {
      try {
        // Check if the TTS API endpoint is accessible
        const response = await fetch('/api/health');
        const isSupported = response.ok;
        setTTSState(prev => ({
          ...prev,
          isSupported
        }));

        console.log('TTS Support (API):', {
          supported: isSupported
        });
      } catch (error) {
        console.error('Error checking TTS support:', error);
        setTTSState(prev => ({
          ...prev,
          isSupported: false
        }));
      }
    };

    checkTTSSupport();
  }, []);

  // Save TTS preferences
  useEffect(() => {
    const savedTTSActive = localStorage.getItem('oma_tts_active');
    if (savedTTSActive !== null) {
      setTTSState(prev => ({
        ...prev,
        isActive: savedTTSActive === 'true'
      }));
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      // Stop Web Speech API
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Stop audio playback (legacy)
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }

      // Cancel current request (legacy)
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

  const speakText = useCallback(async (text: string, language: 'fr' | 'en' = 'fr') => {
    if (!ttsState.isSupported) {
      console.log('TTS skipped: not supported');
      return;
    }

    // Validate language parameter - ensure it's either 'fr' or 'en'
    const validatedLanguage = language === 'en' ? 'en' : 'fr';
    console.log('🎵 TTS language validated:', validatedLanguage);

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

    // Clean text for speech synthesis
    const cleanText = text
      .replace(/[🎯🚀💡🔥✅❌⚡🎨🎁💎🏆📊📈🎪💬📱🛠️⭐]/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/`(.*?)`/g, '$1') // Remove markdown code
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\n+/g, '. ') // Replace line breaks with periods
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    if (cleanText.length > 500) {
      // Truncate long texts to avoid timeouts
      const truncatedText = cleanText.substring(0, 500) + '...';
      console.log('TTS text truncated for performance');
      await speakText(truncatedText, validatedLanguage);
      return;
    }

    // Stop any current playback
    stopSpeaking();

    try {
      console.log('🎵 Starting TTS with Google Cloud API:', { 
        textLength: cleanText.length,
        language: validatedLanguage,
        active: ttsState.isActive
      });

      // Use Google Cloud Text-to-Speech API
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          language: validatedLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`TTS API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const { audioContent } = await response.json();
      
      if (audioContent) {
        // Create Blob URL from base64 audio content
        const audioBytes = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create and play audio
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        audio.volume = ttsState.volume;
        audio.playbackRate = ttsState.rate;

        // Handle audio events
        audio.onplay = () => {
          setTTSState(prev => ({ ...prev, isSpeaking: true }));
          console.log('🎵 Google Cloud TTS started');
        };

        audio.onended = () => {
          setTTSState(prev => ({ ...prev, isSpeaking: false }));
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          console.log('🎵 Google Cloud TTS ended');
        };

        audio.onerror = (error) => {
          console.error('🎵 Google Cloud TTS audio error:', error);
          setTTSState(prev => ({ ...prev, isSpeaking: false }));
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        // Start playback
        await audio.play();
      }
      
    } catch (error) {
      console.error('🎵 Google Cloud TTS failed:', error);
      setTTSState(prev => ({ ...prev, isSpeaking: false }));
      // TTS is non-critical, don't block the interface
    }
  }, [ttsState.isActive, ttsState.isSupported, ttsState.volume, ttsState.rate, stopSpeaking]);

  const toggleTTS = useCallback(() => {
    const newState = !ttsState.isActive;
    
    // Stop playback if we're disabling
    if (!newState && ttsState.isSpeaking) {
      stopSpeaking();
    }
    
    setTTSState(prev => ({ ...prev, isActive: newState }));
    
    // Save preference
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
    
    // Apply immediately if currently playing
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = clampedVolume;
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    setTTSState(prev => ({ ...prev, rate: clampedRate }));
    
    // Apply immediately if currently playing
    if (currentAudioRef.current) {
      currentAudioRef.current.playbackRate = clampedRate;
    }
  }, []);

  // Cleanup on unmount
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