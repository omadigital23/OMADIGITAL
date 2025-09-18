import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatMessage } from '../ChatMessage';

// Mock window.speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    getVoices: jest.fn().mockReturnValue([])
  },
  writable: true
});

describe('ChatMessage', () => {
  const mockOnSpeak = jest.fn();
  const baseMessage = {
    id: '1',
    text: 'Hello world',
    sender: 'user' as const,
    timestamp: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user message correctly', () => {
    render(<ChatMessage message={baseMessage} onSpeak={mockOnSpeak} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders bot message correctly', () => {
    const botMessage = {
      ...baseMessage,
      sender: 'bot' as const,
      text: 'Hello, how can I help you?'
    };
    
    render(<ChatMessage message={botMessage} onSpeak={mockOnSpeak} />);
    
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
    expect(screen.getByText('Bot')).toBeInTheDocument();
  });

  it('shows voice indicator for voice messages', () => {
    const voiceMessage = {
      ...baseMessage,
      isVoice: true
    };
    
    render(<ChatMessage message={voiceMessage} onSpeak={mockOnSpeak} />);
    
    expect(screen.getByText('Vocal')).toBeInTheDocument();
  });

  it('calls onSpeak when voice button is clicked for bot messages', () => {
    const botMessage = {
      ...baseMessage,
      sender: 'bot' as const,
      text: 'This is a bot message'
    };
    
    render(<ChatMessage message={botMessage} onSpeak={mockOnSpeak} />);
    
    const speakButton = screen.getByLabelText('Lire le message');
    fireEvent.click(speakButton);
    
    expect(mockOnSpeak).toHaveBeenCalledWith('This is a bot message');
  });

  it('does not show speak button for user messages', () => {
    render(<ChatMessage message={baseMessage} onSpeak={mockOnSpeak} />);
    
    const speakButtons = screen.queryAllByLabelText('Lire le message');
    expect(speakButtons).toHaveLength(0);
  });

  it('displays timestamp correctly', () => {
    const date = new Date('2023-01-01T12:00:00');
    const messageWithDate = {
      ...baseMessage,
      timestamp: date
    };
    
    render(<ChatMessage message={messageWithDate} onSpeak={mockOnSpeak} />);
    
    // Should display time in French format
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });
});