/**
 * Real data fetching utilities for admin components
 * Replaces all mock data with actual Supabase queries
 */

export async function fetchRealDashboardData() {
  try {
    const [
      newsletterResponse,
      ctaResponse,
      chatbotResponse,
      analyticsResponse
    ] = await Promise.all([
      fetch('/api/admin/newsletter-analytics'),
      fetch('/api/admin/cta-management?analytics=true'),
      fetch('/api/admin/chatbot-interactions'),
      fetch('/api/admin/analytics')
    ]);

    const [newsletter, cta, chatbot, analytics] = await Promise.all([
      newsletterResponse.json(),
      ctaResponse.json(),
      chatbotResponse.json(),
      analyticsResponse.json()
    ]);

    return {
      newsletter,
      cta,
      chatbot,
      analytics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

export async function fetchRealTimeMetrics() {
  try {
    const response = await fetch('/api/admin/realtime-stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching realtime metrics:', error);
    throw error;
  }
}

// Data validation helpers
export function validateDataQuality(data: any) {
  const checks = {
    hasRealData: data && Object.keys(data).length > 0,
    hasTimestamp: data?.timestamp && new Date(data.timestamp).getTime() > 0,
    hasValidMetrics: data?.analytics && typeof data.analytics === 'object',
    isNotMock: !JSON.stringify(data).includes('mock') && !JSON.stringify(data).includes('test')
  };

  return {
    passed: Object.values(checks).every(Boolean),
    checks
  };
}