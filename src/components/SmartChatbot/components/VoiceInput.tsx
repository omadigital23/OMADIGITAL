/**
 * Composant d'interface vocale pour le chatbot
 */

import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { STTService } from '../../../lib/apis/stt-service';

interface VoiceInputProps {
  onTranscript: (text: string, language?: 'fr' | 'en') => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Create a wrapper function to handle the processing state
  const handleTranscript = React.useCallback((transcript: string, language?: 'fr' | 'en') => {
    console.log('🎤 VoiceInput: Handling transcript:', { transcript, language });
    console.log('🔄 VoiceInput: Calling onTranscript callback');
    setIsProcessing(true);
    onTranscript(transcript, language);
    console.log('✅ VoiceInput: onTranscript callback completed');
    // Reset processing state after a short delay
    setTimeout(() => setIsProcessing(false), 1000);
  }, [onTranscript]);

  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const sttService = React.useRef(new STTService());

  const startListening = async () => {
    try {
      setError(null);
      setIsListening(true);
      
      const result = await sttService.current.transcribe();
      if (result.text) {
        handleTranscript(result.text, result.language as 'fr' | 'en');
      }
      setIsListening(false);
    } catch (err: any) {
      setError(err.message || 'Erreur de reconnaissance vocale');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const isSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed" title="Hugging Face STT non supporté">
        <MicOff className="w-5 h-5" />
      </div>
    );
  }

  const getButtonStyle = () => {
    if (isProcessing) return 'bg-blue-500 text-white animate-pulse';
    if (isListening) return 'bg-red-500 text-white animate-pulse';
    if (error) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  };

  const getIcon = () => {
    if (isProcessing) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (isListening) return <MicOff className="w-5 h-5" />;
    return <Mic className="w-5 h-5" />;
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    // Provide more detailed error messages with user guidance
    if (error.includes('Permission microphone refusée')) {
      return (
        <div>
          <p className="font-medium">Permission refusée</p>
          <p className="text-xs">Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur</p>
        </div>
      );
    }
    
    if (error.includes('Impossible d\'accéder au microphone')) {
      return (
        <div>
          <p className="font-medium">Microphone inaccessible</p>
          <p className="text-xs">Vérifiez que votre microphone est connecté et autorisé</p>
        </div>
      );
    }
    
    if (error.includes('Aucune parole détectée')) {
      return (
        <div>
          <p className="font-medium">Aucune parole détectée</p>
          <p className="text-xs">Veuillez parler plus fort et réessayer</p>
        </div>
      );
    }
    
    return <span>{error}</span>;
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleToggleRecording}
        disabled={disabled || isProcessing}
        className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyle()}`}
        title={isListening ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
      >
        {getIcon()}
      </button>
      
      {error && (
        <div className="mt-2 text-xs text-red-500 text-center max-w-48 bg-red-50 p-2 rounded-lg">
          {getErrorMessage()}
        </div>
      )}
      
      {isListening && (
        <div className="mt-2 text-xs text-orange-500 animate-pulse flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></div>
          <span>Écoute en cours...</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="mt-2 text-xs text-blue-500 animate-pulse flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
          <span>Envoi en cours...</span>
        </div>
      )}
    </div>
  );
}