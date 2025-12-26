import { useState, useCallback, useEffect } from 'react'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

const STORAGE_KEY = 'oma_chatbot_messages'
const MAX_STORED_MESSAGES = 50

// Helper to serialize/deserialize messages with Date objects
function serializeMessages(messages: Message[]): string {
  return JSON.stringify(messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp.toISOString()
  })))
}

function deserializeMessages(data: string): Message[] {
  try {
    const parsed = JSON.parse(data)
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  } catch {
    return []
  }
}

export function useChatLogic() {
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const loadedMessages = deserializeMessages(stored)
        setMessages(loadedMessages)
      }
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      // Keep only the last MAX_STORED_MESSAGES
      const messagesToStore = messages.slice(-MAX_STORED_MESSAGES)
      localStorage.setItem(STORAGE_KEY, serializeMessages(messagesToStore))
    }
  }, [messages])

  const addMessage = useCallback((content: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setSuggestions([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    addMessage(userMessage, false)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const botResponse = data.response || "Désolé, je n'ai pas pu traiter votre demande."

      addMessage(botResponse, true)
      setSuggestions(data.suggestions || [])
      return botResponse
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = "Désolé, une erreur s'est produite. Veuillez réessayer."
      addMessage(errorMessage, true)
      return errorMessage
    } finally {
      setIsLoading(false)
    }
  }, [messages, addMessage])

  return {
    messages,
    suggestions,
    sendMessage,
    isLoading,
    addMessage,
    clearMessages
  }
}