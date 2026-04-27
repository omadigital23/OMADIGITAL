'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  href,
  external,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent-violet/50';

  const variants = {
    primary: 'gradient-bg text-white hover:shadow-glow hover:scale-105',
    secondary: 'bg-bg-glass border border-border-subtle text-text-primary hover:bg-bg-glass-hover hover:border-border-medium',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-glass',
  };

  const sizes = {
    sm: 'text-sm px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2',
    lg: 'text-base px-8 py-4 gap-2.5',
  };

  const classes = cn(baseClasses, variants[variant], sizes[size], className);

  if (href) {
    return (
      <motion.a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={classes}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button className={classes} whileTap={{ scale: 0.97 }} {...(props as Record<string, unknown>)}>
      {children}
    </motion.button>
  );
}
