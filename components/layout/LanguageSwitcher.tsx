'use client'

import { useRouter, usePathname } from 'next/navigation'

interface LanguageSwitcherProps {
  currentLocale: string
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
    const newPath = `/${newLocale}${pathWithoutLocale}`
    router.push(newPath)
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => switchLanguage('fr')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'fr'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        EN
      </button>
    </div>
  )
}