import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, Globe, Shield, Award, Zap } from 'lucide-react';
import { NextI18nLanguageSwitcher } from './NextI18nLanguageSwitcher';
import { NewsletterSignupFooter } from './NewsletterSignupFooter';

export function Footer() {
  const { t } = useTranslation();

  const legalLinks = [
    { label: t('footer.links.privacy'), href: '/politique-confidentialite' },
    { label: t('footer.links.terms'), href: '/conditions-generales' },
    { label: t('footer.links.cookies'), href: '/politique-cookies' },
    { label: t('footer.links.rgpd'), href: '/politique-rgpd' },
    { label: t('footer.links.about'), href: '/about' }
  ];

  const services = [
    { name: t('services.whatsapp.title'), href: '/#services' },
    { name: t('services.website.title'), href: '/#services' },
    { name: t('services.branding.title'), href: '/#services' },
    { name: t('services.analytics.title'), href: '/#services' },
    { name: t('services.ai_assistant.title'), href: '/#services' }
  ];

  const socialLinks = [
    { name: 'WhatsApp', icon: Mail, href: 'https://wa.me/212701193811' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">{t('footer.about')}</h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">{t('footer.description')}</p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="text-gray-300">{t('footer.address.senegal')}</p>
                    <p className="text-gray-300 mt-1">{t('footer.address.morocco')}</p>
                  </div>
                </div>
                <a 
                  href={`tel:${t('footer.phone').replace(/\s/g, '')}`}
                  className="flex items-center space-x-3 text-gray-300 hover:text-orange-500 transition-colors"
                >
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">{t('footer.phone')}</span>
                </a>
                <a 
                  href={`mailto:${t('footer.email').split('/')[0]}`}
                  className="flex items-center space-x-3 text-gray-300 hover:text-orange-500 transition-colors"
                >
                  <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm break-all">{t('footer.email')}</span>
                </a>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="pt-4 border-t border-gray-800">
              <h4 className="font-semibold mb-3 text-sm">{t('footer.certifications')}</h4>
              <div className="flex items-center space-x-4 text-xs text-gray-300">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-500" aria-hidden="true" />
                  <span>ISO 27001</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-green-500" aria-hidden="true" />
                  <span>GDPR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2.5">
              {services.map((service, index) => (
                <li key={index}>
                  <a 
                    href={service.href} 
                    className="text-gray-300 hover:text-orange-500 transition-colors flex items-center space-x-2 text-sm group"
                  >
                    <Zap className="w-3.5 h-3.5 text-orange-500 group-hover:text-orange-400" aria-hidden="true" />
                    <span>{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-orange-500 transition-colors text-sm block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('newsletter.title')}</h3>
            <p className="text-gray-300 mb-4 text-sm">{t('newsletter.description')}</p>
            <NewsletterSignupFooter />
            
            {/* Social Links */}
            <div className="mt-8">
              <h4 className="font-semibold mb-3">{t('footer.follow_us')}</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-orange-500 p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={`${t('footer.follow_us')} ${social.name}`}
                    >
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">{t('footer.language')}</h4>
              <NextI18nLanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center space-x-6">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm">{t('footer.rights')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
