import { useState, useCallback } from 'react'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

export function useChatLogic() {
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
    addMessage
  }
}