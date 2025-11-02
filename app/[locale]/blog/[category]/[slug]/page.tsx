import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticle } from '../../../../../lib/articles'

interface BlogPostProps {
  params: { 
    locale: string
    category: string
    slug: string 
  }
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { locale, category, slug } = params
  const article = getArticle(category, slug, locale)
  
  if (!article) return { title: 'Article not found' }
  
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/blog/${category}/${slug}`
  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: url,
      languages: {
        fr: `${domain}/fr/blog/${category}/${slug}`,
        en: `${domain}/en/blog/${category}/${slug}`,
        'x-default': `${domain}/fr/blog/${category}/${slug}`,
      },
    },
  }
}

export default function BlogPost({ params }: BlogPostProps) {
  const { locale, category, slug } = params
  const article = getArticle(category, slug, locale)
  
  if (!article) notFound()
  
  return (
    <main className="py-20">
      <div className="container mx-auto px-4">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{article.title}</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ 
              __html: article.content
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
        </article>
      </div>
    </main>
  )
}