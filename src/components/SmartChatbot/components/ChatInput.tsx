// Composant pour l'input du chat
import React from 'react';
import { Send, Phone, Mail } from 'lucide-react';
import { sanitizeInput } from '../utils/security';
import { TTSIndicator } from './TTSIndicator';

interface ChatInputProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTTSToggle: () => void;
  isTTSActive: boolean;
  isTTSSpeaking: boolean;
  isTTSSupported: boolean;
  disabled?: boolean;
}

export function ChatInput({
  inputText,
  onInputChange,
  onSubmit,
  onTTSToggle,
  isTTSActive,
  isTTSSpeaking,
  isTTSSupported,
  disabled = false
}: ChatInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitiser l'input en temps réel sans trimmer les espaces
    const sanitized = sanitizeInput(e.target.value, DEFAULT_SECURITY_CONFIG, false);
    onInputChange(sanitized);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        onSubmit(e as any);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
      <div className="flex items-center space-x-2 mb-2">
        {/* Indicateur TTS */}
        <TTSIndicator
          isActive={isTTSActive}
          isSpeaking={isTTSSpeaking}
          isSupported={isTTSSupported}
          onToggle={onTTSToggle}
          disabled={disabled}
        />
        
        {/* Input de texte */}
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message..."
          disabled={disabled}
          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          maxLength={500}
          aria-label="Message à envoyer"
        />
        
        {/* Bouton d'envoi */}
        <button
          type="submit"
          disabled={!inputText.trim() || disabled}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="Envoyer le message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      {/* Informations de contact */}
      <div className="flex justify-center space-x-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Phone className="w-3 h-3" />
          <span>+221 701 193 811</span>
        </div>
        <div className="flex items-center space-x-1">
          <Mail className="w-3 h-3" />
          <span>omasenegal25@gmail.com</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center mt-2 text-xs text-gray-400">
        Powered by IA OMA • Dakar, Sénégal
      </div>
    </form>
  );
}