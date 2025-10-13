/**
 * Context React pour la gestion d'état du chatbot multimodal OMA
 * 
 * Alternative à Zustand utilisant React Context + useReducer
 * Conformément au cahier des charges - objectif fluidité et performance
 * Gestion d'état optimisée pour les interactions multimodales
 */

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
  embedding?: number[];
}

export interface ChatSuggestion {
  id: string;
  text: string;
  action: string;
  icon: string;
  type: 'whatsapp' | 'email' | 'appointment' | 'quote' | 'info';
}

interface ChatState {
  // État de base
  messages: ChatMessage[];
  conversationId: string | null;
  
  // États d'interaction
  isTyping: boolean;
  isSpeaking: boolean;
  isProcessingRAG: boolean;
  
  // Suggestions et proactivité
  suggestions: ChatSuggestion[];
  showSuggestions: boolean;
  lastInteractionTime: Date | null;
  
  // Gestion d'erreur
  error: string | null;
  retryCount: number;
  
  // Performance
  isVirtualized: boolean;
}

type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: Omit<ChatMessage, 'id' | 'timestamp'> }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_PROCESSING_RAG'; payload: boolean }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_AUDIO_LEVEL'; payload: number }
  | { type: 'SET_CONVERSATION_ID'; payload: string }
  | { type: 'RESET_CONVERSATION' }
  | { type: 'SET_SUGGESTIONS'; payload: ChatSuggestion[] }
  | { type: 'ADD_SUGGESTION'; payload: ChatSuggestion }
  | { type: 'CLEAR_SUGGESTIONS' }
  | { type: 'TOGGLE_SUGGESTIONS'; payload?: boolean }
  | { type: 'UPDATE_LAST_INTERACTION' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' }
  | { type: 'ENABLE_VIRTUALIZATION' }
  | { type: 'DISABLE_VIRTUALIZATION' };

// Messages de bienvenue localisés pour le marché sénégalais
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  text: `Salut ! Je suis l'assistant IA d'OMA Digital 🤖

✨ Spécialisé dans l'automatisation pour PME sénégalaises
🎯 +200% ROI moyen en 6 mois  
🏢 150+ clients à Dakar
🚀 Solutions IA sur mesure

Comment puis-je transformer votre business aujourd'hui ?

💡 Vous pouvez me parler ou écrire !`,
  sender: 'bot',
  timestamp: new Date(),
  isVoice: false
};

// Suggestions par défaut contextualisées Dakar/Sénégal
const DEFAULT_SUGGESTIONS: ChatSuggestion[] = [
  {
    id: 'suggest-1',
    text: 'Automatisation WhatsApp Business',
    action: 'Je veux automatiser WhatsApp pour mon commerce à Dakar',
    icon: '💬',
    type: 'whatsapp'
  },
  {
    id: 'suggest-2', 
    text: 'Site web ultra-rapide',
    action: 'Créer un site web performant pour ma PME',
    icon: '⚡',
    type: 'quote'
  },
  {
    id: 'suggest-3',
    text: 'Devis personnalisé',
    action: 'Je veux un devis pour digitaliser mon business',
    icon: '💰',
    type: 'quote'
  },
  {
    id: 'suggest-4',
    text: 'Prendre RDV Dakar',
    action: 'Comment prendre rendez-vous dans vos bureaux à Dakar ?',
    icon: '📅',
    type: 'appointment'
  }
];

const initialState: ChatState = {
  messages: [WELCOME_MESSAGE],
  conversationId: null,
  isTyping: false,
  isSpeaking: false,
  isProcessingRAG: false,
  suggestions: DEFAULT_SUGGESTIONS,
  showSuggestions: true,
  lastInteractionTime: null,
  error: null,
  retryCount: 0,
  isVirtualized: false
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const newMessage: ChatMessage = {
        ...action.payload,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      return {
        ...state,
        messages: [...state.messages, newMessage],
        error: null,
        lastInteractionTime: new Date()
      };
    }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.id 
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [WELCOME_MESSAGE],
        conversationId: null
      };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    
    case 'SET_PROCESSING_RAG':
      return { ...state, isProcessingRAG: action.payload };
    
    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.payload };
    
    case 'RESET_CONVERSATION':
      return {
        ...state,
        messages: [WELCOME_MESSAGE],
        conversationId: null,
        suggestions: DEFAULT_SUGGESTIONS,
        showSuggestions: true
      };
    
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    
    case 'ADD_SUGGESTION':
      return {
        ...state,
        suggestions: [...state.suggestions, action.payload]
      };
    
    case 'CLEAR_SUGGESTIONS':
      return { ...state, suggestions: [] };
    
    case 'TOGGLE_SUGGESTIONS':
      return {
        ...state,
        showSuggestions: action.payload !== undefined 
          ? action.payload 
          : !state.showSuggestions
      };
    
    case 'UPDATE_LAST_INTERACTION':
      return { ...state, lastInteractionTime: new Date() };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    
    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };
    
    case 'ENABLE_VIRTUALIZATION':
      return { ...state, isVirtualized: true };
    
    case 'DISABLE_VIRTUALIZATION':
      return { ...state, isVirtualized: false };
    
    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  actions: {
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    clearMessages: () => void;
    setTyping: (typing: boolean) => void;
    setSpeaking: (speaking: boolean) => void;
    setProcessingRAG: (processing: boolean) => void;
    setConversationId: (id: string) => void;
    resetConversation: () => void;
    setSuggestions: (suggestions: ChatSuggestion[]) => void;
    addSuggestion: (suggestion: ChatSuggestion) => void;
    clearSuggestions: () => void;
    toggleSuggestions: (show?: boolean) => void;
    updateLastInteraction: () => void;
    setError: (error: string | null) => void;
    incrementRetry: () => void;
    resetRetry: () => void;
    enableVirtualization: () => void;
    disableVirtualization: () => void;
  };
  inactivityTimerRef: React.MutableRefObject<number | null>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const inactivityTimerRef = useRef<number | null>(null);
  
  const actions = {
    addMessage: useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    }, []),
    
    updateMessage: useCallback((id: string, updates: Partial<ChatMessage>) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
    }, []),
    
    clearMessages: useCallback(() => {
      dispatch({ type: 'CLEAR_MESSAGES' });
    }, []),
    
    setTyping: useCallback((typing: boolean) => {
      dispatch({ type: 'SET_TYPING', payload: typing });
    }, []),
    
    setSpeaking: useCallback((speaking: boolean) => {
      dispatch({ type: 'SET_SPEAKING', payload: speaking });
    }, []),
    
    setProcessingRAG: useCallback((processing: boolean) => {
      dispatch({ type: 'SET_PROCESSING_RAG', payload: processing });
    }, []),
    
    setConversationId: useCallback((id: string) => {
      dispatch({ type: 'SET_CONVERSATION_ID', payload: id });
    }, []),
    
    resetConversation: useCallback(() => {
      dispatch({ type: 'RESET_CONVERSATION' });
    }, []),
    
    setSuggestions: useCallback((suggestions: ChatSuggestion[]) => {
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
    }, []),
    
    addSuggestion: useCallback((suggestion: ChatSuggestion) => {
      dispatch({ type: 'ADD_SUGGESTION', payload: suggestion });
    }, []),
    
    clearSuggestions: useCallback(() => {
      dispatch({ type: 'CLEAR_SUGGESTIONS' });
    }, []),
    
    toggleSuggestions: useCallback((show?: boolean) => {
      dispatch({ type: 'TOGGLE_SUGGESTIONS', payload: show });
    }, []),
    
    updateLastInteraction: useCallback(() => {
      // Nettoyer le timer précédent
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Nouveau timer de 30 secondes pour la proactivité
      inactivityTimerRef.current = window.setTimeout(() => {
        // Ajouter une relance proactive si pas d'interaction
        if (state.messages.length > 1 && !state.isTyping) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              text: `Besoin d'aide supplémentaire ? 🤝

Je peux vous aider avec :
• Automatisation WhatsApp Business
• Sites web ultra-rapides (<1.5s)
• Solutions IA sur mesure
• Consultation gratuite

Que souhaitez-vous améliorer dans votre business ?`,
              sender: 'bot'
            }
          });
        }
      }, 30000); // 30 secondes comme spécifié
      
      dispatch({ type: 'UPDATE_LAST_INTERACTION' });
    }, [state.messages.length, state.isTyping]),
    
    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),
    
    incrementRetry: useCallback(() => {
      dispatch({ type: 'INCREMENT_RETRY' });
    }, []),
    
    resetRetry: useCallback(() => {
      dispatch({ type: 'RESET_RETRY' });
    }, []),
    
    enableVirtualization: useCallback(() => {
      dispatch({ type: 'ENABLE_VIRTUALIZATION' });
    }, []),
    
    disableVirtualization: useCallback(() => {
      dispatch({ type: 'DISABLE_VIRTUALIZATION' });
    }, [])
  };
  
  return (
    <ChatContext.Provider value={{ state, actions, inactivityTimerRef }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

/**
 * Hook pour les suggestions contextuelles basées sur le message
 * Conforme aux objectifs de proactivité du cahier des charges
 */
export const useSmartSuggestions = () => {
  const { actions } = useChatContext();
  
  const generateSuggestions = useCallback((userMessage: string, botResponse: string) => {
    const lowerUserMsg = userMessage.toLowerCase();
    const lowerBotMsg = botResponse.toLowerCase();
    
    // Suggestions dynamiques basées sur le contexte (micro-service interne)
    const suggestions: ChatSuggestion[] = [];
    
    if (lowerUserMsg.includes('whatsapp') || lowerBotMsg.includes('whatsapp')) {
      suggestions.push({
        id: `suggest-wa-${Date.now()}`,
        text: 'Démo WhatsApp Auto',
        action: 'Montrer une démo de WhatsApp automatisé',
        icon: '📱',
        type: 'whatsapp'
      });
    }
    
    if (lowerUserMsg.includes('prix') || lowerUserMsg.includes('coût') || lowerBotMsg.includes('tarif')) {
      suggestions.push({
        id: `suggest-quote-${Date.now()}`,
        text: 'Devis détaillé',
        action: 'Je veux un devis détaillé avec pricing',
        icon: '💰',
        type: 'quote'
      });
    }
    
    if (lowerUserMsg.includes('rdv') || lowerUserMsg.includes('rendez-vous') || lowerBotMsg.includes('rencontre')) {
      suggestions.push({
        id: `suggest-meeting-${Date.now()}`,
        text: 'Planifier RDV',
        action: 'Je veux planifier un rendez-vous à Dakar',
        icon: '📅',
        type: 'appointment'
      });
    }
    
    // Ajouter les suggestions générées
    suggestions.forEach(suggestion => actions.addSuggestion(suggestion));
  }, [actions]);
  
  return { generateSuggestions };
};