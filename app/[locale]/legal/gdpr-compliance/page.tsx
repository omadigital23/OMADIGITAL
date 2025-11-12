import { Metadata } from 'next'
import { getLocalizedContent } from '../../../../lib/utils/content'

interface GDPRCompliancePageProps {
  params: { locale: string }
}

export async function generateMetadata({ params }: GDPRCompliancePageProps): Promise<Metadata> {
  const locale = params.locale
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/legal/gdpr-compliance`
  
  return {
    title: locale === 'fr' ? 'Conformité RGPD' : 'GDPR Compliance',
    description: locale === 'fr'
      ? 'Conformité RGPD d\'OMA Digital. Notre engagement pour la protection des données personnelles.'
      : 'OMA Digital GDPR compliance. Our commitment to personal data protection.',
    alternates: {
      canonical: url,
      languages: {
        fr: `${domain}/fr/legal/gdpr-compliance`,
        en: `${domain}/en/legal/gdpr-compliance`,
        'x-default': `${domain}/fr/legal/gdpr-compliance`,
      },
    },
  }
}

export default async function GDPRCompliancePage({ params }: GDPRCompliancePageProps) {
  let content
  try {
    const data = await import(`../../../../public/locales/${params.locale}/common.json`)
    content = data.default?.legal?.gdpr_compliance
  } catch (error) {
    content = null
  }

  if (!content) {
    return (
      <main className="min-h-screen py-8 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-xl font-medium text-gray-900">
            {params.locale === 'fr' ? 'Contenu non disponible' : 'Content not available'}
          </h1>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{content.title}</h1>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <div dangerouslySetInnerHTML={{ 
            __html: content.content
              .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
              .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-3 text-gray-900">$1</h2>')
              .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mt-4 mb-2 text-gray-900">$1</h3>')
              .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-blue-600">$1</strong>')
              .replace(/^- (.+)$/gm, '<li class="mb-1 list-disc ml-6">$1</li>')
              .split('\n\n')
              .map((paragraph: string) => {
                if (paragraph.startsWith('<h') || paragraph.startsWith('<li')) {
                  return paragraph;
                }
                return paragraph ? `<p class="mb-4">${paragraph}</p>` : '';
              })
              .join('')
          }} />
        </div>
      </div>
    </main>
  )
}