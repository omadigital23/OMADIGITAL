# 🚀 Guide d'Augmentation des Quotas Vertex AI

## ✅ Modifications Appliquées au Code

### Amélioration de la Gestion des Erreurs 429
- **Délais de retry augmentés** : 5s → 10s → 20s → 40s → 80s → 160s → 320s
- **Nombre de tentatives** : Passé de 5 à 7 retries
- **Total temps d'attente maximum** : ~10 minutes avant échec

### Fichier Modifié
- `src/lib/vertex-ai-chatbot.ts` (lignes 89, 127-129)

---

## 📊 Augmenter les Quotas dans Google Cloud Console

### Étape 1 : Accéder aux Quotas
1. Aller sur : https://console.cloud.google.com/iam-admin/quotas?project=omadigital23
2. Se connecter avec votre compte Google Cloud

### Étape 2 : Filtrer les Quotas Vertex AI
Dans la barre de recherche, entrer :
```
Service: Vertex AI API
```

Ou filtrer par :
- **Service** : `aiplatform.googleapis.com`
- **Location** : `us-central1`
- **Metric** : `GenerateContent`

### Étape 3 : Identifier les Quotas à Augmenter

#### Quotas Critiques pour Gemini 2.0 Flash Exp :

1. **Requests per minute per model per region**
   - Quota actuel : ~10-15 RPM
   - **Demander** : 60 RPM (minimum)
   - **Idéal** : 100 RPM

2. **Tokens per minute per model per region**
   - Quota actuel : 1,000,000 TPM
   - **Demander** : 2,000,000 TPM
   - **Idéal** : 5,000,000 TPM

3. **Requests per day per model per region**
   - Quota actuel : 1,000 RPD
   - **Demander** : 10,000 RPD
   - **Idéal** : 50,000 RPD

### Étape 4 : Demander l'Augmentation

1. **Cocher** les quotas à augmenter
2. Cliquer sur **"EDIT QUOTAS"** en haut
3. Remplir le formulaire :

#### Informations à Fournir :
```
Project Name: omadigital23
Service: Vertex AI API (aiplatform.googleapis.com)
Location: us-central1
Model: gemini-2.0-flash-exp

Business Justification:
"Production chatbot for SME business automation platform serving 200+ clients 
in Senegal and Morocco. Real-time customer support with voice and text 
interactions. Current quota causing service disruptions during peak hours."

Technical Details:
- Average requests: 30-50 per minute during business hours
- Peak requests: 80-100 per minute
- Use case: Customer service automation, order management, FAQ responses
- Expected growth: 3x in next 6 months

Contact Email: [VOTRE EMAIL]
Phone: +221701193811
```

4. Cliquer sur **"SUBMIT REQUEST"**

### Étape 5 : Temps de Traitement
- **Réponse habituelle** : 24-48 heures
- **Urgent** : Mentionner "Production impact" dans la justification

---

## 🔧 Solutions Temporaires (En Attendant l'Augmentation)

### 1. Utiliser Plusieurs Régions (Load Balancing)
Ajouter d'autres régions pour distribuer la charge :
- `us-central1` (actuel)
- `europe-west1` (Europe)
- `asia-southeast1` (Asie)

### 2. Activer la Facturation
Si pas déjà fait, activer un compte de facturation augmente automatiquement certains quotas.

```bash
# Vérifier le compte de facturation
gcloud billing accounts list

# Lier le projet
gcloud billing projects link omadigital23 --billing-account=BILLING_ACCOUNT_ID
```

### 3. Passer à un Modèle Stable (Si Urgent)
Si les quotas de `gemini-2.0-flash-exp` sont trop bas, considérer temporairement :
- `gemini-1.5-flash` (quotas plus élevés, modèle stable)
- `gemini-1.5-pro` (quotas encore plus élevés)

**Note** : Le code actuel gère déjà bien les retries, donc cette solution n'est nécessaire qu'en cas d'urgence absolue.

---

## 📈 Monitoring des Quotas

### Vérifier l'Utilisation Actuelle
1. Aller sur : https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/quotas?project=omadigital23
2. Voir les graphiques d'utilisation en temps réel

### Alertes Recommandées
Créer des alertes à 80% d'utilisation :
1. Cloud Monitoring → Alerting
2. Créer une alerte sur `aiplatform.googleapis.com/quota/rate_quota_exceeded`

---

## ✅ Vérification Post-Augmentation

Une fois les quotas augmentés, vérifier :
```bash
# Tester le chatbot
curl -X POST https://www.omadigital.net/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "Test quota"}'
```

Surveiller les logs pour confirmer :
- ✅ Pas d'erreurs 429
- ✅ Temps de réponse < 3 secondes
- ✅ Tous les retries réussissent

---

## 📞 Support Google Cloud

Si la demande est rejetée ou prend trop de temps :
- **Support Email** : cloud-support@google.com
- **Support Chat** : https://cloud.google.com/support
- **Téléphone** : Disponible avec plan de support payant

---

## 🎯 Résumé des Actions

1. ✅ **Code modifié** : Retries augmentés (5s → 320s max)
2. 🔄 **À faire** : Demander augmentation quotas dans Console
3. ⏰ **Attendre** : 24-48h pour approbation
4. ✅ **Vérifier** : Tester après augmentation

**Le chatbot continuera de fonctionner avec les retries améliorés, mais l'augmentation des quotas éliminera complètement les erreurs 429.**
