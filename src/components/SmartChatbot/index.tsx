// Main enhanced chatbot component
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Zap, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { useChatLogic } from './hooks/useChatLogic';
import { useTTSClient } from './hooks/useTTSClient'; // Use client-side TTS hook
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { VoiceInput } from './components/VoiceInput';
import { generateSessionId } from '../../lib/analytics';

export function SmartChatbotNext() {
  // Debug logging (disabled in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('SmartChatbotNext: Component initializing');
  }
  
  // Initialize basic hooks first
  const [sessionId, setSessionId] = React.useState('');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isVoiceInputActive, setIsVoiceInputActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Enhanced initialization with error boundary
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartChatbotNext: useEffect initializing');
    }
    if (typeof window !== 'undefined') {
      try {
        setSessionId(generateSessionId());
        if (process.env.NODE_ENV === 'development') {
          console.log('SmartChatbotNext: Session ID generated');
        }
        
        // Test initial connectivity
        fetch('/api/health', { method: 'HEAD' })
          .then(() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('SmartChatbotNext: Initial connectivity check: OK');
            }
          })
          .catch(() => {
            console.warn('SmartChatbotNext: Initial connectivity check: Failed');
            setError('Connexion instable détectée. Certaines fonctionnalités peuvent être limitées.');
          });
      } catch (err) {
        console.error('SmartChatbotNext: Initialization error:', err);
        setError('Erreur d\'initialisation. Veuillez recharger la page.');
      }
    }
  }, []);

  const { 
    ttsState, 
    speakText, 
    stopSpeaking, 
    toggleTTS
  } = useTTSClient(sessionId); // Use client-side TTS hook

  // Enhanced TTS request handling with IMPERATIVE voice response
  const handleTTSRequest = React.useCallback((text: string, language: 'fr' | 'en', inputMethod: 'text' | 'voice') => {
    console.log('SmartChatbotNext: TTS Request received:', { 
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      language,
      inputMethod,
      ttsActive: ttsState.isActive,
      ttsSupported: ttsState.isSupported
    });
    
    // Validate TTS input
    if (!text || text.trim().length < 2) {
      console.warn('SmartChatbotNext: TTS skipped: text too short');
      return;
    }
    
    if (text.length > 1000) {
      console.warn('SmartChatbotNext: TTS skipped: text too long');
      return;
    }
    
    // RÈGLE IMPÉRATIVE:
    // - Input VOIX → Réponse VOIX (toujours, même si TTS désactivé)
    // - Input TEXTE → Réponse TEXTE (seulement si TTS activé manuellement)
    
    if (!ttsState.isSupported) {
      console.warn('SmartChatbotNext: TTS not supported by browser');
      return;
    }
    
    // Si input vocal → TOUJOURS activer TTS pour la réponse
    if (inputMethod === 'voice') {
      console.log('🎤 Input VOCAL détecté → Réponse VOCALE activée automatiquement');
      try {
        speakText(text, language);
      } catch (ttsError) {
        console.error('SmartChatbotNext: TTS error:', ttsError);
      }
    }
    // Si input texte → TTS seulement si activé manuellement par l'utilisateur
    else if (inputMethod === 'text' && ttsState.isActive) {
      console.log('⌨️ Input TEXTE + TTS activé → Réponse VOCALE');
      try {
        speakText(text, language);
      } catch (ttsError) {
        console.error('SmartChatbotNext: TTS error:', ttsError);
      }
    }
    // Si input texte et TTS désactivé → Pas de voix
    else {
      console.log('⌨️ Input TEXTE + TTS désactivé → Réponse TEXTE uniquement');
    }
  }, [speakText, ttsState.isActive, ttsState.isSupported]);

  const {
    state,
    chatWindowRef,
    isClient,
    sendMessage,
    handleSuggestionClick,
    handleCTAAction,
    handleScroll,
    clearChat,
    exportChat,
    updateState
  } = useChatLogic({ onTTSRequest: handleTTSRequest });

  if (process.env.NODE_ENV === 'development') {
    console.log('SmartChatbotNext: useChatLogic state:', {
      isClient,
      sessionId: state.sessionId,
      isOpen: state.isOpen,
      messagesCount: state.messages.length
    });
  }

  // Enhanced message submission with exponential backoff and circuit breaker
  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = state.inputText;
    if (messageToSend.trim()) {
      setIsAnimating(true);
      setError(null);
      
      let retryCount = 0;
      const maxRetries = 3;
      const baseDelay = 1000;
      
      while (retryCount <= maxRetries) {
        try {
          await sendMessage(messageToSend.trim(), 'text');
          break; // Success, exit retry loop
        } catch (err) {
          retryCount++;
          console.error(`SmartChatbotNext: Error sending message (attempt ${retryCount}):`, err);
          
          if (retryCount > maxRetries) {
            // Final failure - show contextual error message
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            
            if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
              setError('Problème de connexion. Vérifiez votre connexion internet et réessayez.');
            } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
              setError('Trop de requêtes. Veuillez patienter 1 minute avant de réessayer.');
            } else if (errorMessage.includes('timeout')) {
              setError('Temps de réponse dépassé. Le service est peut-être surchargé. Réessayez dans quelques minutes.');
            } else if (errorMessage.includes('503') || errorMessage.includes('502')) {
              setError('Service temporairement indisponible. Notre équipe technique a été notifiée. Contactez-nous au +212 70 119 38 11.');
            } else {
              setError('Erreur inattendue. Si le problème persiste, contactez-nous au +212 70 119 38 11.');
            }
          } else {
            // Exponential backoff: wait longer between retries
            const delay = baseDelay * Math.pow(2, retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      setIsAnimating(false);
    }
  }, [sendMessage, state.inputText]);

  // Enhanced voice transcript handling with validation and retry
  const handleVoiceTranscript = React.useCallback(async (transcript: string) => {
    console.log('SmartChatbotNext: 🚀 DIRECT SENDING - Transcript:', transcript);
    
    // Validate transcript
    if (!transcript?.trim() || transcript.trim().length < 2) {
      setError('Transcription trop courte. Veuillez répéter plus clairement.');
      return;
    }
    
    if (transcript.length > 500) {
      setError('Message vocal trop long. Veuillez le raccourcir.');
      return;
    }
    
    setIsAnimating(true);
    setError(null);
    
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // Send directly without touching input
        await sendMessage(transcript.trim(), 'voice');
        console.log('SmartChatbotNext: ✅ Voice message sent directly');
        break;
      } catch (err) {
        retryCount++;
        console.error(`SmartChatbotNext: ❌ Error sending voice message (attempt ${retryCount}):`, err);
        
        if (retryCount > maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          if (errorMessage.includes('network')) {
            setError('Problème de connexion lors de l\'envoi vocal. Vérifiez votre connexion.');
          } else {
            setError('Erreur lors de l\'envoi du message vocal. Vous pouvez le taper manuellement.');
          }
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
    
    setIsAnimating(false);
  }, [sendMessage]);

  // Enhanced SSR handling with loading state
  if (!isClient) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartChatbotNext: Rendering SSR loading state');
    }
    return (
      <div className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gray-300 animate-pulse z-50" 
           aria-label="Chargement du chat..." />
    );
  }
  
  // Error boundary for critical errors
  if (error && error.includes('initialisation')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartChatbotNext: Rendering error boundary');
    }
    return (
      <div className="fixed bottom-6 right-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 z-50 max-w-xs">
        <p className="font-medium">Erreur critique</p>
        <p className="text-sm mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
        >
          Recharger
        </button>
      </div>
    );
  }

  // Enhanced TTS toggle with error handling
  const handleTTSToggle = () => {
    try {
      if (ttsState.isSpeaking) {
        stopSpeaking();
      }
      toggleTTS();
    } catch (ttsError) {
      console.error('SmartChatbotNext: TTS toggle error:', ttsError);
      setError('Erreur avec la synthèse vocale. Fonctionnalité temporairement désactivée.');
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('SmartChatbotNext: Rendering main component');
  }

  return (
    <>
      
      {/* Floating chat button */}
      <button
        onClick={() => updateState({ isOpen: !state.isOpen })}
        className={`fixed shadow-xl transition-all duration-300 z-50 flex items-center justify-center group ${
          state.isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-180' 
            : 'bg-orange-500 hover:bg-orange-600 hover:scale-110'
        } ${isAnimating ? 'animate-pulse' : ''}
        bottom-4 right-4 w-14 h-14 rounded-full
        md:bottom-6 md:right-6 md:w-16 md:h-16
        lg:bottom-6 lg:right-6 lg:w-16 lg:h-16 lg:rounded-full
        xl:bottom-6 xl:right-6 xl:w-16 xl:h-16
        `}
        style={{ 
          zIndex: 9999,
          display: 'flex',
          visibility: 'visible',
          opacity: 1
        }}
        aria-label={state.isOpen ? "Fermer le chat" : "Ouvrir le chat OMA"}
      >
        {state.isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <>
            <MessageCircle className="w-8 h-8 text-white" />
            {state.isTyping && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </>
        )}
        
        {/* Notification indicator */}
        {!state.isOpen && state.messages.length <= 1 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            <Zap className="w-3 h-3 text-white" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {state.isOpen && (
        <div className={`fixed bg-white shadow-2xl border flex flex-col z-50 overflow-hidden animate-fade-in-up transition-all duration-200 ${
          error ? 'border-red-200 shadow-red-100' : 'border-gray-200'
        } 
        bottom-20 right-4 w-[calc(100vw-2rem)] h-[70vh] rounded-t-2xl
        md:bottom-24 md:right-6 md:w-[30rem] md:h-[36rem] md:rounded-2xl
        lg:bottom-24 lg:right-6 lg:w-96 lg:h-[36rem] lg:rounded-2xl lg:max-w-[calc(100vw-3rem)] lg:max-h-[calc(100vh-6rem)]
        xl:bottom-24 xl:right-6 xl:w-[32rem] xl:h-[40rem]
        `}>
          {/* Header */}
          <ChatHeader
            isOnline={state.isOnline}
            onClose={() => updateState({ isOpen: false })}
            onExport={exportChat}
            onClear={clearChat}
          />

          {/* Messages area */}
          <div 
            ref={chatWindowRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent overscroll-contain"
            role="log"
            aria-live="polite"
            aria-label="Messages du chat"
          >
            {state.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleSuggestionClick}
                onCTAAction={handleCTAAction}
              />
            ))}
            
            {/* Typing indicator */}
            {state.isTyping && <TypingIndicator />}
            
            {/* Enhanced error message display with recovery options */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start animate-fade-in">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Problème technique</p>
                  <p className="text-sm mb-2">{error}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setError(null)}
                      className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => {
                        setError(null);
                        if (state.inputText.trim()) {
                          handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                        }
                      }}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Réessayer
                    </button>
                    {error.includes('connexion') && (
                      <button
                        onClick={() => {
                          setError(null);
                          // Test connection
                          fetch('/api/health').then(() => {
                            console.log('SmartChatbotNext: Connection restored');
                          }).catch(() => {
                            setError('Connexion toujours instable. Vérifiez votre réseau.');
                          });
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                      >
                        Tester connexion
                      </button>
                    )}
                    <a
                      href="tel:+212701193811"
                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
                    >
                      Appeler support
                    </a>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={state.inputText}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit input length
                    if (value.length <= 1000) {
                      updateState({ inputText: value });
                    }
                  }}
                  placeholder={state.isOnline ? "Tapez votre message..." : "Hors ligne - Fonctionnalités limitées"}
                  disabled={state.isTyping || !state.isOnline || isAnimating}
                  maxLength={1000}
                  className={`w-full px-4 py-3 pr-12 border rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (state.inputText.trim() && !isAnimating) {
                        handleSubmit(e as any);
                      }
                    }
                  }}
                  aria-describedby={error ? "error-message" : undefined}
                />
                
                {state.inputText.trim() && (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={state.isTyping || !state.isOnline || isAnimating}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isAnimating 
                        ? 'text-orange-400 animate-pulse' 
                        : 'text-orange-500 hover:text-orange-600'
                    }`}
                    aria-label="Envoyer le message"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Enhanced voice input with error handling */}
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                disabled={state.isTyping || !state.isOnline || isAnimating}
              />
              
              {/* Enhanced TTS button with status indicators */}
              <button
                type="button"
                onClick={handleTTSToggle}
                disabled={isAnimating}
                className={`p-3 rounded-full transition-all duration-200 ${
                  ttsState.isSpeaking
                    ? 'bg-orange-500 text-white animate-pulse shadow-lg'
                    : ttsState.isActive
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={ttsState.isActive ? "Couper le son" : "Activer le son"}
                title={ttsState.isActive ? "Couper le son" : "Activer le son"}
              >
                {ttsState.isActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                {ttsState.isSpeaking && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
                )}
              </button>
            </div>
            
            {/* Enhanced thinking indicator with timeout warning */}
            {(state.isTyping || isAnimating) && (
              <div className="mt-2 text-center text-sm text-gray-500 flex items-center justify-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span>{isAnimating ? 'Envoi en cours...' : 'OMA réfléchit...'}</span>
                </div>
              </div>
            )}
            
            {/* Character count indicator */}
            {state.inputText.length > 800 && (
              <div className="mt-1 text-xs text-gray-500 text-right">
                {state.inputText.length}/1000 caractères
              </div>
            )}
            
            {/* Enhanced connection status indicator with recovery */}
            {!state.isOnline && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm text-yellow-700 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <div className="flex-1">
                  <span className="block font-medium">Connexion perdue</span>
                  <span className="text-xs block mb-1">Mode hors ligne activé - Fonctionnalités limitées</span>
                  <button
                    onClick={() => {
                      // Try to reconnect
                      fetch('/api/health')
                        .then(() => {
                          updateState({ isOnline: true });
                          console.log('SmartChatbotNext: Connection restored');
                        })
                        .catch(() => {
                          console.log('SmartChatbotNext: Still offline');
                        });
                    }}
                    className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded transition-colors"
                  >
                    Reconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}