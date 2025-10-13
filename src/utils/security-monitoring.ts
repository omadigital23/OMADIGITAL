/**
 * Security Monitoring Utilities for OMA Digital
 * Simplified version for immediate implementation
 */

// Security event types
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  RATE_LIMIT_TRIGGERED = 'rate_limit_triggered',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

// Security event interface
interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
}

// In-memory event storage (replace with database in production)
const securityEvents: SecurityEvent[] = [];

/**
 * Log a security event
 */
async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };

  // Add to in-memory storage
  securityEvents.push(securityEvent);

  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }

  // Log to console for monitoring
  const severity = event.severity.toUpperCase();
  const icon = event.severity === 'critical' ? '🚨' : 
               event.severity === 'high' ? '⚠️' : 
               event.severity === 'medium' ? '🔶' : '🔵';
  
  console.log(`${icon} Security Event [${severity}]: ${event.message}`);
  
  if (event.ipAddress) {
    console.log(`   IP: ${event.ipAddress}`);
  }
  
  if (event.details && Object.keys(event.details).length > 0) {
    console.log(`   Details:`, event.details);
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with monitoring services like:
    // - Supabase logging
    // - Sentry
    // - DataDog
    // - Custom webhook
  }

  // Critical events need immediate attention
  if (event.severity === 'critical') {
    console.error('🚨 CRITICAL SECURITY ALERT - IMMEDIATE ACTION REQUIRED');
    console.error(`   Event: ${event.message}`);
    console.error(`   Time: ${securityEvent.timestamp}`);
    console.error(`   IP: ${event.ipAddress}`);
    
    // In production, send alerts via:
    // - Email
    // - Slack
    // - SMS
    // - PagerDuty
  }
}

/**
 * Log successful authentication
 */
export async function logAuthSuccess(username: string, ipAddress: string, userAgent: string) {
  await logSecurityEvent({
    type: SecurityEventType.LOGIN_SUCCESS,
    severity: 'low',
    message: `Successful admin login: ${username}`,
    details: { username },
    ipAddress,
    userAgent
  });
}

/**
 * Log failed authentication
 */
export async function logAuthFailure(username: string, ipAddress: string, userAgent: string, reason?: string) {
  await logSecurityEvent({
    type: SecurityEventType.LOGIN_FAILURE,
    severity: 'medium',
    message: `Failed admin login attempt: ${username}`,
    details: { 
      username, 
      reason: reason || 'Invalid credentials',
      potential_threat: 'Monitor for brute force patterns'
    },
    ipAddress,
    userAgent
  });

  // Check for brute force patterns
  await checkBruteForcePattern(ipAddress, username);
}

/**
 * Log rate limiting events
 */
export async function logRateLimit(ipAddress: string, endpoint: string, userAgent: string) {
  await logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_TRIGGERED,
    severity: 'high',
    message: `Rate limit triggered for IP: ${ipAddress}`,
    details: { 
      endpoint, 
      action: 'blocked_excessive_requests',
      recommendation: 'Monitor for sustained attacks'
    },
    ipAddress,
    userAgent
  });
}

/**
 * Log suspicious input attempts
 */
export async function logSuspiciousInput(
  input: string, 
  type: 'xss' | 'sql_injection' | 'other', 
  ipAddress: string, 
  userAgent: string
) {
  await logSecurityEvent({
    type: SecurityEventType.XSS_ATTEMPT,
    severity: 'high',
    message: `Suspicious ${type} attempt detected`,
    details: { 
      input_sample: input.substring(0, 50) + '...', // Truncate for security
      attack_type: type,
      blocked: true,
      recommendation: 'Review input validation rules'
    },
    ipAddress,
    userAgent
  });
}

/**
 * Check for brute force attack patterns
 */
async function checkBruteForcePattern(ipAddress: string, username: string) {
  // Get failed attempts from last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentFailures = securityEvents.filter(event => 
    event.type === SecurityEventType.LOGIN_FAILURE &&
    event.ipAddress === ipAddress &&
    new Date(event.timestamp) > oneHourAgo
  );

  // Alert if more than 5 failures in an hour
  if (recentFailures.length >= 5) {
    await logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'critical',
      message: `Potential brute force attack detected from IP: ${ipAddress}`,
      details: {
        failed_attempts: recentFailures.length,
        time_window: '1_hour',
        target_username: username,
        recommendation: 'Consider IP blocking or extended rate limiting',
        attack_pattern: 'brute_force'
      },
      ipAddress
    });
  }
}

/**
 * Get security metrics for monitoring dashboard
 */
export function getSecurityMetrics(timeRange: '1h' | '24h' | '7d' = '24h') {
  const timeRanges = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7
  };

  const hoursAgo = timeRanges[timeRange];
  const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const recentEvents = securityEvents.filter(event => 
    new Date(event.timestamp) > startTime
  );

  const metrics = {
    total_events: recentEvents.length,
    by_severity: {
      low: recentEvents.filter(e => e.severity === 'low').length,
      medium: recentEvents.filter(e => e.severity === 'medium').length,
      high: recentEvents.filter(e => e.severity === 'high').length,
      critical: recentEvents.filter(e => e.severity === 'critical').length
    },
    by_type: recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    time_range: timeRange,
    last_updated: new Date().toISOString()
  };

  return metrics;
}

/**
 * Get recent security events for admin dashboard
 */
export function getRecentSecurityEvents(limit: number = 50) {
  return securityEvents
    .slice(-limit)
    .reverse() // Most recent first
    .map(event => ({
      ...event,
      details: JSON.stringify(event.details) // Serialize for display
    }));
}

/**
 * Clear old security events (cleanup function)
 */
export function cleanupOldEvents(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days default
  const cutoffTime = new Date(Date.now() - maxAge);
  
  const initialCount = securityEvents.length;
  
  // Remove old events
  for (let i = securityEvents.length - 1; i >= 0; i--) {
    if (new Date(securityEvents[i].timestamp) < cutoffTime) {
      securityEvents.splice(i, 1);
    }
  }
  
  const removedCount = initialCount - securityEvents.length;
  
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old security events`);
  }
}

// Auto-cleanup every hour
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupOldEvents, 60 * 60 * 1000); // Every hour
}