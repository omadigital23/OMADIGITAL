/**
 * Tests for lib/content.ts
 * 
 * Validates the content abstraction layer works correctly
 * for loading and returning typed locale data.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
    getHeroData,
    getServicesData,
    getBlogData,
    getAgencyData,
    getTranslation,
    clearContentCache,
} from './content'

beforeEach(() => {
    clearContentCache()
})

describe('getTranslation', () => {
    it('should return a top-level value for French locale', () => {
        const title = getTranslation('fr', 'hero.title')
        expect(title).toBeDefined()
        expect(typeof title).toBe('string')
    })

    it('should return undefined for a non-existent key', () => {
        const result = getTranslation('fr', 'nonexistent.key.path')
        expect(result).toBeUndefined()
    })

    it('should return the same value on subsequent calls (cache)', () => {
        const first = getTranslation('fr', 'hero.title')
        const second = getTranslation('fr', 'hero.title')
        expect(first).toEqual(second)
    })
})

describe('getHeroData', () => {
    it('should return hero data with required fields for French locale', () => {
        const data = getHeroData('fr')
        expect(data).toBeDefined()
        expect(data.title).toBeDefined()
        expect(data.subtitle).toBeDefined()
        expect(data.description).toBeDefined()
        expect(data.cta_primary).toBeDefined()
        expect(data.cta_secondary).toBeDefined()
        expect(data.services_slider).toBeDefined()
        expect(Array.isArray(data.services_slider)).toBe(true)
        expect(data.services_slider.length).toBeGreaterThan(0)
        expect(data.video_slider).toBeDefined()
        expect(Array.isArray(data.video_slider)).toBe(true)
    })

    it('should return hero data for English locale', () => {
        const data = getHeroData('en')
        expect(data).toBeDefined()
        expect(data.title).toBeDefined()
    })

    it('should return fallback data for an invalid locale', () => {
        const data = getHeroData('xx')
        expect(data).toBeDefined()
        // Should still return defaults
        expect(data.services_slider.length).toBeGreaterThan(0)
    })
})

describe('getServicesData', () => {
    it('should return services with UI labels for French locale', () => {
        const { services, ui } = getServicesData('fr')

        expect(services).toBeDefined()
        expect(Array.isArray(services)).toBe(true)
        expect(services.length).toBeGreaterThan(0)

        // Each service must have required fields
        for (const service of services) {
            expect(service.id).toBeDefined()
            expect(service.title).toBeDefined()
            expect(service.price).toBeDefined()
            expect(service.icon).toBeDefined()
        }

        // UI labels
        expect(ui.featured_title).toBeDefined()
        expect(ui.learn_more).toBeDefined()
        expect(ui.view_all).toBeDefined()
    })

    it('should strip emoji prefix from service titles', () => {
        const { services } = getServicesData('fr')
        for (const service of services) {
            // Titles should NOT start with an emoji
            expect(service.title).not.toMatch(/^[🌐🛍️📱📲🤖💬⚙️📈🎬]\s/)
        }
    })
})

describe('getBlogData', () => {
    it('should return blog article previews', () => {
        const articles = getBlogData('fr')
        expect(Array.isArray(articles)).toBe(true)
        expect(articles.length).toBe(3)

        for (const article of articles) {
            expect(article.id).toBeDefined()
            expect(article.slug).toBeDefined()
            expect(article.title).toBeDefined()
            expect(article.excerpt).toBeDefined()
            expect(article.categorySlug).toBeDefined()
        }
    })
})

describe('getAgencyData', () => {
    it('should return structured agency data for French locale', () => {
        const data = getAgencyData('fr')

        expect(data.sectionTitle).toBeDefined()
        expect(data.sectionDescription).toBeDefined()
        expect(data.morocco).toBeDefined()
        expect(data.morocco.title).toBeDefined()
        expect(data.morocco.services.length).toBeGreaterThan(0)
        expect(data.international).toBeDefined()
        expect(data.international.services.length).toBeGreaterThan(0)
        expect(data.whyUs).toBeDefined()
        expect(data.whyUs.items.length).toBe(3)
    })

    it('should return English data for en locale', () => {
        const data = getAgencyData('en')
        expect(data.sectionTitle).toContain('International')
    })
})
