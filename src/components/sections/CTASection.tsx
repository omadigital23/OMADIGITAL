'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'motion/react';
import Button from '@/components/ui/Button';
import { getWhatsAppUrl } from '@/lib/constants';

const BENEFITS = [
  { icon: '🎯', key: 'benefit1' },
  { icon: '⚡', key: 'benefit2' },
  { icon: '📊', key: 'benefit3' },
];

export default function CTASection() {
  const t = useTranslations('cta');
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    companyWebsite: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validate = (field: string, value: string) => {
    if (!value.trim()) return true; // required — shown via :invalid CSS
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', business: '', companyWebsite: '' });
        setTouched({});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-bg-primary border text-text-primary placeholder:text-text-muted text-sm focus:outline-none transition-colors ${
      touched[field] && validate(field, form[field as keyof typeof form])
        ? 'border-accent-coral focus:border-accent-coral'
        : 'border-border-subtle focus:border-accent-violet'
    }`;

  return (
    <section ref={ref} id="contact" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-accent-blue/5 to-accent-purple/10" />
      <div className="absolute inset-0 mesh-bg opacity-50" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Gauche : Pitch ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
              {t('title')}{' '}
              <span className="gradient-text">{t('titleAccent')}</span>
            </h2>
            <p className="mt-4 text-text-secondary text-lg">{t('subtitle')}</p>

            {/* Bénéfices */}
            <div className="mt-8 space-y-4">
              {BENEFITS.map((b) => (
                <div key={b.key} className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
                  <div>
                    <p className="text-sm text-text-secondary">{t(b.key as Parameters<typeof t>[0])}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button size="lg" href={whatsappUrl} external>
                {t('button')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Button>
            </div>

            <p className="mt-4 text-sm text-text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              {t('clientCount')}
            </p>

            {/* Garantie */}
            <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-bg-glass border border-border-subtle">
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-text-muted">{t('guarantee')}</p>
            </div>
          </motion.div>

          {/* ── Droite : Formulaire ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div className="p-8 rounded-2xl bg-bg-card/80 backdrop-blur border border-border-subtle shadow-float">
              {/* Header form */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-semibold text-xl">{t('formTitle')}</h3>
                <span className="text-xs text-accent-cyan bg-accent-cyan/10 px-3 py-1 rounded-full border border-accent-cyan/20">
                  🎁 {t('formBadge')}
                </span>
              </div>

              {status === 'success' ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-accent-cyan font-semibold text-lg">{t('formSuccess')}</p>
                  <p className="text-text-muted text-sm mt-2">{t('formSuccessNote')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* honeypot */}
                  <input
                    type="text"
                    value={form.companyWebsite}
                    onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    name="companyWebsite"
                    aria-hidden="true"
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onBlur={() => setTouched({ ...touched, name: true })}
                        placeholder={t('formName')}
                        className={inputClass('name')}
                      />
                    </div>
                    <div>
                      <input
                        type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => setTouched({ ...touched, email: true })}
                        placeholder={t('formEmail')}
                        className={inputClass('email')}
                      />
                    </div>
                  </div>
                  <input
                    type="tel" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onBlur={() => setTouched({ ...touched, phone: true })}
                    placeholder={t('formPhone')}
                    className={inputClass('phone')}
                  />
                  <input
                    type="text" required value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    onBlur={() => setTouched({ ...touched, business: true })}
                    placeholder={t('formBusiness')}
                    className={inputClass('business')}
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="relative w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:shadow-glow transition-all disabled:opacity-60 overflow-hidden group"
                  >
                    <span className={`flex items-center justify-center gap-2 ${status === 'sending' ? 'opacity-0' : ''}`}>
                      {t('formSubmit')}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                    {status === 'sending' && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0110 10" /></svg>
                      </span>
                    )}
                  </button>

                  {status === 'error' && (
                    <p className="text-accent-coral text-sm text-center flex items-center justify-center gap-2">
                      <span>⚠️</span> {t('formError')}
                    </p>
                  )}

                  <p className="text-xs text-text-muted text-center mt-2">
                    🔒 {t('formPrivacy')}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
