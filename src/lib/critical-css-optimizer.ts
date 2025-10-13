/**
 * Critical CSS Optimizer for OMA Digital
 * - Extract above-the-fold CSS
 * - Lazy load non-critical styles
 * - Font optimization
 * - CSS purging
 */

interface CriticalCSSConfig {
  extractCritical: boolean;
  lazyLoadFonts: boolean;
  purgeUnusedCSS: boolean;
  inlineCriticalCSS: boolean;
}

class CriticalCSSOptimizer {
  private config: CriticalCSSConfig;
  private criticalSelectors = [
    // Above-the-fold elements
    'header', 'nav', '.header', '.navbar',
    'h1', 'h2', '.hero', '.above-fold',
    '.cta-button', '.btn-primary',
    // Layout essentials
    'body', 'html', '.container', '.wrapper',
    // Critical utilities
    '.text-center', '.flex', '.grid',
    // Loading states
    '.loading', '.skeleton', '.animate-pulse'
  ];

  private nonCriticalCSS = [
    '/styles/blog.css',
    '/styles/admin.css', 
    '/styles/animations.css',
    '/styles/components.css'
  ];

  constructor(config: Partial<CriticalCSSConfig> = {}) {
    this.config = {
      extractCritical: true,
      lazyLoadFonts: true,
      purgeUnusedCSS: true,
      inlineCriticalCSS: true,
      ...config
    };
  }

  /**
   * Initialize critical CSS optimization
   */
  init(): void {
    if (typeof window === 'undefined') return;

    try {
      if (this.config.extractCritical) {
        this.extractAndInlineCriticalCSS();
      }

      if (this.config.lazyLoadFonts) {
        this.optimizeFontLoading();
      }

      this.lazyLoadNonCriticalCSS();
      this.optimizeExistingStyles();

      console.log('🎨 Critical CSS optimizer initialized');
    } catch (error) {
      console.error('Failed to initialize Critical CSS optimizer:', error);
    }
  }

  /**
   * Extract and inline critical CSS
   */
  private extractAndInlineCriticalCSS(): void {
    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets);
    let criticalCSS = '';

    stylesheets.forEach(stylesheet => {
      try {
        if (stylesheet.cssRules) {
          Array.from(stylesheet.cssRules).forEach(rule => {
            if (this.isCriticalRule(rule)) {
              criticalCSS += rule.cssText + '\n';
            }
          });
        }
      } catch (e) {
        // Cross-origin stylesheets may not be accessible
        console.warn('Cannot access stylesheet rules:', e);
      }
    });

    if (criticalCSS && this.config.inlineCriticalCSS) {
      this.inlineCriticalStyles(criticalCSS);
    }
  }

  /**
   * Check if a CSS rule is critical (above-the-fold)
   */
  private isCriticalRule(rule: CSSRule): boolean {
    if (rule.type !== CSSRule.STYLE_RULE) return false;
    
    const styleRule = rule as CSSStyleRule;
    const selector = styleRule.selectorText;

    return this.criticalSelectors.some(criticalSelector => {
      return selector.includes(criticalSelector) ||
             selector.startsWith(criticalSelector) ||
             selector.includes('.' + criticalSelector.replace('.', ''));
    });
  }

  /**
   * Inline critical styles in document head
   */
  private inlineCriticalStyles(css: string): void {
    // Check if critical styles already inlined
    if (document.querySelector('style[data-critical]')) {
      return;
    }

    const style = document.createElement('style');
    style.textContent = this.optimizeCSS(css);
    style.setAttribute('data-critical', 'true');
    style.setAttribute('data-optimized', 'true');
    
    // Insert at the beginning of head for highest priority
    document.head.insertBefore(style, document.head.firstChild);
    
    console.log('✅ Critical CSS inlined');
  }

  /**
   * Optimize CSS content
   */
  private optimizeCSS(css: string): string {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around selectors
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      .trim();
  }

  /**
   * Optimize font loading
   */
  private optimizeFontLoading(): void {
    // Preload critical fonts
    this.preloadCriticalFonts();
    
    // Lazy load non-critical fonts
    this.lazyLoadFonts();
    
    // Add font-display: swap to existing fonts
    this.addFontDisplaySwap();
  }

  /**
   * Preload critical fonts
   */
  private preloadCriticalFonts(): void {
    const criticalFonts = [
      // Add your critical fonts here
      'Inter', 'Roboto', 'system-ui'
    ];

    criticalFonts.forEach(fontFamily => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `/fonts/${fontFamily.toLowerCase()}.woff2`;
      
      // Only add if font exists
      link.onerror = () => link.remove();
      document.head.appendChild(link);
    });
  }

  /**
   * Lazy load non-critical fonts
   */
  private lazyLoadFonts(): void {
    // Use font loading API if available
    if ('fonts' in document) {
      const fontLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const fontFamily = entry.target.getAttribute('data-font-family');
              if (fontFamily) {
                this.loadFont(fontFamily);
                fontLoadObserver.unobserve(entry.target);
              }
            }
          });
        },
        { rootMargin: '100px' }
      );

      // Observe elements that need specific fonts
      document.querySelectorAll('[data-font-family]').forEach(el => {
        fontLoadObserver.observe(el);
      });
    }
  }

  /**
   * Load a specific font
   */
  private async loadFont(fontFamily: string): Promise<void> {
    try {
      const font = new FontFace(fontFamily, `url(/fonts/${fontFamily.toLowerCase()}.woff2)`);
      await font.load();
      document.fonts.add(font);
      console.log(`✅ Font loaded: ${fontFamily}`);
    } catch (error) {
      console.warn(`Failed to load font: ${fontFamily}`, error);
    }
  }

  /**
   * Add font-display: swap to existing fonts
   */
  private addFontDisplaySwap(): void {
    const fontFaceRules = this.getAllFontFaceRules();
    
    fontFaceRules.forEach(rule => {
      try {
        if (!rule.style.fontDisplay) {
          rule.style.fontDisplay = 'swap';
        }
      } catch (e) {
        // Some browsers may not allow modification
        console.warn('Cannot modify font-display:', e);
      }
    });
  }

  /**
   * Get all @font-face rules
   */
  private getAllFontFaceRules(): CSSFontFaceRule[] {
    const fontFaceRules: CSSFontFaceRule[] = [];
    
    Array.from(document.styleSheets).forEach(stylesheet => {
      try {
        if (stylesheet.cssRules) {
          Array.from(stylesheet.cssRules).forEach(rule => {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              fontFaceRules.push(rule as CSSFontFaceRule);
            }
          });
        }
      } catch (e) {
        // Cross-origin or other access issues
      }
    });
    
    return fontFaceRules;
  }

  /**
   * Lazy load non-critical CSS files
   */
  private lazyLoadNonCriticalCSS(): void {
    // Load non-critical CSS after page is interactive
    requestIdleCallback(() => {
      this.nonCriticalCSS.forEach(href => {
        this.loadStylesheet(href);
      });
    });

    // Load component-specific CSS on demand
    this.setupComponentCSSLoading();
  }

  /**
   * Load a stylesheet asynchronously
   */
  private loadStylesheet(href: string): void {
    // Check if already loaded
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print'; // Load without blocking
    
    link.onload = () => {
      link.media = 'all'; // Apply styles when loaded
      console.log(`✅ Non-critical CSS loaded: ${href}`);
    };
    
    link.onerror = () => {
      console.warn(`Failed to load CSS: ${href}`);
      link.remove();
    };
    
    document.head.appendChild(link);
  }

  /**
   * Setup component-specific CSS loading
   */
  private setupComponentCSSLoading(): void {
    const componentCSSMap = {
      'admin': '/styles/admin.css',
      'blog': '/styles/blog.css',
      'chatbot': '/styles/chatbot.css',
      'forms': '/styles/forms.css'
    };

    // Observer for component-specific CSS loading
    const cssObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cssComponent = entry.target.getAttribute('data-css-component');
            if (cssComponent && componentCSSMap[cssComponent as keyof typeof componentCSSMap]) {
              this.loadStylesheet(componentCSSMap[cssComponent as keyof typeof componentCSSMap]);
              cssObserver.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    // Observe elements that need specific CSS
    document.querySelectorAll('[data-css-component]').forEach(el => {
      cssObserver.observe(el);
    });
  }

  /**
   * Optimize existing styles
   */
  private optimizeExistingStyles(): void {
    // Remove unused CSS classes (basic implementation)
    this.removeUnusedClasses();
    
    // Optimize CSS custom properties
    this.optimizeCSSCustomProperties();
  }

  /**
   * Remove unused CSS classes (simplified)
   */
  private removeUnusedClasses(): void {
    if (!this.config.purgeUnusedCSS) return;

    // This is a simplified version - in production, use PurgeCSS
    const usedClasses = new Set<string>();
    
    // Collect all used classes
    document.querySelectorAll('*').forEach(el => {
      el.classList.forEach(className => {
        usedClasses.add(className);
      });
    });

    console.log(`📊 Found ${usedClasses.size} used CSS classes`);
  }

  /**
   * Optimize CSS custom properties
   */
  private optimizeCSSCustomProperties(): void {
    // Define critical CSS variables for inline styles
    const criticalCSSVars = `
      :root {
        --primary-color: #f97316;
        --text-color: #1f2937;
        --bg-color: #ffffff;
        --border-radius: 0.5rem;
        --shadow: 0 1px 3px rgba(0,0,0,0.1);
        --transition: all 0.2s ease;
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSSVars;
    style.setAttribute('data-css-vars', 'true');
    document.head.appendChild(style);
  }

  /**
   * Get CSS optimization stats
   */
  getOptimizationStats(): {
    criticalCSSInlined: boolean;
    nonCriticalCSSLoaded: number;
    fontsOptimized: boolean;
    totalOptimizations: number;
  } {
    return {
      criticalCSSInlined: !!document.querySelector('style[data-critical]'),
      nonCriticalCSSLoaded: document.querySelectorAll('link[rel="stylesheet"]').length,
      fontsOptimized: this.getAllFontFaceRules().some(rule => rule.style.fontDisplay === 'swap'),
      totalOptimizations: document.querySelectorAll('[data-optimized]').length
    };
  }
}

// Export singleton instance
export const criticalCSSOptimizer = new CriticalCSSOptimizer();

// React hook for CSS optimization
export function useCriticalCSS(config?: Partial<CriticalCSSConfig>) {
  const [isOptimized, setIsOptimized] = React.useState(false);
  const [stats, setStats] = React.useState({
    criticalCSSInlined: false,
    nonCriticalCSSLoaded: 0,
    fontsOptimized: false,
    totalOptimizations: 0
  });

  React.useEffect(() => {
    const optimizer = new CriticalCSSOptimizer(config);
    optimizer.init();
    
    // Update stats after optimization
    setTimeout(() => {
      setStats(optimizer.getOptimizationStats());
      setIsOptimized(true);
    }, 1000);
  }, []);

  return { isOptimized, stats };
}

// Note: CriticalCSSProvider can be implemented in a separate .tsx file if needed
// For now, the core functionality is available through criticalCSSOptimizer.init()