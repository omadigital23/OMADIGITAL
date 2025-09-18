import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env-public';
export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Enhanced analytics event types
export type AnalyticsEvent = {
  event_name: string;
  event_properties?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  url: string;
  user_agent?: string;
  ip_address?: string;
  country?: string; // Added for location tracking
  region?: string; // Added for location tracking
  city?: string; // Added for location tracking
  duration?: number; // For tracking event duration
  referrer?: string; // For tracking referral sources
  device_type?: string; // mobile, tablet, desktop
  connection_type?: string; // 4g, 3g, wifi, etc.
  scroll_depth?: number; // How far the user scrolled on the page
  utm_source?: string; // UTM tracking parameters
  utm_medium?: string;
  utm_campaign?: string;
  page_title?: string; // Title of the page
};

// A/B test result types
export type ABTestResult = {
  test_name: string;
  variant: string;
  conversion: boolean;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  metadata?: Record<string, any>; // Additional test-specific data
};

// Performance metrics types
export type PerformanceMetrics = {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  navigation_start?: number;
  load_event_end?: number;
};

// Chatbot interaction types
export type ChatbotInteraction = {
  message_id: string;
  user_id?: string;
  session_id: string;
  message_text: string;
  response_text: string;
  input_method: 'text' | 'voice';
  response_time: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  timestamp: string;
  conversation_length?: number; // Number of messages in conversation
  user_satisfaction?: number; // 1-5 rating
  // New columns added in migration 20250120000000
  language?: 'fr' | 'en'; // Detected language of the conversation
  source?: string; // Source of the chatbot response (e.g., ultra_intelligent_rag)
  confidence?: number; // Confidence score of the response (0.0 to 1.0)
  suggestions?: number; // Number of suggestions provided (deprecated, use suggestion_count)
  cta_type?: 'contact' | 'demo' | 'appointment' | 'quote'; // Type of call-to-action suggested
  response_length?: number; // Length of the response text in characters
  suggestion_count?: number; // Number of suggestions provided with the response
};

// Enhanced user behavior tracking
export type UserBehaviorEvent = {
  event_type: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  page_x?: number;
  page_y?: number;
  timestamp: string;
  session_id: string;
  url: string;
  viewport_width?: number;
  viewport_height?: number;
};

/**
 * Generate or retrieve session ID
 */
export function generateSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get device information
 */
export function getDeviceInfo(): { device_type: string; connection_type: string } {
  let deviceType = 'desktop';
  let connectionType = 'unknown';
  
  if (typeof navigator !== 'undefined') {
    // Determine device type
    const width = window.innerWidth;
    if (width < 768) {
      deviceType = 'mobile';
    } else if (width < 1024) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
    
    // Determine connection type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connectionType = connection.effectiveType || connection.type || 'unknown';
    }
  }
  
  return { device_type: deviceType, connection_type: connectionType };
}

/**
 * Get UTM parameters from URL
 */
export function getUTMParameters(): Record<string, string> {
  if (typeof window === 'undefined' || typeof URLSearchParams === 'undefined') {
    return {};
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });
  
  return utmParams;
}

/**
 * Track a generic analytics event with enhanced information
 */
export async function trackEvent(event: AnalyticsEvent) {
  try {
    // Get user's IP address and location if not provided
    let ipAddress = event.ip_address;
    let country = event.country;
    let region = event.region;
    let city = event.city;
    
    // If IP address is not provided, we'll get it from the server-side API
    // This is a placeholder - in a real implementation, you would use a service like IP geolocation
    
    // Add default values if not provided
    const eventWithDefaults = {
      ...event,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      session_id: generateSessionId(),
      page_title: typeof document !== 'undefined' ? document.title : '',
      ...getDeviceInfo(),
      ...getUTMParameters(),
      ip_address: ipAddress,
      country: country,
      region: region,
      city: city
    };

    // Ensure timestamp is not duplicated
    if (eventWithDefaults.timestamp && typeof eventWithDefaults.timestamp !== 'string') {
      eventWithDefaults.timestamp = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('analytics_events')
      .insert([eventWithDefaults]);
    
    if (error) {
      console.error('Error tracking event:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error tracking event:', error);
    return null;
  }
}

/**
 * Track user behavior events (clicks, hovers, etc.)
 */
export async function trackUserBehavior(event: UserBehaviorEvent) {
  try {
    const behaviorEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      session_id: generateSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
      viewport_height: typeof window !== 'undefined' ? window.innerHeight : 0
    };

    const { data, error } = await supabase
      .from('user_behavior_events')
      .insert([behaviorEvent]);
    
    if (error) {
      console.error('Error tracking user behavior:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error tracking user behavior:', error);
    return null;
  }
}

/**
 * Record an A/B test conversion
 */
export async function trackABTestConversion(result: ABTestResult) {
  try {
    const resultWithDefaults = {
      ...result,
      timestamp: new Date().toISOString(),
      session_id: generateSessionId()
    };

    const { data, error } = await supabase
      .from('ab_test_results')
      .insert([resultWithDefaults]);
    
    if (error) {
      console.error('Error tracking A/B test conversion:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error tracking A/B test conversion:', error);
    return null;
  }
}

/**
 * Track chatbot interactions with enhanced metrics and error handling
 */
export async function trackChatbotInteraction(interaction: ChatbotInteraction) {
  try {
    // Validate required fields
    if (!interaction.session_id || !interaction.message_id) {
      console.error('Missing required fields for chatbot interaction tracking');
      return null;
    }
    
    const interactionWithDefaults = {
      ...interaction,
      timestamp: new Date().toISOString(),
      session_id: interaction.session_id || generateSessionId()
    };

    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([interactionWithDefaults]);
    
    if (error) {
      console.error('Error tracking chatbot interaction:', error);
      // Try to save to local storage as fallback
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const localInteractions = JSON.parse(localStorage.getItem('chatbot_interactions') || '[]');
          localInteractions.push(interactionWithDefaults);
          localStorage.setItem('chatbot_interactions', JSON.stringify(localInteractions.slice(-100))); // Keep only last 100
        }
      } catch (storageError) {
        console.error('Failed to save interaction to local storage:', storageError);
      }
      return null;
    }
    
    // Clear any stored interactions if successful
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const localInteractions = JSON.parse(localStorage.getItem('chatbot_interactions') || '[]');
        if (localInteractions.length > 0) {
          // Try to send stored interactions
          for (const storedInteraction of localInteractions) {
            await supabase.from('chatbot_interactions').insert([storedInteraction]);
          }
          localStorage.removeItem('chatbot_interactions');
        }
      }
    } catch (storageError) {
      console.error('Failed to clear stored interactions:', storageError);
    }
    
    return data;
  } catch (error) {
    console.error('Error tracking chatbot interaction:', error);
    return null;
  }
}

/**
 * Track performance metrics
 */
export async function trackPerformanceMetrics(metrics: PerformanceMetrics) {
  try {
    const performanceEvent = {
      ...getDeviceInfo(),
      event_name: 'web_vitals',
      event_properties: metrics,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      session_id: generateSessionId(),
      page_title: typeof document !== 'undefined' ? document.title : ''
    };

    const { data, error } = await supabase
      .from('analytics_events')
      .insert([performanceEvent]);
    
    if (error) {
      console.error('Error tracking performance metrics:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error tracking performance metrics:', error);
    return null;
  }
}

/**
 * Track scroll depth
 */
export function trackScrollDepth() {
  if (typeof window === 'undefined') return;
  
  let maxScrollDepth = 0;
  
  const updateScrollDepth = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.offsetHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      
      // Track when user reaches 25%, 50%, 75%, 100% of page
      const milestones = [25, 50, 75, 100];
      const reachedMilestone = milestones.find(milestone => 
        maxScrollDepth >= milestone && maxScrollDepth - scrollPercent < 25
      );
      
      if (reachedMilestone) {
        trackEvent({
          event_name: 'scroll_depth',
          event_properties: { depth: reachedMilestone },
          scroll_depth: reachedMilestone,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          session_id: generateSessionId()
        });
      }
    }
  };
  
  window.addEventListener('scroll', updateScrollDepth);
}

/**
 * Get A/B test results from Supabase
 */
export async function getABTestResults(testName?: string) {
  try {
    let query = supabase
      .from('ab_test_results')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (testName) {
      query = query.eq('test_name', testName);
    }
    
    const { data, error } = await query.limit(1000);
    
    if (error) {
      console.error('Error fetching A/B test results:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching A/B test results:', error);
    return null;
  }
}

/**
 * Get analytics events from Supabase
 */
export async function getAnalyticsEvents(eventName?: string) {
  try {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (eventName) {
      query = query.eq('event_name', eventName);
    }
    
    const { data, error } = await query.limit(1000);
    
    if (error) {
      console.error('Error fetching analytics events:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return null;
  }
}

/**
 * Get chatbot interactions from Supabase
 */
export async function getChatbotInteractions(sessionId?: string) {
  try {
    // Use the API endpoint instead of direct Supabase query to avoid RLS issues
    const url = sessionId 
      ? `/api/chat/interactions?session_id=${encodeURIComponent(sessionId)}`
      : '/api/chat/interactions';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chatbot interactions:', error);
    return null;
  }
}

/**
 * Get user ID (if available)
 */
export function getUserId(): string | undefined {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('oma_user_id') || undefined;
  }
  return undefined;
}

/**
 * Set user ID
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('oma_user_id', userId);
  }
}
