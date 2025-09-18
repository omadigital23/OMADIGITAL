import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroSection } from '../HeroSection';

// Mock the tracking functions
jest.mock('../../utils/supabase/info', () => ({
  trackEvent: jest.fn(),
  generateWhatsAppLink: jest.fn().mockReturnValue('https://wa.me/1234567890'),
}));

// Mock video element
HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.pause = jest.fn();

describe('HeroSection', () => {
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('renders the main heading and subtitle', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Votre partenaire digital au Sénégal')).toBeInTheDocument();
    expect(screen.getByText('Automatisation WhatsApp, Sites Ultra-Rapides & IA')).toBeInTheDocument();
  });

  it('renders slide indicators', () => {
    render(<HeroSection />);
    
    const indicators = screen.getAllByRole('button');
    // Should have at least 5 slide indicators
    expect(indicators.length).toBeGreaterThanOrEqual(5);
  });

  it('calls scrollToContact when primary CTA is clicked', () => {
    render(<HeroSection />);
    
    // Mock the DOM methods
    const mockScrollIntoView = jest.fn();
    global.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    global.document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    });
    
    const ctaButton = screen.getByText('Démarrer maintenant');
    fireEvent.click(ctaButton);
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('opens WhatsApp link when WhatsApp button is clicked', () => {
    render(<HeroSection />);
    
    const mockOpen = jest.fn();
    global.window.open = mockOpen;
    
    const whatsappButton = screen.getByText('💬 WhatsApp Direct');
    fireEvent.click(whatsappButton);
    
    expect(mockOpen).toHaveBeenCalledWith('https://wa.me/1234567890', '_blank');
  });
});