# 🚀 Guide d'Optimisation des Performances - OMA Digital

## 📊 Problèmes Identifiés (Lighthouse)

### Performance Actuelle
- **Performance Score**: 10/100
- **FCP (First Contentful Paint)**: 1.0s ✅
- **LCP (Largest Contentful Paint)**: 31.8s ❌ (Cible: <2.5s)
- **TBT (Total Blocking Time)**: 10,370ms ❌ (Cible: <200ms)
- **CLS (Cumulative Layout Shift)**: 0 ✅
- **Speed Index**: 14.2s ❌ (Cible: <3.4s)

### Problèmes Majeurs
1. **JavaScript énorme**: 14.3s d'exécution
2. **Bundles trop gros**: 4,273 KiB de payload réseau
3. **Lucide-react**: Trop d'icônes importées (422 KiB non utilisés)
4. **Google Tag Manager**: 141 KiB bloquant le rendu
5. **Framer Motion**: 328 KiB (animations lourdes)
6. **React-DOM Development**: 604 KiB (mode dev au lieu de prod)

## ✅ Optimisations Déjà Implémentées

### 1. SEO Amélioré ✅
- ✅ Ajout de `<title>` et `<meta description>` sur `/about`
- ✅ Meta tags Open Graph et Twitter Card
- ✅ Canonical URLs
- ✅ Mots-clés optimisés pour Sénégal et Maroc
- ✅ Geo-tags pour Dakar, Thies, Casablanca, Rabat, Marrakech
- ✅ Contact info mis à jour (+212701193811)

### 2. Fichiers d'Optimisation Créés ✅
- ✅ `src/lib/icons.ts` - Exports optimisés de lucide-react
- ✅ `src/components/OptimizedGTM.tsx` - GTM chargé en async
- ✅ Configuration SEO complète dans `src/lib/seo-config.ts`

## 🔧 Actions à Effectuer Maintenant

### ÉTAPE 1: Build en Mode Production
```bash
# Assurez-vous de builder en mode production
npm run build
npm start

# Vérifiez que NODE_ENV=production
```

### ÉTAPE 2: Optimiser les Imports de Lucide-React
Remplacer tous les imports directs par le fichier centralisé:

**❌ Avant:**
```typescript
import { Menu, X, Phone } from 'lucide-react';
```

**✅ Après:**
```typescript
import { Menu, X, Phone } from '../lib/icons';
```

**Fichiers à modifier:**
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/HeroSection.tsx`
- `src/components/ServicesSection.tsx`
- `src/components/TestimonialsSection.tsx`
- Tous les composants dans `src/components/SmartChatbot/`

### ÉTAPE 3: Lazy Loading des Composants Lourds

**Modifier `pages/index.tsx`:**
```typescript
import dynamic from 'next/dynamic';

// Lazy load des sections non critiques
const TestimonialsSection = dynamic(() => import('../src/components/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
  ssr: false
});

const ProcessTimeline = dynamic(() => import('../src/components/ProcessTimeline').then(mod => ({ default: mod.ProcessTimeline })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
  ssr: false
});

const SmartChatbot = dynamic(() => import('../src/components/SmartChatbot'), {
  loading: () => null,
  ssr: false
});
```

### ÉTAPE 4: Optimiser Framer Motion

**Créer `src/lib/motion.ts`:**
```typescript
// Import uniquement les fonctions nécessaires
export { motion } from 'framer-motion';
export { useInView } from 'framer-motion';
export { AnimatePresence } from 'framer-motion';
```

**Remplacer:**
```typescript
// ❌ Avant
import { motion, useInView, AnimatePresence } from 'framer-motion';

// ✅ Après
import { motion, useInView, AnimatePresence } from '../lib/motion';
```

### ÉTAPE 5: Code Splitting Avancé

**Modifier `next.config.js`:**
```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // Séparer les vendors lourds
        framerMotion: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'framer-motion',
          priority: 30,
          reuseExistingChunk: true,
        },
        lucideReact: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide-react',
          priority: 25,
          reuseExistingChunk: true,
        },
        supabase: {
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          name: 'supabase',
          priority: 20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          maxSize: 200000, // 200KB max
        },
      },
    };
  }
  return config;
},
```

### ÉTAPE 6: Précharger les Ressources Critiques

**Ajouter dans `pages/_document.tsx`:**
```typescript
<Head>
  {/* Précharger les polices */}
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  
  {/* Précharger le logo */}
  <link rel="preload" href="/images/logo.webp" as="image" />
  
  {/* DNS Prefetch */}
  <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  <link rel="dns-prefetch" href="//www.googletagmanager.com" />
</Head>
```

### ÉTAPE 7: Optimiser les Images

**Utiliser next/image partout:**
```typescript
// ❌ Éviter
<img src="/images/hero.jpg" alt="Hero" />

// ✅ Utiliser
import Image from 'next/image';
<Image 
  src="/images/hero.jpg" 
  alt="Hero"
  width={1200}
  height={600}
  priority // Pour les images above-the-fold
  quality={85}
  placeholder="blur"
/>
```

### ÉTAPE 8: Supprimer le Code Inutilisé

**Analyser le bundle:**
```bash
ANALYZE=true npm run build
```

**Supprimer:**
- Composants de test non utilisés
- Imports inutilisés
- Code mort (dead code)

### ÉTAPE 9: Configurer la Compression

**Ajouter dans `next.config.js`:**
```javascript
compress: true,
productionBrowserSourceMaps: false, // Désactiver les source maps en prod
```

### ÉTAPE 10: Cache HTTP Agressif

**Headers déjà configurés dans `next.config.js` ✅**
- Static assets: 1 an de cache
- Images: Cache immutable
- API: No-cache

## 📈 Résultats Attendus

Après ces optimisations:
- **Performance Score**: 90+ (actuellement 10)
- **LCP**: <2.5s (actuellement 31.8s)
- **TBT**: <200ms (actuellement 10,370ms)
- **Bundle Size**: -60% (de 4.3MB à ~1.7MB)
- **JavaScript Execution**: -70% (de 14.3s à ~4s)

## 🎯 Priorités Immédiates

1. **URGENT**: Build en mode production
2. **URGENT**: Remplacer imports lucide-react
3. **IMPORTANT**: Lazy loading des sections
4. **IMPORTANT**: Optimiser Framer Motion
5. **MOYEN**: Code splitting avancé

## 📝 Checklist de Déploiement

- [ ] Build en mode production
- [ ] Vérifier que `NODE_ENV=production`
- [ ] Tester sur Lighthouse après déploiement
- [ ] Vérifier que GTM se charge en async
- [ ] Valider les Core Web Vitals
- [ ] Tester sur mobile (3G/4G)

## 🔗 Ressources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Créé le**: 13 Octobre 2025  
**Dernière mise à jour**: 13 Octobre 2025  
**Auteur**: OMA Digital Team
