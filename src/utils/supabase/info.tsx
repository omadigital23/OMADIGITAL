// Environment-sourced Supabase info (no hardcoded secrets)
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '../../lib/env-public';

// Derive projectId from the Supabase URL
const url = new URL(NEXT_PUBLIC_SUPABASE_URL);
export const projectId = url.hostname.split('.')[0];
export const publicAnonKey = NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Fonction de tracking des événements pour Google Analytics 4
 * Utilisée pour suivre les interactions utilisateur sur la plateforme OMA
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  // Add device information to all events
  const deviceInfo = typeof window !== 'undefined' ? {
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_pixel_ratio: window.devicePixelRatio,
    user_agent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator['language'],
    online: navigator.onLine
  } : {};

  // Add performance information if available
  const performanceInfo = typeof window !== 'undefined' && window.performance ? {
    page_load_time: performance.timing.loadEventEnd - performance.timing.navigationStart,
    dom_content_loaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    memory_used: performance.memory?.usedJSHeapSize,
    memory_total: performance.memory?.jsHeapSizeLimit
  } : {};

  const eventData = {
    event_category: 'oma_interaction',
    event_label: 'user_action',
    custom_parameter_1: 'dakar_senegal',
    timestamp: new Date().toISOString(),
    ...deviceInfo,
    ...performanceInfo,
    ...parameters
  };

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventData);
    console.log(`📊 Event tracked: ${eventName}`, eventData);
  } else {
    console.log(`📊 Event would be tracked: ${eventName}`, eventData);
    
    // In a real implementation, you would send this data to your analytics backend
    // For now, we're just logging it to the console
    if (typeof window !== 'undefined' && window.fetch) {
      // Example of how you might send data to a backend endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     event_name: eventName,
      //     ...eventData
      //   })
      // }).catch(err => console.error('Analytics tracking failed:', err));
    }
  }
};

/**
 * Supabase configuration and utility functions
 */
import { createClient } from '@supabase/supabase-js';

// Configuration
// Use environment-derived values declared above

// Create Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

/**
 * Génère un lien WhatsApp avec message pré-rempli pour OMA Digital
 * Optimisé pour le marché sénégalais avec numéro local Dakar
 */
export const generateWhatsAppLink = (message: string = '', phone: string = '221701193811') => {
  const defaultMessage = `Bonjour OMA Digital ! 👋

Je suis intéressé(e) par vos solutions d'automatisation pour PME à Dakar.

${message}

Pouvez-vous me donner plus d'informations ?

Merci !`;

  const encodedMessage = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

/**
 * Tracks page view with enhanced information
 */
export const trackPageView = (page: string, additionalParams?: Record<string, any>) => {
  trackEvent('page_view', {
    page_name: page,
    url: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof window !== 'undefined' ? document.referrer : '',
    ...additionalParams
  });
};

/**
 * Tracks CTA clicks with enhanced information
 */
export const trackCtaClick = (ctaType: string, location: string, additionalParams?: Record<string, any>) => {
  trackEvent('cta_click', {
    cta_type: ctaType,
    location: location,
    url: typeof window !== 'undefined' ? window.location.href : '',
    ...additionalParams
  });
};

/**
 * Tracks scroll depth
 */
export const trackScrollDepth = (depth: string) => {
  trackEvent('scroll_depth', {
    depth: depth,
    url: typeof window !== 'undefined' ? window.location.href : ''
  });
};

/**
 * Tracks article engagement
 */
export const trackArticleEngagement = (articleId: number, articleTitle: string, action: string, additionalParams?: Record<string, any>) => {
  trackEvent(`article_${action}`, {
    article_id: articleId,
    article_title: articleTitle,
    url: typeof window !== 'undefined' ? window.location.href : '',
    ...additionalParams
  });
};