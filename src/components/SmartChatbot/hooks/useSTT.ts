/**
 * Hook STT principal pour le chatbot
 * 
 * @description 100% Google Cloud Speech API - Optimisé pour iOS
 * @compliance Uses Google Cloud Speech API with iOS compatibility
 */

import { useState, useCallback, useRef } from 'react';
import { STTService } from '../../../lib/apis/stt-service-vertex';
import { 
  getBestAudioFormat, 
  requestMicrophonePermission,
  isIOS,
  getAudioCapabilities
} from '../../../lib/utils/ios-audio-helper';

export interface STTState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  transcript: string;
  confidence: number;
}

export function useSTT() {
  const [state, setState] = useState<STTState>({
    isRecording: false,
    isProcessing: false,
    error: null,
    transcript: '',
    confidence: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sttService = useRef(new STTService());

  const startRecording = useCallback(async () => {
    try {
      // Log des capacités audio pour debug
      if (isIOS()) {
        const capabilities = await getAudioCapabilities();
        console.log('📱 iOS Audio Capabilities:', capabilities);
      }

      // Utiliser le helper iOS pour obtenir le stream avec les bonnes permissions
      const stream = await requestMicrophonePermission();
      
      // Obtenir le meilleur format audio pour l'appareil
      const audioFormat = getBestAudioFormat();
      console.log('🎤 Format audio sélectionné:', audioFormat);
      
      // Créer le MediaRecorder avec le format optimal
      const recorderOptions: MediaRecorderOptions = {};
      if (audioFormat.mimeType) {
        recorderOptions.mimeType = audioFormat.mimeType;
      }
      if (audioFormat.audioBitsPerSecond) {
        recorderOptions.audioBitsPerSecond = audioFormat.audioBitsPerSecond;
      }
      
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      console.log('✅ MediaRecorder créé avec:', {
        mimeType: mediaRecorder.mimeType,
        state: mediaRecorder.state
      });
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: recorderOptions.mimeType || mediaRecorder.mimeType 
          });
          console.log('STT Hook: Audio blob created with size:', audioBlob.size, 'type:', mediaRecorder.mimeType);
          
          if (audioBlob.size === 0) {
            throw new Error('Empty audio recording');
          }
          
          const result = await sttService.current.transcribe(audioBlob);
          console.log('STT Hook: Transcription result:', result);
          
          setState(prev => ({
            ...prev,
            isProcessing: false,
            transcript: result.text,
            confidence: result.confidence || 0,
            error: null
          }));
          
        } catch (error: any) {
          console.error('STT Hook: Transcription error:', error);
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: error instanceof Error ? error.message : 'STT failed'
          }));
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      
      // Sur iOS, utiliser un timeslice plus court pour éviter les problèmes
      const timeslice = isIOS() ? 500 : 1000;
      mediaRecorder.start(timeslice);
      
      console.log('🎤 Enregistrement démarré (timeslice:', timeslice, 'ms)');
      
    } catch (error: any) {
      console.error('STT Hook: Microphone access error:', error);
      
      // Utiliser le message d'erreur du helper iOS s'il est disponible
      let errorMessage = 'Accès au microphone refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error('STT Hook: Error stopping recording:', error);
        setState(prev => ({ ...prev, isRecording: false, isProcessing: false }));
      }
    }
  }, [state.isRecording]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      confidence: 0,
      error: null
    }));
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    clearTranscript
  };
}