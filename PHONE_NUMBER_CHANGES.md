# 📞 Changement du Numéro de Téléphone

## ✅ Changements Effectués

### Fichiers Modifiés :
1. ✅ `src/utils/supabase/info.tsx` - Fonction generateWhatsAppLink
2. ✅ `src/components/Footer.tsx` - Lien WhatsApp social

---

## 🔄 Fichiers Restants à Modifier

Remplacer `+221701193811` ou `221701193811` par `+212701193811` ou `212701193811` dans les fichiers suivants :

### Composants (Priorité Haute)
- [ ] `src/components/SEOHead.tsx` (4 occurrences)
- [ ] `src/components/CTASection.tsx` (3 occurrences)
- [ ] `src/components/SEOHelmet.tsx` (3 occurrences)
- [ ] `src/components/EnhancedHeader.tsx` (2 occurrences)
- [ ] `src/components/StickyWhatsAppButton.tsx` (2 occurrences)
- [ ] `src/components/HeroSection.tsx` (1 occurrence)
- [ ] `src/components/Header.tsx` (1 occurrence)
- [ ] `src/components/SecureHeader.tsx` (1 occurrence)
- [ ] `src/components/SecureContactForm.tsx` (1 occurrence)
- [ ] `src/components/SmartChatbot/index.tsx` (1 occurrence)
- [ ] `src/components/EnhancedSEO.tsx` (1 occurrence)
- [ ] `src/components/OptimizedLandingPage.tsx` (1 occurrence)

### Pages (Priorité Haute)
- [ ] `pages/optimized-index.tsx` (4 occurrences)
- [ ] `pages/blog/[slug].tsx` (2 occurrences)
- [ ] `pages/blog/index.tsx` (1 occurrence)

### Bibliothèques
- [ ] `src/lib/seo-faq-schema.ts` (1 occurrence)

### Tests
- [ ] `src/components/__tests__/useChatLogic.test.ts` (1 occurrence)

---

## 🔍 Comment Trouver et Remplacer

### Option 1 : VS Code (Recommandé)
1. Appuyer sur `Ctrl+Shift+H` (Rechercher et remplacer dans les fichiers)
2. Dans "Rechercher" : `221701193811`
3. Dans "Remplacer par" : `212701193811`
4. Cliquer sur "Remplacer tout"

### Option 2 : PowerShell (Ligne de commande)
```powershell
# Depuis le dossier racine du projet
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.json,*.md | 
  Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git' } | 
  ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match '221701193811') {
      $content -replace '221701193811', '212701193811' | 
        Set-Content $_.FullName -NoNewline
      Write-Host "Modifié: $($_.Name)"
    }
  }
```

### Option 3 : Git Bash / Linux
```bash
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  -exec sed -i 's/221701193811/212701193811/g' {} +
```

---

## ✅ Vérification Post-Changement

Après avoir effectué tous les changements, vérifier :

```bash
# Rechercher s'il reste des occurrences de l'ancien numéro
grep -r "221701193811" --include="*.tsx" --include="*.ts" --include="*.json" --exclude-dir={node_modules,.next,.git}
```

Si la commande ne retourne rien, tous les numéros ont été changés ! ✅

---

## 📋 Résumé

- **Ancien numéro** : +221 70 119 38 11 (Sénégal 🇸🇳)
- **Nouveau numéro** : +212 70 119 38 11 (Maroc 🇲🇦)
- **Total de fichiers** : ~19 fichiers
- **Total d'occurrences** : ~32 occurrences

---

## ⚠️ Important

Après les changements :
1. ✅ Tester le site localement
2. ✅ Vérifier que tous les liens WhatsApp fonctionnent
3. ✅ Vérifier les liens "Appeler" dans le footer et les pages légales
4. ✅ Commit et push les changements
