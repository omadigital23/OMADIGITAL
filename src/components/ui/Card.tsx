'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className, hover = true, gradient = false }: CardProps) {
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
      whileHover={hover ? { y: -4 } : undefined}
    >
      {children}
    </motion.div>
  );
}
