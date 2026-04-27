import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import SEOPageClient from '@/components/SEOPageClient';

export const metadata: Metadata = {
  title: 'Développement Application Mobile au Sénégal | OMA Digital',
  description: 'Développement d\'applications mobiles iOS et Android au Sénégal. À partir de 300 000 FCFA.',
  keywords: 'application mobile Sénégal, développement app Sénégal, app iOS Android Sénégal',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SEOPageClient
      serviceEmoji="📱"
      title="Développement d'Application Mobile au Sénégal"
      subtitle="Applications iOS & Android sur mesure pour les entreprises sénégalaises."
      description="OMA Digital développe des applications mobiles performantes pour le marché sénégalais. iOS, Android, Flutter — des apps qui connectent votre entreprise à vos clients."
      localContext="Avec plus de 90% de pénétration mobile au Sénégal, votre entreprise doit être accessible sur smartphone. OMA Digital crée des applications intuitives, intégrées avec Wave et Orange Money, adaptées aux habitudes de vos clients sénégalais."
      pricingInfo={{ from: '300 000', to: '1 200 000' }}
      faqs={[
        { q: 'Combien coûte une application mobile au Sénégal ?', a: 'Nos tarifs démarrent à 300 000 FCFA pour une application simple et peuvent aller jusqu\'à 1 200 000 FCFA pour une solution complète multi-plateforme.' },
        { q: 'Développez-vous pour iOS et Android ?', a: 'Oui, nous développons des applications natives et cross-platform (Flutter/React Native) pour couvrir iOS et Android simultanément.' },
        { q: 'Intégrez-vous Wave et Orange Money ?', a: 'Absolument ! L\'intégration des paiements mobiles locaux est une spécialité chez OMA Digital.' },
      ]}
    />
  );
}
