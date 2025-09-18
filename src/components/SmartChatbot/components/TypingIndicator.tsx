// Composant pour l'indicateur de frappe
import React from 'react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 text-gray-900 max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-orange-600" />
          <div className="flex items-center space-x-1" aria-label="OMA réfléchit">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animate-delay-0"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animate-delay-200"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animate-delay-400"></div>
          </div>
          <span className="text-sm text-gray-600 italic bg-gray-200 px-2 py-1 rounded fade-in">
            OMA réfléchit...
          </span>
        </div>
      </div>
    </div>
  );
}