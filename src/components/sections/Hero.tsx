'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { STATS, getWhatsAppUrl } from '@/lib/constants';

const VIDEOS = ['/videos/hero1.webm', '/videos/hero2.webm', '/videos/hero3.webm'];
const SLIDE_INTERVAL = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// VideoSlider — autoplay garanti iOS Safari / Android Chrome / Desktop
//
// Stratégie :
//  • Toutes les <video> restent montées dans le DOM (iOS garde le décodeur actif).
//  • La visibilité est gérée uniquement via CSS opacity/z-index (pas de
//    montage/démontage, pas d'attribut `hidden` — ce qui bloquerait le play).
//  • useEffect appelle .play() à chaque changement d'index.  Les promesses
//    rejetées (politique autoplay du navigateur) sont interceptées silencieusement.
//  • Le timer est réinitialisé après chaque interaction manuelle.
// ─────────────────────────────────────────────────────────────────────────────
function VideoSlider() {
  const t = useTranslations('hero');
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── helpers ── */
  const tryPlay = useCallback((index: number) => {
    const v = videoRefs.current[index];
    if (!v) return;
    if (v.readyState < 2) {
      // Pas encore décodable : attendre loadeddata
      const onReady = () => {
        v.removeEventListener('loadeddata', onReady);
        v.play().catch(() => undefined);
      };
      v.addEventListener('loadeddata', onReady);
      v.load(); // force le chargement sur iOS
    } else {
      if (v.ended) v.currentTime = 0;
      v.play().catch(() => {
        setTimeout(() => v.play().catch(() => undefined), 300);
      });
    }
  }, []);

  const pauseOthers = useCallback((active: number) => {
    videoRefs.current.forEach((v, i) => {
      if (v && i !== active) v.pause();
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 350);
    },
    [current, animating],
  );

  const advance = useCallback(() => {
    goTo((current + 1) % VIDEOS.length);
  }, [current, goTo]);

  /* ── autoplay de la vidéo active ── */
  useEffect(() => {
    tryPlay(current);
    pauseOthers(current);
  }, [current, tryPlay, pauseOthers]);

  /* ── timer automatique ── */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, SLIDE_INTERVAL);
  }, [advance]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  /* ── clic sur les dots ── */
  const handleDot = (i: number) => {
    goTo(i);
    startTimer();
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border-subtle shadow-float bg-bg-card aspect-video group">
      {/* ── vidéos : toutes dans le DOM, visibilité CSS seulement ── */}
      {VIDEOS.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: i === current && !animating ? 1 : 0,
            zIndex: i === current ? 1 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            src={src}
            muted
            loop
            playsInline
            autoPlay={i === 0}
            preload={i === 0 ? 'auto' : 'metadata'}
            disablePictureInPicture
            className="w-full h-full object-cover"
            /* attribut webkit nécessaire pour anciens iOS */
            {...({ 'webkit-playsinline': 'true' } as Record<string, string>)}
          />
        </div>
      ))}

      {/* ── overlay gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />

      {/* ── barre de progression ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <div
          key={current}
          className="h-full bg-gradient-to-r from-accent-blue via-accent-violet to-accent-purple"
          style={{
            animation: `progress-bar ${SLIDE_INTERVAL}ms linear forwards`,
          }}
        />
      </div>

      {/* ── dots navigation ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            aria-label={t('videoAriaLabel', { number: i + 1 })}
            aria-current={i === current ? 'true' : undefined}
            className={`transition-all duration-300 rounded-full focus-visible:outline-2 focus-visible:outline-white ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── flèches prev/next (desktop) ── */}
      <button
        onClick={() => { goTo((current - 1 + VIDEOS.length) % VIDEOS.length); startTimer(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
        aria-label="Précédent"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={() => { goTo((current + 1) % VIDEOS.length); startTimer(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
        aria-label="Suivant"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

export default function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg"
      aria-label={t('hero.title')}
    >
      {/* ── orbs flottants ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-accent-violet/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[30%] right-[10%] w-80 h-80 rounded-full bg-accent-blue/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[20%] left-[30%] w-48 h-48 rounded-full bg-accent-purple/5 blur-3xl"
        />
      </div>

      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Colonne gauche ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:pr-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Badge variant="accent" className="mb-6">{t('hero.badge')}</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl leading-tight text-balance"
            >
              {t('hero.title')}{' '}
              <span className="gradient-text">{t('hero.titleAccent')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button size="lg" href={whatsappUrl} external className="w-full sm:w-auto">
                {t('hero.ctaPrimary')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
              <Button variant="secondary" size="lg" href="#services" className="w-full sm:w-auto">
                {t('hero.ctaSecondary')}
              </Button>
            </motion.div>

            {/* Urgency */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-xs text-text-muted flex items-center gap-1.5"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-accent-cyan animate-pulse" aria-hidden="true" />
              {t('hero.urgency')}
            </motion.p>

            {/* Social proof micro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map((n) => (
                  <div key={n} className="w-8 h-8 rounded-full border-2 border-bg-primary bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center text-[10px] font-bold text-white">
                    {['AS','MK','FD','TB'][n-1]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted">
                <span className="text-accent-cyan font-semibold">50+</span> clients satisfaits
              </p>
            </motion.div>
          </div>

          {/* ── Colonne droite — slider vidéo ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full"
          >
            <VideoSlider />

            {/* Badges flottants sous le slider */}
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              {[
                { icon: '🔒', label: 'SSL & Sécurisé' },
                { icon: '⚡', label: 'Livraison rapide' },
                { icon: '🌍', label: 'Support 24/7' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-text-muted bg-bg-glass border border-border-subtle rounded-full px-3 py-1.5">
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto text-center"
          role="list"
          aria-label={t('stats.label')}
        >
          {STATS.map((stat) => (
            <div key={stat.labelKey} role="listitem">
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                label={t(stat.labelKey)}
              />
            </div>
          ))}
        </motion.div>

        {/* ── Trust badges ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10"
          role="list"
          aria-label={t('trustBadges.title')}
        >
          {(['badge1', 'badge2', 'badge3', 'badge4'] as const).map((key) => (
            <div key={key} role="listitem" className="flex items-center gap-2 text-text-muted text-sm">
              <div className="w-2 h-2 rounded-full bg-accent-cyan" aria-hidden="true" />
              {t(`trustBadges.${key}`)}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── fade bas ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
}
