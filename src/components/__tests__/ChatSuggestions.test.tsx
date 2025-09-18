import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatSuggestions } from '../ChatSuggestions';

describe('ChatSuggestions', () => {
  const mockSuggestions = [
    {
      id: '1',
      text: 'Suggestion 1',
      action: 'Action 1',
      icon: '💬',
      type: 'whatsapp' as const
    },
    {
      id: '2',
      text: 'Suggestion 2',
      action: 'Action 2',
      icon: '⚡',
      type: 'quote' as const
    }
  ];

  const mockOnSuggestionClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders suggestions correctly', () => {
    render(<ChatSuggestions suggestions={mockSuggestions} onSuggestionClick={mockOnSuggestionClick} />);
    
    expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
  });

  it('calls onSuggestionClick when suggestion is clicked', () => {
    render(<ChatSuggestions suggestions={mockSuggestions} onSuggestionClick={mockOnSuggestionClick} />);
    
    const suggestionButton = screen.getByText('Suggestion 1');
    fireEvent.click(suggestionButton);
    
    expect(mockOnSuggestionClick).toHaveBeenCalledWith('Action 1');
  });

  it('shows correct icons for suggestions', () => {
    render(<ChatSuggestions suggestions={mockSuggestions} onSuggestionClick={mockOnSuggestionClick} />);
    
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });
});