import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
  sanitizeSessionId,
  sanitizeUUID,
  sanitizeIpAddress,
  sanitizeUserAgent,
  sanitizeUrl,
  sanitizeDeviceType,
  sanitizeBrowser,
  sanitizeOperatingSystem,
  sanitizeCountry,
  sanitizeLocationName,
  sanitizeUTMParameters
} from '../../../src/utils/input-sanitization';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      visitorId,
      ipAddress,
      userAgent,
      referrer,
      landingPage,
      deviceType,
      browser,
      operatingSystem,
      country,
      region,
      city,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    } = req.body;

    // Sanitize inputs
    const sanitizedSessionId = sanitizeSessionId(sessionId);
    const sanitizedVisitorId = visitorId ? sanitizeUUID(visitorId) : null;
    const sanitizedIpAddress = ipAddress ? sanitizeIpAddress(ipAddress) : null;
    const sanitizedUserAgent = userAgent ? sanitizeUserAgent(userAgent) : null;
    const sanitizedReferrer = referrer ? sanitizeUrl(referrer) : null;
    const sanitizedLandingPage = sanitizeUrl(landingPage);
    const sanitizedDeviceType = deviceType ? sanitizeDeviceType(deviceType) : null;
    const sanitizedBrowser = browser ? sanitizeBrowser(browser) : null;
    const sanitizedOperatingSystem = operatingSystem ? sanitizeOperatingSystem(operatingSystem) : null;
    const sanitizedCountry = country ? sanitizeCountry(country) : null;
    const sanitizedRegion = region ? sanitizeLocationName(region) : null;
    const sanitizedCity = city ? sanitizeLocationName(city) : null;
    
    const utmParams = sanitizeUTMParameters({
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent
    });

    // Validate required fields
    if (!sanitizedSessionId || !sanitizedLandingPage) {
      return res.status(400).json({ error: 'Missing required fields: sessionId and landingPage' });
    }

    // Insert or update visitor session
    const { data, error } = await supabase
      .from('visitor_sessions')
      .upsert({
        session_id: sanitizedSessionId,
        visitor_id: sanitizedVisitorId,
        ip_address: sanitizedIpAddress,
        user_agent: sanitizedUserAgent,
        referrer: sanitizedReferrer,
        landing_page: sanitizedLandingPage,
        device_type: sanitizedDeviceType,
        browser: sanitizedBrowser,
        operating_system: sanitizedOperatingSystem,
        country: sanitizedCountry,
        region: sanitizedRegion,
        city: sanitizedCity,
        utm_source: utmParams['utm_source'],
        utm_medium: utmParams['utm_medium'],
        utm_campaign: utmParams['utm_campaign'],
        utm_term: utmParams['utm_term'],
        utm_content: utmParams['utm_content'],
        start_time: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      });

    if (error) {
      console.error('Error tracking session:', error);
      return res.status(500).json({ error: 'Failed to track session' });
    }

    res.status(200).json({ success: true, message: 'Session tracked successfully' });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}