import { memo, lazy, Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy loading des composants non-essentiels du chatbot
const TTSIndicator = lazy(() => import('./components/TTSIndicator'));
const VoiceInput = lazy(() => import('./components/VoiceInput'));
const VoiceSelector = lazy(() => import('./components/VoiceSelector'));

// Composant minimaliste pour le bouton chatbot
const ChatbotTrigger = memo(() => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <button
      className="fixed bottom-4 right-4 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
      onClick={() => setIsLoaded(true)}
      aria-label="Ouvrir le chatbot"
    >
      {isLoaded ? (
        <Suspense fallback={
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        }>
          <ChatbotInterface />
        </Suspense>
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
});

// Interface chatbot avec optimisations performance
const ChatbotInterface = memo(() => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Optimisation: Debounce pour les appels API
  const [debouncedInput, setDebouncedInput] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(inputValue);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  // Optimisation: Virtualisation pour les longs historiques
  const visibleMessages = messages.slice(-50); // Limiter à 50 messages visibles
  
  // Optimisation: Memoisation du rendu des messages
  const MessageList = memo(({ messages }) => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
      {messages.map((message, index) => (
        <MessageBubble key={`${message.id}-${index}`} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  ));
  
  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header minimal */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-500 text-white rounded-t-lg">
        <h3 className="font-semibold text-sm">Assistant OMA</h3>
        <button 
          className="text-white hover:text-gray-200 transition-colors"
          onClick={() => setIsLoaded(false)}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Messages avec virtualisation */}
      <MessageList messages={visibleMessages} />
      
      {/* Input optimisé */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        
        {/* Fonctionnalités avancées - chargement différé */}
        <Suspense fallback={null}>
          <div className="flex mt-2 space-x-2">
            <VoiceInput onTranscript={setInputValue} />
            <TTSIndicator />
            <VoiceSelector />
          </div>
        </Suspense>
      </div>
    </div>
  );
  
  async function handleSendMessage() {
    if (!inputValue.trim() || isTyping) return;
    
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Optimisation: AbortController pour annuler les requêtes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('/api/chat/gemini-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const botMessage = { id: Date.now() + 1, text: data.response, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Message d'erreur utilisateur-friendly
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "Désolé, je rencontre un problème technique. Veuillez réessayer.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }
});

// Composants optimisés
const MessageBubble = memo(({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
      message.sender === 'user' 
        ? 'bg-orange-500 text-white' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {message.text}
    </div>
  </div>
));

const TypingIndicator = memo(() => (
  <div className="flex justify-start">
    <div className="bg-gray-100 px-3 py-2 rounded-lg">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
));

// Export avec React.memo pour éviter les re-renders inutiles
export default memo(ChatbotTrigger);