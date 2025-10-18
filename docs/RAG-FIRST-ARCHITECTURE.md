# Architecture RAG-FIRST - Chatbot OMA Digital

## 📋 Vue d'ensemble

Le chatbot OMA Digital utilise désormais une architecture **RAG-FIRST** qui priorise la base de connaissances Supabase pour toutes les questions concernant OMA Digital, avec Gemini comme fallback uniquement pour les questions générales.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Question Utilisateur                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Recherche Base de Connaissances                 │
│                    (Supabase RAG)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────┴────────┐
              │                 │
         Documents         Pas de
         trouvés          documents
              │                 │
              ▼                 ▼
    ┌─────────────────┐  ┌──────────────────┐
    │ Confiance ≥ 0.7 │  │ Gemini Fallback  │
    │   RAG SEUL      │  │ (Questions       │
    │                 │  │  générales)      │
    └────────┬────────┘  └────────┬─────────┘
             │                    │
             ▼                    │
    ┌─────────────────┐           │
    │ Confiance 0.5-0.7│          │
    │  RAG + Gemini   │           │
    │ (Gemini avec    │           │
    │  contexte RAG)  │           │
    └────────┬────────┘           │
             │                    │
             └────────┬───────────┘
                      ▼
            ┌──────────────────┐
            │  Réponse Finale  │
            └──────────────────┘
```

## 🎯 Stratégies de Réponse

### 1. **RAG SEUL** (Confiance ≥ 0.7)
- **Quand**: Documents pertinents trouvés avec haute confiance
- **Source**: Base de connaissances Supabase uniquement
- **Exemple**: "Quels sont vos services WhatsApp ?"
- **Confiance**: 0.95

### 2. **RAG + Gemini** (Confiance 0.5-0.7)
- **Quand**: Documents trouvés mais confiance moyenne
- **Source**: Gemini avec contexte RAG
- **Exemple**: "Comment automatiser mon business ?"
- **Confiance**: 0.85

### 3. **Gemini Fallback** (Confiance < 0.5 ou aucun document)
- **Quand**: Question générale hors OMA Digital
- **Source**: Gemini seul
- **Exemple**: "Quelle est la capitale du Sénégal ?"
- **Confiance**: 0.7

## 📁 Fichiers Principaux

### 1. Service RAG-First
**Fichier**: `src/lib/rag/rag-first-service.ts`

Responsabilités:
- Recherche dans la base de connaissances Supabase
- Calcul de confiance basé sur les documents trouvés
- Routage vers RAG seul, RAG+Gemini ou Gemini fallback
- Appels Gemini avec contexte RAG

### 2. API Endpoint
**Fichier**: `pages/api/chat/gemini.ts`

Modifications:
- Utilise `ragFirstService` au lieu d'appels Gemini directs
- Suppression des fallbacks mécaniques
- Conservation uniquement de Gemini + RAG

### 3. Recherche RAG Optimisée
**Fichier**: `src/lib/rag/optimized-vector-search.ts`

Fonctionnalités:
- Cache intelligent avec TTL
- Recherche hybride (FTS + mots-clés + catégories)
- Scoring de pertinence
- Fallback gracieux

## 🔍 Calcul de Confiance

Le score de confiance est calculé en fonction de:

1. **Position du document** (0-1 point)
   - Premier document: score maximal
   - Score décroissant pour les suivants

2. **Correspondance titre** (0-0.5 point)
   - Mots-clés de la question dans le titre

3. **Correspondance contenu** (0-0.3 point)
   - Mots-clés de la question dans le contenu

4. **Catégorie prioritaire** (0-0.2 point)
   - Bonus pour: services, about, contact

**Score final**: Moyenne normalisée (0-1)

## 🚫 Suppressions

### Fallbacks Mécaniques Supprimés
- ❌ Réponses pré-définies statiques
- ❌ Templates de réponses fixes
- ❌ Détection de langue locale (côté client)
- ❌ Réponses d'urgence codées en dur

### Conservé
- ✅ Gemini comme fallback intelligent
- ✅ RAG depuis Supabase
- ✅ Détection de langue via Gemini ([LANG:FR|EN])
- ✅ Gestion d'erreurs avec messages appropriés

## 📊 Base de Connaissances Supabase

### Table: `knowledge_base`

Colonnes utilisées:
- `id`: Identifiant unique
- `title`: Titre du document
- `content`: Contenu du document
- `category`: Catégorie (services, about, contact, etc.)
- `language`: Langue (fr, en)
- `keywords`: Mots-clés pour recherche
- `is_active`: Statut actif/inactif

### Données Fournies

Vous avez fourni **200+ entrées** couvrant:
- Services OMA Digital (automatisation, sites web, apps mobiles)
- Informations sur Papa Amadou FALL (fondateur)
- Coordonnées et adresses (Sénégal, Maroc)
- Salutations et messages d'accueil
- Offres et services détaillés

## 🔄 Flux de Traitement

```javascript
// 1. Question reçue
const question = "Quels sont vos services WhatsApp ?";

// 2. Recherche RAG
const ragResult = await ragFirstService.answerQuestion(question, {
  language: 'fr',
  limit: 5,
  similarity_threshold: 0.7
});

// 3. Analyse du résultat
if (ragResult.source === 'rag_only') {
  // Haute confiance: réponse directe depuis RAG
  return ragResult.answer;
}
else if (ragResult.source === 'rag_gemini') {
  // Confiance moyenne: Gemini avec contexte RAG
  return ragResult.answer;
}
else {
  // Faible confiance: Gemini seul
  return ragResult.answer;
}
```

## 🎨 Prompts Gemini

### Prompt RAG (Questions OMA Digital)
```
Tu es l'assistant OMA Digital. Réponds UNIQUEMENT en utilisant les documents fournis.

**Documents de référence:**
[Documents RAG]

**RÈGLES STRICTES:**
1. Utilise EXCLUSIVEMENT les informations des documents
2. Si l'information n'est pas dans les documents, dis-le clairement
3. Réponds en [français/anglais]
4. Commence par [LANG:FR] ou [LANG:EN]
5. Sois concis (max 3 phrases)
6. Propose une action concrète
7. JAMAIS de prix exacts
```

### Prompt Général (Questions hors OMA Digital)
```
Tu es l'assistant OMA Digital. Cette question semble être d'ordre général.

**RÈGLES:**
1. Réponds brièvement et poliment
2. Réponds en [français/anglais]
3. Commence par [LANG:FR] ou [LANG:EN]
4. Suggère de poser des questions sur OMA Digital si pertinent
5. Maximum 2 phrases
```

## 📈 Métriques de Performance

Le système track:
- **Source de réponse**: rag_only, rag_gemini, gemini_fallback
- **Confiance**: Score 0-1
- **Documents trouvés**: Nombre de documents RAG
- **Temps de réponse**: Latency en ms
- **Cache hits**: Utilisation du cache RAG

## 🔧 Configuration

### Variables d'Environnement Requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### Modèle Gemini Utilisé
- **Modèle**: `gemini-2.0-flash-exp`
- **Temperature**: 0.7 (RAG), 0.8 (général)
- **Max Tokens**: 1024 (RAG), 512 (général)
- **Timeout**: 15 secondes

## 🧪 Tests

### Scénarios de Test

1. **Question OMA Digital (haute confiance)**
   - Input: "Quels sont vos services ?"
   - Expected: RAG seul, confiance ≥ 0.7

2. **Question OMA Digital (confiance moyenne)**
   - Input: "Comment vous pouvez m'aider ?"
   - Expected: RAG + Gemini, confiance 0.5-0.7

3. **Question générale**
   - Input: "Quelle heure est-il ?"
   - Expected: Gemini fallback, confiance < 0.5

4. **Question en anglais**
   - Input: "What are your services?"
   - Expected: Réponse en anglais avec [LANG:EN]

## 🚀 Déploiement

### Checklist

- [x] Service RAG-first créé
- [x] API endpoint modifié
- [x] Fallbacks mécaniques supprimés
- [x] Base de connaissances Supabase peuplée
- [x] Variables d'environnement configurées
- [ ] Tests end-to-end
- [ ] Monitoring en production

## 📞 Support

Pour toute question sur cette architecture:
- **Email**: omadigital23@gmail.com
- **Téléphone**: +212 701 193 811
- **Site**: https://omadigital.net

---

**Version**: 1.0  
**Date**: 2025-01-17  
**Auteur**: OMA Digital Team
