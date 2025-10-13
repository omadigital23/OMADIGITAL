/**
 * Security Manager for OMA Digital Platform
 * Comprehensive security utilities and monitoring
 */

import DOMPurify from 'isomorphic-dompurify';

interface SecurityConfig {
  enableCSP: boolean;
  enableXSSProtection: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableSecurityHeaders: boolean;
}

interface SecurityViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private violations: SecurityViolation[] = [];
  private rateLimitMap = new Map<string, number[]>();

  private constructor() {
    this.config = {
      enableCSP: true,
      enableXSSProtection: true,
      enableRateLimiting: true,
      enableInputValidation: true,
      enableSecurityHeaders: true
    };
    
    if (typeof window !== 'undefined') {
      this.initializeClientSecurity();
    }
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize client-side security measures
   */
  private initializeClientSecurity(): void {
    // Monitor for XSS attempts
    this.monitorXSSAttempts();
    
    // Monitor for suspicious activities
    this.monitorSuspiciousActivities();
    
    // Initialize CSP violation reporting
    this.initializeCSPReporting();
    
    // Monitor for clickjacking attempts
    this.monitorClickjacking();
  }

  /**
   * Sanitize user input to prevent XSS
   */
  public sanitizeInput(input: string, options: any = {}): string {
    if (!this.config.enableXSSProtection) return input;
    
    try {
      // Configure DOMPurify options
      const purifyOptions = {
        ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: options.allowedAttributes || [],
        FORBID_SCRIPT: true,
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
        ...options
      };
      
      const sanitized = DOMPurify.sanitize(input, purifyOptions);
      
      // Convert TrustedHTML to string for comparison
      const sanitizedString = typeof sanitized === 'string' ? sanitized : String(sanitized);
      
      // Log if input was modified (potential XSS attempt)
      if (sanitizedString !== input) {
        this.reportViolation({
          type: 'xss_attempt',
          severity: 'high',
          description: `Potentially malicious input detected and sanitized`,
          timestamp: new Date().toISOString()
        });
      }
      
      return sanitizedString;
    } catch (error) {
      console.error('Sanitization error:', error);
      return ''; // Return empty string on error for safety
    }
  }

  /**
   * Validate input against common attack patterns
   */
  public validateInput(input: string, type: 'email' | 'text' | 'message' | 'phone' = 'text'): boolean {
    if (!this.config.enableInputValidation) return true;
    
    // Check for common attack patterns
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
      /javascript:/gi, // JavaScript protocol
      /vbscript:/gi, // VBScript protocol
      /on\w+\s*=/gi, // Event handlers
      /expression\s*\(/gi, // CSS expressions
      /url\s*\(/gi, // CSS url() function
      /import\s+/gi, // CSS @import
      /@import/gi, // CSS @import
      /\beval\s*\(/gi, // eval() function
      /\bexec\s*\(/gi, // exec() function
      /\bsetTimeout\s*\(/gi, // setTimeout with string
      /\bsetInterval\s*\(/gi, // setInterval with string
    ];
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /('|(\\')|(;)|(--)|(\|)|(\*)|(%)|(\+))/gi
    ];
    
    // Type-specific validation
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          this.reportViolation({
            type: 'invalid_email',
            severity: 'low',
            description: 'Invalid email format detected',
            timestamp: new Date().toISOString()
          });
          return false;
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(input)) {
          this.reportViolation({
            type: 'invalid_phone',
            severity: 'low',
            description: 'Invalid phone format detected',
            timestamp: new Date().toISOString()
          });
          return false;
        }
        break;
    }
    
    // Check for malicious patterns
    for (const pattern of maliciousPatterns) {
      if (pattern.test(input)) {
        this.reportViolation({
          type: 'malicious_pattern',
          severity: 'critical',
          description: `Malicious pattern detected: ${pattern.source}`,
          timestamp: new Date().toISOString()
        });
        return false;
      }
    }
    
    // Check for SQL injection patterns
    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        this.reportViolation({
          type: 'sql_injection_attempt',
          severity: 'critical',
          description: `SQL injection pattern detected: ${pattern.source}`,
          timestamp: new Date().toISOString()
        });
        return false;
      }
    }
    
    return true;
  }

  /**
   * Rate limiting implementation
   */
  public checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    if (!this.config.enableRateLimiting) return true;
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.rateLimitMap.has(identifier)) {
      this.rateLimitMap.set(identifier, []);
    }
    
    const requests = this.rateLimitMap.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      this.reportViolation({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        description: `Rate limit exceeded for identifier: ${identifier}`,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.rateLimitMap.set(identifier, validRequests);
    
    return true;
  }

  /**
   * Monitor for XSS attempts
   */
  private monitorXSSAttempts(): void {
    // Monitor for suspicious DOM modifications
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                // Check for suspicious script tags
                if (element.tagName === 'SCRIPT') {
                  this.reportViolation({
                    type: 'suspicious_script_injection',
                    severity: 'critical',
                    description: 'Suspicious script tag injection detected',
                    timestamp: new Date().toISOString()
                  });
                }
                
                // Check for suspicious event handlers
                const suspiciousAttributes = ['onerror', 'onload', 'onclick'];
                suspiciousAttributes.forEach((attr) => {
                  if (element.hasAttribute(attr)) {
                    this.reportViolation({
                      type: 'suspicious_event_handler',
                      severity: 'high',
                      description: `Suspicious event handler detected: ${attr}`,
                      timestamp: new Date().toISOString()
                    });
                  }
                });
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Monitor for suspicious activities
   */
  private monitorSuspiciousActivities(): void {
    // Monitor for rapid form submissions
    let formSubmissionCount = 0;
    let lastSubmissionTime = 0;
    
    document.addEventListener('submit', () => {
      const now = Date.now();
      if (now - lastSubmissionTime < 1000) {
        formSubmissionCount++;
        if (formSubmissionCount > 3) {
          this.reportViolation({
            type: 'rapid_form_submission',
            severity: 'medium',
            description: 'Rapid form submissions detected (possible bot activity)',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        formSubmissionCount = 0;
      }
      lastSubmissionTime = now;
    });
    
    // Monitor for console access (potential developer tools usage)
    let devToolsOpen = false;
    setInterval(() => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          this.reportViolation({
            type: 'developer_tools_detected',
            severity: 'low',
            description: 'Developer tools usage detected',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        devToolsOpen = false;
      }
    }, 5000);
  }

  /**
   * Initialize CSP violation reporting
   */
  private initializeCSPReporting(): void {
    document.addEventListener('securitypolicyviolation', (event) => {
      this.reportViolation({
        type: 'csp_violation',
        severity: 'high',
        description: `CSP violation: ${event.violatedDirective} - ${event.blockedURI}`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Monitor for clickjacking attempts
   */
  private monitorClickjacking(): void {
    if (window.top !== window.self) {
      this.reportViolation({
        type: 'potential_clickjacking',
        severity: 'high',
        description: 'Page loaded in iframe (potential clickjacking attempt)',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate secure headers for API responses
   */
  public generateSecurityHeaders(): Record<string, string> {
    if (!this.config.enableSecurityHeaders) return {};
    
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': this.generateCSPHeader()
    };
  }

  /**
   * Generate Content Security Policy header
   */
  private generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' https://www.google-analytics.com https://*.supabase.co https://generativelanguage.googleapis.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  /**
   * Report security violation
   */
  private reportViolation(violation: SecurityViolation): void {
    this.violations.push(violation);
    
    // Log critical violations immediately
    if (violation.severity === 'critical') {
      console.error('SECURITY VIOLATION:', violation);
    }
    
    // Send to security monitoring service
    this.sendToSecurityService(violation);
    
    // Keep only last 100 violations in memory
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100);
    }
  }

  /**
   * Send violation to security monitoring service
   */
  private async sendToSecurityService(violation: SecurityViolation): Promise<void> {
    try {
      // Only send if window and fetch are available
      if (typeof window !== 'undefined' && typeof window.fetch !== 'undefined') {
        await window.fetch('/api/security/violations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...violation,
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        });
      }
    } catch (error) {
      console.warn('Failed to report security violation:', error);
    }
  }

  /**
   * Get security violations
   */
  public getViolations(): SecurityViolation[] {
    return [...this.violations];
  }

  /**
   * Get security status
   */
  public getSecurityStatus(): any {
    const now = Date.now();
    const recentViolations = this.violations.filter(
      v => now - new Date(v.timestamp).getTime() < 3600000 // Last hour
    );
    
    const criticalViolations = recentViolations.filter(v => v.severity === 'critical');
    const highViolations = recentViolations.filter(v => v.severity === 'high');
    
    return {
      status: criticalViolations.length > 0 ? 'critical' : 
              highViolations.length > 0 ? 'warning' : 'secure',
      totalViolations: this.violations.length,
      recentViolations: recentViolations.length,
      criticalViolations: criticalViolations.length,
      highViolations: highViolations.length,
      config: this.config,
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * Clear old violations
   */
  public clearOldViolations(maxAge: number = 86400000): void {
    const cutoff = Date.now() - maxAge;
    this.violations = this.violations.filter(
      v => new Date(v.timestamp).getTime() > cutoff
    );
  }

  /**
   * Update security configuration
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Export utility functions
export const sanitizeInput = (input: string, options?: any) => 
  securityManager.sanitizeInput(input, options);

export const validateInput = (input: string, type?: 'email' | 'text' | 'message' | 'phone') => 
  securityManager.validateInput(input, type);

export const checkRateLimit = (identifier: string, maxRequests?: number, windowMs?: number) => 
  securityManager.checkRateLimit(identifier, maxRequests, windowMs);