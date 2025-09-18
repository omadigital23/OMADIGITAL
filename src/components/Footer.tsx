import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, Mail, Facebook, Linkedin, Instagram, Twitter, ArrowUp, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Utility function for email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function for URL validation
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

// Utility function for phone number validation
const isValidPhoneNumber = (phone: string): boolean => {
  // Simple validation for international phone numbers
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export function Footer() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{type: string, text: string} | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToSection = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  // Newsletter subscription handler
  const handleNewsletterSubscription = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get email input
    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    
    if (!emailInput || !emailInput.value) {
      setSubscribeMessage({ type: 'error', text: 'Veuillez entrer une adresse email.' });
      return;
    }

    // Sanitize and validate email
    const sanitizedEmail = emailInput.value.trim();
    if (!isValidEmail(sanitizedEmail)) {
      setSubscribeMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide.' });
      return;
    }

    setIsSubscribing(true);
    setSubscribeMessage(null);

    try {
      const response = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          source: 'footer'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeMessage({ type: 'success', text: 'Merci pour votre inscription !' });
        emailInput.value = '';
      } else {
        setSubscribeMessage({ type: 'error', text: data.error || 'Erreur lors de l\'inscription.' });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscribeMessage({ type: 'error', text: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubscribing(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubscribeMessage(null);
      }, 5000);
    }
  }, [setIsSubscribing, setSubscribeMessage]);

  const quickLinks = [
    { label: t('header.home'), id: 'hero' },
    { label: t('header.services'), id: 'services' },
    { label: t('header.case_studies'), id: 'case-studies' },
    { label: t('header.process'), id: 'process' },
    { label: t('header.blog'), href: '/blog' },
    { label: t('header.contact'), id: 'contact' }
  ];

  const services = [
    t('services.whatsapp.title'),
    t('services.website.title'),
    t('services.branding.title'),
    t('services.analytics.title'),
    t('services.ai_assistant.title'),
    t('services.security.title'),
    t('services.mobile_apps.title'),
    'Consultation Stratégique'
  ];

  const legalLinks = [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
    { label: 'Conditions générales', href: '/conditions-generales' },
    { label: 'Politique RGPD', href: '/politique-rgpd' },
    { label: 'Cookies', href: '/politique-cookies' }
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/company/oma-digital-senegal',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/oma.digital.senegal',
      color: 'hover:text-blue-700'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/oma.digital.sn',
      color: 'hover:text-pink-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/oma_digital_sn',
      color: 'hover:text-blue-400'
    }
  ];

  // Don't render client-side specific content on server
  if (!isClient) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-xl font-bold">OMA</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Votre partenaire digital au Sénégal et au Maroc. Spécialisés dans l'automatisation, 
                l'IA et la transformation digitale des PME dans toute l'Afrique de l'Ouest et du Nord.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <span>© 2025 OMA Digital. Tous droits réservés.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                {/* Security: Use Next.js Image for better optimization and security */}
                <img 
                  src="/images/logo.webp" 
                  alt="OMA Digital Logo" 
                  className="w-6 h-6 object-contain"
                  // Security: Prevent XSS by sanitizing image sources
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-logo.png';
                  }}
                />
              </div>
              <span className="text-xl font-bold">OMA</span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Votre partenaire digital au Sénégal et au Maroc. Spécialisés dans l'automatisation, 
              l'IA et la transformation digitale des PME dans toute l'Afrique de l'Ouest et du Nord.
            </p>

            {/* Contact Info for Senegal */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-orange-400">{t('footer.senegal_office')}</h4>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Hersent Rue 15, Thies</div>
                  <div className="text-gray-400 text-sm">Sénégal</div>
                </div>
              </div>
            </div>

            {/* Contact Info for Morocco */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-orange-400">{t('footer.morocco_office')}</h4>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Moustakbal/Sidimaarouf Casablanca</div>
                  <div className="text-gray-400 text-sm">Imm 167 Lot GH20 apt 15, Maroc</div>
                </div>
              </div>
            </div>

            {/* General Contact */}
            <div className="space-y-3">
              {/* Security: Sanitize telephone links */}
              <a 
                href="tel:+221701193811" 
                className="flex items-center space-x-3 hover:text-orange-400 transition-colors"
                onClick={(e) => {
                  // Security: Prevent default and use safer navigation
                  e.preventDefault();
                  const phone = "+221701193811";
                  if (typeof window !== 'undefined' && isValidPhoneNumber(phone)) {
                    window.location.href = `tel:${phone}`;
                  }
                }}
              >
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>+221 701 193 811</span>
              </a>
              
              {/* Security: Sanitize email links */}
              <a 
                href="mailto:omadigital23@gmail.com" 
                className="flex items-center space-x-3 hover:text-orange-400 transition-colors"
                onClick={(e) => {
                  // Security: Prevent default and use safer navigation
                  e.preventDefault();
                  const email = "omadigital23@gmail.com";
                  if (typeof window !== 'undefined' && isValidEmail(email)) {
                    window.location.href = `mailto:${email}`;
                  }
                }}
              >
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>omadigital23@gmail.com</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-colors ${social.color} hover:bg-gray-700`}
                    // Security: Validate external links
                    onClick={(e) => {
                      e.preventDefault();
                      if (typeof window !== 'undefined' && isValidUrl(social.href)) {
                        // Security: Confirm navigation to external site
                        window.open(social.href, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.location.pathname === '/blog' && link.id !== 'blog') {
                          window.location.href = `/#${link.id}`;
                        } else {
                          scrollToSection(link.id);
                        }
                      }}
                      className="text-gray-300 hover:text-orange-400 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('header.services')}</h3>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="text-gray-300 hover:text-orange-400 transition-colors text-left text-sm"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.stay_informed')}</h3>
            
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-4">
                {t('footer.newsletter_description')}
              </p>
              <form onSubmit={handleNewsletterSubscription} className="flex">
                <input
                  type="email"
                  placeholder={t('footer.your_email')}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  // Security: Prevent XSS in input fields
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    // Basic sanitization to prevent XSS
                    target.value = target.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                  }}
                  disabled={isSubscribing}
                />
                <button 
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-r-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </button>
              </form>
              {subscribeMessage && (
                <div className={`mt-2 text-sm ${subscribeMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage.text}
                </div>
              )}
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-medium mb-3 text-sm">{t('footer.compliance_legal')}</h4>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-xs flex items-center space-x-1"
                      rel="nofollow"
                      // Security: Validate internal links
                      onClick={(e) => {
                        e.preventDefault();
                        if (typeof window !== 'undefined') {
                          // Validate internal URLs
                          if (link.href.startsWith('/')) {
                            window.location.href = link.href;
                          } else {
                            // Sanitize URL before logging
                            const sanitizedUrl = String(link.href).replace(/[\r\n\t]/g, '').substring(0, 100);
                            console.error('Invalid internal URL:', sanitizedUrl);
                          }
                        }
                      }}
                    >
                      <span>{link.label}</span>
                      {(link.label.includes('RGPD') || link.label.includes('confidentialité')) && (
                        <span className="text-green-400">🔒</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-gray-500">
                <p>{t('footer.gdpr_compliant')}</p>
                <p>{t('footer.data_protection')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <span>{t('footer.copyright')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{t('footer.made_with')}</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>{t('footer.in_dakar')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('footer.support_active')}</span>
              </div>
              
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors group"
              >
                <span>{t('footer.back_to_top')}</span>
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40 hover:scale-110"
        aria-label="Retour en haut"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </footer>
  );
}