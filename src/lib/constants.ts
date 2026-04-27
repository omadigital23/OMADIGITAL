// ============================================================
// OMA Digital — Business Constants
// ============================================================

export const BUSINESS = {
  name: 'OMA Digital',
  tagline: 'AI Automation Agency',
  email: 'support@omadigital.net',
  phone: '+212701193811',
  whatsappNumber: '212701193811',
  location: {
    country: 'Sénégal',
    city: 'Thiès',
  },
  social: {
    facebook: 'https://facebook.com/omadigital',
    instagram: 'https://instagram.com/omadigital',
    linkedin: 'https://linkedin.com/company/omadigital',
    twitter: 'https://twitter.com/omadigital',
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.omadigital.net',
} as const;

export const WHATSAPP_URL = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
  'Bonjour, je souhaite un audit gratuit pour mon entreprise'
)}`;

export const NAV_ITEMS = [
  { labelKey: 'nav.services', href: '/#services' },
  { labelKey: 'nav.pricing', href: '/pricing' },
  { labelKey: 'nav.blog', href: '/blog' },
  { labelKey: 'nav.contact', href: '/contact' },
] as const;

export const SERVICE_PAGES = [
  { slug: 'creation-site-web-senegal', labelKey: 'services.website' },
  { slug: 'creation-site-web-dakar', labelKey: 'services.websiteDakar' },
  { slug: 'creation-site-web-thies', labelKey: 'services.websiteThies' },
  { slug: 'application-mobile-senegal', labelKey: 'services.mobile' },
  { slug: 'automatisation-ia-senegal', labelKey: 'services.ai' },
] as const;

export const STATS = [
  { value: 50, suffix: '+', labelKey: 'stats.clients' },
  { value: 120, suffix: '+', labelKey: 'stats.automations' },
  { value: 95, suffix: '%', labelKey: 'stats.timeSaved' },
] as const;
