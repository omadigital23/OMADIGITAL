'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'

interface NavigationProps {
  locale: string
}

export default function Navigation({ locale }: NavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    { 
      href: `/${locale}`, 
      label: locale === 'fr' ? 'Accueil' : 'Home' 
    },
    { 
      href: `/${locale}/services`, 
      label: locale === 'fr' ? 'Services' : 'Services' 
    },
    { 
      href: `/${locale}/about`, 
      label: locale === 'fr' ? 'À Propos' : 'About' 
    },
    { 
      href: `/${locale}/blog`, 
      label: locale === 'fr' ? 'Blog' : 'Blog' 
    },
    { 
      href: `/${locale}/contact`, 
      label: locale === 'fr' ? 'Contact' : 'Contact' 
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="text-2xl font-bold text-blue-600">
            OMA Digital
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href 
                    ? 'text-blue-600' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </nav>
  )
}