import React from 'react';
import { Bot, User, Mic, Volume2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
}

interface ChatMessageProps {
  message: ChatMessage;
  onSpeak: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in mb-4`}>
    <div
      className={`max-w-[85%] px-4 py-3 rounded-2xl group ${
        message.sender === 'user'
          ? 'bg-orange-500 text-white rounded-br-md'
          : 'bg-gray-100 text-gray-900 rounded-bl-md hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-2">
        {message.sender === 'bot' && (
          <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-orange-600" />
        )}
        {message.sender === 'user' && (
          <User className="w-4 h-4 mt-1 flex-shrink-0 text-orange-100" />
        )}
        <div className="flex-1">
          <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs opacity-75">
              {message.isVoice && (
                <div className="flex items-center space-x-1">
                  <Mic className="w-3 h-3" />
                  <span>Vocal</span>
                </div>
              )}
              <span>
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {/* Bouton lecture pour messages bot */}
            {message.sender === 'bot' && (
              <button
                onClick={() => onSpeak(message.text)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                aria-label="Lire le message"
              >
                <Volume2 className="w-3 h-3 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);