'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import Card from '@/components/ui/Card';

const caseStudyData = [
  {
    clientKey: 'client1', industryKey: 'industry1', challengeKey: 'challenge1', solutionKey: 'solution1',
    results: ['result1', 'result2'],
    tech: ['Next.js', 'Supabase', 'Wave API', 'Groq AI'],
    color: 'accent-coral',
  },
  {
    clientKey: 'client2', industryKey: 'industry2', challengeKey: 'challenge2', solutionKey: 'solution2',
    results: ['result3', 'result4'],
    tech: ['React Native', 'Node.js', 'PostgreSQL'],
    color: 'accent-cyan',
  },
  {
    clientKey: 'client3', industryKey: 'industry3', challengeKey: 'challenge3', solutionKey: 'solution3',
    results: ['result5', 'result6'],
    tech: ['Python', 'OpenAI', 'Supabase', 'Zapier'],
    color: 'accent-violet',
  },
];

export default function CaseStudies() {
  const t = useTranslations('caseStudies');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
            {t('sectionTitle')}{' '}
            <span className="gradient-text">{t('sectionTitleAccent')}</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">{t('sectionSubtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {caseStudyData.map((cs, i) => (
            <motion.div
              key={cs.clientKey}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="text-xs text-text-muted mb-2">{t(cs.industryKey)}</div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">{t(cs.clientKey)}</h3>
                <p className="text-sm text-text-muted mb-3 leading-relaxed"><strong className="text-text-secondary">Défi:</strong> {t(cs.challengeKey)}</p>
                <p className="text-sm text-text-muted mb-4 leading-relaxed"><strong className="text-accent-cyan">Solution:</strong> {t(cs.solutionKey)}</p>
                
                {/* Results */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {cs.results.map((r) => (
                    <div key={r} className="bg-bg-glass rounded-lg p-3 text-center border border-border-subtle">
                      <span className="font-heading font-bold text-lg gradient-text">{t(r).split(' ')[0]}</span>
                      <span className="block text-xs text-text-muted mt-0.5">{t(r).split(' ').slice(1).join(' ')}</span>
                    </div>
                  ))}
                </div>

                {/* Tech */}
                <div className="mt-auto pt-4 border-t border-border-subtle">
                  <div className="text-xs text-text-muted mb-2">{t('techStack')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cs.tech.map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded bg-bg-glass border border-border-subtle text-text-secondary">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
