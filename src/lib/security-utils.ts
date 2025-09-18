/**
 * Utilitaires de sécurité pour l'application OMA Digital
 * Validation, sanitisation et protection contre les attaques courantes
 */

// Types pour la validation
interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

interface SecurityConfig {
  maxInputLength: number;
  allowedDomains: string[];
  rateLimitWindow: number;
  maxRequestsPerWindow: number;
}

// Configuration de sécurité par défaut
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxInputLength: 1000,
  allowedDomains: ['wa.me', 'whatsapp.com', 'omadigital.com', 'oma-digital.sn'],
  rateLimitWindow: 60000, // 1 minute
  maxRequestsPerWindow: 10
};

// Cache pour le rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Sanitise les entrées utilisateur pour prévenir les attaques XSS
 */
export function sanitizeInput(input: string, maxLength?: number): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Entrée invalide' };
  }

  const limit = maxLength || DEFAULT_SECURITY_CONFIG.maxInputLength;
  
  // Suppression des caractères dangereux
  let sanitized = input
    .replace(/[<>]/g, '') // Supprime < et >
    .replace(/javascript:/gi, '') // Supprime javascript:
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .replace(/data:/gi, '') // Supprime data: URLs
    .replace(/vbscript:/gi, '') // Supprime vbscript:
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Supprime les caractères de contrôle
    .trim();

  // Vérification de la longueur
  if (sanitized.length > limit) {
    sanitized = sanitized.slice(0, limit);
  }

  return {
    isValid: true,
    sanitized
  };
}

/**
 * Valide et sécurise les URLs
 */
export function validateUrl(url: string, allowedDomains?: string[]): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL invalide' };
  }

  try {
    const parsedUrl = new URL(url);
    const domains = allowedDomains || DEFAULT_SECURITY_CONFIG.allowedDomains;
    
    // Vérification du protocole
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
      return { isValid: false, error: 'Protocole non autorisé' };
    }

    // Vérification du domaine pour les URLs HTTP/HTTPS
    if (parsedUrl.protocol.startsWith('http')) {
      const isAllowedDomain = domains.some(domain => 
        parsedUrl.hostname === domain || 
        parsedUrl.hostname.endsWith('.' + domain) ||
        parsedUrl.hostname === window?.location?.hostname
      );

      if (!isAllowedDomain) {
        return { isValid: false, error: 'Domaine non autorisé' };
      }
    }

    return { isValid: true, sanitized: url };
  } catch (error) {
    return { isValid: false, error: 'Format URL invalide' };
  }
}

/**
 * Valide les adresses email
 */
export function validateEmail(email: string): ValidationResult {
  const sanitizeResult = sanitizeInput(email, 254); // RFC 5321 limite
  
  if (!sanitizeResult.isValid || !sanitizeResult.sanitized) {
    return sanitizeResult;
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitizeResult.sanitized)) {
    return { isValid: false, error: 'Format email invalide' };
  }

  return { isValid: true, sanitized: sanitizeResult.sanitized };
}

/**
 * Valide les numéros de téléphone
 */
export function validatePhone(phone: string): ValidationResult {
  const sanitizeResult = sanitizeInput(phone, 20);
  
  if (!sanitizeResult.isValid || !sanitizeResult.sanitized) {
    return sanitizeResult;
  }

  // Supprime tous les caractères non numériques sauf + et espaces
  const cleanPhone = sanitizeResult.sanitized.replace(/[^\d+\s-()]/g, '');
  
  // Vérifie le format (au moins 8 chiffres, peut commencer par +)
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{8,15}$/;
  
  if (!phoneRegex.test(cleanPhone.replace(/[\s-()]/g, ''))) {
    return { isValid: false, error: 'Format téléphone invalide' };
  }

  return { isValid: true, sanitized: cleanPhone };
}

/**
 * Rate limiting simple côté client
 */
export function checkRateLimit(identifier: string, config?: Partial<SecurityConfig>): boolean {
  const now = Date.now();
  const window = config?.rateLimitWindow || DEFAULT_SECURITY_CONFIG.rateLimitWindow;
  const maxRequests = config?.maxRequestsPerWindow || DEFAULT_SECURITY_CONFIG.maxRequestsPerWindow;
  
  const current = rateLimitCache.get(identifier);
  
  if (!current || now > current.resetTime) {
    // Nouvelle fenêtre ou première requête
    rateLimitCache.set(identifier, {
      count: 1,
      resetTime: now + window
    });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false; // Rate limit dépassé
  }
  
  // Incrémente le compteur
  current.count++;
  return true;
}

/**
 * Génère un token CSRF simple
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valide un token CSRF
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken || token.length !== storedToken.length) {
    return false;
  }
  
  // Comparaison sécurisée pour éviter les timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Encode les données pour éviter l'injection
 */
export function encodeForHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valide les données de formulaire de contact
 */
export function validateContactForm(data: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  company?: string;
}): { isValid: boolean; errors: Record<string, string>; sanitized?: any } {
  const errors: Record<string, string> = {};
  const sanitized: any = {};

  // Validation du nom
  if (data.name) {
    const nameResult = sanitizeInput(data.name, 100);
    if (!nameResult.isValid) {
      errors.name = nameResult.error || 'Nom invalide';
    } else if (nameResult.sanitized && nameResult.sanitized.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    } else {
      sanitized.name = nameResult.sanitized;
    }
  } else {
    errors.name = 'Le nom est requis';
  }

  // Validation de l'email
  if (data.email) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error || 'Email invalide';
    } else {
      sanitized.email = emailResult.sanitized;
    }
  } else {
    errors.email = 'L\'email est requis';
  }

  // Validation du téléphone (optionnel)
  if (data.phone) {
    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error || 'Téléphone invalide';
    } else {
      sanitized.phone = phoneResult.sanitized;
    }
  }

  // Validation du message
  if (data.message) {
    const messageResult = sanitizeInput(data.message, 2000);
    if (!messageResult.isValid) {
      errors.message = messageResult.error || 'Message invalide';
    } else if (messageResult.sanitized && messageResult.sanitized.length < 10) {
      errors.message = 'Le message doit contenir au moins 10 caractères';
    } else {
      sanitized.message = messageResult.sanitized;
    }
  } else {
    errors.message = 'Le message est requis';
  }

  // Validation de l'entreprise (optionnel)
  if (data.company) {
    const companyResult = sanitizeInput(data.company, 200);
    if (!companyResult.isValid) {
      errors.company = companyResult.error || 'Nom d\'entreprise invalide';
    } else {
      sanitized.company = companyResult.sanitized;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: Object.keys(errors).length === 0 ? sanitized : undefined
  };
}

/**
 * Génère un identifiant unique sécurisé
 */
export function generateSecureId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${randomPart}`;
}

/**
 * Vérifie si l'environnement est sécurisé (HTTPS en production)
 */
export function isSecureEnvironment(): boolean {
  if (typeof window === 'undefined') return true; // SSR
  
  return (
    window.location.protocol === 'https:' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Log sécurisé qui évite de logger des données sensibles
 */
export function secureLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    // En développement, on peut logger plus d'informations
    console.log(`[SECURE] ${message}`, data);
  } else {
    // En production, on évite de logger des données sensibles
    console.log(`[SECURE] ${message}`);
  }
}

// Export de la configuration par défaut
export { DEFAULT_SECURITY_CONFIG };