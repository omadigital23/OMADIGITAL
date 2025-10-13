// Composant pour l'en-tête du chat
import React from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ChatHeaderProps {
  isOnline: boolean;
  onClose: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function ChatHeader({ isOnline, onClose, onExport, onClear }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center ring-2 ring-orange-300 overflow-hidden">
          <Image 
            src="/images/logo.webp" 
            alt="OMA Digital Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="font-semibold">Assistant IA OMADIGITAL</h3>
          <div className="flex items-center space-x-2 text-orange-100 text-sm">
            <div 
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-400' : 'bg-red-400'
              } animate-pulse`}
              aria-label={isOnline ? 'En ligne' : 'Hors ligne'}
            ></div>
            <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={onExport}
          className="p-2 hover:bg-orange-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="Exporter la conversation"
          title="Exporter la conversation"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClear}
          className="p-2 hover:bg-orange-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="Effacer la conversation"
          title="Effacer la conversation"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-orange-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="Fermer le chat"
          title="Fermer le chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}