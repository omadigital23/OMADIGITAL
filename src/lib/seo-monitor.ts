// SEO Monitoring and Optimization utilities for OMA Digital

export interface SEOMetrics {
  title: string;
  description: string;
  keywords: string[];
  headings: { [key: string]: string[] };
  images: { src: string; alt: string; hasAlt: boolean }[];
  links: { href: string; text: string; isInternal: boolean }[];
  performance: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  accessibility: {
    score: number;
    issues: string[];
  };
  structuredData: object[];
}

// Analyze current page SEO
export function analyzeSEO(): SEOMetrics {
  const metrics: SEOMetrics = {
    title: document.title || '',
    description: getMetaContent('description') || '',
    keywords: getMetaContent('keywords')?.split(',').map(k => k.trim()) || [],
    headings: getHeadings(),
    images: getImages(),
    links: getLinks(),
    performance: {
      lcp: 0,
      fid: 0, 
      cls: 0,
      fcp: 0,
      ttfb: 0
    },
    accessibility: {
      score: 0,
      issues: []
    },
    structuredData: getStructuredData()
  };

  return metrics;
}

// Get meta tag content
function getMetaContent(name: string): string | null {
  const meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  return meta?.content || null;
}

// Analyze heading structure
function getHeadings(): { [key: string]: string[] } {
  const headings: { [key: string]: string[] } = {};
  
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    const elements = document.querySelectorAll(tag);
    headings[tag] = Array.from(elements).map(el => el.textContent || '');
  });
  
  return headings;
}

// Analyze images for SEO
function getImages(): { src: string; alt: string; hasAlt: boolean }[] {
  const images = document.querySelectorAll('img');
  
  return Array.from(images).map(img => ({
    src: img.src,
    alt: img.alt || '',
    hasAlt: !!img.alt
  }));
}

// Analyze internal and external links
function getLinks(): { href: string; text: string; isInternal: boolean }[] {
  const links = document.querySelectorAll('a[href]');
  
  return Array.from(links).map(link => {
    const href = link.getAttribute('href') || '';
    const isInternal = href.startsWith('/') || href.includes(window.location.hostname);
    
    return {
      href,
      text: link.textContent?.trim() || '',
      isInternal
    };
  });
}

// Extract structured data
function getStructuredData(): object[] {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const structuredData: object[] = [];
  
  scripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '');
      structuredData.push(data);
    } catch (error) {
      console.warn('Invalid structured data:', error);
    }
  });
  
  return structuredData;
}

// SEO recommendations engine
export function getSEORecommendations(metrics: SEOMetrics): string[] {
  const recommendations: string[] = [];
  
  // Title optimization
  if (!metrics.title) {
    recommendations.push('❌ Titre manquant - Ajoutez un titre unique et descriptif');
  } else if (metrics.title.length < 30 || metrics.title.length > 60) {
    recommendations.push(`⚠️ Titre (${metrics.title.length} car.) - Optimal: 30-60 caractères`);
  }
  
  // Meta description
  if (!metrics.description) {
    recommendations.push('❌ Meta description manquante');
  } else if (metrics.description.length < 120 || metrics.description.length > 160) {
    recommendations.push(`⚠️ Meta description (${metrics.description.length} car.) - Optimal: 120-160 caractères`);
  }
  
  // H1 optimization
  const h1Count = metrics.headings.h1?.length || 0;
  if (h1Count === 0) {
    recommendations.push('❌ Aucun H1 trouvé - Ajoutez un titre principal');
  } else if (h1Count > 1) {
    recommendations.push('⚠️ Plusieurs H1 détectés - Utilisez un seul H1 par page');
  }
  
  // Images without alt text
  const imagesWithoutAlt = metrics.images.filter(img => !img.hasAlt);
  if (imagesWithoutAlt.length > 0) {
    recommendations.push(`⚠️ ${imagesWithoutAlt.length} image(s) sans attribut alt`);
  }
  
  // Internal linking
  const internalLinks = metrics.links.filter(link => link.isInternal);
  if (internalLinks.length < 3) {
    recommendations.push('⚠️ Peu de liens internes - Améliorez le maillage interne');
  }
  
  // Structured data
  if (metrics.structuredData.length === 0) {
    recommendations.push('⚠️ Aucune donnée structurée - Ajoutez Schema.org');
  }
  
  // Performance recommendations
  if (metrics.performance['lcp'] > 2500) {
    recommendations.push('❌ LCP lent - Optimisez le chargement des images principales');
  }
  
  if (metrics.performance['cls'] > 0.1) {
    recommendations.push('❌ CLS élevé - Stabilisez la mise en page');
  }
  
  return recommendations;
}

// Local SEO optimization checker
export function checkLocalSEO(): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  // Check for local business info
  const hasPhone = document.body.textContent?.includes('+212701193811');
  const hasAddress = document.body.textContent?.includes('Dakar') || document.body.textContent?.includes('Sénégal');
  const hasEmail = document.body.textContent?.includes('omadigital23@gmail.com');
  
  if (!hasPhone) {
    issues.push('Numéro de téléphone local manquant');
    score -= 20;
  }
  
  if (!hasAddress) {
    issues.push('Adresse Dakar/Sénégal manquante');
    score -= 20;
  }
  
  if (!hasEmail) {
    issues.push('Email de contact manquant');
    score -= 10;
  }
  
  // Check for local keywords
  const content = document.body.textContent?.toLowerCase() || '';
  const localKeywords = ['dakar', 'sénégal', 'pme', 'senegal', 'liberté'];
  const foundKeywords = localKeywords.filter(keyword => content.includes(keyword));
  
  if (foundKeywords.length < 3) {
    issues.push('Peu de mots-clés locaux (Dakar, Sénégal, PME)');
    score -= 15;
  }
  
  // Check for Schema.org LocalBusiness
  const structuredData = getStructuredData();
  const hasLocalBusiness = structuredData.some(data => 
    (data as any)['@type'] === 'LocalBusiness' || (data as any)['@type'] === 'Organization'
  );
  
  if (!hasLocalBusiness) {
    issues.push('Schema LocalBusiness manquant');
    score -= 25;
  }
  
  return {
    score: Math.max(0, score),
    issues
  };
}

// Content quality analyzer
export function analyzeContentQuality(): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  const content = document.body.textContent || '';
  const wordCount = content.trim().split(/\s+/).length;
  
  // Word count analysis
  if (wordCount < 300) {
    issues.push('Contenu trop court - Minimum 300 mots recommandé');
    score -= 30;
  }
  
  // Keyword density analysis
  const targetKeywords = ['automatisation', 'ia', 'pme', 'dakar', 'whatsapp', 'chatbot'];
  const keywordDensity = targetKeywords.map(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex) || [];
    return {
      keyword,
      count: matches.length,
      density: (matches.length / wordCount) * 100
    };
  });
  
  // Check keyword density (should be 1-3%)
  keywordDensity.forEach(({ keyword, density }) => {
    if (density < 0.5) {
      issues.push(`Mot-clé "${keyword}" sous-utilisé (${density.toFixed(1)}%)`);
      score -= 10;
    } else if (density > 4) {
      issues.push(`Mot-clé "${keyword}" sur-optimisé (${density.toFixed(1)}%)`);
      score -= 15;
    }
  });
  
  // Reading level check
  const averageWordsPerSentence = wordCount / (content.split('.').length - 1);
  if (averageWordsPerSentence > 20) {
    issues.push('Phrases trop longues - Réduisez la complexité');
    score -= 10;
  }
  
  return {
    score: Math.max(0, score),
    issues
  };
}

// Technical SEO checker
export function checkTechnicalSEO(): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  // Check viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push('Meta viewport manquant');
    score -= 20;
  }
  
  // Check robots meta
  const robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    issues.push('Meta robots manquant');
    score -= 10;
  }
  
  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    issues.push('URL canonique manquante');
    score -= 15;
  }
  
  // Check Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  
  if (!ogTitle || !ogDescription || !ogImage) {
    issues.push('Tags Open Graph incomplets');
    score -= 15;
  }
  
  // Check Twitter Cards
  const twitterCard = document.querySelector('meta[name="twitter:card"]');
  if (!twitterCard) {
    issues.push('Twitter Cards manquantes');
    score -= 10;
  }
  
  // Check HTTPS
  if (window.location.protocol !== 'https:') {
    issues.push('Site non sécurisé (HTTP)');
    score -= 25;
  }
  
  return {
    score: Math.max(0, score),
    issues
  };
}

// Comprehensive SEO audit
export function performSEOAudit(): {
  overall: number;
  sections: {
    technical: { score: number; issues: string[] };
    content: { score: number; issues: string[] };
    local: { score: number; issues: string[] };
  };
  recommendations: string[];
} {
  const technical = checkTechnicalSEO();
  const content = analyzeContentQuality();
  const local = checkLocalSEO();
  const metrics = analyzeSEO();
  
  const overall = Math.round((technical.score + content.score + local.score) / 3);
  const recommendations = getSEORecommendations(metrics);
  
  return {
    overall,
    sections: {
      technical,
      content,
      local
    },
    recommendations
  };
}

// Real-time SEO monitoring
export function startSEOMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Monitor page changes
  const observer = new MutationObserver(() => {
    // Throttle audits to avoid performance issues
    clearTimeout((window as any).seoAuditTimer);
    (window as any).seoAuditTimer = setTimeout(() => {
      const audit = performSEOAudit();
      
      if (audit.overall < 80) {
        console.warn('SEO Score dropped:', audit);
      }
      
      // Store audit results
      sessionStorage.setItem('seo-audit', JSON.stringify(audit));
    }, 2000);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title', 'alt', 'href']
  });
  
  // Initial audit
  setTimeout(() => {
    const audit = performSEOAudit();
    console.log('SEO Audit:', audit);
    sessionStorage.setItem('seo-audit', JSON.stringify(audit));
  }, 1000);
}