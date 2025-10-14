/**
 * Tests for SocialMediaLinks Component
 * @module components/__tests__/SocialMediaLinks
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialMediaLinks, SocialShareButtons } from '../SocialMediaLinks';

describe('SocialMediaLinks', () => {
  describe('Rendering', () => {
    it('renders all social media links', () => {
      render(<SocialMediaLinks />);
      
      // Check for all social media platforms
      expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Instagram/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/TikTok/i)).toBeInTheDocument();
    });

    it('renders with labels when showLabels is true', () => {
      render(<SocialMediaLinks showLabels={true} />);
      
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    it('renders horizontally by default', () => {
      const { container } = render(<SocialMediaLinks />);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('space-x-3');
    });

    it('renders vertically when variant is vertical', () => {
      const { container } = render(<SocialMediaLinks variant="vertical" />);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      expect(wrapper).toHaveClass('space-y-3');
    });

    it('renders in grid when variant is grid', () => {
      const { container } = render(<SocialMediaLinks variant="grid" />);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('grid');
      expect(wrapper).toHaveClass('grid-cols-2');
      expect(wrapper).toHaveClass('gap-3');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<SocialMediaLinks />);
      
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('has navigation role on container', () => {
      const { container } = render(<SocialMediaLinks />);
      const nav = container.querySelector('[role="navigation"]');
      
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Réseaux sociaux OMA Digital');
    });

    it('has proper rel attributes for external links', () => {
      render(<SocialMediaLinks />);
      
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('Security', () => {
    it('uses noopener noreferrer for all external links', () => {
      render(<SocialMediaLinks />);
      
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        const rel = link.getAttribute('rel');
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
      });
    });

    it('opens links in new tab', () => {
      render(<SocialMediaLinks />);
      
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('URLs', () => {
    it('has correct Facebook URL', () => {
      render(<SocialMediaLinks />);
      
      const facebookLink = screen.getByLabelText(/Facebook/i);
      expect(facebookLink).toHaveAttribute('href', 'https://web.facebook.com/profile.php?id=61579740432372');
    });

    it('has correct Twitter/X URL', () => {
      render(<SocialMediaLinks />);
      
      const twitterLink = screen.getByLabelText(/Twitter/i);
      expect(twitterLink).toHaveAttribute('href', 'https://x.com/omadigital23');
    });

    it('has correct Instagram URL', () => {
      render(<SocialMediaLinks />);
      
      const instagramLink = screen.getByLabelText(/Instagram/i);
      expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/omadigital123');
    });

    it('has correct TikTok URL', () => {
      render(<SocialMediaLinks />);
      
      const tiktokLink = screen.getByLabelText(/TikTok/i);
      expect(tiktokLink).toHaveAttribute('href', 'https://www.tiktok.com/@omadigital23');
    });
  });
});

describe('SocialShareButtons', () => {
  const mockProps = {
    url: 'https://www.omadigital.net/blog/test-article',
    title: 'Test Article',
    description: 'Test Description',
  };

  describe('Rendering', () => {
    it('renders all share buttons', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      const buttons = screen.getAllByRole('link');
      expect(buttons).toHaveLength(4); // Facebook, Twitter, LinkedIn, WhatsApp
    });

    it('has proper ARIA labels', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      expect(screen.getByLabelText(/Partager sur Facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Partager sur X/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Partager sur LinkedIn/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Partager sur WhatsApp/i)).toBeInTheDocument();
    });
  });

  describe('Share URLs', () => {
    it('generates correct Facebook share URL', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      const facebookButton = screen.getByLabelText(/Partager sur Facebook/i);
      const href = facebookButton.getAttribute('href');
      
      expect(href).toContain('facebook.com/sharer/sharer.php');
      expect(href).toContain(encodeURIComponent(mockProps.url));
    });

    it('generates correct Twitter share URL', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      const twitterButton = screen.getByLabelText(/Partager sur X/i);
      const href = twitterButton.getAttribute('href');
      
      expect(href).toContain('twitter.com/intent/tweet');
      expect(href).toContain(encodeURIComponent(mockProps.url));
      expect(href).toContain(encodeURIComponent(mockProps.title));
    });

    it('generates correct LinkedIn share URL', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      const linkedinButton = screen.getByLabelText(/Partager sur LinkedIn/i);
      const href = linkedinButton.getAttribute('href');
      
      expect(href).toContain('linkedin.com/sharing/share-offsite');
      expect(href).toContain(encodeURIComponent(mockProps.url));
    });

    it('generates correct WhatsApp share URL', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      const whatsappButton = screen.getByLabelText(/Partager sur WhatsApp/i);
      const href = whatsappButton.getAttribute('href');
      
      expect(href).toContain('wa.me');
      expect(href).toContain(encodeURIComponent(mockProps.title));
      expect(href).toContain(encodeURIComponent(mockProps.url));
    });
  });

  describe('Security', () => {
    it('properly encodes URL parameters', () => {
      const propsWithSpecialChars = {
        url: 'https://example.com/test?param=value&other=123',
        title: 'Test & Special <Characters>',
        description: 'Description with "quotes" and \'apostrophes\'',
      };

      render(<SocialShareButtons {...propsWithSpecialChars} />);
      
      const buttons = screen.getAllByRole('link');
      buttons.forEach((button) => {
        const href = button.getAttribute('href');
        // Check that special characters are encoded
        expect(href).not.toContain('<');
        expect(href).not.toContain('>');
        expect(href).not.toContain('&param='); // Should be encoded
      });
    });

    it('uses noopener noreferrer for security', () => {
      render(<SocialShareButtons {...mockProps} />);
      
      const buttons = screen.getAllByRole('link');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});
