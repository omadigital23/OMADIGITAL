/**
 * Enhanced Security Manager for Production
 * Comprehensive security utilities and validation
 */

import DOMPurify from 'isomorphic-dompurify';

interface SecurityConfig {
  maxInputLength: number;
  allowedDomains: string[];
  rateLimitWindow: number;
  maxRequestsPerWindow: number;
  suspiciousPatterns: RegExp[];
}

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  threats: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number; blocked: boolean }>;
  private suspiciousIPs: Set<string>;
  private blockedIPs: Set<string>;

  private constructor() {
    this.config = {
      maxInputLength: 10000,
      allowedDomains: [
        'oma-digital.sn',
        'localhost',
        'vercel.app',
        'supabase.co',
        'googleapis.com'
      ],
      rateLimitWindow: 60000, // 1 minute
      maxRequestsPerWindow: 30,
      suspiciousPatterns: [
        // XSS patterns (strict)
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:\s*[^\s]/gi,
        /on(load|error|click)\s*=/gi,
        /<iframe\b[^>]*>/gi,
        /<object\b[^>]*>/gi,
        /<embed\b[^>]*>/gi,
        
        // SQL injection patterns (strict)
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\s+(FROM|INTO|SET|TABLE))/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+\s*--)/gi,
        /(\\x27|%27).*(-{2,}|%2D%2D)/gi,
        
        // Command injection patterns
        /(\||&|;|\$\(|\`)/g,
        /(wget|curl|nc|netcat|bash|sh|cmd|powershell)/gi,
        
        // Path traversal patterns
        /(\.\.[\/\\]){2,}/g,
        /(\/etc\/passwd|\/etc\/shadow|\/proc\/|\/sys\/)/gi,
        
        // NoSQL injection patterns
        /(\$where|\$ne|\$gt|\$lt|\$regex)/gi,
        
        // LDAP injection patterns
        /(\*\)|\(\||\)\()/g
      ]
    };
    
    this.rateLimitStore = new Map();
    this.suspiciousIPs = new Set();
    this.blockedIPs = new Set();
    
    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Comprehensive input validation and sanitization
   */
  public validateAndSanitize(input: string, context: 'form' | 'chat' | 'search' | 'admin' = 'form'): ValidationResult {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Basic validation
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        sanitized: '',
        threats: ['Invalid input type'],
        riskLevel: 'medium'
      };
    }
    
    // Length validation
    if (input.length > this.config.maxInputLength) {
      threats.push('Input too long');
      riskLevel = 'medium';
      input = input.substring(0, this.config.maxInputLength);
    }
    
    // Check for suspicious patterns (less strict for chat)
    const patternsToCheck = context === 'chat' 
      ? this.config.suspiciousPatterns.filter(p => {
          const str = p.toString();
          return str.includes('script') || str.includes('iframe') || str.includes('wget') || str.includes('curl');
        })
      : this.config.suspiciousPatterns;
    
    for (const pattern of patternsToCheck) {
      if (pattern.test(input)) {
        const patternName = this.getPatternName(pattern);
        threats.push(`Suspicious pattern detected: ${patternName}`);
        
        // Escalate risk level based on pattern type
        if (patternName.includes('XSS') || patternName.includes('SQL')) {
          riskLevel = 'critical';
        } else if (patternName.includes('Command') || patternName.includes('Path')) {
          riskLevel = 'high';
        } else {
          riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
        }
      }
    }
    
    // Context-specific validation
    switch (context) {
      case 'chat':
        input = this.sanitizeChatInput(input);
        break;
      case 'form':
        input = this.sanitizeFormInput(input);
        break;
      case 'search':
        input = this.sanitizeSearchInput(input);
        break;
      case 'admin':
        input = this.sanitizeAdminInput(input);
        break;
    }
    
    // HTML sanitization using DOMPurify
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: context === 'admin' ? ['b', 'i', 'em', 'strong'] : [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    });
    
    // Final validation
    const isValid = threats.length === 0 || riskLevel === 'low';
    
    return {
      isValid,
      sanitized,
      threats,
      riskLevel
    };
  }

  /**
   * Rate limiting with progressive penalties
   */
  public checkRateLimit(identifier: string, endpoint: string = 'default'): RateLimitResult {
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    // Check if IP is blocked
    if (this.blockedIPs.has(identifier)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.rateLimitWindow,
        blocked: true
      };
    }
    
    let entry = this.rateLimitStore.get(key);
    
    // Initialize or reset if window expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.rateLimitWindow,
        blocked: false
      };
    }
    
    entry['count']++;
    this.rateLimitStore.set(key, entry);
    
    // Check if limit exceeded
    if (entry['count'] > this.config.maxRequestsPerWindow) {
      // Mark as suspicious after multiple violations
      if (entry['count'] > this.config.maxRequestsPerWindow * 2) {
        this.suspiciousIPs.add(identifier);
      }
      
      // Block after extreme violations
      if (entry['count'] > this.config.maxRequestsPerWindow * 5) {
        this.blockedIPs.add(identifier);
        entry.blocked = true;
      }
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        blocked: entry.blocked
      };
    }
    
    return {
      allowed: true,
      remaining: this.config.maxRequestsPerWindow - entry['count'],
      resetTime: entry.resetTime,
      blocked: false
    };
  }

  /**
   * Validate email with enhanced security
   */
  public validateEmail(email: string): { isValid: boolean; sanitized: string; threats: string[] } {
    const threats: string[] = [];
    
    if (!email || typeof email !== 'string') {
      return { isValid: false, sanitized: '', threats: ['Invalid email format'] };
    }
    
    // Basic sanitization
    const sanitized = email.trim().toLowerCase();
    
    // Length check
    if (sanitized.length > 254) {
      threats.push('Email too long');
      return { isValid: false, sanitized: '', threats };
    }
    
    // Format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(sanitized)) {
      threats.push('Invalid email format');
      return { isValid: false, sanitized: '', threats };
    }
    
    // Check for suspicious patterns in email
    const suspiciousEmailPatterns = [
      /script/gi,
      /javascript/gi,
      /vbscript/gi,
      /onload/gi,
      /onerror/gi
    ];
    
    for (const pattern of suspiciousEmailPatterns) {
      if (pattern.test(sanitized)) {
        threats.push('Suspicious content in email');
        return { isValid: false, sanitized: '', threats };
      }
    }
    
    return { isValid: true, sanitized, threats: [] };
  }

  /**
   * Validate phone number for Senegal/Morocco
   */
  public validatePhone(phone: string): { isValid: boolean; sanitized: string; threats: string[] } {
    const threats: string[] = [];
    
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, sanitized: '', threats: ['Invalid phone format'] };
    }
    
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Check for suspicious content
    if (/[a-zA-Z<>{}[\]]/g.test(cleaned)) {
      threats.push('Invalid characters in phone number');
      return { isValid: false, sanitized: '', threats };
    }
    
    // Validate format for Senegal (+221) and Morocco (+212)
    const phoneRegex = /^(\+221|\+212|00221|00212|221|212)?[0-9]{8,9}$/;
    
    if (!phoneRegex.test(cleaned)) {
      threats.push('Invalid phone format for Senegal/Morocco');
      return { isValid: false, sanitized: '', threats };
    }
    
    return { isValid: true, sanitized: cleaned, threats: [] };
  }

  /**
   * Validate and sanitize URLs
   */
  public validateURL(url: string): { isValid: boolean; sanitized: string; threats: string[] } {
    const threats: string[] = [];
    
    if (!url || typeof url !== 'string') {
      return { isValid: false, sanitized: '', threats: ['Invalid URL'] };
    }
    
    try {
      const urlObj = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        threats.push('Invalid protocol');
        return { isValid: false, sanitized: '', threats };
      }
      
      // Check domain whitelist
      const domain = urlObj.hostname;
      const isAllowed = this.config.allowedDomains.some(allowedDomain => 
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
      );
      
      if (!isAllowed) {
        threats.push('Domain not in whitelist');
        return { isValid: false, sanitized: '', threats };
      }
      
      return { isValid: true, sanitized: urlObj.toString(), threats: [] };
      
    } catch (error) {
      threats.push('Malformed URL');
      return { isValid: false, sanitized: '', threats };
    }
  }

  /**
   * Generate secure session ID
   */
  public generateSecureSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('');
    return `${timestamp}-${randomString}`;
  }

  /**
   * Hash sensitive data
   */
  public async hashSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Context-specific sanitization methods
   */
  private sanitizeChatInput(input: string): string {
    // Remove potential command injections but allow apostrophes and accents
    return input
      .replace(/[<>{}[\]\\]/g, '')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private sanitizeFormInput(input: string): string {
    // More permissive for form inputs but still secure
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  private sanitizeSearchInput(input: string): string {
    // Strict sanitization for search
    return input
      .replace(/[<>{}[\]\\'"`;]/g, '')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private sanitizeAdminInput(input: string): string {
    // Moderate sanitization for admin (allow some formatting)
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Get pattern name for logging
   */
  private getPatternName(pattern: RegExp): string {
    const patternString = pattern.toString();
    
    if (patternString.includes('script') || patternString.includes('javascript')) return 'XSS';
    if (patternString.includes('SELECT') || patternString.includes('INSERT')) return 'SQL Injection';
    if (patternString.includes('wget') || patternString.includes('curl')) return 'Command Injection';
    if (patternString.includes('..')) return 'Path Traversal';
    if (patternString.includes('$where')) return 'NoSQL Injection';
    
    return 'Unknown Pattern';
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Clean rate limit store
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        this.rateLimitStore.delete(key);
      }
    }
    
    // Clean suspicious IPs (reset after 1 hour)
    // Note: In production, this should be persisted to database
    if (this.suspiciousIPs.size > 1000) {
      this.suspiciousIPs.clear();
    }
    
    // Clean blocked IPs (reset after 24 hours)
    // Note: In production, this should be persisted to database
    if (this.blockedIPs.size > 100) {
      this.blockedIPs.clear();
    }
  }

  /**
   * Get security metrics for monitoring
   */
  public getSecurityMetrics(): {
    rateLimitEntries: number;
    suspiciousIPs: number;
    blockedIPs: number;
    memoryUsage: number;
  } {
    return {
      rateLimitEntries: this.rateLimitStore.size,
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: this.blockedIPs.size,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Check if IP is suspicious or blocked
   */
  public getIPStatus(ip: string): { suspicious: boolean; blocked: boolean } {
    return {
      suspicious: this.suspiciousIPs.has(ip),
      blocked: this.blockedIPs.has(ip)
    };
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Export types
export type { ValidationResult, RateLimitResult, SecurityConfig };