'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import Button from '@/components/ui/Button';
import { WHATSAPP_URL } from '@/lib/constants';

export default function CTASection() {
  const t = useTranslations('cta');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', business: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section ref={ref} className="py-20 md:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-accent-blue/5 to-accent-purple/10" />
      <div className="absolute inset-0 mesh-bg opacity-50" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
              {t('title')}{' '}
              <span className="gradient-text">{t('titleAccent')}</span>
            </h2>
            <p className="mt-4 text-text-secondary text-lg">{t('subtitle')}</p>
            <div className="mt-8">
              <Button size="lg" href={WHATSAPP_URL} external>
                {t('button')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Button>
            </div>
            <p className="mt-4 text-sm text-text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
              {t('clientCount')}
            </p>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div className="p-8 rounded-2xl bg-bg-card/80 backdrop-blur border border-border-subtle">
              <h3 className="font-heading font-semibold text-xl mb-6">{t('formTitle')}</h3>
              {status === 'success' ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-accent-cyan font-medium">{t('formSuccess')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('formName')}
                    className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border-subtle text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-violet transition-colors"
                  />
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('formEmail')}
                    className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border-subtle text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-violet transition-colors"
                  />
                  <input
                    type="tel" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={t('formPhone')}
                    className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border-subtle text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-violet transition-colors"
                  />
                  <input
                    type="text" required value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    placeholder={t('formBusiness')}
                    className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border-subtle text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-violet transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full gradient-bg text-white font-medium py-3 rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                  >
                    {status === 'sending' ? '...' : t('formSubmit')}
                  </button>
                  {status === 'error' && (
                    <p className="text-accent-coral text-sm text-center">{t('formError')}</p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
