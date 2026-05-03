import type { Metadata } from 'next';

type Locale = 'fr' | 'en';

export type ServicePageId =
  | 'website-senegal'
  | 'website-dakar'
  | 'website-thies'
  | 'mobile-senegal'
  | 'ai-senegal'
  | 'website-campbell-river'
  | 'mobile-campbell-river'
  | 'ai-campbell-river';

type FAQItem = {
  q: string;
  a: string;
};

export type ServicePageContent = {
  metadata: {
    title: string;
    description: NonNullable<Metadata['description']>;
    keywords: NonNullable<Metadata['keywords']>;
  };
  serviceEmoji: string;
  title: string;
  subtitle: string;
  description: string;
  localContext: string;
  pricingInfo: {
    from: string;
    to?: string;
    currencyLabel?: string;
    note?: string;
  };
  faqs: FAQItem[];
};

const servicePages: Record<ServicePageId, Record<Locale, ServicePageContent>> = {
  'website-senegal': {
    fr: {
      metadata: {
        title: 'Création de Site Web au Sénégal | OMA Digital',
        description:
          'Création de sites web professionnels au Sénégal. Sites vitrines, e-commerce, applications web. À partir de 150 000 FCFA. Agence web à Thiès.',
        keywords:
          'création site web Sénégal, agence web Sénégal, site internet Sénégal, développeur web Sénégal',
      },
      serviceEmoji: '🌐',
      title: 'Création de Site Web Professionnel au Sénégal',
      subtitle:
        'Votre agence digitale de confiance pour des sites web modernes et optimisés SEO.',
      description:
        'OMA Digital est votre partenaire pour la création de sites web professionnels au Sénégal. Sites vitrines, e-commerce, applications web — nous transformons votre vision en réalité digitale.',
      localContext:
        'Le marché digital sénégalais est en pleine expansion. Avec plus de 10 millions d’utilisateurs internet au Sénégal, votre entreprise ne peut plus se permettre d’être invisible en ligne. OMA Digital, basée à Thiès, vous accompagne avec des solutions web adaptées au marché local.',
      pricingInfo: { from: '150 000', to: '750 000' },
      faqs: [
        {
          q: 'Combien coûte un site web au Sénégal ?',
          a: 'Nos tarifs démarrent à 150 000 FCFA pour un site vitrine et peuvent aller jusqu’à 750 000 FCFA pour une solution e-commerce complète avec paiement Wave ou Orange Money.',
        },
        {
          q: 'Combien de temps pour créer un site web ?',
          a: 'Un site vitrine est généralement livré en 1 à 2 semaines. Un site e-commerce prend plutôt 3 à 4 semaines selon le périmètre.',
        },
        {
          q: 'Proposez-vous l’hébergement et la maintenance ?',
          a: 'Oui. Nous pouvons prendre en charge l’hébergement, la maintenance et les mises à jour de sécurité de votre site.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'Website Creation in Senegal | OMA Digital',
        description:
          'Professional website creation in Senegal. Corporate websites, e-commerce and web apps from 150,000 FCFA.',
        keywords:
          'website creation Senegal, web agency Senegal, business website Senegal, web developer Senegal',
      },
      serviceEmoji: '🌐',
      title: 'Professional Website Creation in Senegal',
      subtitle:
        'A local digital partner for fast, modern and SEO-ready websites.',
      description:
        'OMA Digital builds business websites for companies in Senegal: showcase sites, e-commerce platforms and custom web applications designed to convert.',
      localContext:
        'Senegal is a fast-growing digital market, and your online presence has become part of your credibility. From Thiès to Dakar, we design websites that load quickly, rank well and speak to local customers.',
      pricingInfo: { from: '150,000', to: '750,000' },
      faqs: [
        {
          q: 'How much does a website cost in Senegal?',
          a: 'Our pricing starts at 150,000 FCFA for a business website and can go up to 750,000 FCFA for a full e-commerce setup with local payment integrations.',
        },
        {
          q: 'How long does delivery take?',
          a: 'A standard business website usually takes 1 to 2 weeks. A larger e-commerce project generally takes 3 to 4 weeks.',
        },
        {
          q: 'Do you handle hosting and maintenance?',
          a: 'Yes. We can manage hosting, technical maintenance and ongoing security updates after launch.',
        },
      ],
    },
  },
  'website-dakar': {
    fr: {
      metadata: {
        title: 'Création de Site Web à Dakar | OMA Digital',
        description:
          'Agence web de référence pour les entreprises dakaroises. Sites vitrines, e-commerce et applications web à Dakar.',
        keywords:
          'création site web Dakar, agence web Dakar, développeur web Dakar, site internet Dakar',
      },
      serviceEmoji: '🏙️',
      title: 'Création de Site Web à Dakar',
      subtitle:
        'L’agence web de référence pour les entreprises dakaroises.',
      description:
        'OMA Digital accompagne les entreprises de Dakar dans leur transformation digitale avec des sites vitrines, boutiques en ligne et applications web sur mesure.',
      localContext:
        'Dakar concentre une grande partie des opportunités business du pays. Que vous soyez au Plateau, aux Almadies ou à Sacré-Cœur, nous créons un site web qui reflète votre ambition et capte vos prospects là où ils vous cherchent déjà: en ligne.',
      pricingInfo: { from: '150 000', to: '750 000' },
      faqs: [
        {
          q: 'Pourquoi choisir OMA Digital à Dakar ?',
          a: 'Nous combinons expertise technique et compréhension du marché sénégalais pour créer des sites réellement utiles commercialement.',
        },
        {
          q: 'Livrez-vous des sites optimisés pour mobile ?',
          a: 'Oui. Tous nos sites sont responsive et pensés pour des connexions 3G et 4G, très courantes au Sénégal.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'Website Creation in Dakar | OMA Digital',
        description:
          'A web agency for Dakar-based businesses: corporate websites, e-commerce and custom web applications.',
        keywords:
          'website creation Dakar, web agency Dakar, web developer Dakar, business website Dakar',
      },
      serviceEmoji: '🏙️',
      title: 'Website Creation in Dakar',
      subtitle:
        'A web agency built for ambitious Dakar-based businesses.',
      description:
        'OMA Digital helps companies in Dakar launch strong online platforms, from simple corporate sites to e-commerce and custom business tools.',
      localContext:
        'Dakar is highly competitive online. Your website has to look credible, load fast and convert on mobile. We build for that reality, with design and performance tuned for local users.',
      pricingInfo: { from: '150,000', to: '750,000' },
      faqs: [
        {
          q: 'Why work with OMA Digital in Dakar?',
          a: 'Because we combine technical execution, local market understanding and a strong focus on business outcomes.',
        },
        {
          q: 'Are your websites mobile-first?',
          a: 'Yes. Every build is responsive and optimized for mobile usage and variable network quality.',
        },
      ],
    },
  },
  'website-thies': {
    fr: {
      metadata: {
        title: 'Création de Site Web à Thiès | OMA Digital',
        description:
          'Agence digitale locale à Thiès. Création de sites web professionnels pour les entreprises thiéssoises.',
        keywords: 'création site web Thiès, agence digitale Thiès, site internet Thiès',
      },
      serviceEmoji: '🏛️',
      title: 'Création de Site Web à Thiès',
      subtitle: 'Votre agence digitale locale à Thiès.',
      description:
        'Basée à Thiès, OMA Digital crée des sites web professionnels pour les entreprises thiéssoises avec un accompagnement de proximité.',
      localContext:
        'Thiès mérite des entreprises visibles en ligne et bien représentées digitalement. En tant qu’agence locale, nous comprenons les contraintes terrain et proposons des solutions adaptées, sans discours hors-sol.',
      pricingInfo: { from: '150 000', to: '750 000' },
      faqs: [
        {
          q: 'Êtes-vous vraiment basés à Thiès ?',
          a: 'Oui. OMA Digital est basée à Thiès et peut vous accompagner avec un suivi de proximité.',
        },
        {
          q: 'Travaillez-vous avec des petites entreprises ?',
          a: 'Oui. Nous accompagnons aussi bien les PME que les commerces, restaurants et indépendants.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'Website Creation in Thiès | OMA Digital',
        description:
          'Local web agency in Thiès building professional websites for businesses and entrepreneurs.',
        keywords: 'website creation Thiès, web agency Thiès, business website Thiès',
      },
      serviceEmoji: '🏛️',
      title: 'Website Creation in Thiès',
      subtitle: 'A local digital agency in Thiès.',
      description:
        'OMA Digital is based in Thiès and builds professional websites for local businesses with hands-on support.',
      localContext:
        'Being local matters. We understand the pace, the expectations and the commercial reality in Thiès, and we turn that into websites that help businesses look more credible and get contacted faster.',
      pricingInfo: { from: '150,000', to: '750,000' },
      faqs: [
        {
          q: 'Are you really based in Thiès?',
          a: 'Yes. OMA Digital is based in Thiès and can support local companies with a close working relationship.',
        },
        {
          q: 'Do you work with small businesses too?',
          a: 'Yes. We work with SMEs, local shops, restaurants and founders who need a serious online presence.',
        },
      ],
    },
  },
  'mobile-senegal': {
    fr: {
      metadata: {
        title: 'Développement Application Mobile au Sénégal | OMA Digital',
        description:
          'Développement d’applications mobiles iOS et Android au Sénégal. À partir de 300 000 FCFA.',
        keywords:
          'application mobile Sénégal, développement app Sénégal, app iOS Android Sénégal',
      },
      serviceEmoji: '📱',
      title: 'Développement d’Application Mobile au Sénégal',
      subtitle:
        'Applications iOS et Android sur mesure pour les entreprises sénégalaises.',
      description:
        'OMA Digital développe des applications mobiles performantes pour le marché sénégalais: iOS, Android et solutions cross-platform orientées usage réel.',
      localContext:
        'Le Sénégal est massivement mobile-first. Si votre service n’est pas accessible facilement sur smartphone, vous perdez des usages. Nous créons des apps pensées pour vos clients, vos équipes et les paiements locaux.',
      pricingInfo: { from: '300 000', to: '1 200 000' },
      faqs: [
        {
          q: 'Combien coûte une application mobile au Sénégal ?',
          a: 'Nos projets démarrent à 300 000 FCFA pour une application simple et montent selon la complexité, les intégrations et les plateformes cibles.',
        },
        {
          q: 'Développez-vous pour iOS et Android ?',
          a: 'Oui. Nous réalisons des applications natives ou cross-platform selon le besoin métier et le budget.',
        },
        {
          q: 'Intégrez-vous Wave et Orange Money ?',
          a: 'Oui. L’intégration des paiements mobiles locaux fait partie des usages que nous savons mettre en place.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'Mobile App Development in Senegal | OMA Digital',
        description:
          'Custom iOS and Android app development in Senegal from 300,000 FCFA.',
        keywords:
          'mobile app Senegal, app development Senegal, iOS Android app Senegal',
      },
      serviceEmoji: '📱',
      title: 'Mobile App Development in Senegal',
      subtitle:
        'Custom iOS and Android apps for businesses operating in Senegal.',
      description:
        'OMA Digital builds mobile applications for real business use cases in Senegal: customer apps, internal tools and cross-platform products.',
      localContext:
        'Mobile usage dominates in Senegal. That changes product expectations: speed, clarity and payment convenience matter. We design apps around how your users actually behave on their phones.',
      pricingInfo: { from: '300,000', to: '1,200,000' },
      faqs: [
        {
          q: 'How much does a mobile app cost in Senegal?',
          a: 'Our mobile projects start at 300,000 FCFA for a simple app and scale based on features, integrations and platform scope.',
        },
        {
          q: 'Do you build for both iOS and Android?',
          a: 'Yes. We ship native or cross-platform apps depending on the product constraints and budget.',
        },
        {
          q: 'Can you integrate local mobile payments?',
          a: 'Yes. We can integrate local payment workflows such as Wave and Orange Money when the product requires them.',
        },
      ],
    },
  },
  'ai-senegal': {
    fr: {
      metadata: {
        title: 'Automatisation IA au Sénégal | OMA Digital',
        description:
          'Solutions d’automatisation IA pour les entreprises sénégalaises. Chatbots, workflows automatisés, CRM intelligent. À partir de 200 000 FCFA.',
        keywords:
          'automatisation IA Sénégal, intelligence artificielle Sénégal, chatbot IA Sénégal',
      },
      serviceEmoji: '🤖',
      title: 'Automatisation IA pour les Entreprises Sénégalaises',
      subtitle:
        'Boostez votre productivité avec des systèmes IA vraiment utiles.',
      description:
        'OMA Digital déploie des solutions d’automatisation IA au Sénégal: chatbots, workflows, CRM intelligent et automatisations métier sur mesure.',
      localContext:
        'L’IA n’est plus un sujet réservé aux grandes entreprises. Les PME sénégalaises peuvent aussi automatiser le support, les relances, la qualification commerciale et les tâches répétitives à fort coût humain.',
      pricingInfo: { from: '200 000', to: '1 000 000' },
      faqs: [
        {
          q: 'Que peut automatiser l’IA dans mon entreprise ?',
          a: 'Le service client, la qualification de leads, les relances, la saisie répétitive, certaines analyses et les workflows internes.',
        },
        {
          q: 'Faut-il des compétences techniques dans l’équipe ?',
          a: 'Non. Nous livrons des systèmes exploitables et pouvons former votre équipe à leur usage.',
        },
        {
          q: 'Quel retour sur investissement attendre ?',
          a: 'Le ROI dépend du volume et du temps aujourd’hui perdu, mais les gains se voient souvent rapidement sur la réactivité et le temps économisé.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'AI Automation in Senegal | OMA Digital',
        description:
          'AI automation services for Senegalese businesses: chatbots, automated workflows and smart CRM systems.',
        keywords:
          'AI automation Senegal, artificial intelligence Senegal, AI chatbot Senegal',
      },
      serviceEmoji: '🤖',
      title: 'AI Automation for Businesses in Senegal',
      subtitle:
        'Use AI where it saves time, improves response speed and scales operations.',
      description:
        'OMA Digital deploys practical AI systems in Senegal: lead qualification, customer support chatbots, smart workflows and business automation.',
      localContext:
        'AI only matters if it removes friction. For businesses in Senegal, that usually means faster replies, less manual repetition and better follow-up. We focus on that, not on novelty demos.',
      pricingInfo: { from: '200,000', to: '1,000,000' },
      faqs: [
        {
          q: 'What can AI automate in my business?',
          a: 'Lead qualification, customer support, follow-up sequences, repetitive admin work and parts of your internal workflows.',
        },
        {
          q: 'Does my team need technical skills?',
          a: 'No. We deliver usable systems and can train your team on the day-to-day workflow.',
        },
        {
          q: 'What kind of ROI should we expect?',
          a: 'That depends on your current process cost, but teams usually see quick gains in response speed, consistency and time saved.',
        },
      ],
    },
  },
  'website-campbell-river': {
    fr: {
      metadata: {
        title: 'Création de Site Web à Campbell River | OMA Digital',
        description:
          'Sites web professionnels pour entreprises, indépendants et services locaux à Campbell River, Colombie-Britannique. Design, SEO local, formulaires et conversion.',
        keywords:
          'création site web Campbell River, site web Campbell River, web design Campbell River, agence web Colombie-Britannique',
      },
      serviceEmoji: '🌐',
      title: 'Création de Site Web sur mesure',
      subtitle:
        'Des sites clairs, rapides et orientés leads pour les entreprises locales.',
      description:
        'OMA Digital accompagne les commerces, freelances et petites entreprises avec des sites vitrines, pages de service et plateformes web conçues pour inspirer confiance et recevoir des demandes qualifiées.',
      localContext:
        'Les clients comparent vite avant d’appeler: Google, mobile, avis, services et formulaire de contact. Une page locale bien structurée aide votre entreprise à être comprise rapidement, surtout pour les recherches de proximité.',
      pricingInfo: {
        from: 'Sur devis',
        currencyLabel: '',
        note: 'Le budget dépend du nombre de pages, du contenu, des intégrations et du niveau de suivi souhaité.',
      },
      faqs: [
        {
          q: 'Travaillez-vous avec les petites entreprises locales ?',
          a: 'Oui. La page est pensée pour commerces, services locaux, indépendants, consultants et petites équipes qui veulent recevoir plus de demandes via leur site.',
        },
        {
          q: 'Le site peut-il inclure un formulaire de demande ?',
          a: 'Oui. Le site peut inclure formulaire, WhatsApp, email, appel direct, suivi des leads et automatisation simple selon le besoin.',
        },
        {
          q: 'Faites-vous aussi le SEO local ?',
          a: 'Oui. Les pages peuvent être structurées autour de votre zone, des services proposés, des questions clients et des appels à l’action.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'Website Design in Campbell River | OMA Digital',
        description:
          'Professional websites for Campbell River businesses, freelancers and local services. Local SEO, lead forms, conversion-focused pages and mobile-first design.',
        keywords:
          'website design Campbell River, web design Campbell River BC, Campbell River website developer, local SEO Campbell River',
      },
      serviceEmoji: '🌐',
      title: 'Website Design for Local Businesses',
      subtitle:
        'Clear, fast and lead-focused websites for local businesses.',
      description:
        'OMA Digital helps businesses, freelancers and local service providers launch websites that explain the offer, build trust and make it easier for visitors to contact you.',
      localContext:
        'Potential clients often check your website before they call. A strong local page has to work on mobile, explain your services quickly and make the next step obvious: call, WhatsApp, form or booking request.',
      pricingInfo: {
        from: 'Custom quote',
        currencyLabel: '',
        note: 'The budget depends on page count, content, integrations and the level of support required.',
      },
      faqs: [
        {
          q: 'Do you work with small local businesses?',
          a: 'Yes. The service is designed for local shops, service providers, freelancers, consultants and small teams that need a credible website.',
        },
        {
          q: 'Can the website capture leads?',
          a: 'Yes. We can include contact forms, WhatsApp links, email routing, call actions and basic lead follow-up workflows.',
        },
        {
          q: 'Do you handle local SEO?',
          a: 'Yes. Pages can be structured around your area, your services, customer questions and clear calls to action.',
        },
      ],
    },
  },
  'mobile-campbell-river': {
    fr: {
      metadata: {
        title: 'Application Mobile à Campbell River | OMA Digital',
        description:
          'Applications mobiles pour entreprises de Campbell River: prise de rendez-vous, portail client, outils internes, iOS, Android et solutions web app.',
        keywords:
          'application mobile Campbell River, développement app Campbell River, app iOS Android Campbell River, web app Colombie-Britannique',
      },
      serviceEmoji: '📱',
      title: 'Application Mobile sur mesure',
      subtitle:
        'Des apps utiles pour les clients, les opérations et les services locaux.',
      description:
        'OMA Digital crée des applications mobiles et web apps pour aider les entreprises à mieux gérer les demandes, les rendez-vous, les clients et les opérations internes.',
      localContext:
        'Les entreprises locales ont souvent besoin d’outils simples: réservation, suivi de demandes, notifications, portail client ou tableau de bord interne. Une app doit résoudre un vrai blocage opérationnel avant d’ajouter des fonctions complexes.',
      pricingInfo: {
        from: 'Sur devis',
        currencyLabel: '',
        note: 'Le budget dépend du périmètre, des plateformes, des comptes utilisateurs et des intégrations.',
      },
      faqs: [
        {
          q: 'Faut-il une app native iOS et Android ?',
          a: 'Pas toujours. Selon le besoin, une web app mobile peut être plus rapide et plus économique. Le choix dépend de l’usage réel.',
        },
        {
          q: 'Pouvez-vous faire une app de rendez-vous ?',
          a: 'Oui. Les cas possibles incluent prise de rendez-vous, demandes client, suivi interne, notifications et tableau de bord.',
        },
        {
          q: 'Travaillez-vous à distance ?',
          a: 'Oui. Le cadrage, les maquettes, les tests et les itérations peuvent se faire à distance avec des points de suivi clairs.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'Mobile App Development in Campbell River | OMA Digital',
        description:
          'Mobile apps and web apps for Campbell River businesses: bookings, customer portals, internal tools, iOS, Android and automation-ready workflows.',
        keywords:
          'mobile app development Campbell River, app developer Campbell River BC, web app Campbell River, iOS Android app Campbell River',
      },
      serviceEmoji: '📱',
      title: 'Custom Mobile App Development',
      subtitle:
        'Practical apps for local operations, customers and service workflows.',
      description:
        'OMA Digital builds mobile apps and web apps for businesses that need better bookings, customer requests, internal tracking or digital service delivery.',
      localContext:
        'A useful app should reduce friction: fewer manual messages, clearer customer requests, simpler scheduling and better follow-up. The right solution may be a native app, a web app or a private internal tool.',
      pricingInfo: {
        from: 'Custom quote',
        currencyLabel: '',
        note: 'The budget depends on scope, platforms, user accounts, integrations and support needs.',
      },
      faqs: [
        {
          q: 'Do I need a native iOS and Android app?',
          a: 'Not always. A mobile web app can be faster and more practical for some businesses. The right choice depends on how users will actually use it.',
        },
        {
          q: 'Can you build a booking or request app?',
          a: 'Yes. Typical use cases include bookings, customer requests, internal tracking, notifications and dashboards.',
        },
        {
          q: 'Can you work remotely with businesses?',
          a: 'Yes. Planning, wireframes, tests and iterations can be handled remotely with a clear review process.',
        },
      ],
    },
  },
  'ai-campbell-river': {
    fr: {
      metadata: {
        title: 'Automatisation IA à Campbell River | OMA Digital',
        description:
          'Automatisation IA pour entreprises de Campbell River: qualification de leads, chatbot, formulaires intelligents, relances, CRM et workflows n8n.',
        keywords:
          'automatisation IA Campbell River, chatbot Campbell River, n8n Campbell River, automatisation entreprise Colombie-Britannique',
      },
      serviceEmoji: '🤖',
      title: 'Automatisation IA sur mesure',
      subtitle:
        'Des workflows IA pour répondre plus vite, qualifier les demandes et réduire les tâches répétitives.',
      description:
        'OMA Digital aide les entreprises à automatiser la qualification de leads, les réponses initiales, les suivis, les formulaires, les notifications et certains processus internes.',
      localContext:
        'Pour une petite entreprise locale, l’IA doit rester concrète: capter une demande, poser les bonnes questions, envoyer une notification, alimenter un CRM ou déclencher une relance. L’objectif est de gagner du temps sans perdre le contrôle.',
      pricingInfo: {
        from: 'Sur devis',
        currencyLabel: '',
        note: 'Le budget dépend du volume de leads, des outils connectés, des canaux et du niveau d’automatisation.',
      },
      faqs: [
        {
          q: 'Quels processus peut-on automatiser ?',
          a: 'Demandes entrantes, qualification, réponses initiales, rappels, transfert vers CRM, notifications équipe et reporting simple.',
        },
        {
          q: 'Pouvez-vous connecter WhatsApp ou Telegram ?',
          a: 'Oui, lorsque ces canaux sont adaptés au public cible. Le site, les formulaires, email ou d’autres canaux peuvent aussi être connectés.',
        },
        {
          q: 'L’IA remplace-t-elle le contact humain ?',
          a: 'Non. L’objectif est d’accélérer les étapes répétitives et de préparer une meilleure prise en charge humaine.',
        },
      ],
    },
    en: {
      metadata: {
        title: 'AI Automation in Campbell River | OMA Digital',
        description:
          'AI automation for Campbell River businesses: lead qualification, chatbots, smart forms, follow-ups, CRM updates and n8n workflows.',
        keywords:
          'AI automation Campbell River, chatbot Campbell River, n8n automation Campbell River, business automation BC',
      },
      serviceEmoji: '🤖',
      title: 'Custom AI Automation',
      subtitle:
        'AI workflows that reply faster, qualify leads and reduce repetitive admin work.',
      description:
        'OMA Digital helps businesses automate lead qualification, first replies, form routing, reminders, notifications and practical internal workflows.',
      localContext:
        'For a local business, AI is useful when it improves response speed and follow-up. A practical setup can collect the right details, notify the right person, update a CRM and keep the lead warm until a human takes over.',
      pricingInfo: {
        from: 'Custom quote',
        currencyLabel: '',
        note: 'The budget depends on lead volume, connected tools, channels and the level of automation required.',
      },
      faqs: [
        {
          q: 'What can AI automate for a business?',
          a: 'Inbound requests, lead qualification, first replies, reminders, CRM handoff, team notifications and simple reporting.',
        },
        {
          q: 'Can you connect WhatsApp or Telegram?',
          a: 'Yes, when those channels fit the audience. Website chat, forms, email and other channels can also be connected.',
        },
        {
          q: 'Does AI replace human service?',
          a: 'No. The goal is to speed up repetitive steps and prepare better handoff to a human.',
        },
      ],
    },
  },
};

export function getServicePageContent(id: ServicePageId, locale: string): ServicePageContent {
  const normalizedLocale: Locale = locale === 'en' ? 'en' : 'fr';
  return servicePages[id][normalizedLocale];
}
