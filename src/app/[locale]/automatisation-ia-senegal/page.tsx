import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import SEOPageClient from '@/components/SEOPageClient';

export const metadata: Metadata = {
  title: 'Automatisation IA au Sénégal | OMA Digital',
  description: 'Solutions d\'automatisation IA pour les entreprises sénégalaises. Chatbots, workflows automatisés, CRM intelligent. À partir de 200 000 FCFA.',
  keywords: 'automatisation IA Sénégal, intelligence artificielle Sénégal, chatbot IA Sénégal',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SEOPageClient
      serviceEmoji="🤖"
      title="Automatisation IA pour les Entreprises Sénégalaises"
      subtitle="Boostez votre productivité avec l'intelligence artificielle."
      description="OMA Digital déploie des solutions d'automatisation IA au Sénégal. Chatbots, workflows automatisés, CRM intelligent — transformez votre entreprise avec l'IA."
      localContext="L'intelligence artificielle n'est plus réservée aux grandes entreprises. OMA Digital rend l'IA accessible aux PME sénégalaises avec des solutions pratiques : chatbots WhatsApp, automatisation des processus, analyse de données et bien plus."
      pricingInfo={{ from: '200 000', to: '1 000 000' }}
      faqs={[
        { q: "Qu'est-ce que l'automatisation IA peut faire pour mon entreprise ?", a: "L'IA peut automatiser votre service client (chatbot), gérer vos emails, analyser vos données de vente, automatiser la facturation et bien plus. Nos clients économisent en moyenne 20h par semaine." },
        { q: 'Faut-il des compétences techniques ?', a: 'Non ! Nos solutions sont conçues pour être simples d\'utilisation. Nous formons votre équipe et assurons un support continu.' },
        { q: 'Quel est le retour sur investissement ?', a: 'La plupart de nos clients voient un ROI positif dès le premier mois grâce au temps économisé et à l\'amélioration du service client.' },
      ]}
    />
  );
}
