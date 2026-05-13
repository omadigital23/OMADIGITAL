// ============================================================
// OMA Digital — i18n Routing Configuration (next-intl)
// ============================================================

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  // 'always' = /fr/... et /en/... retournent 200 directement
  // Sans ce réglage, next-intl utilise 'as-needed' par défaut :
  // /fr/ redirige vers / → Google Search Console signale "Page avec redirection"
  localePrefix: 'always',
  // Pas de redirect automatique basée sur Accept-Language
  localeDetection: false,
});
