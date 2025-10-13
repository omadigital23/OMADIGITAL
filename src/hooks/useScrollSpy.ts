// Hook ScrollSpy optimisé avec Intersection Observer
import { useState, useEffect, useCallback } from 'react';

interface ScrollSpyOptions {
  threshold?: number;
  rootMargin?: string;
  debounceMs?: number;
}

export function useScrollSpy(sectionIds: string[], options: ScrollSpyOptions = {}) {
  const [activeSection, setActiveSection] = useState<string>('');
  const { 
    threshold = 0.5, // 50% de la section visible
    rootMargin = '0px 0px -40% 0px', // Optimisé pour une meilleure détection
    debounceMs = 100 
  } = options;

  // Debounce pour éviter les changements trop fréquents
  const [debouncedActiveSection, setDebouncedActiveSection] = useState<string>('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedActiveSection(activeSection);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [activeSection, debounceMs]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Trouver la section la plus visible
    let mostVisibleSection = '';
    let maxIntersectionRatio = 0;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = entry.intersectionRatio;
        mostVisibleSection = entry.target.id;
      }
    });

    if (mostVisibleSection) {
      setActiveSection(mostVisibleSection);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: [0, 0.25, 0.5, 0.75, 1.0] // Multiples seuils pour une détection précise
    });

    const elements: Element[] = [];

    // Observer toutes les sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        elements.push(element);
        observer.observe(element);
      }
    });

    // Initialiser avec la première section si aucune n'est active
    if (!activeSection && elements.length > 0) {
      setActiveSection(sectionIds[0]);
    }

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [sectionIds, rootMargin, handleIntersection, activeSection]);

  return debouncedActiveSection || activeSection;
}

// Hook optimisé pour la position de scroll avec throttling
export function useScrollPosition(throttleMs: number = 16) { // 60fps
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 50);
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollPosition(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, isScrolled, scrollDirection };
}

// Hook pour le smooth scroll vers une section
export function useSmoothScroll() {
  const scrollToSection = useCallback((sectionId: string, offset: number = 80) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return { scrollToSection };
}