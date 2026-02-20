/**
 * Centralized Content Service
 * 
 * Provides typed access to localized content from JSON translation files.
 * Acts as the single source of truth for all content loading,
 * decoupling components from the file system.
 */

import fs from 'fs'
import path from 'path'

const HOMEPAGE_SERVICE_IDS = [
    'site-vitrine',
    'app-mobile-standard',
    'automatisation-ia',
    'creation-video',
]

// ─── Types ───────────────────────────────────────────────────────────────

export interface ServiceSlide {
    title: string
    description: string
    image_path: string
}

export type VideoSlide = string | { webm?: string; mp4?: string; poster?: string }

export interface HeroData {
    title: string
    subtitle: string
    description: string
    cta_primary: string
    cta_secondary: string
    services_slider: ServiceSlide[]
    video_slider: VideoSlide[]
}

export interface FeaturedService {
    id: string
    title: string
    description: string
    price: string
    icon: string
    includes: string[]
    stack: string[]
}

export interface BlogArticlePreview {
    id: string
    slug: string
    categorySlug: string
    title: string
    excerpt: string
    readTime: string
    publishedAt: string
    category: string
    icon: string
}

export interface AgencyLocation {
    title: string
    description: string
    services: string[]
    contactLabel: string
    contactValue: string
    locationLabel: string
    locationValue: string
}

export interface AgencyWhyUs {
    title: string
    items: Array<{
        icon: string
        title: string
        description: string
    }>
}

export interface AgencyData {
    sectionTitle: string
    sectionDescription: string
    morocco: AgencyLocation
    international: AgencyLocation
    whyUs: AgencyWhyUs
}

export interface ServicesUIData {
    featured_title: string
    featured_description: string
    learn_more: string
    view_all: string
    view_details: string
    order: string
}

// ─── Cache ───────────────────────────────────────────────────────────────

const contentCache = new Map<string, { data: Record<string, unknown>; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute in development, effectively permanent in production

// ─── Core Loader ─────────────────────────────────────────────────────────

/**
 * Loads and caches a JSON locale file.
 * Uses in-memory caching to avoid repeated file system reads.
 */
function loadLocaleFile(locale: string, filename: string = 'common.json'): Record<string, unknown> {
    const cacheKey = `${locale}:${filename}`
    const cached = contentCache.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data
    }

    try {
        const filePath = path.join(process.cwd(), 'public', 'locales', locale, filename)
        let fileContent = fs.readFileSync(filePath, 'utf8')
        // Strip BOM (Byte Order Mark) that Windows editors may add
        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1)
        }
        const data = JSON.parse(fileContent) as Record<string, unknown>

        contentCache.set(cacheKey, { data, timestamp: Date.now() })
        return data
    } catch (error) {
        console.error(`Error loading locale file ${locale}/${filename}:`, error)
        return {}
    }
}

/**
 * Gets a nested value from the locale data using dot notation.
 * Example: getTranslation('fr', 'hero.title')
 */
export function getTranslation(locale: string, key: string): unknown {
    const data = loadLocaleFile(locale)
    return key.split('.').reduce<unknown>((obj, k) => {
        if (obj && typeof obj === 'object' && k in (obj as Record<string, unknown>)) {
            return (obj as Record<string, unknown>)[k]
        }
        return undefined
    }, data)
}

// ─── Domain-Specific Getters ─────────────────────────────────────────────

/**
 * Returns Hero section data for the given locale.
 */
export function getHeroData(locale: string): HeroData {
    const data = loadLocaleFile(locale)
    const hero = (data.hero || {}) as Record<string, unknown>

    const defaultData: HeroData = {
        title: locale === 'fr' ? 'Transformez Votre' : 'Transform Your',
        subtitle: locale === 'fr' ? 'Présence Digitale' : 'Digital Presence',
        description: locale === 'fr'
            ? 'Agence digitale experte au Maroc & Sénégal.'
            : 'Expert digital agency in Morocco & Senegal.',
        cta_primary: locale === 'fr' ? 'Démarrer un Projet' : 'Start a Project',
        cta_secondary: locale === 'fr' ? 'Nos Services' : 'Our Services',
        services_slider: [
            {
                title: locale === 'fr' ? 'Développement Web' : 'Web Development',
                description: locale === 'fr' ? 'Sites web modernes et performants' : 'Modern and high-performance websites',
                image_path: '/images/logo.webp'
            }
        ],
        video_slider: ['/videos/hero1.webm', '/videos/hero2.webm', '/videos/hero3.webm']
    }

    return {
        title: (hero.title as string) || defaultData.title,
        subtitle: (hero.subtitle as string) || defaultData.subtitle,
        description: (hero.description as string) || defaultData.description,
        cta_primary: (hero.cta_primary as string) || defaultData.cta_primary,
        cta_secondary: (hero.cta_secondary as string) || defaultData.cta_secondary,
        services_slider: (hero.services_slider as ServiceSlide[]) || defaultData.services_slider,
        video_slider: (hero.video_slider as VideoSlide[]) || defaultData.video_slider,
    }
}

/**
 * Returns featured services data for the homepage.
 * Maps from the full services array in common.json to a simplified preview format.
 */
export function getServicesData(locale: string): { services: FeaturedService[]; featuredServices: FeaturedService[]; ui: ServicesUIData } {
    const data = loadLocaleFile(locale)
    const services = (data.services || []) as Array<Record<string, unknown>>
    const servicesUI = (data.services_ui || {}) as Record<string, unknown>

    const iconMap: Record<string, string> = {
        'site-vitrine': '🌐',
        'ecommerce-essentiel': '🛍️',
        'app-mobile-mvp': '📱',
        'app-mobile-standard': '📲',
        'chatbot-ia': '🤖',
        'bot-simple': '💬',
        'automatisation-ia': '⚙️',
        'marketing-digital': '📈',
        'creation-video': '🎬',
    }

    const allServices: FeaturedService[] = services.map((s) => {
        let title = (s.title as string) || ''
        // Remove emoji prefix (e.g., "📊 Pack Essentiel" → "Pack Essentiel")
        // Emojis are multi-byte, so we use a Unicode-aware approach
        const emojiPrefixMatch = title.match(/^\p{Emoji_Presentation}\s*/u)
        if (emojiPrefixMatch) {
            title = title.slice(emojiPrefixMatch[0].length)
        }
        return {
            id: s.id as string,
            title,
            description: s.description as string,
            price: s.price as string,
            icon: iconMap[(s.id as string)] || '📦',
            includes: (s.includes as string[]) || [],
            stack: (s.stack as string[]) || [],
        }
    })

    // Filter for homepage
    const featuredServices = allServices.filter(s => HOMEPAGE_SERVICE_IDS.includes(s.id))

    return {
        services: allServices,
        featuredServices,
        ui: {
            featured_title: (servicesUI.featured_title as string) || (locale === 'fr' ? 'Nos Services Phares' : 'Our Featured Services'),
            featured_description: (servicesUI.featured_description as string) || '',
            learn_more: (servicesUI.learn_more as string) || (locale === 'fr' ? 'En savoir plus' : 'Learn More'),
            view_all: (servicesUI.view_all as string) || (locale === 'fr' ? 'Voir tous nos services' : 'View All Services'),
            view_details: (servicesUI.view_details as string) || (locale === 'fr' ? 'Voir les détails' : 'View Details'),
            order: (servicesUI.order as string) || (locale === 'fr' ? 'Commander' : 'Order Now'),
        },
    }
}

/**
 * Returns blog article previews for the homepage.
 */
export function getBlogData(locale: string): BlogArticlePreview[] {
    const data = loadLocaleFile(locale)

    // The blog overview on the homepage uses hardcoded service-articles, not blog posts.
    // These are static promotional articles tied to services.
    const promotionalArticles: BlogArticlePreview[] = [
        {
            id: 'site-vitrine-moderne',
            slug: 'site-vitrine-moderne',
            categorySlug: 'developpement-web',
            title: locale === 'fr' ? 'Site Vitrine Moderne : La Vitrine Digitale de Votre Entreprise' : 'Modern Showcase Website: Your Professional Digital Presence',
            excerpt: locale === 'fr'
                ? 'Découvrez comment un site vitrine moderne peut transformer votre présence digitale et générer plus de clients pour seulement 5 000 DH.'
                : 'Discover how a modern showcase website can transform your digital presence and generate more clients for only 5,000 DH.',
            readTime: '12 min',
            publishedAt: '2025-01-05',
            category: locale === 'fr' ? 'Développement Web' : 'Web Development',
            icon: '🌐'
        },
        {
            id: 'chatbot-ia-personnalise',
            slug: 'chatbot-ia-personnalise',
            categorySlug: 'intelligence-artificielle',
            title: locale === 'fr' ? 'Chatbot IA Personnalisé (RAG) : Intelligence Avancée' : 'Custom AI Chatbot (RAG): Advanced Intelligence',
            excerpt: locale === 'fr'
                ? 'Chatbot intelligent avec IA et base de connaissances utilisant Gemini AI, RAG, Vector DB, Next.js pour 10 000 DH + 500 DH/mois.'
                : 'Intelligent chatbot with AI and knowledge base using Gemini AI, RAG, Vector DB, Next.js for 10,000 DH + 500 DH/month.',
            readTime: '10 min',
            publishedAt: '2025-01-10',
            category: locale === 'fr' ? 'Intelligence Artificielle' : 'Artificial Intelligence',
            icon: '🤖'
        },
        {
            id: 'bot-simple-whatsapp',
            slug: 'bot-simple-whatsapp',
            categorySlug: 'intelligence-artificielle',
            title: locale === 'fr' ? 'Bot Simple WhatsApp/Telegram : Réponses Automatisées' : 'Simple WhatsApp/Telegram Bot: Automated Responses',
            excerpt: locale === 'fr'
                ? 'Bot WhatsApp/Telegram simple avec réponses automatisées et menu interactif pour 2 000 DH + 200 DH/mois.'
                : 'Simple WhatsApp/Telegram bot with automated responses and interactive menu for 2,000 DH + 200 DH/month.',
            readTime: '8 min',
            publishedAt: '2025-01-15',
            category: locale === 'fr' ? 'WhatsApp Business' : 'WhatsApp Business',
            icon: '💬'
        }
    ]

    return promotionalArticles
}

/**
 * Returns agency info data for the homepage.
 */
export function getAgencyData(locale: string): AgencyData {
    const data = loadLocaleFile(locale)
    const seo = (data.local_seo || {}) as Record<string, unknown>

    return {
        sectionTitle: locale === 'fr' ? 'Agence Digitale Internationale' : 'International Digital Agency',
        sectionDescription: locale === 'fr'
            ? 'Basée à Casablanca, OMA Digital accompagne les entreprises dans le monde entier dans leur transformation digitale avec des solutions sur mesure.'
            : 'Based in Casablanca, OMA Digital supports companies worldwide in their digital transformation with customized solutions.',
        morocco: {
            title: locale === 'fr' ? 'Maroc - Siège Principal' : 'Morocco - Headquarters',
            description: locale === 'fr'
                ? 'Notre siège principal à Casablanca dessert l\'ensemble du territoire marocain : Rabat, Marrakech, Fès, Tanger, Agadir et au-delà.'
                : 'Our main headquarters in Casablanca serves the entire Moroccan territory: Rabat, Marrakech, Fès, Tangier, Agadir and beyond.',
            services: [
                (seo.website_creation_casablanca as string) || (locale === 'fr' ? 'Création de site web à Casablanca' : 'Website creation in Casablanca'),
                (seo.ecommerce_dev as string) || (locale === 'fr' ? 'Développement de boutiques e-commerce (Next.js)' : 'E-commerce development (Next.js)'),
                (seo.ai_chatbots as string) || (locale === 'fr' ? 'Chatbots IA et automatisation marketing' : 'AI chatbots and marketing automation'),
                (seo.mobile_apps as string) || (locale === 'fr' ? 'Applications mobiles sur mesure' : 'Custom mobile applications'),
                (seo.seo as string) || (locale === 'fr' ? 'Référencement SEO et positionnement Google' : 'SEO and Google positioning'),
            ],
            contactLabel: '📞',
            contactValue: '+212 701 193 811',
            locationLabel: '📍',
            locationValue: locale === 'fr' ? 'Moustakbal / Sidi Maarouf, Casablanca – Maroc' : 'Moustakbal / Sidi Maarouf, Casablanca - Morocco',
        },
        international: {
            title: locale === 'fr' ? 'Présence Internationale' : 'International Presence',
            description: locale === 'fr'
                ? 'Depuis notre siège à Casablanca, OMA Digital dessert une clientèle internationale : Afrique, Europe, Moyen-Orient, Amérique du Nord et au-delà.'
                : 'From our headquarters in Casablanca, OMA Digital serves an international clientele: Africa, Europe, Middle East, North America and beyond.',
            services: [
                locale === 'fr' ? 'Développement web et applications sur mesure' : 'Custom web and application development',
                locale === 'fr' ? 'Solutions e-commerce multi-devises' : 'Multi-currency e-commerce solutions',
                locale === 'fr' ? 'Automatisation IA et workflows intelligents' : 'AI automation and intelligent workflows',
                locale === 'fr' ? 'Applications mobiles multi-plateformes' : 'Cross-platform mobile applications',
                locale === 'fr' ? 'Marketing digital international et SEO global' : 'International digital marketing and global SEO',
            ],
            contactLabel: '📞',
            contactValue: '+212 701 193 811 (WhatsApp/International)',
            locationLabel: '🌐',
            locationValue: (seo.remote_services as string) || (locale === 'fr'
                ? 'Services 100 % à distance pour tous les pays, tous les fuseaux horaires.'
                : '100% remote services for all countries, all time zones.'),
        },
        whyUs: {
            title: locale === 'fr'
                ? 'Pourquoi choisir OMA Digital pour vos projets internationaux ?'
                : 'Why choose OMA Digital for your international projects?',
            items: [
                {
                    icon: '🏆',
                    title: (seo.local_expertise as string) || (locale === 'fr' ? 'Expertise Internationale' : 'International Expertise'),
                    description: (seo.local_expertise_desc as string) || (locale === 'fr'
                        ? 'Connaissance approfondie des marchés mondiaux et des meilleures pratiques digitales'
                        : 'Deep knowledge of global markets and digital best practices'),
                },
                {
                    icon: '💰',
                    title: (seo.competitive_prices as string) || (locale === 'fr' ? 'Tarifs Compétitifs Mondiaux' : 'Competitive Global Rates'),
                    description: (seo.competitive_prices_desc as string) || (locale === 'fr'
                        ? 'Tarifs adaptés aux budgets internationaux sans compromettre la qualité'
                        : 'Rates adapted to international budgets without compromising quality'),
                },
                {
                    icon: '🚀',
                    title: (seo.continuous_support as string) || (locale === 'fr' ? 'Support 24/7 Multilingue' : '24/7 Multilingual Support'),
                    description: (seo.continuous_support_desc as string) || (locale === 'fr'
                        ? 'Accompagnement personnalisé en français, anglais et arabe, adapté à vos fuseaux horaires'
                        : 'Personalized support in French, English and Arabic, adapted to your time zones'),
                },
            ],
        },
    }
}

/**
 * Clears the content cache. Useful for testing.
 */
export function clearContentCache(): void {
    contentCache.clear()
}
