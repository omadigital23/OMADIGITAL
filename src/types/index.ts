// ============================================================
// OMA Digital — TypeScript Types
// ============================================================

export interface Service {
  id: string;
  slug: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  startingPrice: number;
  currency: string;
  featured?: boolean;
  features: string[];
  href: string;
}

export interface PricingTier {
  id: string;
  nameKey: string;
  price: number;
  currency: string;
  period: string;
  descriptionKey: string;
  features: string[];
  highlighted?: boolean;
  ctaKey: string;
}

export interface PricingCategory {
  id: string;
  nameKey: string;
  tiers: PricingTier[];
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  quoteKey: string;
  avatar: string;
  rating: number;
}

export interface CaseStudy {
  id: string;
  clientKey: string;
  industryKey: string;
  challengeKey: string;
  solutionKey: string;
  results: { metricKey: string; value: string }[];
  techStack: string[];
  image: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  category: BlogCategory;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  readingTime: number;
  image: string;
  tags: string[];
}

export type BlogCategory = 'website' | 'ecommerce' | 'mobile' | 'ai-automation';

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  message?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface NavItem {
  labelKey: string;
  href: string;
  children?: NavItem[];
}

export interface FAQ {
  questionKey: string;
  answerKey: string;
}

export interface BookingSlot {
  id?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  created_at?: string;
}
