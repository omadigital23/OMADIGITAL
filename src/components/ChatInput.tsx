import React from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isRecording: boolean;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
  cancelVoiceRecording: () => void;
  isTyping: boolean;
  isRateLimited: boolean;
  transcribedText?: string;
  isTranscribed?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  handleSubmit,
  handleKeyDown,
  isRecording,
  startVoiceRecording,
  stopVoiceRecording,
  cancelVoiceRecording,
  isTyping,
  isRateLimited,
  transcribedText,
  isTranscribed
}) => {
  const displayText = transcribedText || inputText;
  const hasInput = displayText.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      {transcribedText && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800 flex justify-between items-center">
          <span>Transcription: {transcribedText}</span>
          <button
            type="button"
            onClick={() => setInputText('')}
            className="text-blue-500 hover:text-blue-700"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={displayText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            disabled={isTyping || isRateLimited}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {hasInput && (
            <button
              type="submit"
              disabled={isTyping || isRateLimited}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Envoyer le message"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          onDoubleClick={cancelVoiceRecording}
          disabled={isTyping || isRateLimited}
          className={`p-3 rounded-full ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          aria-label={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement vocal"}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
      
      {isRateLimited && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Trop de messages envoyés. Veuillez ralentir.
        </p>
      )}
    </form>
  );
};