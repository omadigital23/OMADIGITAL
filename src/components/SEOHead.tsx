import Head from 'next/head';
import { NextSeo, NextSeoProps } from 'next-seo';

interface SEOHeadProps extends NextSeoProps {
  structuredData?: object;
  breadcrumbs?: Array<{name: string, url: string}>;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}

export function SEOHead({ 
  title,
  description, 
  canonical,
  openGraph,
  twitter,
  structuredData,
  breadcrumbs,
  article,
  ...props 
}: SEOHeadProps) {
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={canonical}
        openGraph={{
          url: canonical,
          title,
          description,
          locale: 'fr_SN',
          site_name: 'OMA Digital',
          ...openGraph,
        }}
        twitter={{
          handle: '@OMADigitalSN',
          site: '@OMADigitalSN', 
          cardType: 'summary_large_image',
          ...twitter,
        }}
        additionalMetaTags={[
          {
            name: 'geo.region',
            content: 'SN-DK'
          },
          {
            name: 'geo.placename', 
            content: 'Dakar, Sénégal'
          },
          {
            name: 'robots',
            content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          },
          {
            name: 'googlebot',
            content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1'
          }
        ]}
        {...props}
      />
      
      <Head>
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
        )}
        
        {/* Breadcrumbs Schema */}
        {breadcrumbs && breadcrumbs.length > 1 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs.map((crumb, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "name": crumb.name,
                  "item": crumb.url
                }))
              })
            }}
          />
        )}
        
        {/* Article Schema */}
        {article && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": title,
                "description": description,
                "author": {
                  "@type": "Organization",
                  "name": article.authors?.[0] || "OMA Digital"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "OMA Digital",
                  "logo": {
                    "@type": "ImageObject", 
                    "url": "https://oma-digital.sn/images/logo.webp"
                  }
                },
                "datePublished": article.publishedTime,
                "dateModified": article.modifiedTime || article.publishedTime,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": canonical
                },
                "articleSection": article.section,
                "keywords": article.tags?.join(', '),
                "inLanguage": "fr-SN"
              })
            }}
          />
        )}
        
        {/* Critical CSS hint */}
        <link rel="preload" as="style" href="/styles/globals.css" />
        
        {/* Resource hints for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="preconnect" href="https://pcedyohixahtfogfdlig.supabase.co" />
        
        {/* Mobile viewport optimization */}
        <meta name="format-detection" content="telephone=yes, email=yes, address=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Local business markup */}
        <meta name="contact" content="omasenegal25@gmail.com" />
        <meta name="phone" content="+212701193811" />
        <meta name="address" content="Liberté 6 Extension, Dakar, Sénégal" />
      </Head>
    </>
  );
}