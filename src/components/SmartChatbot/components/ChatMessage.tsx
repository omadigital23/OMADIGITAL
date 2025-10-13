// Composant pour afficher un message de chat
import React, { useState, useEffect } from 'react';
import { Bot, User, Phone, Mail, Monitor, Lightbulb } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface CTAData {
  type: string;
  action: string;
  data?: any;
}

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionClick: (suggestion: string) => void;
  onCTAAction: (cta: CTAData) => void;
}

// Determine CTA button styling based on type (moved outside component)
const getCTAButtonClass = (ctaType: string) => {
  const baseClasses = "text-xs px-3 py-2 rounded-full transition-all duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-1 transform hover:scale-105";
  
  // High conversion CTAs (demo, appointment, quote)
  if (['demo', 'appointment', 'quote'].includes(ctaType)) {
    return `${baseClasses} bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg focus:ring-orange-300 animate-pulse-slow`;
  }
  
  // Contact CTAs (WhatsApp, email)
  if (ctaType === 'contact') {
    return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg focus:ring-blue-300`;
  }
  
  // Secondary CTAs
  return `${baseClasses} bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-300`;
};

// Get appropriate icon for CTA type (moved outside component)
const getCTAIcon = (ctaType: string) => {
  switch (ctaType) {
    case 'demo':
      return <Monitor className="w-3 h-3 mr-1" />;
    case 'appointment':
      return <Phone className="w-3 h-3 mr-1" />;
    case 'quote':
      return <Lightbulb className="w-3 h-3 mr-1" />;
    case 'contact':
      return <Mail className="w-3 h-3 mr-1" />;
    default:
      return null;
  }
};

export function ChatMessage({ message, onSuggestionClick, onCTAAction }: ChatMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation d'entrée pour les messages
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-300`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          message.sender === 'user'
            ? 'bg-orange-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
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
            {/* Affichage sécurisé du texte - PAS de dangerouslySetInnerHTML */}
            <p className="text-sm whitespace-pre-line leading-relaxed">
              {message.text}
            </p>
            <div className="text-xs opacity-75 mt-1">
              {message.timestamp.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            
            {/* Suggestions pour les messages du bot */}
            {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 transform hover:scale-105"
                    aria-label={`Suggestion: ${suggestion}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* CTA pour les messages du bot */}
            {message.sender === 'bot' && message.cta && (
              <div className="mt-2">
                <button
                  onClick={() => onCTAAction(message.cta)}
                  className={getCTAButtonClass(message.cta.type)}
                  aria-label={`Action: ${message.cta.action}`}
                >
                  {getCTAIcon(message.cta.type)}
                  {message.cta.action}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}