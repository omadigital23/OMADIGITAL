import React from 'react';
import SEOHelmet from './SEOHelmet';

interface BlogSEOProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  publishedTime?: string;
  tags?: string[];
  category?: string;
}

export function BlogSEO({
  title,
  description,
  image = "https://oma-digital.sn/images/blog-preview.webp",
  url,
  publishedTime,
  tags = [],
  category
}: BlogSEOProps) {
  // Enhanced blog schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image,
    "url": url,
    "datePublished": publishedTime || new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "OMA Digital",
      "url": "https://oma-digital.sn"
    },
    "publisher": {
      "@type": "Organization",
      "name": "OMA Digital",
      "logo": {
        "@type": "ImageObject",
        "url": "https://oma-digital.sn/images/logo.webp"
      }
    },
    "keywords": tags.join(', '),
    "articleSection": category
  };

  return (
    <SEOHelmet
      title={title}
      description={description}
      image={image}
      url={url}
      type="article"
      blogPostSchema={blogSchema}
    />
  );
}