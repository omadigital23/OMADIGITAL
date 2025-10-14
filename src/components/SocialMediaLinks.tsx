/**
 * Social Media Links Component
 * Displays social media links with proper accessibility and security
 * @module components/SocialMediaLinks
 */

import React from 'react';
import { Facebook, Twitter, Instagram, Music2, Linkedin, MessageCircle } from 'lucide-react';
import type { SocialLink, SocialPlatform } from '../types/blog';

interface SocialMediaLinksProps {
  /**
   * Display variant
   */
  variant?: 'horizontal' | 'vertical' | 'grid';
  /**
   * Show labels alongside icons
   */
  showLabels?: boolean;
  /**
   * Custom CSS classes
   */
  className?: string;
  /**
   * Icon size
   */
  iconSize?: 'sm' | 'md' | 'lg';
  /**
   * Color theme
   */
  theme?: 'light' | 'dark' | 'brand';
}

/**
 * Social media configuration
 * URLs are stored here to avoid hardcoding in multiple places
 */
const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'facebook',
    url: 'https://web.facebook.com/profile.php?id=61579740432372',
    label: 'Facebook',
  },
  {
    platform: 'twitter',
    url: 'https://x.com/omadigital23',
    label: 'X (Twitter)',
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/omadigital123',
    label: 'Instagram',
  },
  {
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@omadigital23',
    label: 'TikTok',
  },
];

/**
 * Get icon component for social platform
 */
const getSocialIcon = (platform: SocialPlatform, size: number = 20) => {
  const iconProps = { size, 'aria-hidden': 'true' };
  
  switch (platform) {
    case 'facebook':
      return <Facebook {...iconProps} />;
    case 'twitter':
      return <Twitter {...iconProps} />;
    case 'instagram':
      return <Instagram {...iconProps} />;
    case 'tiktok':
      return <Music2 {...iconProps} />;
    case 'linkedin':
      return <Linkedin {...iconProps} />;
    case 'whatsapp':
      return <MessageCircle {...iconProps} />;
    default:
      return null;
  }
};

/**
 * Get brand color for social platform
 */
const getBrandColor = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'facebook':
      return 'hover:bg-[#1877F2] hover:text-white';
    case 'twitter':
      return 'hover:bg-[#1DA1F2] hover:text-white';
    case 'instagram':
      return 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white';
    case 'tiktok':
      return 'hover:bg-[#000000] hover:text-white';
    case 'linkedin':
      return 'hover:bg-[#0A66C2] hover:text-white';
    case 'whatsapp':
      return 'hover:bg-[#25D366] hover:text-white';
    default:
      return 'hover:bg-gray-100';
  }
};

/**
 * Social Media Links Component
 * 
 * @example
 * ```tsx
 * <SocialMediaLinks variant="horizontal" showLabels={true} />
 * ```
 */
export function SocialMediaLinks({
  variant = 'horizontal',
  showLabels = false,
  className = '',
  iconSize = 'md',
  theme = 'light',
}: SocialMediaLinksProps) {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const iconSizePx = sizeMap[iconSize];

  const containerClasses = {
    horizontal: 'flex items-center space-x-3',
    vertical: 'flex flex-col space-y-3',
    grid: 'grid grid-cols-2 gap-3',
  };

  const linkBaseClasses = 'inline-flex items-center justify-center transition-all duration-300 rounded-lg';
  
  const linkThemeClasses = {
    light: 'bg-white text-gray-700 border border-gray-200 hover:shadow-md',
    dark: 'bg-gray-800 text-white hover:bg-gray-700',
    brand: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  };

  const linkSizeClasses = showLabels 
    ? 'px-4 py-2 space-x-2' 
    : 'p-2 min-w-[40px] min-h-[40px]';

  return (
    <div 
      className={`${containerClasses[variant]} ${className}`}
      role="navigation"
      aria-label="Réseaux sociaux OMA Digital"
    >
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            ${linkBaseClasses}
            ${linkThemeClasses[theme]}
            ${linkSizeClasses}
            ${getBrandColor(social.platform)}
          `}
          aria-label={`Suivez-nous sur ${social.label}`}
          title={social.label}
        >
          {getSocialIcon(social.platform, iconSizePx)}
          {showLabels && (
            <span className="text-sm font-medium">{social.label}</span>
          )}
        </a>
      ))}
    </div>
  );
}

/**
 * Social Share Buttons Component
 * For sharing specific content on social media
 */
interface SocialShareProps {
  /**
   * URL to share
   */
  url: string;
  /**
   * Title to share
   */
  title: string;
  /**
   * Description to share
   */
  description?: string;
  /**
   * Custom CSS classes
   */
  className?: string;
}

export function SocialShareButtons({ url, title, description, className = '' }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = [
    {
      platform: 'facebook' as SocialPlatform,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Partager sur Facebook',
    },
    {
      platform: 'twitter' as SocialPlatform,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      label: 'Partager sur X',
    },
    {
      platform: 'linkedin' as SocialPlatform,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'Partager sur LinkedIn',
    },
    {
      platform: 'whatsapp' as SocialPlatform,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      label: 'Partager sur WhatsApp',
    },
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`} role="group" aria-label="Partager l'article">
      {shareLinks.map((share) => (
        <a
          key={share.platform}
          href={share.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            inline-flex items-center justify-center p-2 rounded-lg
            bg-white text-gray-700 border border-gray-200
            transition-all duration-300 hover:shadow-md
            min-w-[40px] min-h-[40px]
            ${getBrandColor(share.platform)}
          `}
          aria-label={share.label}
          title={share.label}
        >
          {getSocialIcon(share.platform, 20)}
        </a>
      ))}
    </div>
  );
}
