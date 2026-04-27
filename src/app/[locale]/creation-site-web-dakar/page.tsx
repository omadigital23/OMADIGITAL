import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import SEOPageClient from '@/components/SEOPageClient';

export const metadata: Metadata = {
  title: 'Création de Site Web à Dakar | OMA Digital',
  description: 'Agence web de référence pour les entreprises dakaroises. Sites vitrines, e-commerce, applications web à Dakar.',
  keywords: 'création site web Dakar, agence web Dakar, développeur web Dakar, site internet Dakar',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SEOPageClient
      serviceEmoji="🏙️"
      title="Création de Site Web à Dakar"
      subtitle="L'agence web de référence pour les entreprises dakaroises."
      description="Basée au Sénégal, OMA Digital accompagne les entreprises de Dakar dans leur transformation digitale. Sites vitrines, e-commerce, applications web — des solutions sur mesure pour le marché dakarois."
      localContext="Dakar, capitale économique du Sénégal, regorge d'entreprises prêtes à conquérir le digital. Que vous soyez dans le Plateau, Almadies, ou Parcelles Assainies, OMA Digital vous crée un site web qui reflète l'ambition de votre entreprise et capte vos clients en ligne."
      pricingInfo={{ from: '150 000', to: '750 000' }}
      faqs={[
        { q: 'Pourquoi choisir OMA Digital à Dakar ?', a: 'Nous combinons expertise technique et connaissance du marché sénégalais pour créer des sites web qui convertissent réellement.' },
        { q: 'Livrez-vous des sites optimisés pour mobile ?', a: 'Oui, tous nos sites sont responsive et optimisés pour les connexions 3G/4G, essentielles au Sénégal.' },
      ]}
    />
  );
}
