// ============================================================
// OMA Digital — i18n Routing Configuration (next-intl)
// ============================================================

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});
