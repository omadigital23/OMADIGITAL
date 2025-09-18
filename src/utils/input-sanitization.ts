// Utility functions for sanitizing user inputs before database queries

// Sanitize string input
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  // Escape SQL-like patterns (basic protection)
  sanitized = sanitized.replace(/[%_]/g, '');
  
  return sanitized;
}

// Sanitize email input
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  // Basic email validation and sanitization
  const sanitized = email.trim().toLowerCase();
  
  // Check if it looks like a valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  // Limit length
  if (sanitized.length > 254) { // RFC 5321 limit
    return '';
  }
  
  return sanitized;
}

// Sanitize URL input
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = url.trim();
  
  // Limit length
  if (sanitized.length > 2000) { // Practical limit
    sanitized = sanitized.substring(0, 2000);
  }
  
  // Basic URL validation
  try {
    const parsedUrl = new URL(sanitized);
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return '';
    }
    return sanitized;
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

// Sanitize number input
export function sanitizeNumber(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
  const num = Number(input);
  
  // Check if it's a valid number
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }
  
  // Clamp to min/max values
  return Math.max(min, Math.min(max, num));
}

// Sanitize boolean input
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  
  if (typeof input === 'number') {
    return input !== 0;
  }
  
  return false;
}

// Sanitize array input
export function sanitizeArray<T>(input: any[], sanitizer: (item: any) => T, maxLength: number = 100): T[] {
  if (!Array.isArray(input)) {
    return [];
  }
  
  // Limit array length
  const limitedArray = input.slice(0, maxLength);
  
  // Sanitize each item
  return limitedArray.map(sanitizer);
}

// Sanitize object input (for JSON fields)
export function sanitizeObject(obj: any, maxLength: number = 10000): any {
  if (typeof obj !== 'object' || obj === null) {
    return {};
  }
  
  // Convert to JSON string and back to ensure it's a plain object
  try {
    const jsonString = JSON.stringify(obj);
    
    // Limit length
    if (jsonString.length > maxLength) {
      return {};
    }
    
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}

// Sanitize session ID
export function sanitizeSessionId(sessionId: string): string {
  if (typeof sessionId !== 'string') {
    return '';
  }
  
  // Session IDs should be alphanumeric with underscores and hyphens
  const sanitized = sessionId.trim();
  
  // Check format (basic validation)
  const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!sessionIdRegex.test(sanitized)) {
    return '';
  }
  
  // Limit length
  if (sanitized.length > 100) {
    return '';
  }
  
  return sanitized;
}

// Sanitize UUID
export function sanitizeUUID(uuid: string): string {
  if (typeof uuid !== 'string') {
    return '';
  }
  
  // Trim whitespace
  const sanitized = uuid.trim();
  
  // Check UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized.toLowerCase();
}

// Sanitize IP address
export function sanitizeIpAddress(ip: string): string {
  if (typeof ip !== 'string') {
    return '';
  }
  
  // Trim whitespace
  const sanitized = ip.trim();
  
  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(sanitized)) {
    // Validate each octet
    const octets = sanitized.split('.');
    for (const octet of octets) {
      const num = parseInt(octet, 10);
      if (num < 0 || num > 255) {
        return '';
      }
    }
    return sanitized;
  }
  
  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
  if (ipv6Regex.test(sanitized)) {
    return sanitized.toLowerCase();
  }
  
  return '';
}

// Sanitize user agent string
export function sanitizeUserAgent(userAgent: string): string {
  if (typeof userAgent !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = userAgent.trim();
  
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  return sanitized;
}

// Sanitize referrer URL
export function sanitizeReferrer(referrer: string): string {
  // Same as URL but can be empty
  if (!referrer) {
    return '';
  }
  
  return sanitizeUrl(referrer);
}

// Sanitize device type
export function sanitizeDeviceType(deviceType: string): string {
  if (typeof deviceType !== 'string') {
    return 'unknown';
  }
  
  const validTypes = ['mobile', 'tablet', 'desktop'];
  const sanitized = deviceType.trim().toLowerCase();
  
  return validTypes.includes(sanitized) ? sanitized : 'unknown';
}

// Sanitize browser name
export function sanitizeBrowser(browser: string): string {
  if (typeof browser !== 'string') {
    return 'unknown';
  }
  
  const validBrowsers = ['chrome', 'firefox', 'safari', 'edge', 'opera', 'unknown'];
  const sanitized = browser.trim().toLowerCase();
  
  return validBrowsers.includes(sanitized) ? sanitized : 'unknown';
}

// Sanitize operating system
export function sanitizeOperatingSystem(os: string): string {
  if (typeof os !== 'string') {
    return 'unknown';
  }
  
  const validOS = ['windows', 'macos', 'linux', 'android', 'ios', 'unknown'];
  const sanitized = os.trim().toLowerCase();
  
  return validOS.includes(sanitized) ? sanitized : 'unknown';
}

// Sanitize country code
export function sanitizeCountry(country: string): string {
  if (typeof country !== 'string') {
    return '';
  }
  
  const sanitized = country.trim().toUpperCase();
  
  // ISO 3166-1 alpha-2 country codes
  const countryRegex = /^[A-Z]{2}$/;
  if (!countryRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

// Sanitize region/city names
export function sanitizeLocationName(location: string): string {
  if (typeof location !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = location.trim();
  
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  return sanitized;
}

// Sanitize UTM parameters
export function sanitizeUTMParameters(utm: Record<string, string>): Record<string, string> {
  if (typeof utm !== 'object' || utm === null) {
    return {};
  }
  
  const sanitized: Record<string, string> = {};
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  for (const key of utmKeys) {
    if (utm[key]) {
      // Limit length for UTM parameters
      sanitized[key] = sanitizeString(utm[key], 100);
    }
  }
  
  return sanitized;
}

// Sanitize event type
export function sanitizeEventType(eventType: string): string {
  if (typeof eventType !== 'string') {
    return 'unknown';
  }
  
  const validEventTypes = [
    'click', 'scroll', 'form_submit', 'download', 'video_play', 'video_complete',
    'social_share', 'search', 'filter', 'sort', 'pagination', 'unknown'
  ];
  
  const sanitized = eventType.trim().toLowerCase();
  
  return validEventTypes.includes(sanitized) ? sanitized : 'unknown';
}

// Sanitize element identifiers
export function sanitizeElementId(elementId: string): string {
  if (typeof elementId !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = elementId.trim();
  
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  return sanitized;
}

export function sanitizeElementClass(elementClass: string): string {
  if (typeof elementClass !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = elementClass.trim();
  
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  return sanitized;
}

// Sanitize element text content
export function sanitizeElementText(elementText: string): string {
  if (typeof elementText !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = elementText.trim();
  
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  return sanitized;
}

// Sanitize coordinate positions
export function sanitizeCoordinate(coordinate: any): number {
  return sanitizeNumber(coordinate, 0, 10000);
}

// Sanitize scroll depth percentage
export function sanitizeScrollDepth(scrollDepth: any): number {
  const depth = sanitizeNumber(scrollDepth, 0, 100);
  return Math.round(depth);
}

// Sanitize engagement score
export function sanitizeEngagementScore(score: any): number {
  const sanitized = sanitizeNumber(score, 0, 1);
  return Math.round(sanitized * 100) / 100; // Round to 2 decimal places
}

// Sanitize read completion percentage
export function sanitizeReadCompletion(completion: any): number {
  const sanitized = sanitizeNumber(completion, 0, 1);
  return Math.round(sanitized * 100) / 100; // Round to 2 decimal places
}