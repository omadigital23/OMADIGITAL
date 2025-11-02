'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { useState } from 'react'

interface HeaderProps {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/images/logo.webp"
              alt="OMA Digital"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
              sizes="(max-width: 640px) 100px, 120px"
            />
          </Link>
          
          {/* Desktop Navigation */}
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
          
          {/* Language Switcher & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}