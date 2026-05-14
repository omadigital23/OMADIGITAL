'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import Card from '@/components/ui/Card';
import { completedProjects, projectShowcaseCopy, type ProjectLocale } from '@/data/projects';

function normalizeLocale(locale: string): ProjectLocale {
  return locale === 'en' ? 'en' : 'fr';
}

export default function CaseStudies() {
  const locale = normalizeLocale(useLocale());
  const copy = projectShowcaseCopy[locale];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="projects" className="py-20 md:py-28 bg-bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">
            {copy.eyebrow}
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
            {copy.title}{' '}
            <span className="gradient-text">{copy.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            {copy.subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12">
          {completedProjects.map((project, i) => {
            const featured = i === 0 || i === 1;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.08 }}
                className={featured ? 'lg:col-span-6' : 'lg:col-span-4'}
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                  aria-label={`${copy.visitLabel}: ${project.title}`}
                >
                  <Card className="flex h-full flex-col p-0 border-border-medium/60">
                    <div className="relative aspect-[16/9] overflow-hidden bg-bg-primary">
                      <Image
                        src={project.image}
                        alt={`${copy.imageAltPrefix} ${project.title}`}
                        fill
                        loading={featured ? 'eager' : 'lazy'}
                        sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 33vw'}
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-card/80 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-bg-primary/75 px-3 py-1 text-xs font-medium text-text-primary backdrop-blur-md">
                        {project.type[locale]}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="font-heading text-xl font-semibold text-text-primary">
                          {project.title}
                        </h3>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-subtle bg-bg-glass text-text-secondary transition-colors group-hover:border-accent-cyan/40 group-hover:text-accent-cyan" aria-hidden="true">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M7 17L17 7" />
                            <path d="M8 7h9v9" />
                          </svg>
                        </span>
                      </div>

                      <div className="mb-4 rounded-xl border border-accent-cyan/20 bg-accent-cyan/10 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-cyan">
                          {copy.outcomeLabel}
                        </p>
                        <p className="mt-1 text-sm font-medium leading-snug text-text-primary">
                          {project.outcome[locale]}
                        </p>
                      </div>

                      <p className="mb-5 text-sm leading-relaxed text-text-secondary">
                        {project.summary[locale]}
                      </p>

                      <div className="mt-auto flex flex-wrap gap-2">
                        {project.tags[locale].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border-subtle bg-bg-glass px-3 py-1 text-xs text-text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-accent-violet/30 bg-accent-violet/10 px-4 py-3 text-sm font-semibold text-text-primary transition-colors group-hover:border-accent-violet group-hover:bg-accent-violet/15">
                        {copy.visitLabel}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
