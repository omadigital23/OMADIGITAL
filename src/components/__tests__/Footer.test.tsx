import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../Footer';

describe('Footer', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    global.HTMLElement.prototype.scrollIntoView = jest.fn();
    global.document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: jest.fn(),
    });
  });

  it('renders company information and contact details', () => {
    render(<Footer />);
    
    expect(screen.getByText('OMA')).toBeInTheDocument();
    expect(screen.getByText(/Votre partenaire digital au Sénégal/i)).toBeInTheDocument();
    
    // Check contact information
    expect(screen.getByText('Liberté 6, Dakar')).toBeInTheDocument();
    expect(screen.getByText('+212 701 193 811')).toBeInTheDocument();
    expect(screen.getByText('contact@oma-digital.sn')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Études de cas')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
  });

  it('scrolls to top when back to top button is clicked', () => {
    render(<Footer />);
    
    const scrollToMock = jest.fn();
    global.window.scrollTo = scrollToMock;
    
    const topButton = screen.getByLabelText('Retour en haut');
    fireEvent.click(topButton);
    
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls to section when navigation link is clicked', () => {
    render(<Footer />);
    
    const servicesLink = screen.getByText('Services');
    fireEvent.click(servicesLink);
    
    expect(global.document.getElementById).toHaveBeenCalledWith('services');
  });
});