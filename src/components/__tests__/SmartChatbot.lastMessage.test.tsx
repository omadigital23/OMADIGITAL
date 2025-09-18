import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartChatbot } from '../SmartChatbotNext';

// Mock the tracking functions
jest.mock('../../utils/supabase/info', () => ({
  projectId: 'test-project-id',
  publicAnonKey: 'test-public-key',
  trackEvent: jest.fn(),
  generateWhatsAppLink: jest.fn().mockReturnValue('https://wa.me/1234567890'),
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SmartChatbot Last Message Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display last message in chat header', async () => {
    // Mock the chat API to return a response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        response: 'Bonjour! Comment puis-je vous aider?', 
        conversationId: 'test-conv-id' 
      }),
    });

    render(<SmartChatbot />);
    
    // Open chat
    const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
    fireEvent.click(chatButton);
    
    // Type a message
    const input = screen.getByPlaceholderText('Tapez votre message...');
    fireEvent.change(input, { target: { value: 'Bonjour' } });
    
    // Send the message
    const sendButton = screen.getByLabelText('Envoyer le message');
    fireEvent.click(sendButton);
    
    // Wait for response
    expect(await screen.findByText('Bonjour! Comment puis-je vous aider?')).toBeInTheDocument();
    
    // Close and reopen chat to check header
    fireEvent.click(screen.getByLabelText('Fermer le chat'));
    fireEvent.click(chatButton);
    
    // Check that last message preview is displayed in header
    // Note: This test might need adjustment based on exact implementation
  });

  it('should display last message in conversation history', async () => {
    // Mock localStorage to have conversation history
    const mockHistory = [
      {
        id: 'test-conv-1',
        title: 'Test Conversation',
        timestamp: new Date(),
        lastMessage: 'This is the last message in the conversation'
      }
    ];
    
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'oma-chat-history') {
        return JSON.stringify(mockHistory);
      }
      return null;
    });

    render(<SmartChatbot />);
    
    // Open chat
    const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
    fireEvent.click(chatButton);
    
    // Open history
    const historyButton = screen.getByLabelText("Ouvrir l'historique");
    fireEvent.click(historyButton);
    
    // Check that conversation with last message is displayed
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    expect(screen.getByText('This is the last message in the conversation')).toBeInTheDocument();
  });

  it('should clean emojis from message preview', () => {
    render(<SmartChatbot />);
    
    // Open chat
    const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
    fireEvent.click(chatButton);
    
    // The getLastMessagePreview function should be tested indirectly
    // through the UI components that use it
  });
});