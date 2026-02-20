/**
 * Server-side translation loader.
 * Reads locale JSON files from the public/locales directory.
 * Must only be used in Server Components or server-side code.
 */

import path from 'path'
import fs from 'fs'

export type Locale = 'fr' | 'en'

// ── Type definitions for translation namespaces ──────────────────────────────

export interface CommonTranslations {
    nav?: {
        home?: string
        services?: string
        about?: string
        blog?: string
        contact?: string
    }
    cart?: {
        title?: string
        empty?: string
        total?: string
        checkout?: string
        added?: string
        remove?: string
    }
    auth?: {
        signin?: string
        signup?: string
        signout?: string
        my_orders?: string
    }
    services_ui?: {
        view_details?: string
        hide_details?: string
        included?: string
        technologies?: string
        order?: string
    }
    footer?: Record<string, string>
    [key: string]: unknown
}

export interface AboutTranslations {
    title?: string
    description?: string
    [key: string]: unknown
}

// ── Loader ───────────────────────────────────────────────────────────────────

const localesDir = path.join(process.cwd(), 'public', 'locales')

export function getTranslations(locale: Locale, namespace: 'common'): CommonTranslations
export function getTranslations(locale: Locale, namespace: 'about'): AboutTranslations
export function getTranslations(locale: Locale, namespace: string): Record<string, unknown>
export function getTranslations(locale: Locale, namespace: string): Record<string, unknown> {
    const filePath = path.join(localesDir, locale, `${namespace}.json`)

    try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(raw)
    } catch {
        // Fallback: try the other locale
        const fallbackLocale: Locale = locale === 'fr' ? 'en' : 'fr'
        const fallbackPath = path.join(localesDir, fallbackLocale, `${namespace}.json`)

        try {
            const raw = fs.readFileSync(fallbackPath, 'utf-8')
            return JSON.parse(raw)
        } catch {
            return {}
        }
    }
}

/** Convenience: load common.json for a locale */
export function getCommonTranslations(locale: Locale): CommonTranslations {
    return getTranslations(locale, 'common')
}
