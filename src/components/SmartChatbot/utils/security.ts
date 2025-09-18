// Utilitaires de sécurité pour le chatbot
import DOMPurify from 'isomorphic-dompurify';
import { logSuspiciousInput } from '../../../utils/security-monitoring';

export interface SecurityConfig {
  maxMessageLength: number;
  suspiciousPatterns: RegExp[];
  rateLimitWindow: number;
  maxMessagesPerWindow: number;
}

// Configuration de sécurité par défaut
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxMessageLength: 500,
  suspiciousPatterns: [
    /<script/i,
    /javascript:/i,
    /onerror/i,
    /onload/i,
    /onmouseover/i,
    /onclick/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /alert\(/i,
    /confirm\(/i,
    /prompt\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
    /data:text\/html/i
  ],
  rateLimitWindow: 60000, // 1 minute
  maxMessagesPerWindow: 10
};

// Cache pour le rate limiting avec nettoyage automatique
const rateLimitCache = new Map<string, number[]>();

// Nettoyage périodique du cache pour éviter les fuites mémoire
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [userId, timestamps] of rateLimitCache.entries()) {
      const recentRequests = timestamps.filter(
        timestamp => now - timestamp < DEFAULT_SECURITY_CONFIG.rateLimitWindow
      );
      if (recentRequests.length === 0) {
        rateLimitCache.delete(userId);
      } else {
        rateLimitCache.set(userId, recentRequests);
      }
    }
  }, 60000); // Nettoyage toutes les minutes
}

/**
 * Sanitise l'input utilisateur de manière sécurée
 */
export function sanitizeInput(input: string, config: SecurityConfig = DEFAULT_SECURITY_CONFIG, trimWhitespace: boolean = true): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Limiter la longueur
  const truncated = input.substring(0, config.maxMessageLength);
  
  // Utiliser DOMPurify pour nettoyer le contenu
  const sanitized = DOMPurify.sanitize(truncated, {
    ALLOWED_TAGS: [], // Aucun tag HTML autorisé
    ALLOWED_ATTR: [], // Aucun attribut autorisé
    KEEP_CONTENT: true // Garder le contenu texte
  });

  // Ne trim que lors de la soumission finale, pas pendant la saisie en temps réel
  return trimWhitespace ? sanitized.trim() : sanitized;
}

/**
 * Vérifie si l'input contient des patterns suspects
 */
export function checkForSuspiciousInput(
  input: string, 
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return config.suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Vérifie le rate limiting pour un utilisateur
 */
export function checkRateLimit(
  userId: string, 
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): boolean {
  const now = Date.now();
  const userRequests = rateLimitCache.get(userId) || [];
  
  // Nettoyer les anciennes requêtes
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < config.rateLimitWindow
  );
  
  // Vérifier si la limite est dépassée
  if (recentRequests.length >= config.maxMessagesPerWindow) {
    return false;
  }
  
  // Ajouter la nouvelle requête
  recentRequests.push(now);
  rateLimitCache.set(userId, recentRequests);
  
  return true;
}

/**
 * Valide et sécurise un message utilisateur
 */
export function validateAndSecureMessage(
  message: string,
  userId: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): {
  isValid: boolean;
  sanitizedMessage: string;
  error?: string;
} {
  // Sanitiser le message avec trimming (pour la soumission finale)
  const sanitizedMessage = sanitizeInput(message, config, true);
  
  // Vérifier le rate limiting après validation
  if (!checkRateLimit(userId, config)) {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Trop de messages envoyés. Veuillez patienter avant de réessayer.'
    };
  }
  
  // Vérifier si le message est vide après sanitisation
  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Message vide ou invalide.'
    };
  }

  // Vérifier les patterns suspects sur le message sanitizé
  if (checkForSuspiciousInput(sanitizedMessage, config)) {
    // Logger l'activité suspecte sans inclure le contenu utilisateur
    if (typeof window !== 'undefined') {
      logSuspiciousInput(
        'Suspicious content detected',
        'xss_attempt',
        'unknown', // Dans un vrai environnement, obtenir la vraie IP
        navigator.userAgent
      ).catch(error => {
        console.warn('Security logging failed');
      });
    }
    
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Votre message contient du contenu non autorisé. Veuillez reformuler votre demande.'
    };
  }

  return {
    isValid: true,
    sanitizedMessage
  };
}

/**
 * Nettoie le cache de rate limiting (utile pour les tests)
 */
export function clearRateLimitCache(): void {
  rateLimitCache.clear();
}

/**
 * Obtient les statistiques de rate limiting pour un utilisateur
 */
export function getRateLimitStats(userId: string): {
  requestCount: number;
  remainingRequests: number;
  resetTime: number;
} {
  const now = Date.now();
  const userRequests = rateLimitCache.get(userId) || [];
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < DEFAULT_SECURITY_CONFIG.rateLimitWindow
  );
  
  const oldestRequest = Math.min(...recentRequests);
  const resetTime = oldestRequest + DEFAULT_SECURITY_CONFIG.rateLimitWindow;
  
  return {
    requestCount: recentRequests.length,
    remainingRequests: Math.max(0, DEFAULT_SECURITY_CONFIG.maxMessagesPerWindow - recentRequests.length),
    resetTime
  };
}