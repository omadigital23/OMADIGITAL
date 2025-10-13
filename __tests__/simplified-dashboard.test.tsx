import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimplifiedDashboard } from '../src/components/admin/SimplifiedDashboard';

// Mock the fetch API
global.fetch = jest.fn();

describe('SimplifiedDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<SimplifiedDashboard />);
    
    expect(screen.getByText('Tableau de Bord Simplifié')).toBeInTheDocument();
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('renders newsletter data correctly', async () => {
    const mockNewsletterData = {
      total_subscribers: 100,
      active_subscribers: 80,
      pending_subscribers: 20,
      new_this_week: 10,
      conversion_rate: 75.5
    };

    const mockCTAData = {
      total_views: 500,
      total_clicks: 150,
      total_conversions: 30,
      click_rate: 30
    };

    const mockChatbotData = {
      total_interactions: 200,
      avg_confidence: 0.85,
      avg_response_time: 1200,
      daily_interactions: 25
    };

    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('newsletter-analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              dashboard: mockNewsletterData
            }
          })
        });
      } else if (url.includes('cta-management')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            eventCounts: {
              'page_view': 350,
              'cta_click': 150,
              'conversion': 30
            }
          })
        });
      } else if (url.includes('chatbot-interactions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            stats: mockChatbotData
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SimplifiedDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Check newsletter data
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('75.50%')).toBeInTheDocument();

    // Check CTA data
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    // Check chatbot data
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('1.2s')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    );

    render(<SimplifiedDashboard />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
    });
  });
});