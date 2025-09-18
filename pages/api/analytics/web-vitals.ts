import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get client IP address
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     'unknown';
    
    // Extract just the first IP if multiple are provided
    const clientIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;
    
    // For location data, we would typically use a service like IP geolocation
    // For now, we'll use placeholder values and note that in a real implementation
    // you would integrate with a service like MaxMind, IPinfo, or similar
    let country = 'unknown';
    let region = 'unknown';
    let city = 'unknown';
    
    // In a real implementation, you would do something like:
    // const locationData = await getLocationFromIP(clientIp);
    // country = locationData.country;
    // region = locationData.region;
    // city = locationData.city;

    const requestData = req.body;

    // Validate required fields
    if (!requestData.name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    // Prepare data for insertion
    const eventData = {
      event_name: requestData.name,
      event_properties: requestData.value ? { value: requestData.value } : requestData,
      session_id: requestData.sessionId || `session_${Date.now()}`,
      url: requestData.url || (typeof window !== 'undefined' ? window.location.href : ''),
      user_agent: requestData.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      ip_address: clientIp,
      country: country,
      region: region,
      city: city,
      device_type: requestData.deviceType || null,
      timestamp: new Date().toISOString()
    };

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('Error inserting web vitals data:', error);
      return res.status(500).json({ error: 'Failed to insert data' });
    }

    res.status(200).json({ message: 'Web vitals data recorded successfully' });
  } catch (error) {
    console.error('Web vitals API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
