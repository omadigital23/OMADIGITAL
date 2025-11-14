'use client'

import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import GoogleAnalytics from '../../components/GoogleAnalytics'
import CookieConsent from '../../components/CookieConsent'

interface LayoutClientProps {
  children: React.ReactNode
  locale: string
}

export default function LayoutClient({ children, locale }: LayoutClientProps) {
  return (
    <>
      <GoogleAnalytics />
      <Header locale={locale} />
      {children}
      <Footer locale={locale} />
      <CookieConsent />
    </>
  )
}
