import type { Metadata } from 'next';

export type SupportLocale = 'fr' | 'en';

type SupportItem = {
  title: string;
  description: string;
};

type SupportFaq = {
  q: string;
  a: string;
};

export type SupportPageContent = {
  slug: string;
  metadata: {
    title: string;
    description: NonNullable<Metadata['description']>;
    keywords: NonNullable<Metadata['keywords']>;
  };
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  whatsappMessage: string;
  heroBullets: string[];
  form: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    device: string;
    model: string;
    issue: string;
    urgency: string;
    city: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    urgencyOptions: string[];
  };
  softwareSection: {
    title: string;
    subtitle: string;
    items: SupportItem[];
  };
  exclusionsSection: {
    title: string;
    subtitle: string;
    items: string[];
  };
  experienceSection: {
    eyebrow: string;
    title: string;
    body: string;
    note: string;
  };
  processSection: {
    title: string;
    steps: SupportItem[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    button: string;
  };
  faqs: SupportFaq[];
};

export const supportPageSlugs: Record<SupportLocale, string> = {
  fr: '/depannage-logiciel-configuration-appareils',
  en: '/software-troubleshooting-device-setup',
};

const supportPageContent: Record<SupportLocale, SupportPageContent> = {
  fr: {
    slug: supportPageSlugs.fr,
    metadata: {
      title: 'Dépannage logiciel à Campbell River | PC, Mac, iPhone & Android',
      description:
        'Assistance logicielle à Campbell River pour Windows, Mac, iPhone, iPad, Android, tablettes, caméras intelligentes, mises à jour et configuration.',
      keywords:
        'dépannage logiciel Campbell River, support informatique Campbell River, réparation logiciel PC, configuration caméra intelligente, dépannage iPhone Campbell River, dépannage Android Campbell River',
    },
    eyebrow: 'OMA Digital Support',
    title: 'Dépannage logiciel & configuration d’appareils',
    subtitle:
      'Assistance pour PC Windows, Mac, iPhone, iPad, Android, tablettes, caméras intelligentes et logiciels du quotidien.',
    description:
      'Un support clair pour résoudre les problèmes logiciels, configurer vos appareils et remettre vos outils numériques en état de fonctionner, sans intervention hardware.',
    primaryCta: 'Envoyer mon problème sur WhatsApp',
    secondaryCta: 'Lancer un diagnostic',
    whatsappMessage:
      'Bonjour, je souhaite un diagnostic OMA Digital Support pour un problème logiciel ou une configuration d’appareil.',
    heroBullets: [
      'Diagnostic logiciel et configuration',
      'Diagnostic logiciel rapide',
      'Assistance à distance ou sur rendez-vous local',
    ],
    form: {
      title: 'Diagnostic rapide',
      subtitle: 'Décrivez le problème et votre disponibilité pour recevoir une réponse plus précise.',
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      device: 'Appareil concerné',
      model: 'Marque / modèle',
      issue: 'Problème rencontré',
      urgency: 'Urgence',
      city: 'Ville',
      submit: 'Envoyer ma demande',
      sending: 'Envoi...',
      success: 'Demande reçue. Je vous recontacte pour le diagnostic.',
      error: 'Impossible d’envoyer la demande. Essayez WhatsApp.',
      urgencyOptions: ['Aujourd’hui', 'Cette semaine', 'Pas urgent'],
    },
    softwareSection: {
      title: 'Ce que nous réparons côté logiciel',
      subtitle:
        'Des interventions orientées configuration, stabilité, comptes, mises à jour et usages quotidiens.',
      items: [
        {
          title: 'PC Windows',
          description: 'Lenteur, bugs, mises à jour, pilotes, logiciels, comptes et nettoyage logiciel.',
        },
        {
          title: 'Mac',
          description: 'Configuration, comptes, sauvegardes, mises à jour, apps et optimisation de base.',
        },
        {
          title: 'iPhone & iPad',
          description: 'iCloud, Apple ID, sauvegarde, applications, réglages et transfert de données.',
        },
        {
          title: 'Android & tablettes',
          description: 'Compte Google, applications, stockage, lenteur, synchronisation et configuration.',
        },
        {
          title: 'Caméras intelligentes',
          description: 'Installation via app mobile, Wi-Fi, notifications, accès à distance et réglages.',
        },
        {
          title: 'Logiciels du quotidien',
          description: 'Emails, WhatsApp, Google, antivirus, imprimantes, sauvegardes et comptes en ligne.',
        },
      ],
    },
    exclusionsSection: {
      title: 'Ce que nous ne faisons pas',
      subtitle:
        'Le service est volontairement centré sur le logiciel, la configuration et l’assistance numérique.',
      items: [
        'Pas d’écran cassé',
        'Pas de batterie',
        'Pas de carte mère',
        'Pas de soudure',
        'Pas d’ouverture hardware',
      ],
    },
    experienceSection: {
      eyebrow: 'Expérience terrain',
      title: 'Une expertise construite au contact des vrais problèmes clients',
      body:
        'Cette expertise s’est développée pendant 5 ans dans un environnement Vidéotron, avec des interventions régulières sur les problèmes logiciels, les configurations et l’accompagnement utilisateur. Aujourd’hui, cette assistance est aussi proposée en freelance via OMA Digital.',
      note:
        'Le service OMA Digital Support est une activité indépendante et n’est pas un service officiel ni sponsorisé par Vidéotron.',
    },
    processSection: {
      title: 'Comment se passe l’intervention',
      steps: [
        {
          title: 'Diagnostic rapide',
          description: 'Vous envoyez l’appareil, le modèle, le problème et l’urgence.',
        },
        {
          title: 'Proposition de solution',
          description: 'Le problème est cadré avant toute intervention pour éviter les mauvaises attentes.',
        },
        {
          title: 'Assistance',
          description: 'Intervention à distance ou sur rendez-vous selon le type de problème.',
        },
        {
          title: 'Vérification finale',
          description: 'Les réglages sont testés et vous recevez des conseils pour éviter que le problème revienne.',
        },
      ],
    },
    finalCta: {
      title: 'Un appareil bloque votre journée ?',
      subtitle: 'Envoyez le problème, le modèle, votre ville et une capture si possible. Le diagnostic démarre plus vite.',
      button: 'Contacter OMA Digital Support',
    },
    faqs: [
      {
        q: 'Réparez-vous les écrans ?',
        a: 'Non. OMA Digital Support ne fait pas de réparation matérielle : pas d’écran, batterie, carte mère, soudure ou ouverture d’appareil.',
      },
      {
        q: 'Pouvez-vous configurer une caméra intelligente ?',
        a: 'Oui, pour la partie logiciel : application mobile, connexion Wi-Fi, notifications, compte utilisateur et accès à distance.',
      },
      {
        q: 'Pouvez-vous aider avec iCloud ou compte Google ?',
        a: 'Oui, l’assistance peut couvrir la configuration, la synchronisation, les sauvegardes et les réglages de compte.',
      },
      {
        q: 'Faites-vous l’assistance à distance ?',
        a: 'Oui, quand le problème peut être traité sans accès physique. Certains cas demandent plutôt un rendez-vous.',
      },
      {
        q: 'Combien de temps prend un dépannage logiciel ?',
        a: 'Cela dépend du problème, de l’appareil et de l’accès aux comptes. Le diagnostic sert à estimer la durée avant l’intervention.',
      },
      {
        q: 'Travaillez-vous avec les particuliers et les petites entreprises ?',
        a: 'Oui, le service s’adresse aux particuliers, freelances, petites équipes et commerces qui ont besoin d’un support logiciel clair.',
      },
    ],
  },
  en: {
    slug: supportPageSlugs.en,
    metadata: {
      title: 'Software Troubleshooting in Campbell River | PC, Mac, iPhone & Android',
      description:
        'Software support in Campbell River for Windows, Mac, iPhone, iPad, Android, tablets, smart cameras, updates and device setup.',
      keywords:
        'software troubleshooting Campbell River, computer support Campbell River, PC software repair, smart camera setup Campbell River, iPhone troubleshooting Campbell River, Android troubleshooting Campbell River',
    },
    eyebrow: 'OMA Digital Support',
    title: 'Software troubleshooting & device setup',
    subtitle:
      'Support for Windows PCs, Macs, iPhone, iPad, Android, tablets, smart cameras and everyday software.',
    description:
      'Practical support to fix software issues, configure devices and get digital tools working again without hardware repair.',
    primaryCta: 'Send the issue on WhatsApp',
    secondaryCta: 'Start a diagnostic',
    whatsappMessage:
      'Hello, I need an OMA Digital Support diagnostic for a software issue or device setup.',
    heroBullets: [
      'Software diagnostic and setup',
      'Fast software diagnostic',
      'Remote or local appointment-based support',
    ],
    form: {
      title: 'Quick diagnostic',
      subtitle: 'Describe the issue and your availability so the first reply can be more precise.',
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      device: 'Device',
      model: 'Brand / model',
      issue: 'Issue',
      urgency: 'Urgency',
      city: 'City',
      submit: 'Send request',
      sending: 'Sending...',
      success: 'Request received. I will follow up for the diagnostic.',
      error: 'Could not send the request. Try WhatsApp.',
      urgencyOptions: ['Today', 'This week', 'Not urgent'],
    },
    softwareSection: {
      title: 'What we fix on the software side',
      subtitle:
        'Support focused on setup, stability, accounts, updates and everyday digital use.',
      items: [
        {
          title: 'Windows PCs',
          description: 'Slowdowns, bugs, updates, drivers, software, accounts and software cleanup.',
        },
        {
          title: 'Mac',
          description: 'Setup, accounts, backups, updates, apps and basic optimization.',
        },
        {
          title: 'iPhone & iPad',
          description: 'iCloud, Apple ID, backup, apps, settings and data transfer.',
        },
        {
          title: 'Android & tablets',
          description: 'Google account, apps, storage, slowdowns, sync and setup.',
        },
        {
          title: 'Smart cameras',
          description: 'Mobile app setup, Wi-Fi, notifications, remote access and settings.',
        },
        {
          title: 'Everyday software',
          description: 'Email, WhatsApp, Google, antivirus, printers, backups and online accounts.',
        },
      ],
    },
    exclusionsSection: {
      title: 'What we do not do',
      subtitle:
        'The service is intentionally focused on software, configuration and digital assistance.',
      items: [
        'No broken screens',
        'No batteries',
        'No motherboards',
        'No soldering',
        'No hardware opening',
      ],
    },
    experienceSection: {
      eyebrow: 'Field experience',
      title: 'Experience built around real customer issues',
      body:
        'This expertise was developed over 5 years in a Videotron environment, with regular work on software issues, device setup and user support. Today, this assistance is also offered independently through OMA Digital.',
      note:
        'OMA Digital Support is an independent freelance activity and is not an official Videotron service or sponsored offer.',
    },
    processSection: {
      title: 'How the intervention works',
      steps: [
        {
          title: 'Quick diagnostic',
          description: 'You send the device, model, issue and urgency.',
        },
        {
          title: 'Solution proposal',
          description: 'The issue is framed before intervention so expectations stay clear.',
        },
        {
          title: 'Support',
          description: 'Remote or appointment-based assistance depending on the type of issue.',
        },
        {
          title: 'Final check',
          description: 'Settings are tested and you receive tips to reduce the chance of repeat issues.',
        },
      ],
    },
    finalCta: {
      title: 'A device is slowing down your day?',
      subtitle: 'Send the issue, model, city and a screenshot if possible. The diagnostic starts faster.',
      button: 'Contact OMA Digital Support',
    },
    faqs: [
      {
        q: 'Do you repair screens?',
        a: 'No. OMA Digital Support does not handle hardware repair: no screens, batteries, motherboards, soldering or device opening.',
      },
      {
        q: 'Can you configure a smart camera?',
        a: 'Yes, for the software side: mobile app, Wi-Fi connection, notifications, user account and remote access.',
      },
      {
        q: 'Can you help with iCloud or a Google account?',
        a: 'Yes, support can cover setup, sync, backups and account settings.',
      },
      {
        q: 'Do you offer remote support?',
        a: 'Yes, when the issue can be handled without physical access. Some cases are better handled by appointment.',
      },
      {
        q: 'How long does software troubleshooting take?',
        a: 'It depends on the issue, device and account access. The diagnostic helps estimate timing before intervention.',
      },
      {
        q: 'Do you work with individuals and small businesses?',
        a: 'Yes, the service is for individuals, freelancers, small teams and local businesses that need clear software support.',
      },
    ],
  },
};

export function resolveSupportLocale(locale: string): SupportLocale {
  return locale === 'en' ? 'en' : 'fr';
}

export function getSupportPageContent(locale: string): SupportPageContent {
  return supportPageContent[resolveSupportLocale(locale)];
}
