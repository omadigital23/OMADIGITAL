'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { NAV_ITEMS, WHATSAPP_URL } from '@/lib/constants';
import Image from 'next/image';
import MobileMenu from './MobileMenu';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logo.png"
              alt="OMA Digital"
              width={140}
              height={48}
              className="h-10 w-auto object-contain group-hover:brightness-110 transition-all"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent-violet after:transition-all hover:after:w-full"
              >
                {t(item.labelKey.replace('nav.', ''))}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={switchLocale}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-subtle hover:border-border-medium"
            >
              {t('languageSwitch')}
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-bg text-white text-sm font-medium px-5 py-2.5 rounded-full hover:shadow-glow transition-all hover:scale-105"
            >
              {t('auditCta')}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className="w-6 h-0.5 bg-text-primary transition-all" />
            <span className="w-6 h-0.5 bg-text-primary transition-all" />
            <span className="w-4 h-0.5 bg-text-primary transition-all" />
          </button>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSwitchLocale={switchLocale}
      />
    </>
  );
}
