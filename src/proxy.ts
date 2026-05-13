import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function hasLocalePrefix(pathname: string) {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normaliser le trailing slash AVANT tout : /fr/ → /fr (308 permanent)
  // Ceci évite que Google voie /fr/ comme une "page avec redirection"
  // car next-intl avec localePrefix:'always' peut encore rediriger /fr/ → /fr
  const hasTrailingSlash = pathname.endsWith('/') && pathname !== '/';
  if (hasTrailingSlash) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, { status: 308 });
  }

  // Si le pathname n'a pas de préfixe de locale, rediriger vers la locale par défaut
  if (!hasLocalePrefix(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === '/' || pathname === ''
        ? `/${routing.defaultLocale}`
        : `/${routing.defaultLocale}${pathname}`;
    return NextResponse.redirect(url, { status: 308 });
  }

  // Laisser next-intl gérer le routing localisé
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
