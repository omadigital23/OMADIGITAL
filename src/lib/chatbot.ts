import { BUSINESS, WHATSAPP_URL } from '@/lib/constants';

export type ChatLocale = 'fr' | 'en';
export type ChatRole = 'user' | 'assistant';
export type ServiceType = 'website' | 'mobile' | 'ai';
export type ChatIntent = 'services' | 'pricing' | 'audit' | 'contact' | 'general';
export type LeadStage = 'discovery' | 'interested' | 'qualified' | 'ready';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatSuggestion = {
  label: string;
  kind: 'prompt' | 'link';
  value: string;
};

export type LeadInsights = {
  name: string | null;
  email: string | null;
  phone: string | null;
  businessType: string | null;
  service: ServiceType | null;
  budget: string | null;
  projectSummary: string | null;
  latestUserMessage: string | null;
  qualificationScore: number;
  stage: LeadStage;
};

const CONTACT_LINE = {
  fr: `WhatsApp : ${BUSINESS.phone} | Email : ${BUSINESS.email}`,
  en: `WhatsApp: ${BUSINESS.phone} | Email: ${BUSINESS.email}`,
} as const;

const SERVICE_COPY = {
  fr: {
    website: 'Création de sites web - à partir de 150 000 FCFA',
    mobile: 'Applications mobiles - à partir de 300 000 FCFA',
    ai: 'Automatisation IA - à partir de 200 000 FCFA',
  },
  en: {
    website: 'Website creation - starting at 150,000 FCFA',
    mobile: 'Mobile applications - starting at 300,000 FCFA',
    ai: 'AI automation - starting at 200,000 FCFA',
  },
} as const;

const INITIAL_SUGGESTIONS: Record<ChatLocale, ChatSuggestion[]> = {
  fr: [
    { label: 'Nos services', kind: 'prompt', value: 'Quels services recommandez-vous pour mon entreprise ?' },
    { label: 'Tarifs', kind: 'prompt', value: 'Quels sont vos tarifs de départ ?' },
    { label: 'Audit gratuit', kind: 'prompt', value: 'Je souhaite un audit gratuit pour mon entreprise.' },
    { label: 'Nous contacter', kind: 'prompt', value: 'Comment puis-je vous contacter rapidement ?' },
  ],
  en: [
    { label: 'Services', kind: 'prompt', value: 'Which service do you recommend for my business?' },
    { label: 'Pricing', kind: 'prompt', value: 'What are your starting prices?' },
    { label: 'Free audit', kind: 'prompt', value: 'I would like a free audit for my business.' },
    { label: 'Contact', kind: 'prompt', value: 'How can I contact you quickly?' },
  ],
};

const CONTACT_ACTIONS: Record<ChatLocale, ChatSuggestion[]> = {
  fr: [
    { label: 'WhatsApp', kind: 'link', value: WHATSAPP_URL },
    { label: 'Email', kind: 'link', value: `mailto:${BUSINESS.email}` },
  ],
  en: [
    { label: 'WhatsApp', kind: 'link', value: WHATSAPP_URL },
    { label: 'Email', kind: 'link', value: `mailto:${BUSINESS.email}` },
  ],
};

const SERVICE_KEYWORDS: Record<ServiceType, string[]> = {
  website: ['site web', 'website', 'web site', 'landing page', 'e-commerce', 'ecommerce', 'boutique en ligne', 'shop', 'seo'],
  mobile: ['application mobile', 'app mobile', 'mobile app', 'android', 'ios', 'flutter', 'react native'],
  ai: ['automatisation', 'automation', 'ia', 'ai', 'chatbot', 'workflow', 'agent ia', 'agent ai'],
};

const BUSINESS_HINTS = [
  'restaurant',
  'boutique',
  'shop',
  'store',
  'clinic',
  'clinique',
  'cabinet',
  'agency',
  'agence',
  'startup',
  'start-up',
  'societe',
  'société',
  'entreprise',
  'company',
  'business',
  'commerce',
  'hotel',
  'hôtel',
  'salon',
  'pharmacie',
  'school',
  'ecole',
  'école',
  'association',
];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function normalizeReplyWhitespace(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeReplyLists(value: string): string {
  return value
    .replace(/:\s*[-•]\s+/g, ':\n- ')
    .replace(/([);.!?])\s*[-•]\s+(?=[A-Z0-9])/g, '$1\n- ')
    .replace(/\n[-•]\s*/g, '\n- ');
}

function titleCaseName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function sanitizeCapturedValue(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/^[\s,.;:-]+/, '')
      .replace(/[\s,.;:-]+$/, '')
  );
}

function uniqueSuggestions(suggestions: ChatSuggestion[]): ChatSuggestion[] {
  const seen = new Set<string>();
  const result: ChatSuggestion[] = [];

  for (const suggestion of suggestions) {
    const key = `${suggestion.kind}:${suggestion.label}:${suggestion.value}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(suggestion);
  }

  return result;
}

function getUserMessages(messages: ChatMessage[]): string[] {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) => normalizeWhitespace(message.content))
    .filter(Boolean);
}

function findLastPatternMatch(texts: string[], patterns: RegExp[]): string | null {
  const reversed = [...texts].reverse();

  for (const text of reversed) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      const value = match?.[1];
      if (value) {
        return sanitizeCapturedValue(value);
      }
    }
  }

  return null;
}

function extractEmail(texts: string[]): string | null {
  const reversed = [...texts].reverse();

  for (const text of reversed) {
    const match = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
    if (match?.[0]) {
      return match[0].toLowerCase();
    }
  }

  return null;
}

function extractPhone(texts: string[]): string | null {
  const reversed = [...texts].reverse();

  for (const text of reversed) {
    const matches = text.match(/(?:\+?\d[\d\s().-]{6,}\d)/g);
    if (!matches?.length) {
      continue;
    }

    const candidate = sanitizeCapturedValue(matches[matches.length - 1]);
    const digits = candidate.replace(/\D/g, '');

    if (digits.length >= 7 && digits.length <= 15) {
      return candidate;
    }
  }

  return null;
}

function extractService(texts: string[]): ServiceType | null {
  const content = texts.join(' ').toLowerCase();

  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS) as [ServiceType, string[]][]) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      return service;
    }
  }

  return null;
}

function extractBudget(texts: string[]): string | null {
  const reversed = [...texts].reverse();
  const patterns = [
    /\b(?:budget|prix|tarif|co[uû]t|price|cost|quote|devis)[^.!?\n]{0,40}?((?:\d[\d\s.,]*\s*(?:k|m|fcfa|cfa|mad|dh|usd|eur|\$|€)?))/i,
    /\b((?:\d[\d\s.,]*\s*(?:k|m)?\s*(?:fcfa|cfa|mad|dh|usd|eur|\$|€)))\b/i,
  ];

  for (const text of reversed) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return sanitizeCapturedValue(match[1]);
      }
    }
  }

  return null;
}

function extractName(texts: string[]): string | null {
  const value = findLastPatternMatch(texts, [
    /\b(?:je m'appelle|mon nom est|moi c'est)\s+([A-Za-zÀ-ÿ' -]{2,60})/i,
    /\b(?:my name is|this is)\s+([A-Za-zÀ-ÿ' -]{2,60})/i,
  ]);

  return value ? titleCaseName(value) : null;
}

function extractBusinessType(texts: string[]): string | null {
  const explicitValue = findLastPatternMatch(texts, [
    /\b(?:je g[èe]re|j'ai|nous sommes|mon entreprise est|ma soci[ée]t[ée] est)\s+(?:une?\s+)?([^.!?\n]{3,70})/i,
    /\b(?:i run|we run|my company is|my business is|we are)\s+(?:an?\s+)?([^.!?\n]{3,70})/i,
  ]);

  if (explicitValue) {
    return truncate(explicitValue, 80);
  }

  const reversed = [...texts].reverse();

  for (const text of reversed) {
    const lower = text.toLowerCase();
    const hint = BUSINESS_HINTS.find((value) => lower.includes(value));
    if (hint) {
      return truncate(text, 80);
    }
  }

  return null;
}

function buildProjectSummary(texts: string[]): string | null {
  if (texts.length === 0) {
    return null;
  }

  const latestMessages = texts.slice(-3).map((message) => truncate(message, 220));
  return truncate(latestMessages.join(' | '), 600);
}

function getMissingFields(insights: LeadInsights): string[] {
  const missing: string[] = [];

  if (!insights.service) {
    missing.push('service');
  }

  if (!insights.budget) {
    missing.push('budget');
  }

  if (!insights.name) {
    missing.push('name');
  }

  if (!insights.email) {
    missing.push('email');
  }

  if (!insights.phone) {
    missing.push('phone');
  }

  return missing;
}

export function resolveChatLocale(locale: unknown): ChatLocale {
  return locale === 'en' ? 'en' : 'fr';
}

export function getDefaultChatSuggestions(locale: ChatLocale): ChatSuggestion[] {
  return INITIAL_SUGGESTIONS[locale];
}

export function getChatContactActions(locale: ChatLocale): ChatSuggestion[] {
  return CONTACT_ACTIONS[locale];
}

export function detectChatIntent(text: string): ChatIntent {
  const content = text.toLowerCase();

  if (/(audit|diagnostic|free audit)/.test(content)) {
    return 'audit';
  }

  if (/(prix|tarif|budget|quote|pricing|price|cost)/.test(content)) {
    return 'pricing';
  }

  if (/(contact|whatsapp|email|phone|num[eé]ro|appel|call|reach you)/.test(content)) {
    return 'contact';
  }

  if (/(service|site web|website|application|mobile|automatisation|automation|chatbot|seo|e-commerce)/.test(content)) {
    return 'services';
  }

  return 'general';
}

export function extractLeadInsights(messages: ChatMessage[]): LeadInsights {
  const userMessages = getUserMessages(messages);
  const name = extractName(userMessages);
  const email = extractEmail(userMessages);
  const phone = extractPhone(userMessages);
  const businessType = extractBusinessType(userMessages);
  const service = extractService(userMessages);
  const budget = extractBudget(userMessages);
  const projectSummary = buildProjectSummary(userMessages);
  const latestUserMessage = userMessages.at(-1) || null;
  const qualificationScore = [name, email, phone, businessType, service, budget].filter(Boolean).length;

  let stage: LeadStage = 'discovery';

  if (service || budget || businessType || projectSummary) {
    stage = 'interested';
  }

  if ((email || phone) && service && (budget || businessType || projectSummary)) {
    stage = 'qualified';
  }

  if (name && email && phone && (service || projectSummary)) {
    stage = 'ready';
  }

  return {
    name,
    email,
    phone,
    businessType,
    service,
    budget,
    projectSummary,
    latestUserMessage,
    qualificationScore,
    stage,
  };
}

export function buildSystemPrompt(locale: ChatLocale, insights: LeadInsights): string {
  const serviceCopy = SERVICE_COPY[locale];
  const missingFields = getMissingFields(insights);
  const missingFieldsText =
    missingFields.length > 0
      ? missingFields.join(', ')
      : locale === 'fr'
        ? 'aucun, le lead est presque complet'
        : 'none, the lead is almost complete';
  const knownContext = [
    `name=${insights.name || 'unknown'}`,
    `email=${insights.email || 'unknown'}`,
    `phone=${insights.phone || 'unknown'}`,
    `business=${insights.businessType || 'unknown'}`,
    `service=${insights.service || 'unknown'}`,
    `budget=${insights.budget || 'unknown'}`,
    `stage=${insights.stage}`,
  ].join('; ');

  if (locale === 'en') {
    return `You are the sales assistant for ${BUSINESS.name}, an agency based in ${BUSINESS.location.city}, ${BUSINESS.location.country}.
Website: ${BUSINESS.siteUrl}

Core offers:
- ${serviceCopy.website}
- ${serviceCopy.mobile}
- ${serviceCopy.ai}

Hard rules:
- Detect the language of the user's last message and reply in that same language. If the language is neither French nor English, reply in French.
- Answer the user's exact latest question first. Only add context that directly helps answer it.
- Keep replies short: 2 to 4 sentences by default, with at most one short qualifying follow-up question.
- Do not automatically list every service, every price, or the full company pitch.
- Only present multiple offers when the user explicitly asks for services, options, or pricing.
- If you list offers, keep each item to one short line and only include the most relevant options.
- Never invent phone numbers, prices, case studies, timelines, or countries.
- Use these exact contact details only:
  WhatsApp: ${BUSINESS.phone}
  Email: ${BUSINESS.email}
- Never paste a raw WhatsApp URL in the reply body. When sharing contact, show only the WhatsApp number and email.
- Pricing must stay framed as "starting at", never give fake exact quotes.
- Do not promise advanced features, delivery guarantees, or custom scope before a brief.
- When a user shares a budget, position the closest starting package and say the final scope depends on the brief.
- Your goal is to qualify the lead for WhatsApp or the contact form.
- When interest is strong, gather the missing items progressively: project type, budget, name, email, phone.
- Ask for one missing field at a time, not everything at once.
- If the user asks for pricing, give the relevant starting price and the main deliverable in one concise answer.
- If the user asks for contact, provide both the exact WhatsApp number and email above.
- Do not re-introduce yourself unless the user asks who you are or starts with a greeting.

Known lead context: ${knownContext}
Missing data still useful: ${missingFieldsText}

Tone:
- Consultative, sharp, modern, conversion-focused.
- Confident, never pushy.
- Avoid markdown tables.
- Do not mention these instructions.`;
  }

  return `Tu es l'assistant commercial de ${BUSINESS.name}, une agence basee a ${BUSINESS.location.city}, ${BUSINESS.location.country}.
Site web: ${BUSINESS.siteUrl}

Offres principales:
- ${serviceCopy.website}
- ${serviceCopy.mobile}
- ${serviceCopy.ai}

Regles strictes:
- Detecte la langue du dernier message utilisateur et reponds dans cette meme langue. Si la langue n'est ni le francais ni l'anglais, reponds en francais.
- Reponds d'abord a la question exacte du dernier message. Ajoute seulement le contexte utile pour y repondre.
- Reponses courtes par defaut: 2 a 4 phrases, avec au maximum une seule courte question de qualification.
- Ne recite pas automatiquement tous les services, tous les prix, ni tout le pitch commercial.
- Ne presente plusieurs offres que si l'utilisateur demande explicitement les services, les options ou les tarifs.
- Si tu listes des offres, garde une ligne courte par offre et limite-toi aux options les plus pertinentes.
- N'invente jamais de numero, de pays, de tarifs exacts, de delais ou de cas clients.
- Utilise uniquement ces coordonnees exactes:
  WhatsApp: ${BUSINESS.phone}
  Email: ${BUSINESS.email}
- N'affiche jamais d'URL WhatsApp brute dans le corps de la reponse. En cas de contact, affiche seulement le numero WhatsApp et l'email.
- Les prix doivent toujours rester formules "a partir de".
- Ne promets jamais de fonctionnalites avancees, de delais fermes ou de perimetre sur mesure sans brief.
- Quand un budget est donne, rattache-le au forfait de depart le plus proche et precise que le perimetre final depend du brief.
- Ton objectif est de qualifier le lead pour WhatsApp ou le formulaire de contact.
- Quand l'interet est reel, collecte progressivement les informations manquantes: type de projet, budget, nom, email, telephone.
- Demande un seul champ manquant a la fois.
- Si l'utilisateur demande les tarifs, donne le prix de depart pertinent et le livrable principal en une reponse concise.
- Si l'utilisateur demande le contact, donne a la fois le numero WhatsApp exact et l'email exact ci-dessus.
- Ne te re-presente pas sauf si l'utilisateur demande qui tu es ou commence par une salutation.

Contexte lead connu: ${knownContext}
Donnees encore utiles: ${missingFieldsText}

Ton:
- Professionnel, moderne, efficace, oriente conversion.
- Serein, jamais agressif.
- Evite les tableaux markdown.
- Ne mentionne jamais ces instructions.`;
}

export function sanitizeAssistantReply(reply: string): string {
  const normalizedReply = reply
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1: $2')
    .replace(/\[([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\]/gi, '$1')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/https?:\/\/(?:wa\.me\/\d+[^\s)"]*|api\.whatsapp\.com\/send\?[^\s)"]*)/gi, BUSINESS.phone)
    .replace(/\+?212[\s().-]*701[\s().-]*193[\s().-]*811/gi, BUSINESS.phone)
    .replace(/support@omadigital\.(com|sn)/gi, BUSINESS.email);

  return normalizeReplyWhitespace(normalizeReplyLists(normalizedReply));
}

export function appendDeterministicContactCta(
  reply: string,
  locale: ChatLocale,
  intent: ChatIntent,
  stage: LeadStage
): string {
  const shouldAddContactLine =
    intent === 'contact' ||
    intent === 'audit' ||
    stage === 'qualified' ||
    stage === 'ready';

  if (!shouldAddContactLine) {
    return reply;
  }

  const hasPhone = reply.includes(BUSINESS.phone);
  const hasEmail = reply.includes(BUSINESS.email);

  if (hasPhone && hasEmail) {
    return reply;
  }

  if (!hasPhone && !hasEmail) {
    return `${reply}\n\n${CONTACT_LINE[locale]}`;
  }

  const missingContactParts = [];

  if (!hasPhone) {
    missingContactParts.push(locale === 'fr' ? `WhatsApp : ${BUSINESS.phone}` : `WhatsApp: ${BUSINESS.phone}`);
  }

  if (!hasEmail) {
    missingContactParts.push(locale === 'fr' ? `Email : ${BUSINESS.email}` : `Email: ${BUSINESS.email}`);
  }

  return `${reply}\n\n${missingContactParts.join(' | ')}`;
}

export function buildChatSuggestions(locale: ChatLocale, insights: LeadInsights): ChatSuggestion[] {
  const suggestions: ChatSuggestion[] = [];

  if (!insights.service) {
    if (locale === 'en') {
      suggestions.push(
        { label: 'Website project', kind: 'prompt', value: 'I need a website for my business.' },
        { label: 'Mobile app', kind: 'prompt', value: 'I need a mobile app for my business.' },
        { label: 'AI automation', kind: 'prompt', value: 'I need AI automation for my business.' }
      );
    } else {
      suggestions.push(
        { label: 'Projet site web', kind: 'prompt', value: "J'ai besoin d'un site web pour mon entreprise." },
        { label: 'Application mobile', kind: 'prompt', value: "J'ai besoin d'une application mobile pour mon entreprise." },
        { label: 'Automatisation IA', kind: 'prompt', value: "J'ai besoin d'une automatisation IA pour mon entreprise." }
      );
    }
  }

  if (!insights.budget) {
    if (locale === 'en') {
      suggestions.push(
        { label: 'Budget 150k-300k', kind: 'prompt', value: 'My budget is around 150,000 to 300,000 FCFA.' },
        { label: 'Budget 300k+', kind: 'prompt', value: 'My budget is above 300,000 FCFA.' }
      );
    } else {
      suggestions.push(
        { label: 'Budget 150k-300k', kind: 'prompt', value: 'Mon budget est autour de 150 000 a 300 000 FCFA.' },
        { label: 'Budget 300k+', kind: 'prompt', value: 'Mon budget est superieur a 300 000 FCFA.' }
      );
    }
  }

  if (!insights.email && insights.stage !== 'discovery') {
    suggestions.push(
      locale === 'en'
        ? { label: 'Share email', kind: 'prompt', value: 'I can share my email to receive a proposal.' }
        : { label: 'Partager mon email', kind: 'prompt', value: 'Je peux partager mon email pour recevoir une proposition.' }
    );
  }

  if (!insights.phone && insights.stage !== 'discovery') {
    suggestions.push(
      locale === 'en'
        ? { label: 'Share phone', kind: 'prompt', value: 'I can share my phone number for a WhatsApp follow-up.' }
        : { label: 'Partager mon numero', kind: 'prompt', value: 'Je peux partager mon numero pour un suivi WhatsApp.' }
    );
  }

  if (insights.stage === 'ready' || insights.stage === 'qualified') {
    suggestions.unshift(...CONTACT_ACTIONS[locale]);
  }

  return uniqueSuggestions([...suggestions, ...INITIAL_SUGGESTIONS[locale]]).slice(0, 4);
}

export function buildChatFallback(locale: ChatLocale): string {
  if (locale === 'en') {
    return `I am temporarily unavailable, but you can still reach OMA Digital on WhatsApp at ${BUSINESS.phone} or by email at ${BUSINESS.email}.`;
  }

  return `Je suis temporairement indisponible, mais vous pouvez joindre OMA Digital sur WhatsApp au ${BUSINESS.phone} ou par email a ${BUSINESS.email}.`;
}

export function buildTranscriptionPrompt(locale: ChatLocale): string {
  if (locale === 'en') {
    return 'OMA Digital, Thies, Senegal, website creation, mobile apps, AI automation, WhatsApp, free audit, chatbot, business automation.';
  }

  return 'OMA Digital, Thies, Senegal, creation de sites web, applications mobiles, automatisation IA, WhatsApp, audit gratuit, chatbot, automatisation business.';
}
