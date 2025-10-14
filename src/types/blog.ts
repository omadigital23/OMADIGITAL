/**
 * Blog types for multilingual content
 * @module types/blog
 */

/**
 * Blog article category
 */
export type BlogCategory = 
  | 'Intelligence Artificielle' 
  | 'WhatsApp Business' 
  | 'Développement Web' 
  | 'Études de Cas' 
  | 'Guides Pratiques'
  | 'Artificial Intelligence'
  | 'Web Development'
  | 'Case Studies'
  | 'Practical Guides';

/**
 * Blog article content section
 */
export interface BlogSection {
  title: string;
  content: string;
}

/**
 * Blog article content structure
 */
export interface BlogContent {
  intro: string;
  sections: BlogSection[];
  cta: string;
}

/**
 * Blog article metadata and content
 */
export interface BlogArticle {
  title: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  reading_time: number;
  author: string;
  published_date: string;
  updated_date: string;
  content: BlogContent;
}

/**
 * Blog articles collection (keyed by slug)
 */
export interface BlogArticles {
  [slug: string]: BlogArticle;
}

/**
 * Blog translation structure
 */
export interface BlogTranslations {
  page_title: string;
  page_description: string;
  hero_title: string;
  hero_subtitle: string;
  search_placeholder: string;
  filter_all: string;
  filter_ai: string;
  filter_whatsapp: string;
  filter_web: string;
  filter_case_study: string;
  filter_guides: string;
  read_more: string;
  reading_time: string;
  published_on: string;
  updated_on: string;
  share_article: string;
  related_articles: string;
  back_to_blog: string;
  no_results: string;
  no_results_description: string;
  categories: string;
  tags: string;
  author: string;
  articles: BlogArticles;
  cta_section: {
    title: string;
    description: string;
    button_primary: string;
    button_secondary: string;
  };
}

/**
 * Blog filter options
 */
export type BlogFilter = 'all' | 'ai' | 'whatsapp' | 'web' | 'case_study' | 'guides';

/**
 * Social media platform
 */
export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'linkedin' | 'whatsapp';

/**
 * Social media link
 */
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
  icon?: string;
}
