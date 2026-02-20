'use client'

import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import GoogleAnalytics from '../../components/GoogleAnalytics'
import CookieConsent from '../../components/CookieConsent'
import type { CommonTranslations } from '../../lib/translations'

interface LayoutClientProps {
  children: React.ReactNode
  locale: string
  translations: CommonTranslations
}

export default function LayoutClient({ children, locale, translations }: LayoutClientProps) {
  return (
    <>
      <GoogleAnalytics />
      <Header locale={locale} translations={translations} />
      {children}
      <Footer locale={locale} translations={translations} />
      <CookieConsent />
    </>
  )
}
