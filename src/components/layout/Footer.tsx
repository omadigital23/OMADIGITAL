'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BUSINESS, FRONTEND_SERVICE_PAGES, getSupportPagePath, NAV_ITEMS, resolveLocalizedPath } from '@/lib/constants';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('sending');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyWebsite,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribed(true);
        setEmail('');
        setCompanyWebsite('');
        setNewsletterStatus('success');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <footer className="bg-bg-secondary border-t border-border-subtle">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="block mb-4">
              <Image
                src="/images/logo.png"
                alt="OMA Digital"
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              {['facebook', 'instagram', 'linkedin', 'twitter'].map((s) => (
                <a
                  key={s}
                  href={BUSINESS.social[s as keyof typeof BUSINESS.social]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-bg-glass border border-border-subtle flex items-center justify-center text-text-muted hover:text-accent-violet hover:border-accent-violet/30 transition-all"
                  aria-label={s}
                >
                  <SocialIcon name={s} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary mb-4">
              {t('footer.servicesTitle')}
            </h3>
            <ul className="space-y-2.5">
              {FRONTEND_SERVICE_PAGES.map((page) => (
                <li key={page.labelKey}>
                  <Link
                    href={resolveLocalizedPath(page.slug, locale)}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {t(`services.${page.labelKey.replace('services.', '')}`)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={getSupportPagePath(locale)}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  {t('services.supportSoftware')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary mb-4">
              {t('footer.resources')}
            </h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.filter((item) => item.labelKey !== 'nav.support').map((item) => (
                <li key={item.labelKey}>
                  <Link
                    href={resolveLocalizedPath(item.href, locale)}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {t(item.labelKey.replace('nav.', 'nav.'))}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-text-primary mb-4">
              {t('footer.newsletter')}
            </h3>
            {subscribed ? (
              <p className="text-accent-cyan text-sm" role="status">{t('footer.newsletterSuccess')}</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  name="companyWebsite"
                  aria-hidden="true"
                  className="hidden"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-primary border border-border-subtle text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-violet transition-colors"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'sending'}
                  className="gradient-bg text-white text-sm font-medium py-2.5 rounded-lg hover:shadow-glow transition-all"
                >
                  {newsletterStatus === 'sending' ? '...' : t('footer.newsletterButton')}
                </button>
                {newsletterStatus === 'error' && (
                  <p className="text-accent-coral text-sm" role="alert">{t('footer.newsletterError')}</p>
                )}
              </form>
            )}
            {/* Contact info */}
            <div className="mt-6 space-y-2 text-sm text-text-muted">
              <p>📍 {BUSINESS.location.city}, {BUSINESS.location.country}</p>
              <p>📧 {BUSINESS.email}</p>
              <p>📱 {BUSINESS.phone}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <span>{t('footer.privacy')}</span>
            <span>{t('footer.terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
    instagram: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7.5a1 1 0 110-2 1 1 0 010 2z',
    linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z',
    twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7.5v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
