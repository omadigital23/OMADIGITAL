import Link from 'next/link'
import NewsletterForm from '../NewsletterForm'
import type { CommonTranslations } from '../../lib/translations'

interface FooterProps {
  locale: string
  translations?: CommonTranslations
}

export default function Footer({ locale, translations = {} }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const nav = translations.nav || {}
  const ft = (translations as Record<string, Record<string, string>>).footer || {}

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">{ft.company_name || 'OMA Digital'}</h3>
            <p className="text-gray-300 mb-4">
              {ft.company_desc || 'International digital agency based in Casablanca (Morocco).'}
            </p>
            <div className="space-y-2 text-gray-300">
              <p>{ft.address || '📍 Moustakbal / Sidi Maarouf, Casablanca – Maroc'}</p>
              <p>{ft.phone || '📞 +212 701 193 811 (International) | +221 77 143 01 37 (Sénégal)'}</p>
              <p>{ft.email || '✉️ omadigital23@gmail.com'}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {ft.quick_links || 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}`} className="text-gray-300 hover:text-white transition-colors">
                  {nav.home || 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services`} className="text-gray-300 hover:text-white transition-colors">
                  {nav.services || 'Services'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-gray-300 hover:text-white transition-colors">
                  {nav.about || 'About'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-300 hover:text-white transition-colors">
                  {nav.blog || 'Blog'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-300 hover:text-white transition-colors">
                  {nav.contact || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {ft.legal || 'Legal'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/legal/privacy-policy`} className="text-gray-300 hover:text-white transition-colors">
                  {ft.privacy_policy || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/terms-conditions`} className="text-gray-300 hover:text-white transition-colors">
                  {ft.terms_conditions || 'Terms & Conditions'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/cookie-policy`} className="text-gray-300 hover:text-white transition-colors">
                  {ft.cookie_policy || 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/gdpr-compliance`} className="text-gray-300 hover:text-white transition-colors">
                  {ft.gdpr_compliance || 'GDPR Compliance'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterForm locale={locale} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-300">
          <p>
            © {currentYear} OMA Digital. {ft.copyright || 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}