import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageSwitcher } from '../LanguageSwitcher';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'fr',
      changeLanguage: jest.fn(),
    },
    t: (key: string) => key,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with current language', () => {
    render(<LanguageSwitcher />);
    
    expect(screen.getByLabelText('Changer de langue')).toBeInTheDocument();
    // We can't easily test the text content because it's dynamic
  });

  it('should show language options when clicked', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('Changer de langue');
    fireEvent.click(button);
    
    // Check that language options are present
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    // Wolof has been removed
    expect(screen.queryByText('Wolof')).not.toBeInTheDocument();
  });

  it('should change language when option is selected', () => {
    const mockChangeLanguage = jest.fn();
    
    // Mock the useTranslation hook to return our mock function
    jest.spyOn(require('react-i18next'), 'useTranslation').mockReturnValue({
      i18n: {
        language: 'fr',
        changeLanguage: mockChangeLanguage,
      },
      t: (key: string) => key,
    });
    
    render(<LanguageSwitcher />);
    
    // Click on English option
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});