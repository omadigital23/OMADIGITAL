/**
 * Store Zustand pour la gestion d'état du chatbot multimodal OMA
 * Conformément au cahier des charges - utilisation de Zustand pour l'état global
 * Objectif: Fluidité et zéro latence perceptible
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
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

export interface ConversationState {
  // État de base
  messages: ChatMessage[];
  conversationId: string | null;
  
  // États d'interaction
  isTyping: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessingRAG: boolean;
  
  // État vocal
  isListening: boolean;
  audioLevel: number;
  
  // Suggestions et proactivité
  suggestions: ChatSuggestion[];
  showSuggestions: boolean;
  lastInteractionTime: Date | null;
  inactivityTimerId: number | null;
  
  // Gestion d'erreur
  error: string | null;
  retryCount: number;
  
  // Performance et cache
  isVirtualized: boolean;
  messageCache: Map<string, ChatMessage>;
}

interface ChatActions {
  // Actions de message
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  
  // Actions d'état
  setTyping: (typing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setProcessingRAG: (processing: boolean) => void;
  setListening: (listening: boolean) => void;
  setAudioLevel: (level: number) => void;
  
  // Actions de conversation
  setConversationId: (id: string) => void;
  resetConversation: () => void;
  
  // Actions de suggestions
  setSuggestions: (suggestions: ChatSuggestion[]) => void;
  addSuggestion: (suggestion: ChatSuggestion) => void;
  clearSuggestions: () => void;
  toggleSuggestions: (show?: boolean) => void;
  
  // Actions de proactivité
  updateLastInteraction: () => void;
  setInactivityTimer: (timerId: number) => void;
  clearInactivityTimer: () => void;
  
  // Actions d'erreur
  setError: (error: string | null) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  
  // Actions de performance
  enableVirtualization: () => void;
  disableVirtualization: () => void;
  cacheMessage: (message: ChatMessage) => void;
  getCachedMessage: (id: string) => ChatMessage | undefined;
}

type ChatStore = ConversationState & ChatActions;

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

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // État initial
      messages: [WELCOME_MESSAGE],
      conversationId: null,
      isTyping: false,
      isRecording: false,
      isSpeaking: false,
      isProcessingRAG: false,
      isListening: false,
      audioLevel: 0,
      suggestions: DEFAULT_SUGGESTIONS,
      showSuggestions: true,
      lastInteractionTime: null,
      inactivityTimerId: null,
      error: null,
      retryCount: 0,
      isVirtualized: false,
      messageCache: new Map(),

      // Actions de message
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        };
        
        set((state) => {
          // Cache le message pour la virtualisation
          const newCache = new Map(state.messageCache);
          newCache.set(newMessage.id, newMessage);
          
          return {
            messages: [...state.messages, newMessage],
            messageCache: newCache,
            error: null,
            lastInteractionTime: new Date()
          };
        });
        
        // Mettre à jour l'heure d'interaction pour la proactivité
        get().updateLastInteraction();
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === id ? { ...msg, ...updates } : msg
          ),
          messageCache: new Map(state.messageCache).set(id, 
            { ...state.messageCache.get(id)!, ...updates }
          )
        }));
      },

      clearMessages: () => {
        set({
          messages: [WELCOME_MESSAGE],
          messageCache: new Map(),
          conversationId: null
        });
      },

      // Actions d'état (conformément aux objectifs de fluidité)
      setTyping: (typing) => set({ isTyping: typing }),
      setRecording: (recording) => set({ isRecording: recording }),
      setSpeaking: (speaking) => set({ isSpeaking: speaking }),
      setProcessingRAG: (processing) => set({ isProcessingRAG: processing }),
      setListening: (listening) => set({ isListening: listening }),
      setAudioLevel: (level) => set({ audioLevel: level }),

      // Actions de conversation
      setConversationId: (id) => set({ conversationId: id }),
      resetConversation: () => {
        get().clearMessages();
        set({ 
          conversationId: null,
          suggestions: DEFAULT_SUGGESTIONS,
          showSuggestions: true 
        });
      },

      // Actions de suggestions (pour la proactivité)
      setSuggestions: (suggestions) => set({ suggestions }),
      
      addSuggestion: (suggestion) => {
        set((state) => ({
          suggestions: [...state.suggestions, suggestion]
        }));
      },

      clearSuggestions: () => set({ suggestions: [] }),
      
      toggleSuggestions: (show) => {
        set((state) => ({
          showSuggestions: show !== undefined ? show : !state.showSuggestions
        }));
      },

      // Actions de proactivité (relance après 30s d'inactivité selon specs)
      updateLastInteraction: () => {
        const state = get();
        
        // Nettoyer le timer précédent
        if (state.inactivityTimerId) {
          clearTimeout(state.inactivityTimerId);
        }
        
        // Nouveau timer de 30 secondes
        const timerId = window.setTimeout(() => {
          const currentState = get();
          
          // Ajouter une relance proactive si pas d'interaction
          if (currentState.messages.length > 1 && !currentState.isTyping) {
            get().addMessage({
              text: `Besoin d'aide supplémentaire ? 🤝

Je peux vous aider avec :
• Automatisation WhatsApp Business
• Sites web ultra-rapides (<1.5s)
• Solutions IA sur mesure
• Consultation gratuite

Que souhaitez-vous améliorer dans votre business ?`,
              sender: 'bot'
            });
          }
        }, 30000); // 30 secondes comme spécifié
        
        set({ 
          lastInteractionTime: new Date(),
          inactivityTimerId: timerId
        });
      },

      setInactivityTimer: (timerId) => set({ inactivityTimerId: timerId }),
      
      clearInactivityTimer: () => {
        const state = get();
        if (state.inactivityTimerId) {
          clearTimeout(state.inactivityTimerId);
          set({ inactivityTimerId: null });
        }
      },

      // Actions d'erreur
      setError: (error) => set({ error }),
      incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),
      resetRetry: () => set({ retryCount: 0 }),

      // Actions de performance (virtualisation avec react-window selon specs)
      enableVirtualization: () => set({ isVirtualized: true }),
      disableVirtualization: () => set({ isVirtualized: false }),
      
      cacheMessage: (message) => {
        set((state) => {
          const newCache = new Map(state.messageCache);
          newCache.set(message.id, message);
          return { messageCache: newCache };
        });
      },
      
      getCachedMessage: (id) => {
        return get().messageCache.get(id);
      }
    }),
    {
      name: 'oma-chatbot-store', // Pour le debugging
    }
  )
);

/**
 * Hook pour les suggestions contextuelles basées sur le message
 * Conforme aux objectifs de proactivité du cahier des charges
 */
export const useSmartSuggestions = () => {
  const { addSuggestion, clearSuggestions } = useChatStore();
  
  const generateSuggestions = (userMessage: string, botResponse: string) => {
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
    suggestions.forEach(suggestion => addSuggestion(suggestion));
  };
  
  return { generateSuggestions };
};