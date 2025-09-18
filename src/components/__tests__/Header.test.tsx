import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../Header';

// Mock the tracking functions
jest.mock('../../utils/supabase/info', () => ({
  trackEvent: jest.fn(),
  generateWhatsAppLink: jest.fn().mockReturnValue('https://wa.me/1234567890'),
}));

describe('Header', () => {
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('renders the logo and company name', () => {
    render(<Header />);
    
    expect(screen.getByText('OMA Digital')).toBeInTheDocument();
    expect(screen.getByText('IA & Automatisation')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(<Header />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Études de cas')).toBeInTheDocument();
    expect(screen.getByText('Processus')).toBeInTheDocument();
    expect(screen.getByText('Blog IA')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Header />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // After clicking, the menu should be open
    expect(screen.getByText('Demander un devis')).toBeInTheDocument();
    
    // Click again to close
    fireEvent.click(menuButton);
    // The menu should be closed now
  });

  it('calls scrollToSection when navigation items are clicked', () => {
    render(<Header />);
    
    // Mock the DOM methods
    const mockScrollIntoView = jest.fn();
    global.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    global.document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    });
    
    fireEvent.click(screen.getByText('Services'));
    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it('opens search modal when search button is clicked', () => {
    render(<Header />);
    
    const searchButton = screen.getByRole('button', { name: /rechercher/i });
    fireEvent.click(searchButton);
    
    expect(screen.getByPlaceholderText(/rechercher des services/i)).toBeInTheDocument();
  });
});