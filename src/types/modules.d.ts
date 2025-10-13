// Type declarations for modules without proper TypeScript support
import React from 'react';

declare module 'react-window' {
  export interface FixedSizeListProps {
    children: React.ComponentType<any>;
    height: number;
    itemCount: number;
    itemSize: number;
    itemData?: any;
    width?: number | string;
  }
  
  export class FixedSizeList extends React.Component<FixedSizeListProps> {
    scrollToItem(index: number, align?: string): void;
  }
}

declare module '@radix-ui/react-accordion@1.2.3' {
  export * from '@radix-ui/react-accordion';
}

declare module 'lucide-react@0.487.0' {
  export * from 'lucide-react';
}

declare module 'class-variance-authority@0.7.1' {
  export * from 'class-variance-authority';
}

declare module '@radix-ui/react-slot@1.1.2' {
  export * from '@radix-ui/react-slot';
}

// Add other module declarations as needed
declare module 'embla-carousel-react@8.6.0' {
  export * from 'embla-carousel-react';
}

declare module 'recharts@2.15.2' {
  export * from 'recharts';
}

declare module 'cmdk@1.1.1' {
  export * from 'cmdk';
}

declare module 'vaul@1.1.2' {
  export * from 'vaul';
}

declare module 'react-hook-form@7.55.0' {
  export * from 'react-hook-form';
}

declare module 'input-otp@1.4.2' {
  export * from 'input-otp';
}

declare module 'react-resizable-panels@2.1.7' {
  export * from 'react-resizable-panels';
}

declare module 'next-themes@0.4.6' {
  export * from 'next-themes';
}

declare module 'sonner@2.0.3' {
  export * from 'sonner';
}