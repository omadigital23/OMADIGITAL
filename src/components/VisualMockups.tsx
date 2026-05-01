import Image from 'next/image';
import { cn } from '@/lib/utils';

export type ServiceVariant = 'website' | 'mobile' | 'ai';

type Locale = string | undefined;

const serviceCopy = {
  website: {
    fr: {
      eyebrow: 'Site rapide + SEO',
      title: 'Presence web premium',
      metric: '+38%',
      metricLabel: 'demandes qualifiees',
      chips: ['SEO', 'Mobile', 'Paiements'],
      highlight: 'Pages claires, parcours court, contact visible.',
      deliverables: ['Maquette responsive', 'SEO local', 'Formulaire + WhatsApp'],
    },
    en: {
      eyebrow: 'Fast site + SEO',
      title: 'Premium web presence',
      metric: '+38%',
      metricLabel: 'qualified inquiries',
      chips: ['SEO', 'Mobile', 'Payments'],
      highlight: 'Clear pages, short journey, visible contact.',
      deliverables: ['Responsive mockup', 'Local SEO', 'Form + WhatsApp'],
    },
  },
  mobile: {
    fr: {
      eyebrow: 'iOS + Android',
      title: 'Experience mobile fluide',
      metric: '4.8/5',
      metricLabel: 'experience utilisateur',
      chips: ['App', 'Push', 'Mobile money'],
      highlight: 'Reservations, commandes et suivi depuis le telephone.',
      deliverables: ['Prototype ecrans', 'Notifications', 'Publication stores'],
    },
    en: {
      eyebrow: 'iOS + Android',
      title: 'Smooth mobile experience',
      metric: '4.8/5',
      metricLabel: 'user experience',
      chips: ['App', 'Push', 'Mobile money'],
      highlight: 'Bookings, orders and tracking from the phone.',
      deliverables: ['Screen prototype', 'Notifications', 'Store release'],
    },
  },
  ai: {
    fr: {
      eyebrow: 'IA + automatisation',
      title: 'Workflow qui vend 24/7',
      metric: '-12h',
      metricLabel: 'temps manuel / semaine',
      chips: ['WhatsApp', 'CRM', 'Reporting'],
      highlight: 'Qualification, relance et reponse client automatisees.',
      deliverables: ['Chatbot IA', 'Workflow CRM', 'Dashboard de suivi'],
    },
    en: {
      eyebrow: 'AI + automation',
      title: 'Workflow that sells 24/7',
      metric: '-12h',
      metricLabel: 'manual time / week',
      chips: ['WhatsApp', 'CRM', 'Reporting'],
      highlight: 'Automated qualification, follow-up and support.',
      deliverables: ['AI chatbot', 'CRM workflow', 'Tracking dashboard'],
    },
  },
} satisfies Record<ServiceVariant, Record<'fr' | 'en', {
  eyebrow: string;
  title: string;
  metric: string;
  metricLabel: string;
  chips: string[];
  highlight: string;
  deliverables: string[];
}>>;

function pickLocale(locale: Locale) {
  return locale === 'en' ? 'en' : 'fr';
}

export function getServiceVisualCopy(variant: ServiceVariant, locale: Locale) {
  return serviceCopy[variant][pickLocale(locale)];
}

function BrowserMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative h-full min-h-[190px] overflow-hidden rounded-[18px] bg-[#0d1224] border border-white/10">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-coral" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-gold" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-cyan" />
        <span className="ml-3 h-2 w-28 rounded-full bg-white/10" />
      </div>
      <div className="grid h-[calc(100%-45px)] grid-cols-[1.05fr_0.95fr] gap-4 p-4">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-accent-cyan/80" />
          <div className="h-8 w-full max-w-[190px] rounded-lg bg-white/15" />
          <div className="h-3 w-5/6 rounded-full bg-white/12" />
          <div className="h-3 w-2/3 rounded-full bg-white/10" />
          <div className="mt-4 flex gap-2">
            <div className="h-9 w-24 rounded-full gradient-bg" />
            <div className="h-9 w-20 rounded-full border border-white/10 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className={cn(
                'rounded-xl border border-white/10 bg-white/[0.05] p-2',
                item === 0 && !compact ? 'col-span-2' : '',
              )}
            >
              <div className="mb-2 h-16 rounded-lg bg-gradient-to-br from-accent-blue/50 via-accent-violet/40 to-accent-cyan/25" />
              <div className="h-2 w-4/5 rounded-full bg-white/18" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto h-full min-h-[220px] w-[150px] rounded-[30px] border border-white/15 bg-[#0c1020] p-2 shadow-float">
      <div className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/70" />
      <div className="h-full rounded-[24px] bg-gradient-to-b from-[#151a34] to-[#0a0c16] px-3 pb-4 pt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-5 rounded-full bg-accent-cyan" />
          <div className="h-2 w-12 rounded-full bg-white/20" />
        </div>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white/[0.07] p-3">
            <div className="mb-2 h-2 w-16 rounded-full bg-accent-violet" />
            <div className="h-2 w-full rounded-full bg-white/16" />
            <div className="mt-1.5 h-2 w-2/3 rounded-full bg-white/10" />
          </div>
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl bg-white/[0.05] p-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-4/5 rounded-full bg-white/16" />
                <div className="h-2 w-1/2 rounded-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

function AutomationMockup() {
  const nodes = [
    { label: 'Lead', x: '10%', y: '22%' },
    { label: 'IA', x: '43%', y: '48%' },
    { label: 'CRM', x: '74%', y: '20%' },
    { label: 'Devis', x: '72%', y: '72%' },
  ];

  return (
    <div className="relative h-full min-h-[210px] overflow-hidden rounded-[18px] border border-white/10 bg-[#0c1020] p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(6,214,160,0.18),transparent_36%),radial-gradient(circle_at_74%_58%,rgba(124,106,255,0.2),transparent_38%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 360 230" aria-hidden="true">
        <path d="M70 62 C130 62 125 110 170 113" fill="none" stroke="rgba(6,214,160,.45)" strokeWidth="2" strokeDasharray="7 7" />
        <path d="M197 110 C245 98 245 58 292 55" fill="none" stroke="rgba(124,106,255,.55)" strokeWidth="2" strokeDasharray="7 7" />
        <path d="M198 130 C244 142 247 176 288 174" fill="none" stroke="rgba(79,125,255,.55)" strokeWidth="2" strokeDasharray="7 7" />
      </svg>
      {nodes.map((node) => (
        <div
          key={node.label}
          className="absolute grid h-16 w-16 place-items-center rounded-2xl border border-white/12 bg-bg-card/90 text-xs font-semibold text-text-primary shadow-card"
          style={{ left: node.x, top: node.y }}
        >
          {node.label}
        </div>
      ))}
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-accent-cyan/20 bg-accent-cyan/10 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase text-accent-cyan">
          <span>Automation live</span>
          <span>98%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[82%] rounded-full bg-accent-cyan" />
        </div>
      </div>
    </div>
  );
}

export function ServiceMockup({
  variant,
  locale,
  compact = false,
  className,
}: {
  variant: ServiceVariant;
  locale?: Locale;
  compact?: boolean;
  className?: string;
}) {
  const copy = getServiceVisualCopy(variant, locale);

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-white/10 bg-bg-primary/60 p-3', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-transparent to-accent-purple/10" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase text-accent-cyan">{copy.eyebrow}</p>
            <p className="text-sm font-semibold text-text-primary">{copy.title}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
            <p className="font-heading text-lg font-bold gradient-text">{copy.metric}</p>
            <p className="text-[10px] text-text-muted">{copy.metricLabel}</p>
          </div>
        </div>
        <div className={compact ? 'h-[180px]' : 'h-[260px]'}>
          {variant === 'website' && <BrowserMockup compact={compact} />}
          {variant === 'mobile' && <PhoneMockup />}
          {variant === 'ai' && <AutomationMockup />}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-text-secondary">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CaseStudyMedia({
  variant,
  logo,
  clientName,
  metric,
  locale,
}: {
  variant: ServiceVariant;
  logo?: string;
  clientName: string;
  metric: string;
  locale?: Locale;
}) {
  const copy = getServiceVisualCopy(variant, locale);

  return (
    <div className="relative overflow-hidden border-b border-border-subtle bg-bg-primary/70 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-transparent to-accent-cyan/10" />
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white p-1.5">
            {logo ? (
              <Image src={logo} alt={clientName} width={64} height={64} className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs font-bold text-bg-primary" aria-hidden="true">
                {variant === 'website' ? 'WEB' : variant === 'mobile' ? 'APP' : 'AI'}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-text-muted">{copy.eyebrow}</p>
            <p className="text-sm font-semibold text-text-primary">{clientName}</p>
          </div>
        </div>
        <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/10 px-3 py-2 text-right">
          <p className="font-heading text-lg font-bold text-accent-cyan">{metric.split(' ')[0]}</p>
          <p className="text-[10px] text-text-muted">{metric.split(' ').slice(1).join(' ')}</p>
        </div>
      </div>
      <ServiceMockup variant={variant} locale={locale} compact className="p-2" />
    </div>
  );
}

export function AuditReportPreview({ locale, className }: { locale?: Locale; className?: string }) {
  const isEnglish = locale === 'en';
  const rows = isEnglish
    ? ['SEO visibility', 'Mobile journey', 'Lead follow-up']
    : ['Visibilite SEO', 'Parcours mobile', 'Relance leads'];

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border-subtle bg-bg-card/80 p-5 shadow-card', className)}>
      <div className="absolute inset-x-0 top-0 h-1 gradient-bg" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-accent-cyan">{isEnglish ? 'Free audit preview' : 'Apercu audit offert'}</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-text-primary">
            {isEnglish ? 'Lead growth plan' : 'Plan de croissance leads'}
          </h3>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-violet/15 text-center">
          <span className="font-heading text-xl font-bold gradient-text">82</span>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm text-text-secondary">{row}</span>
              <span className="text-xs text-accent-cyan">+{index + 2}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan"
                style={{ width: `${64 + index * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {['24h', '3', '0F'].map((item, index) => (
          <div key={item} className="rounded-xl bg-bg-primary/60 px-2 py-2">
            <p className="font-heading text-base font-bold text-text-primary">{item}</p>
            <p className="text-[10px] text-text-muted">
              {isEnglish
                ? ['reply', 'actions', 'cost'][index]
                : ['reponse', 'actions', 'cout'][index]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
