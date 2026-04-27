import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center px-6">
        <div className="text-8xl font-heading font-bold gradient-text mb-6">404</div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-text-primary mb-4">
          {t('title')}
        </h1>
        <p className="text-text-muted mb-8 max-w-md mx-auto">{t('description')}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 gradient-bg text-white font-medium px-6 py-3 rounded-full hover:shadow-glow transition-all"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
