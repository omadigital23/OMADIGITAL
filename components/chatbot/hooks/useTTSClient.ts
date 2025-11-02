import { useState, useCallback } from 'react'

export function useTTSClient() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text: string) => {
    if (!text || isSpeaking) return

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported')
      return
    }

    try {
      setIsSpeaking(true)
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
    }
  }, [isSpeaking])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stopSpeaking,
    isSpeaking
  }
}