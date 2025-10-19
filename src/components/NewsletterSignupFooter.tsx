/**
 * NewsletterSignupFooter Component
 * 
 * @description Version compacte du formulaire newsletter pour le footer
 * @accessibility WCAG 2.1 AA - Labels, contraste, focus visible
 * @performance Optimisé, pas de dépendances lourdes
 */

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Send } from 'lucide-react';

export function NewsletterSignupFooter() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            {t('newsletter.placeholder')}
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            placeholder={t('newsletter.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none transition-all text-sm"
            required
            disabled={isSubmitting}
            aria-describedby={status !== 'idle' ? 'newsletter-status' : undefined}
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          disabled={isSubmitting}
          aria-label={t('newsletter.subscribe')}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              <span>{t('newsletter.subscribe')}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{t('newsletter.subscribe')}</span>
            </>
          )}
        </button>
      </form>

      {/* Status Messages */}
      {status === 'success' && (
        <p 
          id="newsletter-status"
          className="text-green-400 text-xs flex items-center gap-1"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">✓</span>
          <span>{t('newsletter.success')}</span>
        </p>
      )}
      
      {status === 'error' && (
        <p 
          id="newsletter-status"
          className="text-red-400 text-xs flex items-center gap-1"
          role="alert"
          aria-live="assertive"
        >
          <span aria-hidden="true">✗</span>
          <span>{t('newsletter.error')}</span>
        </p>
      )}

      {/* Privacy Notice */}
      <p className="text-gray-400 text-xs leading-relaxed">
        {t('newsletter.privacy')}
      </p>
    </div>
  );
}
