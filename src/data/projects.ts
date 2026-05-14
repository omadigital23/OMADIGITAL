export type ProjectLocale = 'fr' | 'en';

type LocalizedText = Record<ProjectLocale, string>;

export type CompletedProject = {
  id: string;
  title: string;
  url: string;
  image: string;
  type: LocalizedText;
  outcome: LocalizedText;
  summary: LocalizedText;
  tags: Record<ProjectLocale, string[]>;
};

export const projectShowcaseCopy = {
  fr: {
    eyebrow: 'Portfolio client',
    title: 'Projets',
    titleAccent: 'réalisés',
    subtitle:
      'Une sélection de sites, plateformes et applications livrés avec une attention forte portée au design, à la clarté du parcours et à la conversion.',
    visitLabel: 'Voir le projet',
    outcomeLabel: 'Impact',
    imageAltPrefix: 'Capture du projet',
  },
  en: {
    eyebrow: 'Client portfolio',
    title: 'Completed',
    titleAccent: 'projects',
    subtitle:
      'A selection of websites, platforms and applications delivered with a strong focus on design, clear journeys and conversion.',
    visitLabel: 'View project',
    outcomeLabel: 'Impact',
    imageAltPrefix: 'Screenshot of',
  },
} satisfies Record<ProjectLocale, {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  visitLabel: string;
  outcomeLabel: string;
  imageAltPrefix: string;
}>;

export const completedProjects = [
  {
    id: 'nubia-aura',
    title: 'Nubia Aura',
    url: 'https://www.nubiaaura.com/fr',
    image: '/images/projects/nubia-aura-portfolio.webp',
    type: {
      fr: 'Mode africaine',
      en: 'African fashion',
    },
    outcome: {
      fr: 'Catalogue clair et image premium renforcée.',
      en: 'Clear catalogue and stronger premium brand image.',
    },
    summary: {
      fr: 'Une présence web premium pour présenter des créations, guider vers le catalogue et renforcer l’image de marque.',
      en: 'A premium web presence to present collections, guide visitors to the catalogue and strengthen the brand image.',
    },
    tags: {
      fr: ['Site vitrine', 'Catalogue', 'Image premium'],
      en: ['Showcase site', 'Catalogue', 'Premium image'],
    },
  },
  {
    id: 'oma-digital',
    title: 'OMA Digital',
    url: 'https://www.omadigital.net/fr',
    image: '/images/projects/oma-digital.webp',
    type: {
      fr: 'Agence digitale',
      en: 'Digital agency',
    },
    outcome: {
      fr: 'Parcours d’audit, pages SEO et assistant IA réunis.',
      en: 'Audit journey, SEO pages and AI assistant combined.',
    },
    summary: {
      fr: 'Le site agence OMA Digital avec pages SEO, offres de services, formulaire, WhatsApp et assistant IA.',
      en: 'The OMA Digital agency website with SEO pages, service offers, contact form, WhatsApp and AI assistant.',
    },
    tags: {
      fr: ['Next.js', 'SEO local', 'Chatbot IA'],
      en: ['Next.js', 'Local SEO', 'AI chatbot'],
    },
  },
  {
    id: 'cloud-cert',
    title: 'Cloud Cert',
    url: 'https://cloud-cert.vercel.app/',
    image: '/images/projects/cloud-cert.webp',
    type: {
      fr: 'Formation cloud',
      en: 'Cloud learning',
    },
    outcome: {
      fr: 'Modules, quiz et progression réunis dans une interface simple.',
      en: 'Modules, quizzes and progress tracking in one simple interface.',
    },
    summary: {
      fr: 'Une plateforme d’apprentissage structurée pour suivre des modules, quiz et objectifs de progression cloud.',
      en: 'A structured learning platform for tracking cloud modules, quizzes and progression goals.',
    },
    tags: {
      fr: ['E-learning', 'Quiz', 'Progression'],
      en: ['E-learning', 'Quizzes', 'Progress'],
    },
  },
  {
    id: 'sojif-consulting',
    title: 'SOJIF Consulting',
    url: 'https://www.sojifconsulting.com/fr',
    image: '/images/projects/sojif-consulting.webp',
    type: {
      fr: 'Conseil & RH',
      en: 'Consulting & HR',
    },
    outcome: {
      fr: 'Offres plus lisibles et demandes mieux orientées.',
      en: 'Clearer offers and better-routed inquiries.',
    },
    summary: {
      fr: 'Un site institutionnel clair pour structurer les services juridiques, fiscaux, RH et les demandes entrantes.',
      en: 'A clear institutional website for legal, tax, HR services and qualified inbound requests.',
    },
    tags: {
      fr: ['Site corporate', 'Services', 'Lead qualifié'],
      en: ['Corporate site', 'Services', 'Qualified leads'],
    },
  },
  {
    id: 'oma-compta',
    title: 'OMA Compta',
    url: 'https://oma-compta.vercel.app/login',
    image: '/images/projects/oma-compta.webp',
    type: {
      fr: 'Application métier',
      en: 'Business app',
    },
    outcome: {
      fr: 'Accès sécurisé à un espace comptable SYSCOHADA dédié.',
      en: 'Secure access to a dedicated SYSCOHADA accounting workspace.',
    },
    summary: {
      fr: 'Une application privée pensée pour la comptabilité SYSCOHADA, avec accès sécurisé et espace de travail dédié.',
      en: 'A private application for SYSCOHADA accounting, with secure access and a dedicated workspace.',
    },
    tags: {
      fr: ['SaaS privé', 'SYSCOHADA', 'Connexion sécurisée'],
      en: ['Private SaaS', 'SYSCOHADA', 'Secure login'],
    },
  },
] satisfies CompletedProject[];
