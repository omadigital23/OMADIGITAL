import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { ChevronRight, Home } from 'lucide-react';
import { trackEvent } from '../utils/supabase/info';

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNavigation({ items, className = "" }: BreadcrumbNavigationProps) {
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    // Sanitize data before tracking
    const sanitizedName = DOMPurify.sanitize(item.name, { ALLOWED_TAGS: [] });
    const sanitizedUrl = DOMPurify.sanitize(item.url, { ALLOWED_TAGS: [] });
    
    trackEvent('breadcrumb_click', {
      breadcrumb_name: sanitizedName,
      breadcrumb_url: sanitizedUrl,
      breadcrumb_position: items.findIndex(i => i.url === item.url) + 1
    });
  };

  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label="Fil d'Ariane"
    >
      {/* Home icon always first */}
      <Link
        href="/"
        onClick={() => handleBreadcrumbClick({ name: 'Accueil', url: '/' })}
        className="flex items-center hover:text-orange-600 transition-colors"
        aria-label="Retour à l'accueil"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Accueil</span>
      </Link>

      {items.length > 0 && (
        <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
      )}

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.url} className="flex items-center">
            {item.current || isLast ? (
              <span 
                className="font-medium text-gray-900 truncate max-w-xs"
                aria-current="page"
              >
                {DOMPurify.sanitize(item.name, { ALLOWED_TAGS: [] })}
              </span>
            ) : (
              <Link
                href={DOMPurify.sanitize(item.url, { ALLOWED_TAGS: [] })}
                onClick={() => handleBreadcrumbClick(item)}
                className="hover:text-orange-600 transition-colors truncate max-w-xs"
              >
                {DOMPurify.sanitize(item.name, { ALLOWED_TAGS: [] })}
              </Link>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Helper function to generate common breadcrumbs
export function generateBreadcrumbs(currentPath: string, customTitle?: string): BreadcrumbItem[] {
  const pathSegments = currentPath.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Build breadcrumbs from path segments
  pathSegments.forEach((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/');
    let name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    // Custom names for specific routes
    const routeNames: Record<string, string> = {
      'blog': 'Blog IA',
      'services': 'Services',
      'about': 'À propos', 
      'contact': 'Contact',
      'admin': 'Administration',
      'case-studies': 'Études de cas'
    };
    
    if (routeNames[segment]) {
      name = routeNames[segment];
    }
    
    // Use custom title for last item if provided
    if (index === pathSegments.length - 1 && customTitle) {
      name = customTitle;
    }
    
    breadcrumbs.push({
      name,
      url,
      current: index === pathSegments.length - 1
    });
  });

  return breadcrumbs;
}