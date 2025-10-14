# 📝 Blog & Pages Locales - Documentation

## 🎯 Vue d'ensemble

Ce document décrit les nouvelles fonctionnalités ajoutées au site OMA Digital :

1. **Blog multilingue** avec système i18n
2. **Pages locales par ville** (Dakar, Thiès, Casablanca, Rabat, Marrakech)
3. **Composant réseaux sociaux** réutilisable
4. **SEO optimisé** pour chaque page

---

## 📚 Blog Multilingue

### Structure

```
pages/
├── blog/
│   ├── index.tsx          # Liste des articles
│   └── [slug].tsx         # Page article individuelle

public/locales/
├── fr/
│   └── blog.json          # Traductions françaises
└── en/
    └── blog.json          # Traductions anglaises
```

### Fonctionnalités

- ✅ **5 articles de blog** pré-créés
- ✅ **Recherche en temps réel** par titre, extrait ou tags
- ✅ **Filtres par catégorie** (IA, WhatsApp, Web, Études de cas, Guides)
- ✅ **ISR (Incremental Static Regeneration)** pour performance optimale
- ✅ **SEO optimisé** avec structured data (BlogPosting schema)
- ✅ **Partage social** (Facebook, Twitter, LinkedIn, WhatsApp)
- ✅ **Temps de lecture** estimé
- ✅ **Tags** et catégories
- ✅ **Responsive** et accessible (WCAG 2.1 AA)

### Articles disponibles

1. **Comment automatiser WhatsApp Business au Sénégal** (8 min)
2. **Chatbot vocal multilingue** (10 min)
3. **Sites web ultra-rapides avec Next.js** (12 min)
4. **Vertex AI vs autres solutions IA** (15 min)
5. **ROI de l'automatisation pour PME africaines** (20 min)

### Ajouter un nouvel article

1. Ouvrez `public/locales/fr/blog.json`
2. Ajoutez votre article dans `articles`:

```json
{
  "articles": {
    "votre-slug-article": {
      "title": "Titre de votre article",
      "excerpt": "Résumé court",
      "category": "Intelligence Artificielle",
      "tags": ["Tag1", "Tag2"],
      "reading_time": 10,
      "author": "Équipe OMA Digital",
      "published_date": "2025-01-20",
      "updated_date": "2025-01-20",
      "content": {
        "intro": "Introduction...",
        "sections": [
          {
            "title": "Section 1",
            "content": "Contenu..."
          }
        ],
        "cta": "Call to action"
      }
    }
  }
}
```

3. Répétez pour `public/locales/en/blog.json`
4. Ajoutez l'URL dans `pages/sitemap.xml.tsx`

### URLs

- Liste des articles : `/blog` ou `/en/blog`
- Article individuel : `/blog/[slug]` ou `/en/blog/[slug]`

---

## 🌍 Pages Locales par Ville

### Structure

```
pages/
└── villes/
    └── [city].tsx         # Page dynamique pour chaque ville

public/locales/
├── fr/
│   └── cities.json        # Données des villes en français
└── en/
    └── cities.json        # Données des villes en anglais
```

### Villes disponibles

1. **Dakar** (Sénégal)
2. **Thiès** (Sénégal)
3. **Casablanca** (Maroc)
4. **Rabat** (Maroc)
5. **Marrakech** (Maroc)

### Fonctionnalités

- ✅ **SEO local optimisé** avec structured data (LocalBusiness schema)
- ✅ **Services adaptés** à chaque ville
- ✅ **Tarifs locaux** (FCFA pour Sénégal, MAD pour Maroc)
- ✅ **Témoignages clients** locaux
- ✅ **Statistiques** par ville
- ✅ **Coordonnées** et horaires
- ✅ **Géolocalisation** précise
- ✅ **ISR** pour performance

### Contenu par ville

Chaque page ville contient :

- Description de la ville
- 3 services principaux avec tarifs
- Témoignages clients locaux
- Statistiques (clients, projets, satisfaction, ROI)
- Coordonnées complètes
- CTA adaptés

### Ajouter une nouvelle ville

1. Ouvrez `public/locales/fr/cities.json`
2. Ajoutez votre ville dans `cities`:

```json
{
  "cities": {
    "nouvelle-ville": {
      "name": "Nouvelle Ville",
      "country": "Pays",
      "region": "Région",
      "description": "Description...",
      "services": [...],
      "testimonials": [...],
      "stats": {...},
      "contact": {...}
    }
  }
}
```

3. Répétez pour `public/locales/en/cities.json`
4. Ajoutez dans `getStaticPaths` de `pages/villes/[city].tsx`
5. Ajoutez l'URL dans `pages/sitemap.xml.tsx`

### URLs

- `/villes/dakar` ou `/en/villes/dakar`
- `/villes/thies` ou `/en/villes/thies`
- `/villes/casablanca` ou `/en/villes/casablanca`
- `/villes/rabat` ou `/en/villes/rabat`
- `/villes/marrakech` ou `/en/villes/marrakech`

---

## 📱 Composant Réseaux Sociaux

### Fichier

```
src/components/SocialMediaLinks.tsx
```

### Composants disponibles

#### 1. SocialMediaLinks

Affiche les liens vers les réseaux sociaux d'OMA Digital.

**Props:**
- `variant`: `'horizontal'` | `'vertical'` | `'grid'` (défaut: `'horizontal'`)
- `showLabels`: `boolean` (défaut: `false`)
- `className`: `string` (optionnel)
- `iconSize`: `'sm'` | `'md'` | `'lg'` (défaut: `'md'`)
- `theme`: `'light'` | `'dark'` | `'brand'` (défaut: `'light'`)

**Exemple:**

```tsx
import { SocialMediaLinks } from '@/components/SocialMediaLinks';

<SocialMediaLinks 
  variant="horizontal" 
  showLabels={true} 
  theme="brand"
/>
```

#### 2. SocialShareButtons

Boutons de partage pour un contenu spécifique.

**Props:**
- `url`: `string` (requis)
- `title`: `string` (requis)
- `description`: `string` (optionnel)
- `className`: `string` (optionnel)

**Exemple:**

```tsx
import { SocialShareButtons } from '@/components/SocialMediaLinks';

<SocialShareButtons 
  url="https://www.omadigital.net/blog/article"
  title="Titre de l'article"
  description="Description"
/>
```

### Réseaux sociaux configurés

- **Facebook**: https://web.facebook.com/profile.php?id=61579740432372
- **X (Twitter)**: https://x.com/omadigital23
- **Instagram**: https://www.instagram.com/omadigital123
- **TikTok**: https://www.tiktok.com/@omadigital23

### Sécurité

- ✅ Tous les liens externes utilisent `rel="noopener noreferrer"`
- ✅ URLs encodées correctement
- ✅ Pas de hardcoding d'informations sensibles
- ✅ Validation des URLs

---

## 🔧 Configuration i18n

### Namespaces ajoutés

```javascript
// next-i18next.config.js
ns: ['common', 'legal', 'about', 'blog', 'cities']
```

### Fichiers de traduction

```
public/locales/
├── fr/
│   ├── common.json
│   ├── legal.json
│   ├── about.json
│   ├── blog.json      ← Nouveau
│   └── cities.json    ← Nouveau
└── en/
    ├── common.json
    ├── legal.json
    ├── about.json
    ├── blog.json      ← Nouveau
    └── cities.json    ← Nouveau
```

---

## 🎨 Types TypeScript

### Fichier

```
src/types/blog.ts
```

### Types disponibles

- `BlogCategory`: Catégories d'articles
- `BlogSection`: Section de contenu
- `BlogContent`: Structure du contenu
- `BlogArticle`: Article complet
- `BlogArticles`: Collection d'articles
- `BlogTranslations`: Structure des traductions
- `BlogFilter`: Filtres disponibles
- `SocialPlatform`: Plateformes sociales
- `SocialLink`: Lien social

---

## 🧪 Tests

### Fichier de tests

```
src/components/__tests__/SocialMediaLinks.test.tsx
```

### Tests couverts

- ✅ Rendu des composants
- ✅ Accessibilité (ARIA labels, navigation)
- ✅ Sécurité (noopener, noreferrer)
- ✅ URLs correctes
- ✅ Encodage des paramètres
- ✅ Variantes de rendu

### Lancer les tests

```bash
npm test
# ou
npm run test:watch
```

---

## 🚀 Performance

### ISR (Incremental Static Regeneration)

Toutes les pages utilisent ISR avec revalidation toutes les heures :

```typescript
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'blog'])),
    },
    revalidate: 3600, // 1 heure
  };
};
```

### Avantages

- ✅ Pages pré-générées (ultra-rapides)
- ✅ Mise à jour automatique toutes les heures
- ✅ Pas de rebuild complet nécessaire
- ✅ Fallback: 'blocking' pour nouvelles pages

---

## 📊 SEO

### Structured Data

#### Blog

```json
{
  "@type": "BlogPosting",
  "headline": "...",
  "author": {...},
  "publisher": {...},
  "datePublished": "...",
  "dateModified": "..."
}
```

#### Villes

```json
{
  "@type": "LocalBusiness",
  "name": "OMA Digital Dakar",
  "address": {...},
  "geo": {...},
  "openingHours": "...",
  "aggregateRating": {...}
}
```

### Sitemap

Toutes les pages sont ajoutées au sitemap avec priorités appropriées :

- Blog index: `priority: 0.9`
- Articles: `priority: 0.8`
- Villes: `priority: 0.9`

---

## ♿ Accessibilité

### Conformité WCAG 2.1 AA

- ✅ Balises sémantiques (`<article>`, `<nav>`, `<section>`)
- ✅ ARIA labels sur tous les liens
- ✅ Navigation au clavier
- ✅ Contrastes de couleurs suffisants
- ✅ Textes alternatifs
- ✅ Focus visible
- ✅ Hiérarchie de titres correcte

---

## 🔒 Sécurité

### Bonnes pratiques

- ✅ Pas de secrets hardcodés
- ✅ Validation et sanitisation des entrées
- ✅ `rel="noopener noreferrer"` sur liens externes
- ✅ Encodage des URLs
- ✅ CSP headers (à configurer dans Vercel)
- ✅ HTTPS uniquement

---

## 📝 Checklist de déploiement

Avant de pousser en production :

- [ ] Tester toutes les pages en local (`npm run dev`)
- [ ] Vérifier les traductions FR et EN
- [ ] Tester la recherche blog
- [ ] Tester les filtres blog
- [ ] Vérifier les liens sociaux
- [ ] Tester le partage social
- [ ] Vérifier le sitemap (`/sitemap.xml`)
- [ ] Tester sur mobile
- [ ] Vérifier l'accessibilité
- [ ] Lancer les tests (`npm test`)
- [ ] Build production (`npm run build`)
- [ ] Vérifier les erreurs de build

---

## 🐛 Dépannage

### Le blog ne s'affiche pas

1. Vérifiez que `blog.json` existe dans `public/locales/fr/` et `public/locales/en/`
2. Vérifiez que `'blog'` est dans `ns` de `next-i18next.config.js`
3. Redémarrez le serveur de dev

### Les traductions ne fonctionnent pas

1. Vérifiez la structure JSON (pas d'erreurs de syntaxe)
2. Vérifiez que les clés correspondent entre FR et EN
3. Utilisez `t('blog:key')` pour accéder aux traductions

### Erreur 404 sur les pages villes

1. Vérifiez que le slug est dans `getStaticPaths`
2. Vérifiez que les données existent dans `cities.json`
3. Rebuild avec `npm run build`

---

## 📞 Support

Pour toute question :
- Email: contact@omadigital.net
- Téléphone: +221 70 119 38 11
- WhatsApp: +221 70 119 38 11

---

**Dernière mise à jour:** Janvier 2025  
**Version:** 1.0.0
