/**
 * Google Analytics 4 Integration
 * Optimized for Senegal and Morocco markets
 */

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-MHSXEJMW8C';

/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Configure GA4 with enhanced ecommerce and demographics
  window.gtag('js', new Date().toISOString());
  window.gtag('config', GA_MEASUREMENT_ID, {
    // Enhanced for Senegal/Morocco markets
    country: 'SN', // Default to Senegal, will be updated based on user location
    currency: 'XOF', // West African CFA franc
    custom_map: {
      custom_parameter_1: 'market_region', // Senegal vs Morocco
      custom_parameter_2: 'service_interest',
      custom_parameter_3: 'business_size'
    },
    // Performance optimizations
    send_page_view: false, // We'll send manually for better control
    anonymize_ip: true,
    allow_google_signals: true,
    allow_ad_personalization_signals: false, // Privacy-focused
  });
};

/**
 * Track page views with SEO-optimized data for Senegal/Morocco
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Detect market region from URL or user data
  const isMarocco = url.includes('maroc') || url.includes('morocco') || url.includes('casablanca');
  const isSenegal = url.includes('senegal') || url.includes('dakar') || url.includes('thies');
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: title,
    page_location: url,
    custom_map: {
      market_region: isMarocco ? 'Morocco' : isSenegal ? 'Senegal' : 'West_Africa',
    }
  });

  // Send enhanced page view for SEO
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: url,
    market_region: isMarocco ? 'Morocco' : isSenegal ? 'Senegal' : 'West_Africa',
    content_group1: 'Landing_Page', // Content categorization
    content_group2: isMarocco ? 'Morocco_Market' : 'Senegal_Market',
  });
};

/**
 * Track business-focused events for Senegal/Morocco markets
 */
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Enhanced parameters for West African business context
  const enhancedParams = {
    ...parameters,
    timestamp: new Date().toISOString(),
    market_focus: 'West_Africa_Business',
    // Add business context
    business_category: parameters['service_type'] || 'digital_transformation',
    target_market: parameters['location'] || 'senegal_morocco',
  };

  window.gtag('event', eventName, enhancedParams);
};

/**
 * Track conversions (quote requests, WhatsApp clicks)
 */
export const trackConversion = (conversionType: 'quote_request' | 'whatsapp_contact' | 'phone_call', value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    event_category: 'Lead_Generation',
    event_label: conversionType,
    value: value || 1,
    currency: 'XOF',
    // Business-specific data for Senegal/Morocco
    conversion_type: conversionType,
    market_segment: 'SME_Digital_Transformation',
    service_category: 'AI_Automation',
  });

  // Track as custom conversion for better attribution
  window.gtag('event', conversionType, {
    event_category: 'Business_Conversion',
    market_region: 'West_Africa',
    lead_quality: 'High_Intent',
  });
};

/**
 * Track service interest for market analysis
 */
export const trackServiceInterest = (service: string, location: 'senegal' | 'morocco' | 'both') => {
  trackEvent('service_interest', {
    service_type: service,
    target_location: location,
    event_category: 'Service_Discovery',
    market_segment: location === 'morocco' ? 'Morocco_SME' : 'Senegal_SME',
  });
};

/**
 * Track user engagement for SEO insights
 */
export const trackEngagement = (action: string, section: string, duration?: number) => {
  trackEvent('user_engagement', {
    engagement_action: action,
    page_section: section,
    engagement_duration: duration,
    event_category: 'User_Behavior',
    content_interaction: `${section}_${action}`,
  });
};

/**
 * Enhanced ecommerce tracking for service packages
 */
export const trackServiceView = (serviceId: string, serviceName: string, category: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: 'XOF',
    value: 0, // Will be updated when pricing is available
    items: [{
      item_id: serviceId,
      item_name: serviceName,
      item_category: category,
      item_brand: 'OMA_Digital',
      item_variant: 'West_Africa_Package',
    }]
  });
};

/**
 * Track quote form completion
 */
export const trackQuoteSubmission = (formData: {
  service: string;
  location: string;
  company?: string;
  budget?: string;
}) => {
  // Track conversion
  trackConversion('quote_request');
  
  // Track detailed form data
  trackEvent('quote_form_completed', {
    event_category: 'Lead_Generation',
    service_requested: formData.service,
    target_location: formData.location,
    has_company: !!formData.company,
    budget_range: formData.budget || 'not_specified',
    form_completion_rate: 100,
    lead_score: formData.budget ? 'High' : 'Medium',
  });
};

/**
 * Generate unique session ID for tracking
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Track chatbot interaction with Supabase
 */
export const trackChatbotInteraction = async (interactionData: any) => {
  try {
    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || ''
    );

    // Save interaction to chatbot_conversations table
    const { error } = await supabase
      .from('chatbot_conversations')
      .insert(interactionData);

    if (error) {
      console.error('Error saving chatbot interaction:', error);
      return false;
    }

    console.log('✅ Chatbot interaction saved successfully');
    return true;
  } catch (error) {
    console.error('Error creating Supabase client or saving interaction:', error);
    return false;
  }
};

/**
 * Get chatbot interactions for a session
 */
export const getChatbotInteractions = async (sessionId: string) => {
  try {
    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || ''
    );

    // Get interactions for this session
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chatbot interactions:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error creating Supabase client or fetching interactions:', error);
    return [];
  }
};