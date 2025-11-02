import { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/articles'

interface CategoryPageProps {
  params: { locale: string; category: string }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://omadigital.net'
  const url = `${domain}/${locale}/blog/${category}`
  const alternates = {
    canonical: url,
    languages: {
      fr: `${domain}/fr/blog/${category}`,
      en: `${domain}/en/blog/${category}`,
      'x-default': `${domain}/fr/blog/${category}`,
    },
  }
  return {
    title: locale === 'fr' ? `Blog - ${category}` : `Blog - ${category}`,
    description:
      locale === 'fr'
        ? "Articles de la catégorie du blog OMA Digital."
        : 'OMA Digital blog category articles.',
    alternates,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = params
  const articles = getAllArticles().filter(
    (a) => a.locale === locale && a.category === category
  )

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'fr' ? 'Catégorie' : 'Category'}: {category}
        </h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={`${article.category}-${article.slug}`} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>
              <Link
                className="text-blue-600 hover:text-blue-800"
                href={`/${locale}/blog/${article.category}/${article.slug}`}
              >
                {locale === 'fr' ? 'Lire la suite' : 'Read more'}
              </Link>
            </article>
          ))}
        </div>
        {articles.length === 0 && (
          <p className="text-gray-500">
            {locale === 'fr' ? 'Aucun article dans cette catégorie.' : 'No articles in this category.'}
          </p>
        )}
      </div>
    </main>
  )
}
