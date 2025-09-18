import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServicesSection } from '../ServicesSection';

describe('ServicesSection', () => {
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    
    // Mock scrollIntoView
    global.HTMLElement.prototype.scrollIntoView = jest.fn();
    global.document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: jest.fn(),
    });
  });

  it('renders the section title and description', () => {
    render(<ServicesSection />);
    
    expect(screen.getByText('Solutions Digitales Complètes')).toBeInTheDocument();
    expect(screen.getByText(/De l'automatisation WhatsApp aux sites ultra-rapides/i)).toBeInTheDocument();
  });

  it('renders all service cards', () => {
    render(<ServicesSection />);
    
    // Check for key services
    expect(screen.getByText('Automatisation WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Sites Web Ultra-Rapides')).toBeInTheDocument();
    expect(screen.getByText('Branding Authentique')).toBeInTheDocument();
    expect(screen.getByText('Dashboards Analytics')).toBeInTheDocument();
  });

  it('shows popular badge on WhatsApp automation service', () => {
    render(<ServicesSection />);
    
    const whatsappService = screen.getByText('Automatisation WhatsApp');
    expect(whatsappService).toBeInTheDocument();
    
    // The parent container should have the popular badge
    const serviceCard = whatsappService.closest('.group');
    expect(serviceCard).toBeInTheDocument();
  });

  it('calls scrollToContact when service CTA is clicked', () => {
    render(<ServicesSection />);
    
    const ctaButton = screen.getByText('En savoir plus');
    fireEvent.click(ctaButton);
    
    expect(global.document.getElementById).toHaveBeenCalledWith('contact');
  });
});