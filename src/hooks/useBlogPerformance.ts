import { useEffect } from 'react';
import { trackEvent } from '../utils/supabase/info';

/**
 * Hook to monitor blog page performance and user engagement
 */
export function useBlogPerformance() {
  useEffect(() => {
    // Track page view
    trackEvent('blog_page_view', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Measure page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Track performance metrics
    trackEvent('blog_page_performance', {
      load_time: loadTime,
      url: window.location.href,
      // Add more detailed performance metrics
      dom_content_loaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      first_paint: performance.timing.responseStart - performance.timing.navigationStart,
      page_size: typeof window !== 'undefined' ? window.performance.memory?.usedJSHeapSize : undefined
    });

    // Monitor scroll depth
    let maxScrollDepth = 0;
    let scrollMilestones = {
      '25': false,
      '50': false,
      '75': false,
      '100': false
    };
    
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.offsetHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track scroll milestones
        if (maxScrollDepth >= 25 && !scrollMilestones['25']) {
          scrollMilestones['25'] = true;
          trackEvent('blog_scroll_depth', { depth: '25%' });
        } else if (maxScrollDepth >= 50 && !scrollMilestones['50']) {
          scrollMilestones['50'] = true;
          trackEvent('blog_scroll_depth', { depth: '50%' });
        } else if (maxScrollDepth >= 75 && !scrollMilestones['75']) {
          scrollMilestones['75'] = true;
          trackEvent('blog_scroll_depth', { depth: '75%' });
        } else if (maxScrollDepth >= 100 && !scrollMilestones['100']) {
          scrollMilestones['100'] = true;
          trackEvent('blog_scroll_depth', { depth: '100%' });
        }
      }
    };

    // Monitor click events for CTA tracking
    const handleCtaClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const ctaElement = target.closest('[data-cta-type]');
      
      if (ctaElement) {
        const ctaType = ctaElement.getAttribute('data-cta-type');
        const ctaLocation = ctaElement.getAttribute('data-cta-location') || 'unknown';
        
        if (ctaType) {
          trackEvent('blog_cta_click', {
            cta_type: ctaType,
            location: ctaLocation,
            scroll_depth: maxScrollDepth,
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    // Monitor time to first interaction
    let firstInteractionTime: number | null = null;
    const handleFirstInteraction = () => {
      if (firstInteractionTime === null) {
        firstInteractionTime = performance.now();
        trackEvent('blog_first_interaction', {
          time_to_interaction: firstInteractionTime,
          url: window.location.href
        });
        
        // Remove event listeners after first interaction
        document.removeEventListener('mousedown', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('click', handleCtaClick);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleCtaClick);
      
      // Track session duration and max scroll depth on unmount
      trackEvent('blog_session_end', {
        max_scroll_depth: maxScrollDepth,
        session_duration: Date.now() - performance.timing.navigationStart,
        url: window.location.href
      });
    };
  }, []);
}