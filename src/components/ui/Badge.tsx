'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-bg-glass border-border-subtle text-text-secondary',
    accent: 'bg-accent-violet/10 border-accent-violet/20 text-accent-violet',
    success: 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
