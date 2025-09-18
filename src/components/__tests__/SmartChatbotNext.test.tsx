import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartChatbotNext } from '../SmartChatbotNext';

// Mock the necessary modules
jest.mock('../../lib/analytics', () => ({
  generateSessionId: jest.fn(() => 'test-session-id'),
  getChatbotInteractions: jest.fn(() => Promise.resolve([])),
  trackChatbotInteraction: jest.fn(() => Promise.resolve())
}));

jest.mock('../../utils/security-monitoring', () => ({
  logSuspiciousInput: jest.fn()
}));

// Mock DOMPurify
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

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ])
    })
  }
});

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = jest.fn().mockReturnValue(true);
  ondataavailable = jest.fn();
  onstop = jest.fn();
  start = jest.fn();
  stop = jest.fn();
  
  constructor(stream: MediaStream) {}
}

Object.defineProperty(window, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true
});

describe('SmartChatbotNext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders chat button initially', () => {
    render(<SmartChatbotNext />);
    
    // Wait for client-side rendering
    waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      expect(chatButton).toBeInTheDocument();
    });
  });

  test('opens chat window when button is clicked', async () => {
    render(<SmartChatbotNext />);
    
    // Wait for client-side rendering
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Check if chat window is opened
    await waitFor(() => {
      const chatHeader = screen.getByText('Assistant IA OMADIGITAL');
      expect(chatHeader).toBeInTheDocument();
    });
  });

  test('toggles TTS functionality', async () => {
    render(<SmartChatbotNext />);
    
    // Open chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Find TTS button
    await waitFor(() => {
      const ttsButton = screen.getByLabelText('Désactiver la synthèse vocale');
      expect(ttsButton).toBeInTheDocument();
      
      // Toggle TTS
      fireEvent.click(ttsButton);
    });
  });

  test('handles text input submission', async () => {
    render(<SmartChatbotNext />);
    
    // Open chat
    await waitFor(() => {
      const chatButton = screen.getByLabelText('Ouvrir le chat OMA');
      fireEvent.click(chatButton);
    });
    
    // Find input and submit a message
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Tapez votre message...');
      fireEvent.change(input, { target: { value: 'Bonjour' } });
      
      const submitButton = screen.getByLabelText('Envoyer le message');
      fireEvent.click(submitButton);
    });
  });
});
