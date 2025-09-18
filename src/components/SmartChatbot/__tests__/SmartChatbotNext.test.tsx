import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartChatbotNext } from '../index';

// Mock des modules
jest.mock('../../../lib/analytics', () => ({
  generateSessionId: jest.fn(() => 'test-session-id'),
  getChatbotInteractions: jest.fn(() => Promise.resolve([])),
  trackChatbotInteraction: jest.fn(() => Promise.resolve())
}));

jest.mock('../../../utils/security-monitoring', () => ({
  logSuspiciousInput: jest.fn()
}));

jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((input) => input)
}));

// Mock window.speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    speaking: false,
    pending: false
  }
});

// Mock fetch
global.fetch = jest.fn();

describe('SmartChatbotNext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        response: 'Test response',
        language: 'fr',
        suggestions: ['Test suggestion'],
        cta: null
      })
    });
  });

  test('renders chat button initially', async () => {
    render(<SmartChatbotNext />);
    
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      expect(chatButton).toBeInTheDocument();
    });
  });

  test('opens chat window when button is clicked', async () => {
    render(<SmartChatbotNext />);
    
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    await waitFor(() => {
      const chatHeader = screen.getByText('Assistant IA OMADIGITAL');
      expect(chatHeader).toBeInTheDocument();
    });
  });

  test('handles text input submission', async () => {
    render(<SmartChatbotNext />);
    
    // Ouvrir le chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Trouver l'input et soumettre un message
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Tapez votre message...');
      fireEvent.change(input, { target: { value: 'Bonjour' } });
      
      const submitButton = screen.getByLabelText('Envoyer le message');
      fireEvent.click(submitButton);
    });

    // Vérifier que fetch a été appelé
    expect(global.fetch).toHaveBeenCalledWith('/api/chat/send', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('Bonjour')
    }));
  });

  test('toggles TTS functionality', async () => {
    render(<SmartChatbotNext />);
    
    // Ouvrir le chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Trouver et cliquer sur le bouton TTS
    await waitFor(() => {
      const ttsButton = screen.getByLabelText('Désactiver la synthèse vocale');
      expect(ttsButton).toBeInTheDocument();
      fireEvent.click(ttsButton);
    });
  });

  test('handles security validation', async () => {
    render(<SmartChatbotNext />);
    
    // Ouvrir le chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Essayer d'envoyer un message suspect
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Tapez votre message...');
      fireEvent.change(input, { target: { value: '<script>alert("xss")</script>' } });
      
      const submitButton = screen.getByLabelText('Envoyer le message');
      fireEvent.click(submitButton);
    });

    // Vérifier qu'un message d'erreur apparaît
    await waitFor(() => {
      expect(screen.getByText(/contient du contenu non autorisé/)).toBeInTheDocument();
    });
  });

  test('exports chat history', async () => {
    // Mock createElement et click
    const mockAnchor = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn()
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation();

    render(<SmartChatbotNext />);
    
    // Ouvrir le chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Cliquer sur export
    await waitFor(() => {
      const exportButton = screen.getByLabelText('Exporter la conversation');
      fireEvent.click(exportButton);
    });

    expect(mockAnchor.click).toHaveBeenCalled();
  });

  test('clears chat history', async () => {
    render(<SmartChatbotNext />);
    
    // Ouvrir le chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Cliquer sur clear
    await waitFor(() => {
      const clearButton = screen.getByLabelText('Effacer la conversation');
      fireEvent.click(clearButton);
    });

    // Vérifier que le message de bienvenue est présent
    await waitFor(() => {
      expect(screen.getByText(/Salut ! Je suis l'assistant IA d'OMADIGITAL/)).toBeInTheDocument();
    });
  });
});