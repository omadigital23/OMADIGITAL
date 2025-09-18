// Hook principal pour la logique du chatbot
import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessage, ChatResponse, ChatbotState } from '../types';
import { validateAndSecureMessage } from '../utils/security';
import { combineLanguageDetection } from '../utils/languageDetection';
import { chatbotMonitoring } from '../utils/monitoring';
import { trackChatbotInteraction, getChatbotInteractions, generateSessionId } from '../../../lib/analytics';
import { ctaService } from '../../../lib/cta-service';

interface UseChatLogicProps {
  onTTSRequest?: (text: string, language: 'fr' | 'en', inputMethod: 'text' | 'voice') => void;
}

export function useChatLogic({ onTTSRequest }: UseChatLogicProps = {}) {
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    messages: [],
    inputText: '',
    isTyping: false,
    isTTSActive: true,
    isTTSSpeaking: false,
    isOnline: true,
    isNearBottom: true,
    sessionId: ''
  });

  const [isRateLimited, setIsRateLimited] = useState(false);
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const isClientRef = useRef(false);

  // Define all hook functions first before they are used
  /**
   * Vérifie le statut de l'API
   */
  const checkApiStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/status');
      setState(prev => ({ ...prev, isOnline: response.ok }));
    } catch (error) {
      setState(prev => ({ ...prev, isOnline: false }));
      console.error('Vérification du statut API échouée:', error);
    }
  }, []);

  /**
   * Définit le message de bienvenue proactif avec CTAs intégrés
   */
  const setProactiveWelcomeMessage = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      text: "Bonjour ! Je suis OMA Assistant, votre assistant conversationnel officiel d'OMA Digital. Comment puis-je vous aider à développer votre PME aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date(),
      language: 'fr',
      cta: {
        type: 'demo',
        action: 'Demander une démo',
        priority: 'high',
        data: {
          service: 'Demande de démo WhatsApp'
        }
      }
    };
    
    const servicesCTA: ChatMessage = {
      id: 'cta-1',
      text: "Je peux vous aider avec :",
      sender: 'bot',
      timestamp: new Date(),
      language: 'fr',
      suggestions: [
        "Automatisation WhatsApp",
        "Sites web ultra-rapides",
        "Branding authentique",
        "Assistant IA personnalisé"
      ]
    };
    
    setState(prev => ({ ...prev, messages: [welcomeMessage, servicesCTA] }));
    
    // TTS will only be triggered for voice input responses
  }, []);

  /**
   * Gère les erreurs de manière plus détaillée
   */
  const handleChatError = useCallback((error: any, context: string) => {
    console.error(`Chatbot error in ${context}:`, error);
    
    // Create a more detailed error message based on error type
    let errorMessage = "Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.";
    
    if (error && typeof error === 'object') {
      if (error.message) {
        // Handle specific error messages
        if (error.message.includes('rate limit')) {
          errorMessage = "Trop de messages envoyés. Veuillez patienter quelques secondes avant de réessayer.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Problème de connexion. Veuillez vérifier votre connexion internet et réessayer.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Délai d'attente dépassé. Veuillez vérifier votre connexion internet et réessayer.";
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          errorMessage = "Erreur d'authentification. Veuillez réessayer plus tard.";
        } else if (error.message.includes('forbidden') || error.message.includes('403')) {
          errorMessage = "Accès refusé. Vous n'avez pas les permissions nécessaires pour cette action.";
        } else if (error.message.includes('TTS')) {
          errorMessage = "Problème avec la synthèse vocale. Le message sera affiché textuellement.";
        } else if (error.message.includes('STT') || error.message.includes('speech')) {
          errorMessage = "Problème avec la reconnaissance vocale. Veuillez réessayer ou utiliser le clavier.";
        }
      }
      
      // Handle HTTP status codes
      if (error.status) {
        switch (error.status) {
          case 400:
            errorMessage = "Message invalide. Veuillez vérifier votre message et réessayer.";
            break;
          case 401:
            errorMessage = "Erreur d'authentification. Veuillez réessayer plus tard.";
            break;
          case 403:
            errorMessage = "Accès refusé. Vous n'avez pas les permissions nécessaires pour cette action.";
            break;
          case 404:
            errorMessage = "Ressource non trouvée. Le service demandé est introuvable.";
            break;
          case 408:
            errorMessage = "Délai d'attente dépassé. Veuillez vérifier votre connexion internet et réessayer.";
            break;
          case 429:
            errorMessage = "Trop de requêtes. Veuillez patienter quelques minutes avant de réessayer.";
            setIsRateLimited(true);
            break;
          case 500:
            errorMessage = "Erreur serveur interne. Notre équipe technique a été notifiée et travaille à résoudre le problème.";
            break;
          case 502:
            errorMessage = "Passerelle incorrecte. Le serveur a reçu une réponse invalide.";
            break;
          case 503:
            errorMessage = "Service temporairement indisponible. Veuillez réessayer dans quelques minutes.";
            break;
          case 504:
            errorMessage = "Délai d'attente de la passerelle dépassé. Veuillez réessayer plus tard.";
            break;
          default:
            errorMessage = `Erreur inattendue (code: ${error.status}). Veuillez réessayer plus tard. Si le problème persiste, contactez notre support.`;
        }
      }
    }
    
    return errorMessage;
  }, []);

  /**
   * Charge l'historique des conversations depuis Supabase
   */
  const loadChatHistory = useCallback(async () => {
    try {
      // TRY TO LOAD FROM NEWER CONVERSATIONS/MESSAGES TABLES FIRST (for admin dashboard compatibility)
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
        process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || ''
      );
      
      // Get conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('session_id', state.sessionId)
        .single();
      
      if (!convError && conversation) {
        // Get messages for this conversation
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('id, content, sender, language, created_at')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });
        
        if (!msgError && messages) {
          // Transform messages to chat format
          const historyMessages = messages.map((msg: any) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.created_at),
            language: msg.language || 'fr'
          }));
          
          setState(prev => ({ ...prev, messages: historyMessages }));
          return;
        }
      }
      
      // FALLBACK TO OLD CHATBOT_INTERACTIONS TABLE
      const interactions = await getChatbotInteractions(state.sessionId);
      
      if (interactions && interactions.length > 0) {
        const historyMessages = interactions.flatMap((interaction: any) => [
          {
            id: `user-${interaction.message_id}`,
            text: interaction.message_text,
            sender: 'user' as const,
            timestamp: new Date(interaction.timestamp),
            language: interaction.language || 'fr'
          },
          {
            id: `bot-${interaction.message_id}`,
            text: interaction.response_text,
            sender: 'bot' as const,
            timestamp: new Date(interaction.timestamp),
            language: interaction.language || 'fr',
            suggestions: interaction.suggestions,
            cta: interaction.cta,
            source: interaction.source,
            confidence: interaction.confidence
          }
        ]).sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setState(prev => ({ ...prev, messages: historyMessages }));
      } else {
        // Message de bienvenue proactif
        setProactiveWelcomeMessage();
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      // Fallback to welcome message even if history loading fails
      setProactiveWelcomeMessage();
    }
  }, [state.sessionId, setProactiveWelcomeMessage]);

  /**
   * Efface l'historique du chat
   */
  const clearChat = useCallback(() => {
    setProactiveWelcomeMessage();
  }, [setProactiveWelcomeMessage]);

  /**
   * Exporte l'historique du chat
   */
  const exportChat = useCallback(() => {
    try {
      const chatData = {
        sessionId: state.sessionId,
        timestamp: new Date().toISOString(),
        messages: state.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp.toISOString(),
          language: msg.language,
          source: msg.source,
          confidence: msg.confidence,
          suggestions: msg.suggestions,
          cta: msg.cta
        }))
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `chat-history-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Error exporting chat:', error);
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: `export-error-${Date.now()}`,
        text: "Désolé, je n'ai pas pu exporter l'historique. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date(),
        language: 'fr'
      };
      
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage]
      }));
    }
  }, [state.sessionId, state.messages]);

  /**
   * Met à jour l'état
   */
  const updateState = useCallback((updates: Partial<ChatbotState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Gère le scroll du chat
   */
  const handleScroll = useCallback(() => {
    if (chatWindowRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      const nearBottomThreshold = 50;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < nearBottomThreshold;
      setState(prev => ({ ...prev, isNearBottom }));
    }
  }, []);

  /**
   * Envoie un message avec une gestion d'erreurs améliorée
   */
  const sendMessage = useCallback(async (messageText: string, inputMethod: 'text' | 'voice' = 'text') => {
    // Rate limiting check
    if (isRateLimited) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: "Trop de messages envoyés. Veuillez patienter quelques secondes avant de réessayer.",
        sender: 'bot',
        timestamp: new Date(),
        language: 'fr'
      };
      
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        inputText: '',
        isTyping: false
      }));
      return;
    }

    // Validation et sécurisation
    const validation = validateAndSecureMessage(messageText, state.sessionId);
    
    if (!validation.isValid) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: validation.error || "Message invalide. Veuillez vérifier votre message et réessayer.",
        sender: 'bot',
        timestamp: new Date(),
        language: 'fr'
      };
      
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        inputText: '',
        isTyping: false
      }));
      return;
    }

    const sanitizedMessage = validation.sanitizedMessage;
    
    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: sanitizedMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMessage],
      inputText: '', // Always clear the input field after sending
      isTyping: true,
      transcribedText: ''
    }));

    const startTime = Date.now();

    // Détecte la langue d'un texte en utilisant exclusivement l'API Google AI Studio (Gemini)
    const detectLanguageWithGoogleAPI = async (text: string): Promise<'fr' | 'en'> => {
      try {
        // Préparer le texte pour la détection
        const preparedText = text
          .replace(/https?:\/\/[^\s]+/g, '') // URLs
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '') // Emails
          .replace(/\+?[0-9][\d\s\-\(\)]{7,}/g, '') // Numéros de téléphone
          .replace(/\s+/g, ' ') // Normaliser les espaces
          .trim();
        
        if (!preparedText || preparedText.trim().length === 0) {
          return 'fr'; // Défaut pour le marché sénégalais
        }

        // Appeler l'API de détection de langue
        const response = await fetch('/api/language/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: preparedText.substring(0, 500) }) // Limiter la longueur pour l'API
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.language) {
            return data.language === 'en' ? 'en' : 'fr';
          }
        }
        
        // En cas d'erreur, utiliser la détection locale comme fallback
        console.warn('Google language detection failed, using local detection as fallback');
        return 'fr'; // Défaut pour le marché sénégalais
      } catch (error) {
        console.error('Language detection API error:', error);
        // En cas d'erreur API, utiliser la détection locale comme fallback
        return 'fr'; // Défaut pour le marché sénégalais
      }
    };

    try {
      // Utiliser exclusivement la détection Google API
      console.log('🎵 Detecting language for message:', sanitizedMessage.substring(0, 50));
      const detectedLanguage = await detectLanguageWithGoogleAPI(sanitizedMessage);
      console.log('🎵 Language detected:', detectedLanguage);
      
      // Appel API Gemini avec RAG et langue détectée
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sanitizedMessage,
          sessionId: state.sessionId,
          inputMethod: inputMethod,
          detectedLanguage: detectedLanguage, // Passer la langue détectée
          // Ajout de métadonnées pour améliorer le traitement
          context: {
            history: state.messages.slice(-6), // Derniers 6 messages pour le contexte
            languageDetection: 'gemini' // Indiquer que la détection doit être faite par Gemini
          }
        })
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        
        // Utiliser exclusivement la détection Google API
        const detectedLanguage = await detectLanguageWithGoogleAPI(sanitizedMessage);
        
        // Create bot message with proper optional property handling
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        
        // Add optional properties only if they exist
        if (data.suggestions) {
          botMessage.suggestions = data.suggestions;
        }
        if (data.cta) {
          botMessage.cta = data.cta;
        }
        if (detectedLanguage) {
          botMessage.language = detectedLanguage;
        }
        if (data.source) {
          botMessage.source = data.source;
        }
        if (data.confidence !== undefined) {
          botMessage.confidence = data.confidence;
        }

        setState(prev => ({ 
          ...prev, 
          messages: [...prev.messages, botMessage],
          isTyping: false
        }));

        // Déclencher TTS automatiquement SEULEMENT pour les messages vocaux
        if (onTTSRequest && inputMethod === 'voice') {
          console.log('Déclenchement TTS pour réponse vocale:', data.response.substring(0, 50));
          // Use the language from the bot message instead of the undefined detectedLanguage variable
          const responseLanguage = botMessage.language || 'fr';
          onTTSRequest(data.response, responseLanguage, inputMethod);
        }

        // Map CTA types to analytics-supported types
        let analyticsCtaType: 'contact' | 'demo' | 'appointment' | 'quote' | undefined;
        if (data.cta?.type) {
          switch (data.cta.type) {
            case 'contact':
            case 'whatsapp':
            case 'email':
            case 'phone':
              analyticsCtaType = 'contact';
              break;
            case 'demo':
              analyticsCtaType = 'demo';
              break;
            case 'appointment':
              analyticsCtaType = 'appointment';
              break;
            case 'quote':
              analyticsCtaType = 'quote';
              break;
            default:
              analyticsCtaType = undefined;
          }
        }

        // Prepare interaction data with proper optional property handling
        const interactionData: any = {
          message_id: userMessage.id,
          session_id: state.sessionId,
          message_text: sanitizedMessage,
          response_text: data.response,
          input_method: inputMethod,
          response_time: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          language: detectedLanguage
        };
        
        // Add optional properties only if they exist
        if (data.source !== undefined) {
          interactionData.source = data.source;
        }
        if (data.confidence !== undefined) {
          interactionData.confidence = data.confidence;
        }
        if (data.suggestions) {
          interactionData.suggestions = data.suggestions.length;
          interactionData.suggestion_count = data.suggestions.length;
        } else {
          interactionData.suggestions = 0;
          interactionData.suggestion_count = 0;
        }
        if (analyticsCtaType !== undefined) {
          interactionData.cta_type = analyticsCtaType;
        }
        interactionData.response_length = data.response.length;

        // Tracker l'interaction avec plus de détails
        await trackChatbotInteraction(interactionData);

        // Track response quality metrics
        chatbotMonitoring.trackResponseQuality(
          Date.now() - startTime,
          data.response.length,
          !!data.suggestions?.length,
          !!data.cta,
          !!data.fallback
        );

        // If we have language detection info, track it
        if (data.language && data.confidence) {
          // For monitoring purposes, we'll assume the detected language is correct
          // In a real implementation, we would collect user feedback
          chatbotMonitoring.trackLanguageDetection(
            data.language as 'fr' | 'en',
            data.language as 'fr' | 'en',
            data.confidence
          );
        }

      } else {
        // Handle API error with more specific error messages
        let errorMessageText = "Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.";
        
        switch (response.status) {
          case 400:
            errorMessageText = "Message invalide. Veuillez vérifier votre message et réessayer.";
            break;
          case 401:
            errorMessageText = "Erreur d'authentification. Veuillez réessayer plus tard.";
            break;
          case 403:
            errorMessageText = "Accès refusé. Vous n'avez pas les permissions nécessaires pour cette action.";
            break;
          case 404:
            errorMessageText = "Ressource non trouvée. Le service demandé est introuvable.";
            break;
          case 408:
            errorMessageText = "Délai d'attente dépassé. Veuillez vérifier votre connexion internet et réessayer.";
            break;
          case 429:
            errorMessageText = "Trop de requêtes. Veuillez patienter quelques minutes avant de réessayer.";
            setIsRateLimited(true);
            break;
          case 500:
            errorMessageText = "Erreur serveur interne. Notre équipe technique a été notifiée et travaille à résoudre le problème.";
            break;
          case 502:
            errorMessageText = "Passerelle incorrecte. Le serveur a reçu une réponse invalide.";
            break;
          case 503:
            errorMessageText = "Service temporairement indisponible. Veuillez réessayer dans quelques minutes.";
            break;
          case 504:
            errorMessageText = "Délai d'attente de la passerelle dépassé. Veuillez réessayer plus tard.";
            break;
          default:
            errorMessageText = `Erreur inattendue (code: ${response.status}). Veuillez réessayer plus tard. Si le problème persiste, contactez notre support.`;
        }
        
        throw new Error(errorMessageText);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: state.isOnline 
          ? handleChatError(error, 'sendMessage')
          : "Désolé, je rencontre un problème de connexion. Veuillez vérifier votre connexion internet et réessayer.",
        sender: 'bot',
        timestamp: new Date(),
        language: 'fr'
      };
      
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        isTyping: false
      }));
      
      // Track fallback usage
      chatbotMonitoring.trackResponseQuality(
        Date.now() - startTime,
        errorMessage.text.length,
        false,
        false,
        true
      );
      
      // Don't re-throw to avoid unhandled promise rejections
    }
  }, [state.sessionId, state.isTTSActive, state.isOnline, state.messages, onTTSRequest, isRateLimited, handleChatError]);

  /**
   * Gère les actions CTA avec scroll, pré-remplissage et redirections
   */
  const handleCTAAction = useCallback(async (cta: any) => {
    try {
      // Track CTA click
      if (cta.id) {
        await ctaService.trackCTAAction(cta.id, state.sessionId, 'click');
      }
      
      // Track CTA click for analytics
      chatbotMonitoring.trackResponseQuality(
        0, // response time not applicable
        0, // response length not applicable
        false, // suggestions not applicable
        true, // CTA click
        false // fallback not applicable
      );
      
      switch (cta.type) {
        case 'contact':
        case 'whatsapp':
          if (cta.data?.phone) {
            const message = cta.data?.message || "Bonjour ! Je souhaite en savoir plus sur vos services OMA Digital.";
            const whatsappUrl = `https://wa.me/${cta.data.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            // Track conversion
            if (cta.id) {
              await ctaService.recordCTAConversion(cta.id, state.sessionId, 'whatsapp_contact');
            }
          } else if (cta.data?.email) {
            const subject = cta.data?.subject || 'Demande d\'information OMA Digital';
            window.open(`mailto:${cta.data.email}?subject=${encodeURIComponent(subject)}`, '_blank');
            if (cta.id) {
              await ctaService.recordCTAConversion(cta.id, state.sessionId, 'email_contact');
            }
          }
          break;
          
        case 'phone':
          if (cta.data?.phone) {
            window.open(`tel:${cta.data.phone}`, '_blank');
            if (cta.id) {
              await ctaService.recordCTAConversion(cta.id, state.sessionId, 'phone_call');
            }
          }
          break;
          
        case 'email':
          if (cta.data?.email) {
            const subject = cta.data?.subject || 'Demande d\'information OMA Digital';
            window.open(`mailto:${cta.data.email}?subject=${encodeURIComponent(subject)}`, '_blank');
            if (cta.id) {
              await ctaService.recordCTAConversion(cta.id, state.sessionId, 'email_contact');
            }
          }
          break;
          
        case 'demo':
        case 'appointment':
        case 'quote':
          // Scroll to contact section and pre-fill service field
          const contactSection = document.getElementById('contact');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            
            // Pre-fill service field if it exists
            setTimeout(() => {
              const serviceField = document.querySelector('input[name="service"], select[name="service"]');
              if (serviceField && cta.data?.service) {
                (serviceField as HTMLInputElement).value = cta.data.service;
              }
            }, 1000);
            
            // Track conversion
            if (cta.id) {
              ctaService.recordCTAConversion(cta.id, state.sessionId, `form_${cta.type}`);
            }
          }
          break;
          
        default:
          if (cta.data?.url) {
            // Open URL in new tab
            window.open(cta.data.url, '_blank');
          }
          break;
      }
    } catch (error) {
      console.error('Error handling CTA action:', error);
      // Fallback: show an error message to the user
      const errorMessage: ChatMessage = {
        id: `cta-error-${Date.now()}`,
        text: "Désolé, je n'ai pas pu effectuer cette action. Veuillez réessayer ou nous contacter directement.",
        sender: 'bot',
        timestamp: new Date(),
        language: 'fr'
      };
      
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage]
      }));
    }
  }, [state.sessionId, ctaService, chatbotMonitoring]);

  /**
   * Gère le clic sur une suggestion
   */
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setState(prev => ({ ...prev, inputText: suggestion }));
  }, []);

  // Initialisation côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isClientRef.current = true;
      setState(prev => ({
        ...prev,
        sessionId: generateSessionId()
      }));
    }
  }, []);

  // Charger l'historique au montage
  useEffect(() => {
    if (isClientRef.current && state.sessionId) {
      loadChatHistory();
      checkApiStatus();
    }
  }, [state.sessionId, loadChatHistory, checkApiStatus]);

  // Auto-scroll quand les messages changent
  useEffect(() => {
    if (chatWindowRef.current && isClientRef.current && state.isNearBottom) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [state.messages, state.isTyping, state.isNearBottom]);

  // Vérification périodique du statut API
  useEffect(() => {
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, [checkApiStatus]);

  // Rate limiting timeout
  useEffect(() => {
    if (isRateLimited) {
      const timer = setTimeout(() => {
        setIsRateLimited(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isRateLimited]);

  return {
    state,
    chatWindowRef,
    isClient: isClientRef.current,
    sendMessage,
    handleSuggestionClick,
    handleCTAAction,
    handleScroll,
    clearChat,
    exportChat,
    updateState
  };
}

