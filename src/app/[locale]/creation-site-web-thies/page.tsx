import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import SEOPageClient from '@/components/SEOPageClient';

export const metadata: Metadata = {
  title: 'Création de Site Web à Thiès | OMA Digital',
  description: 'Agence digitale locale à Thiès. Création de sites web professionnels pour les entreprises thiéssoises.',
  keywords: 'création site web Thiès, agence digitale Thiès, site internet Thiès',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SEOPageClient
      serviceEmoji="🏛️"
      title="Création de Site Web à Thiès"
      subtitle="Votre agence digitale locale à Thiès."
      description="OMA Digital, basée à Thiès, crée des sites web professionnels pour les entreprises thiéssoises. Proximité, expertise et résultats garantis."
      localContext="Thiès, deuxième ville du Sénégal, mérite des entreprises avec une présence digitale forte. En tant qu'agence locale, OMA Digital comprend les besoins spécifiques des entreprises thiéssoises et propose des solutions adaptées avec un accompagnement de proximité."
      pricingInfo={{ from: '150 000', to: '750 000' }}
      faqs={[
        { q: 'Êtes-vous basés à Thiès ?', a: 'Oui ! OMA Digital est basée à Thiès. Nous offrons un accompagnement de proximité avec des rendez-vous en personne.' },
        { q: 'Travaillez-vous avec des entreprises de toutes tailles ?', a: 'Absolument. Du petit commerce au restaurant en passant par les PME, nous avons des solutions adaptées à chaque budget.' },
      ]}
    />
  );
}
