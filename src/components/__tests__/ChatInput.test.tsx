import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const mockProps = {
    inputText: '',
    setInputText: jest.fn(),
    handleSubmit: jest.fn(),
    handleKeyDown: jest.fn(),
    isRecording: false,
    startVoiceRecording: jest.fn(),
    stopVoiceRecording: jest.fn(),
    cancelVoiceRecording: jest.fn(),
    isTyping: false,
    isRateLimited: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field correctly', () => {
    render(<ChatInput {...mockProps} />);
    
    expect(screen.getByPlaceholderText('Tapez votre message...')).toBeInTheDocument();
  });

  it('shows send button when there is text', () => {
    const propsWithText = {
      ...mockProps,
      inputText: 'Hello'
    };
    
    render(<ChatInput {...propsWithText} />);
    
    expect(screen.getByLabelText('Envoyer le message')).toBeInTheDocument();
  });

  it('hides send button when there is no text', () => {
    render(<ChatInput {...mockProps} />);
    
    const sendButtons = screen.queryAllByLabelText('Envoyer le message');
    expect(sendButtons).toHaveLength(0);
  });

  it('shows recording button with correct state', () => {
    render(<ChatInput {...mockProps} />);
    
    const recordButton = screen.getByLabelText('Commencer l\'enregistrement vocal');
    expect(recordButton).toBeInTheDocument();
    expect(recordButton).not.toHaveClass('bg-red-500');
  });

  it('shows stop recording button when recording', () => {
    const propsRecording = {
      ...mockProps,
      isRecording: true
    };
    
    render(<ChatInput {...propsRecording} />);
    
    const stopButton = screen.getByLabelText('Arrêter l\'enregistrement');
    expect(stopButton).toBeInTheDocument();
    expect(stopButton).toHaveClass('bg-red-500');
  });

  it('calls handleSubmit when form is submitted', () => {
    const propsWithText = {
      ...mockProps,
      inputText: 'Hello'
    };
    
    render(<ChatInput {...propsWithText} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it('shows rate limit message when rate limited', () => {
    const propsRateLimited = {
      ...mockProps,
      isRateLimited: true
    };
    
    render(<ChatInput {...propsRateLimited} />);
    
    expect(screen.getByText('Trop de messages envoyés. Veuillez ralentir.')).toBeInTheDocument();
  });

  it('shows transcribed text when available', () => {
    const propsWithTranscription = {
      ...mockProps,
      transcribedText: 'Transcribed message'
    };
    
    render(<ChatInput {...propsWithTranscription} />);
    
    expect(screen.getByText('Transcription: Transcribed message')).toBeInTheDocument();
  });

  it('calls setInputText when clear transcription button is clicked', () => {
    const mockSetInputText = jest.fn();
    const propsWithTranscription = {
      ...mockProps,
      transcribedText: 'Transcribed message',
      setInputText: mockSetInputText
    };
    
    render(<ChatInput {...propsWithTranscription} />);
    
    const clearButton = screen.getByText('✕');
    fireEvent.click(clearButton);
    
    expect(mockSetInputText).toHaveBeenCalledWith('');
  });
});