import React from 'react';

interface ChatSuggestion {
  id: string;
  text: string;
  action: string;
  icon: string;
  type: 'whatsapp' | 'email' | 'appointment' | 'quote' | 'info';
}

interface ChatSuggestionsProps {
  suggestions: ChatSuggestion[];
  onSuggestionClick: (action: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ suggestions, onSuggestionClick }) => (
  <div className="grid grid-cols-2 gap-2 mb-4">
    {suggestions.map((suggestion) => (
      <button
        key={suggestion.id}
        onClick={() => onSuggestionClick(suggestion.action)}
        className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors text-sm"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{suggestion.icon}</span>
          <span className="font-medium text-gray-900">{suggestion.text}</span>
        </div>
      </button>
    ))}
  </div>
);