import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticle, getAllArticles } from '../../../../../lib/articles'
import ReactMarkdown from 'react-markdown'

interface BlogPostProps {
  params: Promise<{
    locale: string
    category: string
    slug: string
  }>
}

// Pre-generate all blog article pages at build time for better SEO indexation
export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map((article) => ({
    locale: article.locale,
    category: article.category,
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { locale, category, slug } = await params
  const article = getArticle(category, slug, locale)

  if (!article) return { title: 'Article not found' }

  const baseUrl = 'https://www.omadigital.net'
  const url = `${baseUrl}/${locale}/blog/${category}/${slug}`
  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: url,
      languages: {
        fr: `${baseUrl}/fr/blog/${category}/${slug}`,
        en: `${baseUrl}/en/blog/${category}/${slug}`,
        'x-default': `${baseUrl}/fr/blog/${category}/${slug}`,
      },
    },
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { locale, category, slug } = await params
  const article = getArticle(category, slug, locale)

  if (!article) notFound()

  return (
    <main className="py-20">
      <div className="container mx-auto px-4">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{article.title}</h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown
              components={{
                h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
                h2: (props) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-900" {...props} />,
                h3: (props) => <h3 className="text-xl font-medium mt-4 mb-2 text-gray-900" {...props} />,
                strong: (props) => <strong className="font-semibold text-blue-600" {...props} />,
                li: (props) => <li className="mb-1 ml-6" {...props} />,
                p: (props) => <p className="mb-4" {...props} />,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  )
}