// Client-side analytics utility for tracking user interactions

// Generate a unique session ID
export function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Get visitor ID (if available)
export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('visitor_id');
}

// Set visitor ID
export function setVisitorId(visitorId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('visitor_id', visitorId);
}

// Get UTM parameters from URL
export function getUTMParameters(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) utmParams[key] = value;
  });
  
  return utmParams;
}

// Get device information
export function getDeviceInfo(): { deviceType: string; browser: string; os: string } {
  if (typeof window === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }
  
  const userAgent = navigator.userAgent;
  
  // Device type detection
  let deviceType = 'desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'mobile';
  else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
  
  // Browser detection
  let browser = 'unknown';
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/edge/i.test(userAgent)) browser = 'Edge';
  else if (/opera/i.test(userAgent) || /opr/i.test(userAgent)) browser = 'Opera';
  
  // OS detection
  let os = 'unknown';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac/i.test(userAgent)) os = 'MacOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Track session start
export async function trackSessionStart(landingPage: string, referrer: string = document.referrer): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const utmParams = getUTMParameters();
  const deviceInfo = getDeviceInfo();
  
  try {
    await fetch('/api/analytics/track-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        visitorId,
        ipAddress: null, // Server will determine this
        userAgent: navigator.userAgent,
        referrer,
        landingPage,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        operatingSystem: deviceInfo.os,
        country: null, // Server will determine this
        region: null, // Server will determine this
        city: null, // Server will determine this
        ...utmParams
      }),
    });
  } catch (error) {
    console.error('Error tracking session start:', error);
  }
}

// Track page view
export async function trackPageView(pageUrl: string, pageTitle: string, referrer: string = document.referrer): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  
  try {
    await fetch('/api/analytics/track-page-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        pageUrl,
        pageTitle,
        referrer,
        entryTime: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Track article reading
export async function trackArticleRead(
  articleSlug: string, 
  articleId?: string,
  scrollProgress?: number,
  readCompletion?: number
): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  
  try {
    await fetch('/api/analytics/track-article-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        articleId,
        articleSlug,
        scrollProgress,
        readCompletion,
        startReadingTime: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Error tracking article reading:', error);
  }
}

// Track user behavior event
export async function trackBehaviorEvent(
  eventType: string,
  pageUrl: string,
  elementId?: string,
  elementClass?: string,
  elementText?: string,
  xPosition?: number,
  yPosition?: number,
  metadata?: Record<string, any>
): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  
  try {
    await fetch('/api/analytics/track-behavior', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        eventType,
        elementId,
        elementClass,
        elementText,
        pageUrl,
        xPosition,
        yPosition,
        metadata
      }),
    });
  } catch (error) {
    console.error('Error tracking behavior event:', error);
  }
}

// Track scroll depth
export function trackScrollDepth(): void {
  if (typeof window === 'undefined') return;
  
  let scrollTimer: NodeJS.Timeout | null = null;
  
  window.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    
    scrollTimer = setTimeout(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
      
      // Track scroll event only if scroll depth is significant
      if (scrollPercent > 10) {
        trackBehaviorEvent(
          'scroll',
          window.location.href,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { scrollDepth: scrollPercent }
        );
      }
    }, 1000); // Debounce scroll events
  });
}

// Track click events
export function trackClickEvents(): void {
  if (typeof window === 'undefined') return;
  
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target) return;
    
    // Get element information
    const elementId = target.id || undefined;
    const elementClass = target.className || undefined;
    const elementText = target.textContent?.substring(0, 100) || undefined;
    const xPosition = event.clientX;
    const yPosition = event.clientY;
    
    trackBehaviorEvent(
      'click',
      window.location.href,
      elementId,
      elementClass,
      elementText,
      xPosition,
      yPosition
    );
  });
}

// Initialize analytics
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Track session start
  trackSessionStart(window.location.href, document.referrer);
  
  // Track initial page view
  trackPageView(window.location.href, document.title, document.referrer);
  
  // Set up scroll tracking
  trackScrollDepth();
  
  // Set up click tracking
  trackClickEvents();
  
  // Track page views on navigation (for SPAs)
  let lastTrackedUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastTrackedUrl) {
      trackPageView(window.location.href, document.title, lastTrackedUrl);
      lastTrackedUrl = window.location.href;
    }
  }, 1000);
}

// Update session end time
export async function trackSessionEnd(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  
  try {
    // Update session end time
    await fetch('/api/analytics/update-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        endTime: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Error updating session end time:', error);
  }
}

// Add beforeunload listener to track session end
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    trackSessionEnd();
  });
}