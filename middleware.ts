// ============================================================
// OMA Digital — next-intl Middleware
// ============================================================

import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(fr|en)/:path*'],
};
