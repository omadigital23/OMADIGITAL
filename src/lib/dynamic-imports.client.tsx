// Optimized dynamic imports for heavy components
import dynamic from 'next/dynamic';
import { lazy, Suspense } from 'react';

// Framer Motion - Only load when animations are needed
export const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

export const MotionSection = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.section })),
  { ssr: false }
);

// Recharts - Only for admin dashboard
export const PerformanceChart = dynamic(
  () => import('recharts').then(mod => ({ 
    default: ({ children }) => <mod.ResponsiveContainer>{children}</mod.ResponsiveContainer>
  })),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
  }
);

export const LineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { ssr: false }
);

export const BarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { ssr: false }
);

// React Query - Conditionally load
export const QueryWrapper = dynamic(
  () => import('@tanstack/react-query').then(mod => ({ 
    default: ({ children }) => <mod.QueryClientProvider client={new mod.QueryClient()}>{children}</mod.QueryClientProvider>
  })),
  { ssr: false }
);

// Lucide Icons - Tree-shakeable imports
export { 
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Play,
  Pause,
  Star,
  Check,
  AlertCircle,
  Info,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Loading components for better UX
export const ChartSkeleton = () => (
  <div className="h-64 bg-gray-100 animate-pulse rounded flex items-center justify-center">
    <div className="text-gray-400">Loading chart...</div>
  </div>
);

export const AnimationSkeleton = () => (
  <div className="opacity-50">
    {/* Static content while animation loads */}
  </div>
);
