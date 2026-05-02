// ============================================================
// OMA Digital — Business Constants
// ============================================================

export const BUSINESS = {
  name: 'OMA Digital',
  tagline: 'AI Automation Agency',
  email: 'omadigital23@gmail.com',
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

// Messages WhatsApp localisés FR / EN
const WHATSAPP_MESSAGES: Record<string, string> = {
  fr: 'Bonjour, je souhaite un audit gratuit pour mon entreprise',
  en: 'Hello, I would like a free audit for my business',
};

export function getWhatsAppUrl(locale: string = 'fr'): string {
  const msg = WHATSAPP_MESSAGES[locale] ?? WHATSAPP_MESSAGES.fr;
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

// URL par défaut (FR) — conservée pour la compatibilité des composants sans locale
export const WHATSAPP_URL = getWhatsAppUrl('fr');

type LocalizedPath = {
  readonly fr: string;
  readonly en: string;
};

export const SUPPORT_PAGE_PATHS = {
  fr: '/depannage-logiciel-configuration-appareils',
  en: '/software-troubleshooting-device-setup',
} as const satisfies LocalizedPath;

export function getSupportPagePath(locale: string = 'fr'): string {
  return locale === 'en' ? SUPPORT_PAGE_PATHS.en : SUPPORT_PAGE_PATHS.fr;
}

export function resolveLocalizedPath(path: string | LocalizedPath, locale: string = 'fr'): string {
  const resolved = typeof path === 'string' ? path : locale === 'en' ? path.en : path.fr;
  return resolved.startsWith('/') ? resolved : `/${resolved}`;
}

type NavItem = {
  readonly labelKey: string;
  readonly href: string | LocalizedPath;
};

export const NAV_ITEMS = [
  { labelKey: 'nav.services', href: '/#services' },
  { labelKey: 'nav.support', href: SUPPORT_PAGE_PATHS },
  { labelKey: 'nav.pricing', href: '/pricing' },
  { labelKey: 'nav.blog', href: '/blog' },
  { labelKey: 'nav.contact', href: '/contact' },
] as const satisfies readonly NavItem[];

export const SERVICE_PAGES = [
  { slug: 'creation-site-web-senegal', labelKey: 'services.website' },
  { slug: 'creation-site-web-dakar', labelKey: 'services.websiteDakar' },
  { slug: 'creation-site-web-thies', labelKey: 'services.websiteThies' },
  { slug: 'application-mobile-senegal', labelKey: 'services.mobile' },
  { slug: 'automatisation-ia-senegal', labelKey: 'services.ai' },
  {
    slug: {
      fr: 'creation-site-web-campbell-river',
      en: 'website-design-campbell-river',
    },
    labelKey: 'services.websiteCampbellRiver',
  },
  {
    slug: {
      fr: 'application-mobile-campbell-river',
      en: 'mobile-app-development-campbell-river',
    },
    labelKey: 'services.mobileCampbellRiver',
  },
  {
    slug: {
      fr: 'automatisation-ia-campbell-river',
      en: 'ai-automation-campbell-river',
    },
    labelKey: 'services.aiCampbellRiver',
  },
] as const;

export const STATS = [
  { value: 50, suffix: '+', labelKey: 'stats.clients' },
  { value: 120, suffix: '+', labelKey: 'stats.automations' },
  { value: 95, suffix: '%', labelKey: 'stats.timeSaved' },
] as const;
