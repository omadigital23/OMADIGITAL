/**
 * AMÉLIORATION 5 : Composant Chatbot Intégré avec Toutes les Améliorations
 * Remplace le composant existant avec les nouvelles fonctionnalités
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Languages, MessageCircle, X } from 'lucide-react';
import { useEnhancedChatLogic } from './hooks/useEnhancedChatLogic';

interface EnhancedSmartChatbotProps {
  position?: 'bottom-right' | 'bottom-left' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  enableRAG?: boolean;
  enableVoice?: boolean;
  enableLanguageDetection?: boolean;
  enableInputOutputMatching?: boolean;
  sessionId?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

const EnhancedSmartChatbot: React.FC<EnhancedSmartChatbotProps> = ({
  position = 'bottom-right',
  theme = 'auto',
  enableRAG = true,
  enableVoice = true,
  enableLanguageDetection = true,
  enableInputOutputMatching = true,
  sessionId,
  onClose,
  isOpen = true
}) => {
  const [textInput, setTextInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hook amélioré avec toutes les optimisations
  const {
    messages,
    isLoading,
    isRecording,
    isPlaying,
    currentLanguage,
    inputMode,
    outputMode,
    error,
    sendMessage,
    startVoiceRecording,
    stopVoiceRecording,
    stopAudio,
    changeLanguage,
    setOutputMode,
    clearMessages,
    isVoiceSupported,
    ttsStats
  } = useEnhancedChatLogic({
    enableRAGOptimization: enableRAG,
    enableLanguageDetection,
    enableInputOutputMatching,
    sessionId
  });

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus automatique sur l'input
  useEffect(() => {
    if (!isMinimized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isMinimized]);

  /**
   * AMÉLIORATION: Gestion des messages texte optimisée
   */
  const handleSendMessage = async () => {
    if (!textInput.trim() || isLoading) return;
    
    const message = textInput.trim();
    setTextInput('');
    
    await sendMessage(message, 'text');
  };

  /**
   * AMÉLIORATION: Gestion vocal avec correspondance input/output
   */
  const handleVoiceToggle = async () => {
    if (!isVoiceSupported) {
      alert(currentLanguage === 'fr' 
        ? 'Fonction vocale non supportée par votre navigateur'
        : 'Voice feature not supported by your browser'
      );
      return;
    }

    if (isRecording) {
      // L'arrêt est géré par le hook useEnhancedChatLogic
      return;
    }

    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      await startVoiceRecording();
    } catch (error) {
      console.error('Voice recording failed:', error);
    }
  };

  /**
   * Gestion des touches clavier
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Formatage des messages avec métadonnées
   */
  const formatMessage = (content: string, metadata?: any) => {
    let displayContent = content;
    
    // Ajout d'indicateurs de source RAG
    if (metadata?.ragContext && metadata.ragContext.length > 0) {
      const ragInfo = currentLanguage === 'fr' 
        ? `\n\n📚 Sources: ${metadata.ragContext.length} document(s) consultés`
        : `\n\n📚 Sources: ${metadata.ragContext.length} document(s) consulted`;
      displayContent += ragInfo;
    }

    return displayContent;
  };

  if (!isOpen) return null;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed ${positionClasses[position]} z-50 ${
        isMinimized ? 'w-16 h-16' : 'w-96 h-[600px]'
      } max-w-[90vw] max-h-[90vh]`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header amélioré */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">OMADIGITAL AI</span>
              {enableRAG && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  RAG Enhanced
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Indicateur de langue avec détection automatique */}
              <button
                onClick={() => changeLanguage(currentLanguage === 'fr' ? 'en' : 'fr')}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                title={enableLanguageDetection ? 'Auto-détection activée' : 'Changer de langue'}
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs ml-1">
                  {currentLanguage.toUpperCase()}
                  {enableLanguageDetection && '🤖'}
                </span>
              </button>
              
              {/* Mode de sortie */}
              {isVoiceSupported && (
                <button
                  onClick={() => setOutputMode(outputMode === 'text' ? 'voice' : 'text')}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  title={`Mode: ${outputMode === 'voice' ? 'Vocal' : 'Texte'}`}
                >
                  {outputMode === 'voice' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
              
              {/* Minimiser/Agrandir */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? '□' : '−'}
              </button>
              
              {/* Fermer */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Indicateurs d'état */}
          <div className="mt-2 flex items-center space-x-2 text-xs">
            {enableInputOutputMatching && (
              <span className="bg-white/20 px-2 py-1 rounded-full">
                {inputMode} → {outputMode}
              </span>
            )}
            {ttsStats.size > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded-full">
                Cache: {ttsStats.size}
              </span>
            )}
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Zone de messages améliorée */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {formatMessage(message.content, message.metadata)}
                      </div>
                      
                      {/* Métadonnées de debug */}
                      {message.metadata && (
                        <div className="text-xs opacity-70 mt-1">
                          {message.type === 'voice' && '🎙️ '}
                          {message.metadata.confidence && `${Math.round(message.metadata.confidence * 100)}% `}
                          {message.metadata.source && `(${message.metadata.source})`}
                          {message.metadata.processingTime && ` • ${message.metadata.processingTime}ms`}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Indicateur de chargement */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Affichage d'erreur */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Zone de saisie améliorée */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      currentLanguage === 'fr'
                        ? 'Tapez votre message...'
                        : 'Type your message...'
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={1}
                    disabled={isLoading}
                  />
                </div>
                
                {/* Bouton vocal amélioré */}
                {enableVoice && isVoiceSupported && (
                  <button
                    onClick={handleVoiceToggle}
                    disabled={isLoading}
                    className={`p-3 rounded-xl transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : isPlaying
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={
                      isRecording
                        ? 'Enregistrement en cours...'
                        : isPlaying
                        ? 'Lecture en cours...'
                        : 'Appuyez pour parler'
                    }
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                
                {/* Bouton d'envoi */}
                <button
                  onClick={handleSendMessage}
                  disabled={!textInput.trim() || isLoading}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Indicateurs supplémentaires */}
              <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                <span>
                  {enableRAG && '🧠 RAG • '}
                  {enableLanguageDetection && '🌐 Auto-Lang • '}
                  {enableInputOutputMatching && '🔄 I/O Match'}
                </span>
                {textInput.length > 0 && (
                  <span>{textInput.length}/500</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedSmartChatbot;