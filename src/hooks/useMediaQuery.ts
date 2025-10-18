/**
 * Hook pour détecter les media queries
 * Utilisé pour adapter l'UI mobile/desktop
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Mettre à jour l'état initial
    setMatches(media.matches);

    // Créer un listener pour les changements
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Ajouter le listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback pour les anciens navigateurs
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Hooks pré-configurés pour les breakpoints courants
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}
