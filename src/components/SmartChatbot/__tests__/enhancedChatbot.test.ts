import { detectLanguage, combineLanguageDetection, prepareTextForLanguageDetection } from '../utils/languageDetection';
import { ChatMessage, ChatResponse } from '../types';

// Mock the Google AI Studio API key
process.env['GOOGLE_AI_API_KEY'] = 'test-api-key';

describe('Enhanced SmartChatbotNext', () => {
  describe('Language Detection', () => {
    test('should detect French correctly', () => {
      expect(detectLanguage('Bonjour, comment ça va?')).toBe('fr');
      expect(detectLanguage('Je voudrais automatiser mon business')).toBe('fr');
      expect(detectLanguage('Prix WhatsApp automation')).toBe('fr');
    });

    test('should detect English correctly', () => {
      expect(detectLanguage('Hello, how are you?')).toBe('en');
      expect(detectLanguage("I'm interested in WhatsApp automation")).toBe('en');
      expect(detectLanguage('What is the price for automation?')).toBe('en');
    });

    test('should prefer French for ambiguous cases', () => {
      expect(detectLanguage('Bonjour')).toBe('fr');
      // For very short ambiguous words, it should default to French for Senegalese market
      expect(detectLanguage('ok')).toBe('fr');
    });

    test('should combine API language detection correctly', () => {
      expect(combineLanguageDetection('fr', 'Hello')).toBe('fr');
      expect(combineLanguageDetection('en', 'Bonjour')).toBe('en');
      expect(combineLanguageDetection(undefined, 'Bonjour')).toBe('fr');
    });

    test('should prepare text for language detection', () => {
      const text = 'Bonjour https://example.com contact@oma.com +212701193811';
      const prepared = prepareTextForLanguageDetection(text);
      expect(prepared).toBe('Bonjour');
    });
  });

  describe('Chat Response Structure', () => {
    test('should have correct structure for chat responses', () => {
      const response: ChatResponse = {
        response: 'Bonjour! Comment puis-je vous aider?',
        language: 'fr',
        suggestions: ['Automatisation WhatsApp', 'Sites web', 'Contact'],
        source: 'ultra_intelligent_rag',
        confidence: 0.95
      };

      expect(response.response).toBeDefined();
      expect(response['language']).toBeDefined();
      expect(response.suggestions).toBeDefined();
      expect(response.source).toBeDefined();
      expect(response.confidence).toBeDefined();
    });

    test('should have correct structure for chat messages', () => {
      const message: ChatMessage = {
        id: 'test-1',
        text: 'Bonjour! Comment puis-je vous aider?',
        sender: 'bot',
        timestamp: new Date(),
        language: 'fr',
        suggestions: ['Automatisation WhatsApp', 'Sites web', 'Contact'],
        source: 'ultra_intelligent_rag',
        confidence: 0.95
      };

      expect(message.id).toBeDefined();
      expect(message.text).toBeDefined();
      expect(message.sender).toBeDefined();
      expect(message.timestamp).toBeDefined();
      expect(message['language']).toBeDefined();
      expect(message.suggestions).toBeDefined();
      expect(message.source).toBeDefined();
      expect(message.confidence).toBeDefined();
    });
  });
});