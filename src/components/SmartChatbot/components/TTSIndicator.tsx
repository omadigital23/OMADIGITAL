// Composant pour indiquer le statut TTS
import React from 'react';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';

interface TTSIndicatorProps {
  isActive: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function TTSIndicator({ 
  isActive, 
  isSpeaking, 
  isSupported, 
  onToggle, 
  disabled = false 
}: TTSIndicatorProps) {
  // Si TTS n'est pas supporté, afficher un indicateur d'avertissement
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled={true}
        className="p-2 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed"
        aria-label="Synthèse vocale non supportée par ce navigateur"
        title="Synthèse vocale non supportée par ce navigateur"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
        isSpeaking
          ? 'bg-red-500 text-white animate-pulse'
          : isActive 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'bg-red-500 text-white hover:bg-red-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={
        isSpeaking 
          ? "Arrêter la lecture vocale" 
          : isActive 
          ? "Désactiver la synthèse vocale" 
          : "Activer la synthèse vocale"
      }
      title={
        isSpeaking 
          ? "Cliquez pour arrêter la lecture" 
          : isActive 
          ? "Synthèse vocale activée - Cliquez pour désactiver" 
          : "Synthèse vocale désactivée - Cliquez pour activer"
      }
    >
      {isSpeaking ? (
        <VolumeX className="w-5 h-5" />
      ) : isActive ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
}