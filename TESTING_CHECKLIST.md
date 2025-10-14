# ✅ Checklist de Test Local

## 🎯 Avant de pousser vers production

Testez toutes ces fonctionnalités en local avec `npm run dev`

---

## 1️⃣ Header - Lien Blog

### Test
- [ ] Cliquez sur "Blog IA" dans le header
- [ ] Vérifiez que vous êtes redirigé vers `/blog` (et non `https://blog.omadigital.net`)
- [ ] Testez en français et en anglais

### Résultat attendu
✅ Le lien pointe vers `/blog` (page interne)

---

## 2️⃣ Page Blog - Liste des Articles

### URL à tester
- Français: http://localhost:3000/blog
- Anglais: http://localhost:3000/en/blog

### Tests
- [ ] La page se charge correctement
- [ ] Les 5 articles s'affichent
- [ ] La barre de recherche fonctionne
- [ ] Les filtres fonctionnent (Tous, IA, WhatsApp, Web, Études de cas, Guides)
- [ ] Le temps de lecture s'affiche
- [ ] Les tags s'affichent
- [ ] Les catégories s'affichent
- [ ] Le bouton "Lire l'article" fonctionne

### Recherche
- [ ] Tapez "WhatsApp" → 2 articles apparaissent
- [ ] Tapez "Vertex AI" → 2 articles apparaissent
- [ ] Tapez "Next.js" → 1 article apparaît

### Filtres
- [ ] Cliquez sur "Intelligence Artificielle" → 2 articles
- [ ] Cliquez sur "WhatsApp Business" → 2 articles
- [ ] Cliquez sur "Développement Web" → 1 article
- [ ] Cliquez sur "Études de Cas" → 1 article

---

## 3️⃣ Page Article Individuelle

### URLs à tester
- http://localhost:3000/blog/chatbot-whatsapp-senegal
- http://localhost:3000/blog/chatbot-vocal-multilingue
- http://localhost:3000/blog/sites-web-rapides-nextjs
- http://localhost:3000/blog/vertex-ai-vs-alternatives
- http://localhost:3000/blog/roi-automatisation-pme-afrique

### Tests
- [ ] L'article se charge correctement
- [ ] Le titre s'affiche
- [ ] L'extrait s'affiche
- [ ] L'auteur s'affiche
- [ ] La date de publication s'affiche
- [ ] Le temps de lecture s'affiche
- [ ] Les tags s'affichent
- [ ] Le contenu complet s'affiche
- [ ] Les sections sont bien formatées
- [ ] Le CTA s'affiche
- [ ] Les boutons de partage social fonctionnent
- [ ] Le breadcrumb fonctionne
- [ ] Le bouton "Retour au blog" fonctionne

### Partage Social
- [ ] Bouton Facebook → Ouvre popup de partage
- [ ] Bouton Twitter/X → Ouvre popup de partage
- [ ] Bouton LinkedIn → Ouvre popup de partage
- [ ] Bouton WhatsApp → Ouvre WhatsApp

---

## 4️⃣ Pages Villes

### URLs à tester
- http://localhost:3000/villes/dakar
- http://localhost:3000/villes/thies
- http://localhost:3000/villes/casablanca
- http://localhost:3000/villes/rabat
- http://localhost:3000/villes/marrakech

### Tests pour chaque ville
- [ ] La page se charge correctement
- [ ] Le nom de la ville s'affiche
- [ ] La description s'affiche
- [ ] Les 4 statistiques s'affichent
- [ ] Les 3 services s'affichent avec tarifs
- [ ] Les témoignages s'affichent
- [ ] Les coordonnées s'affichent
- [ ] Les boutons CTA fonctionnent
- [ ] Le bouton WhatsApp fonctionne

### Vérifications spécifiques

#### Dakar
- [ ] Tarifs en FCFA
- [ ] Support français et wolof mentionné
- [ ] Témoignages de clients dakarois

#### Thiès
- [ ] Adresse : Hersent Rue 15, Thiès
- [ ] Support local mentionné

#### Casablanca
- [ ] Tarifs en MAD
- [ ] Support français et arabe mentionné
- [ ] Dialecte marocain (darija) mentionné

#### Rabat
- [ ] Tarifs en MAD
- [ ] Support bilingue FR/AR

#### Marrakech
- [ ] Tarifs en MAD
- [ ] Support 3 langues (FR/AR/EN) pour tourisme

---

## 5️⃣ Composant Réseaux Sociaux

### Localisation
Visible sur :
- Page blog (bas de page)
- Pages villes (bas de page)

### Tests
- [ ] Les 4 icônes s'affichent (Facebook, X, Instagram, TikTok)
- [ ] Les labels s'affichent si `showLabels={true}`
- [ ] Clic sur Facebook → Ouvre https://web.facebook.com/profile.php?id=61579740432372
- [ ] Clic sur X → Ouvre https://x.com/omadigital23
- [ ] Clic sur Instagram → Ouvre https://www.instagram.com/omadigital123
- [ ] Clic sur TikTok → Ouvre https://www.tiktok.com/@omadigital23
- [ ] Tous les liens s'ouvrent dans un nouvel onglet

---

## 6️⃣ SEO & Structured Data

### Test avec Google Rich Results Test

1. Allez sur https://search.google.com/test/rich-results
2. Testez ces URLs :
   - http://localhost:3000/blog
   - http://localhost:3000/blog/chatbot-whatsapp-senegal
   - http://localhost:3000/villes/dakar

### Vérifications
- [ ] Pas d'erreurs de structured data
- [ ] BlogPosting schema détecté sur articles
- [ ] LocalBusiness schema détecté sur pages villes

### Test Sitemap

1. Ouvrez http://localhost:3000/sitemap.xml
2. Vérifiez que ces URLs sont présentes :
   - [ ] /blog
   - [ ] /blog/chatbot-whatsapp-senegal
   - [ ] /blog/chatbot-vocal-multilingue
   - [ ] /blog/sites-web-rapides-nextjs
   - [ ] /blog/vertex-ai-vs-alternatives
   - [ ] /blog/roi-automatisation-pme-afrique
   - [ ] /villes/dakar
   - [ ] /villes/thies
   - [ ] /villes/casablanca
   - [ ] /villes/rabat
   - [ ] /villes/marrakech

---

## 7️⃣ Multilingue (i18n)

### Test Français → Anglais

1. Sur http://localhost:3000/blog
2. Cliquez sur le sélecteur de langue (🇫🇷 FR)
3. Sélectionnez 🇬🇧 EN
4. Vérifiez :
   - [ ] URL devient /en/blog
   - [ ] Tous les textes sont en anglais
   - [ ] Les articles sont traduits
   - [ ] Les filtres sont en anglais

### Test Anglais → Français

1. Sur http://localhost:3000/en/villes/dakar
2. Changez la langue vers FR
3. Vérifiez :
   - [ ] URL devient /villes/dakar
   - [ ] Tous les textes sont en français
   - [ ] Les services sont traduits
   - [ ] Les témoignages sont traduits

---

## 8️⃣ Responsive Design

### Test Mobile (375px)
- [ ] Header responsive
- [ ] Blog grid passe en 1 colonne
- [ ] Filtres blog s'affichent correctement
- [ ] Articles lisibles
- [ ] Pages villes lisibles
- [ ] Boutons accessibles (min 44x44px)

### Test Tablet (768px)
- [ ] Blog grid passe en 2 colonnes
- [ ] Navigation optimisée

### Test Desktop (1920px)
- [ ] Blog grid en 3 colonnes
- [ ] Contenu centré avec max-width

---

## 9️⃣ Accessibilité

### Test Clavier
- [ ] Tab pour naviguer
- [ ] Enter pour activer les liens
- [ ] Espace pour activer les boutons
- [ ] Escape pour fermer les modales

### Test Lecteur d'écran
- [ ] Tous les liens ont des labels ARIA
- [ ] Les images ont des alt texts
- [ ] La navigation est logique
- [ ] Les titres sont hiérarchiques (H1 → H2 → H3)

### Test Contraste
- [ ] Texte noir sur fond blanc : ratio > 4.5:1
- [ ] Texte orange sur fond blanc : ratio > 3:1
- [ ] Boutons visibles et lisibles

---

## 🔟 Performance

### Test PageSpeed Insights

1. Build production : `npm run build`
2. Start production : `npm start`
3. Testez sur https://pagespeed.web.dev/
4. Vérifiez :
   - [ ] Performance > 90
   - [ ] Accessibility > 95
   - [ ] Best Practices > 90
   - [ ] SEO > 95

### Test Lighthouse (Chrome DevTools)

1. F12 → Lighthouse
2. Testez ces pages :
   - [ ] /blog
   - [ ] /blog/chatbot-whatsapp-senegal
   - [ ] /villes/dakar

---

## 1️⃣1️⃣ Tests Unitaires

### Lancer les tests

```bash
npm test
```

### Vérifications
- [ ] Tous les tests passent
- [ ] Pas d'erreurs de console
- [ ] Coverage > 80%

---

## 1️⃣2️⃣ Build Production

### Commandes

```bash
# Build
npm run build

# Vérifier les erreurs
# Pas d'erreurs TypeScript
# Pas d'erreurs de build
# Pas de warnings critiques

# Start production
npm start

# Tester en production locale
# http://localhost:3000
```

### Vérifications
- [ ] Build réussit sans erreurs
- [ ] Pas d'erreurs TypeScript
- [ ] Toutes les pages se génèrent
- [ ] ISR fonctionne

---

## ✅ Checklist Finale

Avant de faire `git push` :

- [ ] Tous les tests ci-dessus passent
- [ ] Pas d'erreurs dans la console
- [ ] Pas de warnings critiques
- [ ] Build production réussit
- [ ] Documentation à jour
- [ ] Pas de secrets hardcodés
- [ ] Pas de console.log oubliés
- [ ] Code formaté (Prettier)
- [ ] Code linté (ESLint)

---

## 🚀 Commandes Git

Une fois tous les tests validés :

```bash
# Voir les fichiers modifiés
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "feat: Ajout blog multilingue, pages villes et réseaux sociaux

✨ Nouvelles fonctionnalités:
- Blog multilingue avec 5 articles (FR/EN)
- Pages locales pour 5 villes (Dakar, Thiès, Casablanca, Rabat, Marrakech)
- Composant réseaux sociaux réutilisable
- Partage social sur articles blog

🎨 Améliorations:
- Lien blog header corrigé (/blog au lieu de blog.omadigital.net)
- SEO optimisé avec structured data
- ISR pour performance
- Sitemap mis à jour

🧪 Tests:
- Tests unitaires pour SocialMediaLinks
- Accessibilité WCAG 2.1 AA
- Responsive design

📚 Documentation:
- BLOG_AND_CITIES_README.md
- TESTING_CHECKLIST.md"

# Push vers GitHub
git push origin main
```

---

## 📞 En cas de problème

Si vous rencontrez des erreurs :

1. **Vérifiez les logs** dans la console
2. **Vérifiez les fichiers JSON** (syntaxe correcte)
3. **Redémarrez le serveur** (`Ctrl+C` puis `npm run dev`)
4. **Nettoyez le cache** (`rm -rf .next`)
5. **Réinstallez les dépendances** (`npm install`)

---

**Bonne chance pour les tests ! 🚀**
