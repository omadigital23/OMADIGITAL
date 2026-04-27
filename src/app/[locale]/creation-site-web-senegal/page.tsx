import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import SEOPageClient from '@/components/SEOPageClient';

export const metadata: Metadata = {
  title: 'Création de Site Web au Sénégal | OMA Digital',
  description: 'Création de sites web professionnels au Sénégal. Sites vitrines, e-commerce, applications web. À partir de 150 000 FCFA. Agence web à Thiès.',
  keywords: 'création site web Sénégal, agence web Sénégal, site internet Sénégal, développeur web Sénégal',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SEOPageClient
      serviceEmoji="🌐"
      title="Création de Site Web Professionnel au Sénégal"
      subtitle="Votre agence digitale de confiance pour des sites web modernes et optimisés SEO."
      description="OMA Digital est votre partenaire pour la création de sites web professionnels au Sénégal. Sites vitrines, e-commerce, applications web — nous transformons votre vision en réalité digitale."
      localContext="Le marché digital sénégalais est en pleine expansion. Avec plus de 10 millions d'utilisateurs internet au Sénégal, votre entreprise ne peut plus se permettre d'être invisible en ligne. OMA Digital, basée à Thiès, vous accompagne dans cette transformation avec des solutions web adaptées au marché local."
      pricingInfo={{ from: '150 000', to: '750 000' }}
      faqs={[
        { q: 'Combien coûte un site web au Sénégal ?', a: 'Nos tarifs démarrent à 150 000 FCFA pour un site vitrine et peuvent aller jusqu\'à 750 000 FCFA pour une solution e-commerce complète avec paiement Wave/Orange Money.' },
        { q: 'Combien de temps pour créer un site web ?', a: 'Un site vitrine est livré en 1 à 2 semaines. Un site e-commerce prend 3 à 4 semaines. Nous garantissons des délais respectés.' },
        { q: 'Proposez-vous l\'hébergement et la maintenance ?', a: 'Oui, tous nos forfaits incluent l\'hébergement. Nous proposons aussi des contrats de maintenance pour garder votre site à jour et sécurisé.' },
      ]}
    />
  );
}
