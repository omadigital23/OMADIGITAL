/**
 * Logger conditionnel pour éviter les logs sensibles en production
 * Utilisation: import { logger } from '@/lib/logger'
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDevelopment = process.env.NODE_ENV !== 'production'

class Logger {
    /**
     * Debug logs (seulement en développement)
     * Utilisé pour les logs de débogage détaillés
     */
    debug(...args: unknown[]) {
        if (isDevelopment) {
            console.log('[DEBUG]', new Date().toISOString(), ...args)
        }
    }

    /**
     * Info logs (production et développement)
     * Utilisé pour les événements importants mais non critiques
     * Éviter de logger des PII (données personnelles)
     */
    info(...args: unknown[]) {
        console.log('[INFO]', new Date().toISOString(), ...args)
    }

    /**
     * Warning logs (production et développement)
     * Utilisé pour les situations anormales mais non bloquantes
     */
    warn(...args: unknown[]) {
        console.warn('[WARN]', new Date().toISOString(), ...args)
    }

    /**
     * Error logs (production et développement)
     * Utilisé pour les erreurs critiques
     */
    error(...args: unknown[]) {
        console.error('[ERROR]', new Date().toISOString(), ...args)
    }

    /**
     * Log conditionnel basé sur le niveau
     */
    log(level: LogLevel, ...args: unknown[]) {
        switch (level) {
            case 'debug':
                this.debug(...args)
                break
            case 'info':
                this.info(...args)
                break
            case 'warn':
                this.warn(...args)
                break
            case 'error':
                this.error(...args)
                break
        }
    }
}

export const logger = new Logger()
