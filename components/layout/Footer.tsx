import Link from 'next/link'
import NewsletterForm from '../NewsletterForm'

interface FooterProps {
  locale: string
}

export default function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">OMA Digital</h3>
            <p className="text-gray-300 mb-4">
              {locale === 'fr' 
                ? 'Agence digitale experte basée à Casablanca (Maroc) servant le Maroc et le Sénégal. Solutions web, mobile et marketing digital sur mesure.'
                : 'Expert digital agency based in Casablanca (Morocco) serving Morocco and Senegal. Custom web, mobile and digital marketing solutions.'
              }
            </p>
            <div className="space-y-2 text-gray-300">
              <p>📍 Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Maroc</p>
              <p>📞 +212 701 193 811</p>
              <p>✉️ omadigital23@gmail.com</p>
              <p>✉️ amadou@omadigital.net</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {locale === 'fr' ? 'Liens Rapides' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'Accueil' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'Services' : 'Services'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'À Propos' : 'About'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {locale === 'fr' ? 'Légal' : 'Legal'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/legal/privacy-policy`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/terms-conditions`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'Conditions d\'Utilisation' : 'Terms & Conditions'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/cookie-policy`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'Politique Cookies' : 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/gdpr-compliance`} className="text-gray-300 hover:text-white transition-colors">
                  {locale === 'fr' ? 'Conformité RGPD' : 'GDPR Compliance'}
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
            © {currentYear} OMA Digital. {locale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}