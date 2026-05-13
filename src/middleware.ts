// ============================================================
// OMA Digital — next-intl Middleware
// ============================================================
// Ce fichier est obligatoire pour que next-intl gère correctement
// le routing i18n. Son absence empêche la détection de locale et
// peut provoquer des redirects non contrôlées sur /fr/ et /en/.
// ============================================================

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Intercepter toutes les routes sauf :
  // - /api/* (routes API Next.js)
  // - /_next/* (assets Next.js)
  // - /_vercel/* (assets Vercel)
  // - Fichiers statiques avec extension (.png, .ico, .xml, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
