'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BUSINESS } from '@/lib/constants';
import type { SupportPageContent } from '@/data/support-page';

type SupportPageClientProps = {
  content: SupportPageContent;
  locale: string;
};

type SupportFormState = {
  name: string;
  email: string;
  phone: string;
  device: string;
  model: string;
  issue: string;
  urgency: string;
  city: string;
  companyWebsite: string;
};

const initialForm: SupportFormState = {
  name: '',
  email: '',
  phone: '',
  device: '',
  model: '',
  issue: '',
  urgency: '',
  city: '',
  companyWebsite: '',
};

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

function SupportVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent-cyan/20 via-accent-violet/10 to-accent-gold/10 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-card shadow-float">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent-cyan">Support desk</p>
            <p className="mt-1 font-heading text-lg font-semibold text-text-primary">Device diagnostic</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-violet/10 text-accent-violet">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
        </div>

        <div className="grid gap-4 p-5">
          {[
            { label: 'Windows PC', value: 'Software cleanup', tone: 'text-accent-cyan bg-accent-cyan/10' },
            { label: 'iPhone', value: 'iCloud setup', tone: 'text-accent-violet bg-accent-violet/10' },
            { label: 'Smart camera', value: 'Wi-Fi + alerts', tone: 'text-accent-gold bg-accent-gold/10' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-primary/70 p-4">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="mt-1 text-xs text-text-muted">{item.value}</p>
              </div>
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${item.tone}`}>
                <CheckIcon />
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border-subtle bg-bg-primary/50 p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-text-muted">
            <span>Remote-ready checklist</span>
            <span>4/4</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-glass">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSupportLeadMessage(form: SupportFormState, locale: string): string {
  const labels =
    locale === 'en'
      ? {
          source: 'Source: OMA Digital Support',
          device: 'Device',
          model: 'Brand/model',
          urgency: 'Urgency',
          city: 'City',
          issue: 'Issue',
        }
      : {
          source: 'Source : OMA Digital Support',
          device: 'Appareil',
          model: 'Marque/modèle',
          urgency: 'Urgence',
          city: 'Ville',
          issue: 'Problème',
        };

  return [
    labels.source,
    `${labels.device}: ${form.device}`,
    form.model ? `${labels.model}: ${form.model}` : null,
    form.urgency ? `${labels.urgency}: ${form.urgency}` : null,
    form.city ? `${labels.city}: ${form.city}` : null,
    `${labels.issue}: ${form.issue}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export default function SupportPageClient({ content, locale }: SupportPageClientProps) {
  const [form, setForm] = useState<SupportFormState>(initialForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const whatsappUrl = buildWhatsAppUrl(content.whatsappMessage);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          business: form.city ? `Support software - ${form.city}` : 'Support software',
          message: buildSupportLeadMessage(form, locale),
          service: 'support',
          companyWebsite: form.companyWebsite,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setForm(initialForm);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <section className="container-custom mb-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="accent" className="mb-5">{content.eyebrow}</Badge>
              <h1 className="font-heading text-4xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl">
                {content.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-accent-cyan">
                {content.subtitle}
              </p>
              <p className="mt-5 max-w-2xl text-text-secondary leading-relaxed">
                {content.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" href={whatsappUrl} external>
                  {content.primaryCta}
                </Button>
                <Button size="lg" variant="secondary" href="#diagnostic">
                  {content.secondaryCta}
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {content.heroBullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-glass p-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-accent-cyan/10 text-accent-cyan">
                      <CheckIcon />
                    </span>
                    <p className="text-sm text-text-secondary">{bullet}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <SupportVisual />
            </motion.div>
          </div>
        </section>

        <section id="diagnostic" className="container-custom mb-20 scroll-mt-28">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
            <div>
              <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
                {content.softwareSection.title}
              </h2>
              <p className="mt-4 max-w-2xl text-text-secondary leading-relaxed">
                {content.softwareSection.subtitle}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {content.softwareSection.items.map((item) => (
                  <Card key={item.title} className="p-5" hover={false}>
                    <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-accent-violet/10 text-accent-violet">
                      <CheckIcon />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-text-primary">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-6" hover={false}>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">{content.form.title}</h2>
              <p className="mt-2 text-sm text-text-muted">{content.form.subtitle}</p>
              {status === 'success' ? (
                <div className="mt-8 rounded-xl border border-accent-cyan/20 bg-accent-cyan/10 p-5 text-center text-accent-cyan">
                  {content.form.success}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input
                    type="text"
                    value={form.companyWebsite}
                    onChange={(event) => setForm({ ...form, companyWebsite: event.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    name="companyWebsite"
                    aria-hidden="true"
                    className="hidden"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sr-only" htmlFor="support-name">{content.form.name}</label>
                    <input id="support-name" required type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={content.form.name} className="rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                    <label className="sr-only" htmlFor="support-email">{content.form.email}</label>
                    <input id="support-email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder={content.form.email} className="rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sr-only" htmlFor="support-phone">{content.form.phone}</label>
                    <input id="support-phone" required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder={content.form.phone} className="rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                    <label className="sr-only" htmlFor="support-city">{content.form.city}</label>
                    <input id="support-city" type="text" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder={content.form.city} className="rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sr-only" htmlFor="support-device">{content.form.device}</label>
                    <input id="support-device" required type="text" value={form.device} onChange={(event) => setForm({ ...form, device: event.target.value })} placeholder={content.form.device} className="rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                    <label className="sr-only" htmlFor="support-model">{content.form.model}</label>
                    <input id="support-model" type="text" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder={content.form.model} className="rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                  </div>
                  <label className="sr-only" htmlFor="support-urgency">{content.form.urgency}</label>
                  <select id="support-urgency" required value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value })} className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary focus:border-accent-violet focus:outline-none">
                    <option value="">{content.form.urgency}</option>
                    {content.form.urgencyOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor="support-issue">{content.form.issue}</label>
                  <textarea id="support-issue" required rows={5} value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })} placeholder={content.form.issue} className="w-full resize-none rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none" />
                  <button type="submit" disabled={status === 'sending'} className="w-full rounded-xl gradient-bg py-3 text-sm font-medium text-white transition-all hover:shadow-glow disabled:opacity-60">
                    {status === 'sending' ? content.form.sending : content.form.submit}
                  </button>
                  {status === 'error' && (
                    <p className="text-center text-sm text-accent-coral">{content.form.error}</p>
                  )}
                </form>
              )}
            </Card>
          </div>
        </section>

        <section className="container-custom mb-20">
          <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
            <Card className="p-6" hover={false}>
              <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-accent-coral/10 text-accent-coral">
                <AlertIcon />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">{content.exclusionsSection.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{content.exclusionsSection.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {content.exclusionsSection.items.map((item) => (
                  <span key={item} className="rounded-full border border-accent-coral/20 bg-accent-coral/10 px-3 py-1 text-xs text-accent-coral">
                    {item}
                  </span>
                ))}
              </div>
            </Card>

            <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-card to-bg-glass p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-accent-cyan">{content.experienceSection.eyebrow}</p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-text-primary">{content.experienceSection.title}</h2>
              <p className="mt-5 leading-relaxed text-text-secondary">{content.experienceSection.body}</p>
              <p className="mt-5 rounded-xl border border-border-subtle bg-bg-primary/60 p-4 text-sm text-text-muted">
                {content.experienceSection.note}
              </p>
            </div>
          </div>
        </section>

        <section className="container-custom mb-20">
          <h2 className="text-center font-heading text-3xl font-bold text-text-primary md:text-4xl">
            {content.processSection.title}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {content.processSection.steps.map((step, index) => (
              <div key={step.title} className="relative rounded-xl border border-border-subtle bg-bg-card p-5">
                <span className="mb-5 inline-grid h-9 w-9 place-items-center rounded-lg bg-accent-blue/10 font-heading text-sm font-bold text-accent-cyan">
                  {index + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-custom mb-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center font-heading text-3xl font-bold text-text-primary">FAQ</h2>
            <div className="space-y-4">
              {content.faqs.map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-border-subtle bg-bg-card p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading font-medium text-text-primary">
                    {faq.q}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-4 leading-relaxed text-text-secondary">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container-custom">
          <div className="rounded-2xl gradient-bg p-8 text-center md:p-12">
            <h2 className="font-heading text-3xl font-bold text-white">{content.finalCta.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/75">{content.finalCta.subtitle}</p>
            <div className="mt-7">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-bg-primary transition-all hover:shadow-lg">
                {content.finalCta.button}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
