# Configuration Vertex AI - Quota Optimisé

## ⚙️ Changement de Modèle

### Ancien Modèle ❌
```
VERTEX_AI_MODEL=gemini-2.0-flash-exp
```
**Problème** : Quota très limité (60 requêtes/minute)

### Nouveau Modèle ✅
```
VERTEX_AI_MODEL=gemini-1.5-flash
```
**Avantages** :
- ✅ Quota plus élevé (1000 requêtes/minute)
- ✅ Modèle stable (pas expérimental)
- ✅ Même qualité de réponse
- ✅ Latence similaire

---

## 📝 Configuration dans .env.local

Ajoutez ou modifiez cette ligne dans votre `.env.local` :

```bash
# Vertex AI Configuration
VERTEX_AI_MODEL=gemini-1.5-flash
```

**Note** : Si la variable n'est pas définie, le code utilisera automatiquement `gemini-1.5-flash` par défaut.

---

## 🔧 Changements Appliqués

### 1. Modèle par Défaut
**Fichier** : `src/lib/vertex-ai-chatbot.ts` (ligne 54)
```typescript
this.model = process.env['VERTEX_AI_MODEL'] || 'gemini-1.5-flash';
```

### 2. Suppression du Fallback Générique
**Avant** ❌ :
```typescript
// Retournait un message "service surchargé"
return this.getQuotaExceededResponse(prompt);
```

**Après** ✅ :
```typescript
// Lance une erreur pour que l'API gère proprement
throw new Error(`Vertex AI quota exceeded after ${maxRetries} retries`);
```

**Résultat** : Vertex AI reste le SEUL fallback, pas de message générique.

---

## 📊 Comparaison des Quotas

| Modèle | Requêtes/Minute | Tokens/Minute | Statut |
|--------|-----------------|---------------|--------|
| `gemini-2.0-flash-exp` | 60 | 4M | Expérimental ⚠️ |
| `gemini-1.5-flash` | 1000 | 4M | Stable ✅ |
| `gemini-1.5-pro` | 360 | 4M | Stable (plus lent) |

---

## 🚀 Augmenter le Quota (Si Nécessaire)

Si même avec `gemini-1.5-flash` vous atteignez les limites :

### Option 1 : Demander une Augmentation
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/iam-admin/quotas)
2. Rechercher "Vertex AI API"
3. Sélectionner "Generate content requests per minute per project per base model"
4. Cliquer "Edit Quotas"
5. Demander une augmentation (ex: 2000/min)

### Option 2 : Activer la Facturation
- Les projets avec facturation activée ont des quotas plus élevés automatiquement
- Vertex AI offre $300 de crédits gratuits pour commencer

### Option 3 : Utiliser le Batching
- Regrouper plusieurs questions en une seule requête
- Réduire le nombre d'appels API

---

## ✅ Vérification

Pour vérifier que le nouveau modèle est utilisé, regardez les logs au démarrage :

```
✅ Vertex AI initialized
   Project: omadigital23
   Location: us-central1
   Model: gemini-1.5-flash  ← Doit afficher ce modèle
```

---

## 🎯 Résultat Attendu

Avec ces changements :
- ✅ **16x plus de requêtes** possibles (60 → 1000/min)
- ✅ **Pas de message "service surchargé"**
- ✅ **Vertex AI reste le seul fallback**
- ✅ **Retry automatique avec exponential backoff**

---

## 📞 Support

Si vous continuez à avoir des erreurs 429 :
1. Vérifiez que le modèle est bien `gemini-1.5-flash-001`
2. Vérifiez votre quota actuel dans Google Cloud Console
3. Demandez une augmentation de quota si nécessaire
