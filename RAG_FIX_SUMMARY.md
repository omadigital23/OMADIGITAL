# 🔧 Corrections RAG + Erreur Hydration

**Date:** 19 janvier 2025  
**Problèmes résolus:** 2

---

## ✅ PROBLÈME 1: Erreur d'Hydration Next.js (RÉSOLU)

### Erreur
```
Text content does not match server-rendered HTML
Server: "Accueil" Client: "header.home"
```

### Cause
Le composant `Header.tsx` utilisait `t('header.home')` côté serveur, mais i18next n'était pas toujours initialisé lors du SSR, causant un mismatch entre le rendu serveur et client.

### Solution Appliquée
**Fichier:** `src/components/Header.tsx` (lignes 275-284)

**Avant:**
```typescript
const serverNavigationItems = [
  { label: t('header.home'), id: 'hero' },
  { label: t('header.services'), id: 'services' },
  // ...
];
```

**Après:**
```typescript
const serverNavigationItems = [
  { label: 'Accueil', id: 'hero' },
  { label: 'Services', id: 'services' },
  { label: 'Offres', id: 'offers' },
  { label: 'Études de cas', id: 'case-studies' },
  { label: 'Processus', id: 'process' },
  { label: 'Blog IA', href: '/blog' },
  { label: 'Contact', id: 'contact' },
];
```

**Résultat:** ✅ Plus d'erreur d'hydration, le serveur et le client affichent maintenant le même contenu

---

## ⚠️ PROBLÈME 2: RAG ne fonctionne pas en anglais (EN COURS)

### Symptômes
- Question FR: "quels sont vos offres" → ✅ Réponse détaillée avec contexte RAG
- Question EN: "what are your offers" → ❌ Réponse générique sans contexte RAG

### Causes Identifiées

#### 1. Stopwords insuffisants
**Fichier:** `src/lib/rag/rag-first-service.ts` (ligne 100)
- Manquait beaucoup de mots anglais courants: "offers", "what", "your", "which", etc.
- Résultat: Le mot "offers" était extrait comme keyword, mais ne matchait rien

#### 2. Recherche Supabase sous-optimale
**Fichier:** `src/lib/rag/rag-first-service.ts` (lignes 121-128)
- Utilisait `keywords.cs.{${kw}}` (syntaxe incorrecte)
- Ne cherchait pas dans le champ `category`
- Résultat: Documents anglais non trouvés même s'ils existent

#### 3. Prompt pas assez explicite
**Fichier:** `src/lib/rag/rag-first-service.ts` (lignes 164-176)
- Ne donnait pas assez de contexte sur OMA Digital
- Ne demandait pas explicitement d'utiliser les documents fournis

### Solution Proposée

**Fichier créé:** `src/lib/rag/rag-first-service-fixed.ts`

#### Changement 1: Stopwords étendus
```typescript
const stopwords = [
  // English (étendu)
  'the', 'what', 'where', 'when', 'how', 'your', 'are', 'is', 'can', 'do', 'does',
  'you', 'have', 'has', 'had', 'was', 'were', 'been', 'being', 'for', 'with', 
  'from', 'this', 'that', 'these', 'those', 'and', 'but', 'not', 'all', 'any', 
  'some', 'more', 'most', 'who', 'which', 'will', 'would', 'could', 'should',
  // French
  'qui', 'que', 'quoi', 'ou', 'comment', 'votre', 'est', 'sont', 'peut', 'faire', 
  'cest', 'les', 'des', 'une', 'aux', 'dans', 'sur', 'pour', 'avec', 'sans', 'sous'
];
```

#### Changement 2: Recherche Supabase améliorée
```typescript
keywords.forEach(kw => {
  // Chercher dans title, content ET category (plus fiable)
  conditions.push(`title.ilike.%${kw}%`);
  conditions.push(`content.ilike.%${kw}%`);
  conditions.push(`category.ilike.%${kw}%`); // NOUVEAU
});
```

#### Changement 3: Prompt amélioré
```typescript
const prompt = `You are the OMA Digital assistant. Answer based on this context:

${ragContext}

User question: ${question}

IMPORTANT INSTRUCTIONS: 
1. Detect the language of the user's question automatically
2. Respond in the SAME language as the user's question (French if they ask in French, English if they ask in English)
3. Use ONLY the information from the context above to answer
4. Keep your response concise (maximum 8 sentences)
5. Start your response with [LANG:FR] if responding in French or [LANG:EN] if responding in English
6. If the context mentions offers, services, or products, provide specific details from the documents
