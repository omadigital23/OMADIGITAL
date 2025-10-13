/**
 * Composant de sélection de voix pour le TTS amélioré
 * Permet de choisir entre les différentes voix Google AI Studio
 */

import React, { useState } from 'react';
import { Volume2, Settings, Play, Pause, Check } from 'lucide-react';

interface VoiceSelectorProps {
  currentVoice: string;
  availableVoices: string[];
  onVoiceChange: (voice: string) => void;
  onTestVoice: (voice: string) => void;
  isPlaying: boolean;
  isGoogleTTSAvailable: boolean;
}

const VOICE_DESCRIPTIONS = {
  'fr-professional-male': {
    name: 'Homme Professionnel',
    description: 'Voix masculine chaleureuse et professionnelle',
    type: 'Studio',
    recommended: true
  },

  'fr-wavenet-male': {
    name: 'Homme Naturel',
    description: 'Voix masculine fluide et naturelle',
    type: 'WaveNet',
    recommended: false
  },
  'fr-wavenet-female': {
    name: 'Femme Dynamique',
    description: 'Voix féminine énergique et engageante',
    type: 'WaveNet',
    recommended: false
  },
  'en-professional-male': {
    name: 'Professional Male (EN)',
    description: 'Professional masculine English voice',
    type: 'Studio',
    recommended: true
  },
  'en-professional-female': {
    name: 'Professional Female (EN)',
    description: 'Professional feminine English voice',
    type: 'Studio',
    recommended: true
  }
};

const TEST_PHRASES = {
  fr: "Bonjour ! Je suis votre assistant IA d'OMA Digital. Comment puis-je vous aider aujourd'hui ?",
  en: "Hello! I'm your OMA Digital AI assistant. How can I help you today?"
};

export function VoiceSelector({
  currentVoice,
  availableVoices,
  onVoiceChange,
  onTestVoice,
  isPlaying,
  isGoogleTTSAvailable
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  const handleVoiceTest = async (voiceKey: string) => {
    setTestingVoice(voiceKey);
    onTestVoice(voiceKey);
    
    // Simuler la durée du test (ajuster selon la durée réelle)
    setTimeout(() => {
      setTestingVoice(null);
    }, 3000);
  };

  const getTestPhrase = (voiceKey: string) => {
    return voiceKey.startsWith('en-') ? TEST_PHRASES.en : TEST_PHRASES.fr;
  };

  if (!isGoogleTTSAvailable) {
    return (
      <div className="flex items-center text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
        <Volume2 className="w-4 h-4 mr-2" />
        <span>Voix système utilisée</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        title="Changer la voix"
      >
        <Volume2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700">
          {VOICE_DESCRIPTIONS[currentVoice as keyof typeof VOICE_DESCRIPTIONS]?.name || 'Voix'}
        </span>
        <Settings className="w-3 h-3 text-gray-400" />
      </button>

      {/* Panel de sélection */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Choisir une voix</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableVoices.map((voiceKey) => {
                const voiceInfo = VOICE_DESCRIPTIONS[voiceKey as keyof typeof VOICE_DESCRIPTIONS];
                if (!voiceInfo) return null;

                const isSelected = currentVoice === voiceKey;
                const isTesting = testingVoice === voiceKey;

                return (
                  <div
                    key={voiceKey}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-orange-200 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => !isTesting && onVoiceChange(voiceKey)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {voiceInfo.name}
                          </span>
                          
                          {voiceInfo.recommended && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Recommandée
                            </span>
                          )}
                          
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {voiceInfo.type}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {voiceInfo.description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-3">
                        {isSelected && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoiceTest(voiceKey);
                          }}
                          disabled={isTesting}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                          title="Tester cette voix"
                        >
                          {isTesting ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isTesting && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        Test en cours : "{getTestPhrase(voiceKey).slice(0, 50)}..."
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>• Voix Studio : Plus naturelles</span>
                  <span className="text-green-600">✓ Disponible</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Voix WaveNet : Bonne qualité</span>
                  <span className="text-blue-600">✓ Fallback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}