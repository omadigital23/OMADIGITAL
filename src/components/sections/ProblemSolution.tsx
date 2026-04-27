'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const problemIcons = ['⏰', '👻', '📉'];
const solutionIcons = ['🤖', '🌐', '🚀'];

export default function ProblemSolution() {
  const t = useTranslations('problemSolution');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const problems = [
    { icon: problemIcons[0], title: t('p1Title'), desc: t('p1Desc') },
    { icon: problemIcons[1], title: t('p2Title'), desc: t('p2Desc') },
    { icon: problemIcons[2], title: t('p3Title'), desc: t('p3Desc') },
  ];

  const solutions = [
    { icon: solutionIcons[0], title: t('s1Title'), desc: t('s1Desc') },
    { icon: solutionIcons[1], title: t('s2Title'), desc: t('s2Desc') },
    { icon: solutionIcons[2], title: t('s3Title'), desc: t('s3Desc') },
  ];

  return (
    <section ref={ref} className="py-20 md:py-28 container-custom">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-16"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
          {t('sectionTitle')}{' '}
          <span className="gradient-text">{t('sectionTitleAccent')}</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Problems */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-accent-coral/5 border border-accent-coral/10"
        >
          <h3 className="font-heading font-semibold text-xl text-accent-coral mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent-coral/10 flex items-center justify-center text-sm">✗</span>
            {t('problemsTitle')}
          </h3>
          <div className="space-y-6">
            {problems.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-4"
              >
                <span className="text-2xl shrink-0">{p.icon}</span>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">{p.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Solutions */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-accent-cyan/5 border border-accent-cyan/10"
        >
          <h3 className="font-heading font-semibold text-xl text-accent-cyan mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-sm">✓</span>
            {t('solutionsTitle')}
          </h3>
          <div className="space-y-6">
            {solutions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-4"
              >
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">{s.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
