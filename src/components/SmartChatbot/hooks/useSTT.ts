/**
 * Hook STT principal pour le chatbot
 */

import { useState, useCallback, useRef } from 'react';
import { STTService } from '../../../lib/apis/stt-service';

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Try to use WAV format for better Hugging Face compatibility
      let options = { mimeType: 'audio/webm;codecs=opus' };
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
          console.log('STT Hook: Audio blob created with size:', audioBlob.size, 'type:', options.mimeType);
          
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
      mediaRecorder.start(1000);
      
    } catch (error) {
      console.error('STT Hook: Microphone access error:', error);
      setState(prev => ({
        ...prev,
        error: 'Accès au microphone refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.'
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