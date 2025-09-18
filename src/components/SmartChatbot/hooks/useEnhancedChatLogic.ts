/**
 * AMÉLIORATION 4 : Hook ChatLogic Amélioré avec Input/Output Matching
 * Intègre tous les services améliorés avec logique de correspondance
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { enhancedRAG } from '../../../lib/rag-enhanced-optimized';
import { enhancedSTT } from '../../../lib/stt-enhanced-service';
import { enhancedTTS } from '../../../lib/tts-enhanced-service';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: 'fr' | 'en';
  type: 'text' | 'voice';
  metadata?: {
    confidence?: number;
    source?: string;
    processingTime?: number;
    ragContext?: any[];
  };
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  currentLanguage: 'fr' | 'en';
  inputMode: 'text' | 'voice';
  outputMode: 'text' | 'voice';
  error: string | null;
}

interface EnhancedChatOptions {
  enableInputOutputMatching: boolean;
  enableRAGOptimization: boolean;
  enableLanguageDetection: boolean;
  sessionId?: string;
}

export function useEnhancedChatLogic(options: EnhancedChatOptions = {
  enableInputOutputMatching: true,
  enableRAGOptimization: true,
  enableLanguageDetection: true
}) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isRecording: false,
    isPlaying: false,
    currentLanguage: 'fr',
    inputMode: 'text',
    outputMode: 'text',
    error: null
  });

  const sessionId = useRef(options.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageIdCounter = useRef(0);

  /**
   * AMÉLIORATION: Génération d'ID de message unique
   */
  const generateMessageId = useCallback(() => {
    return `msg_${sessionId.current}_${++messageIdCounter.current}_${Date.now()}`;
  }, []);

  /**
   * AMÉLIORATION: Logique de correspondance input/output
   */
  const determineOutputMode = useCallback((inputMode: 'text' | 'voice', userPreference?: 'text' | 'voice'): 'text' | 'voice' => {
    if (!options.enableInputOutputMatching) {
      return userPreference || 'text';
    }

    // Règles de correspondance intelligente :
    // 1. Si l'utilisateur parle, répondre vocalement
    // 2. Si l'utilisateur écrit, répondre textuellement
    // 3. Respecter les préférences utilisateur si spécifiées
    
    if (userPreference) {
      return userPreference;
    }

    return inputMode; // Correspondance directe par défaut
  }, [options.enableInputOutputMatching]);

  /**
   * AMÉLIORATION: Envoi de message avec RAG optimisé
   */
  const sendMessage = useCallback(async (
    content: string, 
    inputType: 'text' | 'voice' = 'text',
    detectedLanguage?: 'fr' | 'en'
  ) => {
    if (!content.trim()) return;

    const startTime = Date.now();
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Création du message utilisateur
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        content: content.trim(),
        sender: 'user',
        timestamp: new Date(),
        language: detectedLanguage || state.currentLanguage,
        type: inputType
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        inputMode: inputType,
        currentLanguage: detectedLanguage || prev.currentLanguage
      }));

      // 2. Recherche RAG optimisée si activée
      let ragContext: any[] = [];
      if (options.enableRAGOptimization) {
        try {
          const ragResults = await enhancedRAG.searchSemantic(
            content, 
            detectedLanguage || state.currentLanguage, 
            3
          );
          ragContext = ragResults;
          console.log(`🔍 RAG: ${ragResults.length} documents found`);
        } catch (ragError) {
          console.warn('RAG search failed, continuing without context:', ragError);
        }
      }

      // 3. Appel API chatbot avec contexte RAG
      const chatResponse = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId.current,
          detectedLanguage: detectedLanguage || state.currentLanguage,
          ragContext: ragContext.length > 0 ? ragContext : undefined,
          inputType
        })
      });

      if (!chatResponse.ok) {
        const errorData = await chatResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur API: ${chatResponse.status}`);
      }

      const response = await chatResponse.json();

      // 4. Détermination du mode de sortie
      const outputMode = determineOutputMode(inputType, state.outputMode);

      // 5. Création du message bot
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        content: response.response,
        sender: 'bot',
        timestamp: new Date(),
        language: response.language || detectedLanguage || state.currentLanguage,
        type: outputMode,
        metadata: {
          confidence: response.confidence,
          source: response.source,
          processingTime: Date.now() - startTime,
          ragContext
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        outputMode,
        currentLanguage: response.language || prev.currentLanguage,
        isLoading: false
      }));

      // 6. Synthèse vocale si mode voice activé
      if (outputMode === 'voice' && enhancedTTS.isAvailable()) {
        try {
          await playResponseAudio(response.response, response.language || state.currentLanguage);
        } catch (ttsError) {
          console.warn('TTS playback failed:', ttsError);
          // Continue sans audio, le message texte est déjà affiché
        }
      }

      console.log(`✅ Message processed in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('Send message error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));

      // Message d'erreur fallback
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer.',
        sender: 'bot',
        timestamp: new Date(),
        language: state.currentLanguage,
        type: 'text',
        metadata: { source: 'error_fallback' }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    }
  }, [state.currentLanguage, state.outputMode, options, generateMessageId, determineOutputMode]);

  /**
   * AMÉLIORATION: Enregistrement vocal avec STT optimisé
   */
  const startVoiceRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRecording: true, error: null }));

      // Utilisation du service STT amélioré
      await enhancedSTT.transcribeWithLanguageDetection(
        new Blob(), // Placeholder - le STT service gère l'enregistrement
        {
          enableLanguageDetection: options.enableLanguageDetection,
          preferredLanguage: state.currentLanguage,
          enableNoiseReduction: true
        }
      );

    } catch (error) {
      console.error('Voice recording failed:', error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: error instanceof Error ? error.message : 'Erreur d\'enregistrement'
      }));
    }
  }, [state.currentLanguage, options.enableLanguageDetection]);

  /**
   * AMÉLIORATION: Arrêt d'enregistrement avec traitement
   */
  const stopVoiceRecording = useCallback(async (audioBlob: Blob) => {
    if (!state.isRecording) return;

    try {
      setState(prev => ({ ...prev, isRecording: false, isLoading: true }));

      // Transcription avec détection de langue
      const sttResult = await enhancedSTT.transcribeWithLanguageDetection(audioBlob, {
        enableLanguageDetection: options.enableLanguageDetection,
        preferredLanguage: state.currentLanguage,
        enableNoiseReduction: true
      });

      if (sttResult.text.trim().length === 0) {
        throw new Error('Aucun texte détecté dans l\'enregistrement');
      }

      console.log(`🎙️ STT: "${sttResult.text}" (${sttResult.language}, ${sttResult.confidence})`);

      // Envoi du message transcrit
      await sendMessage(sttResult.text, 'voice', sttResult.language);

    } catch (error) {
      console.error('Voice processing failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de traitement vocal'
      }));
    }
  }, [state.isRecording, state.currentLanguage, options.enableLanguageDetection, sendMessage]);

  /**
   * AMÉLIORATION: Lecture audio de la réponse
   */
  const playResponseAudio = useCallback(async (text: string, language: 'fr' | 'en') => {
    try {
      setState(prev => ({ ...prev, isPlaying: true }));

      // Arrêt de l'audio précédent
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      // Synthèse TTS optimisée
      const ttsResult = await enhancedTTS.synthesizeOptimized(text, {
        language,
        speed: 1.0,
        voice: 'auto',
        enableCache: true
      });

      // Lecture audio si URL disponible (Gemini TTS)
      if (ttsResult.audioUrl) {
        const audio = new Audio(ttsResult.audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setState(prev => ({ ...prev, isPlaying: false }));
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn('Audio playback failed');
          setState(prev => ({ ...prev, isPlaying: false }));
        };

        await audio.play();
      } else {
        // Browser TTS (synthèse automatique)
        setState(prev => ({ ...prev, isPlaying: false }));
      }

      console.log(`🔊 TTS: ${text.length} chars in ${ttsResult.processingTime}ms`);

    } catch (error) {
      console.error('Audio playback failed:', error);
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  /**
   * AMÉLIORATION: Arrêt de la lecture audio
   */
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    enhancedTTS.stopSynthesis();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  /**
   * Changement de langue
   */
  const changeLanguage = useCallback((language: 'fr' | 'en') => {
    setState(prev => ({ ...prev, currentLanguage: language }));
  }, []);

  /**
   * Changement de mode de sortie
   */
  const setOutputMode = useCallback((mode: 'text' | 'voice') => {
    setState(prev => ({ ...prev, outputMode: mode }));
  }, []);

  /**
   * Effacement des messages
   */
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
  }, []);

  /**
   * Nettoyage à la destruction du composant
   */
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      enhancedTTS.stopSynthesis();
      enhancedTTS.clearCache();
      enhancedSTT.clearCache();
    };
  }, []);

  /**
   * Mise à jour en arrière-plan des embeddings
   */
  useEffect(() => {
    if (options.enableRAGOptimization) {
      // Démarrage différé pour ne pas bloquer le rendu
      const timer = setTimeout(() => {
        enhancedRAG.updateDocumentEmbeddings().catch(console.error);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [options.enableRAGOptimization]);

  return {
    // État
    ...state,
    sessionId: sessionId.current,
    
    // Actions
    sendMessage,
    startVoiceRecording,
    stopVoiceRecording,
    playResponseAudio,
    stopAudio,
    changeLanguage,
    setOutputMode,
    clearMessages,
    
    // Utilitaires
    isVoiceSupported: enhancedTTS.isAvailable(),
    ragStats: options.enableRAGOptimization ? enhancedRAG : null,
    ttsStats: enhancedTTS.getCacheStats()
  };
}