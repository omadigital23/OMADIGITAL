'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string | undefined;
  hover?: boolean | undefined;
  gradient?: boolean | undefined;
}

export default function Card({ children, className, hover = true, gradient = false }: CardProps) {
  const hoverProps = hover ? { whileHover: { y: -4 } } : {};

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border overflow-hidden',
        gradient
          ? 'gradient-border bg-bg-card'
          : 'bg-bg-card border-border-subtle',
        hover && 'hover:bg-bg-card-hover hover:border-border-medium hover:shadow-card-hover transition-all duration-300',
        className
      )}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
}
