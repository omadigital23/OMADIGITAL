# 🎤 Guide: Configuration Google Cloud Speech-to-Text

## 🎯 Objectif

Activer la reconnaissance vocale dans le chatbot OMA Digital avec Google Cloud Speech-to-Text API.

---

## 📋 Étape 1: Créer une API Key Google Cloud

### A. Accéder à Google Cloud Console

1. Aller sur: https://console.cloud.google.com/
2. Se connecter avec votre compte Google

### B. Créer/Sélectionner un Projet

1. Cliquer sur le sélecteur de projet (en haut)
2. Cliquer sur "NOUVEAU PROJET"
3. Nom du projet: `omadigital-chatbot`
4. Cliquer sur "CRÉER"
5. Attendre la création (~30 secondes)
6. Sélectionner le projet créé

### C. Activer Speech-to-Text API

1. Aller sur: https://console.cloud.google.com/apis/library/speech.googleapis.com
2. Vérifier que le projet `omadigital-chatbot` est sélectionné
3. Cliquer sur le bouton bleu **"ACTIVER"**
4. Attendre l'activation (~10 secondes)

### D. Créer une Clé API

1. Aller sur: https://console.cloud.google.com/apis/credentials
2. Cliquer sur **"+ CRÉER DES IDENTIFIANTS"** (en haut)
3. Sélectionner **"Clé API"**
4. Une popup s'affiche avec votre clé:
   ```
   AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
5. **COPIER** cette clé (vous en aurez besoin)
6. Cliquer sur **"RESTREINDRE LA CLÉ"**

### E. Restreindre la Clé (Sécurité)

1. Dans "Restrictions relatives aux API":
   - Sélectionner **"Restreindre la clé"**
   - Cocher: ✅ **Cloud Speech-to-Text API**
   - (Optionnel) Cocher: ✅ **Cloud Text-to-Speech API**
2. Cliquer sur **"ENREGISTRER"**

---

## 🔧 Étape 2: Configuration Locale (Développement)

### A. Créer/Modifier `.env.local`

```bash
# Dans le terminal (à la racine du projet)
# Si le fichier n'existe pas, le créer:
cp .env.example .env.local

# Ou créer manuellement le fichier .env.local
```

### B. Ajouter la Clé API

Ouvrir `.env.local` et ajouter/modifier:

```
# Google Cloud API Key pour STT/TTS
GOOGLE_CLOUD_API_KEY=[REDACTED]
```

**⚠️ IMPORTANT:**
- Remplacer `[REDACTED]` par votre vraie clé
- Ne JAMAIS commit `.env.local` dans Git (déjà dans `.gitignore`)

### C. Redémarrer le Serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Redémarrer
npm run dev
```

---

## 🧪 Étape 3: Tester la Reconnaissance Vocale

### Test 1: Interface Chatbot

1. Ouvrir http://localhost:3000
2. Cliquer sur l'icône du chatbot (coin bas-droite)
3. Cliquer sur le bouton microphone 🎤
4. **Autoriser** l'accès au microphone (popup navigateur)
5. Parler clairement: **"Bonjour"**
6. Attendre 5 secondes (enregistrement automatique)
7. ✅ Vérifier que le texte "Bonjour" apparaît dans le chat
8. ✅ Vérifier que le bot répond en voix

### Test 2: Console Logs

Ouvrir la console du navigateur (F12) et chercher:

```
✅ Logs de succès:
🎤 Google Cloud STT: Calling API...
✅ Google Cloud STT Success: { transcript: "Bonjour", confidence: 0.95, detectedLanguage: "fr" }
🎤 Input VOCAL détecté → Réponse VOCALE activée automatiquement
```

```
❌ Logs d'erreur (si problème):
❌ Google Cloud STT Error: { status: 403, error: "..." }
```

### Test 3: Test API Direct

```bash
# Tester l'API directement
curl "https://speech.googleapis.com/v1/speech:recognize?key=[REDACTED]" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "encoding": "LINEAR16",
      "sampleRateHertz": 16000,
      "languageCode": "fr-FR"
    },
    "audio": {
      "content": ""
    }
  }'

# Réponse attendue (même avec audio vide):
# { "results": [] }
# Cela confirme que l'API est accessible
```

---

## 🚀 Étape 4: Déploiement Production

### A. Ajouter les Variables d'Environnement

Configurer les variables d'environnement dans votre plateforme de déploiement:

- **Name:** `GOOGLE_CLOUD_API_KEY`
- **Value:** `[REDACTED]` (votre clé)
- **Environments:** Production, Preview, Development

### B. Redéployer

```bash
git add .
git commit -m "Add Google Cloud STT configuration"
git push
```

### C. Tester en Production

1. Ouvrir votre site: https://omadigital.net
2. Tester le microphone du chatbot
3. ✅ Vérifier que la reconnaissance vocale fonctionne

---

## 💰 Tarification & Quotas

### Quota Gratuit

- **60 minutes/mois** de reconnaissance vocale gratuite
- Parfait pour démarrer et tester

### Au-delà du Quota Gratuit

- **STT Standard:** $0.006 / 15 secondes = **~$0.024/minute**
- **STT Enhanced:** $0.009 / 15 secondes = **~$0.036/minute**

### Estimation pour OMA Digital

**Scénario Conservateur:**
```
100 conversations vocales/jour
× 10 secondes/conversation moyenne
× 30 jours
= 5 heures/mois = 300 minutes/mois

Coût:
- 60 minutes gratuit
- 240 minutes payant × $0.024 = $5.76/mois
```

**Scénario Optimiste (moins d'usage):**
```
50 conversations vocales/jour
× 8 secondes/conversation
× 30 jours
= 3.3 heures/mois = ~200 minutes/mois

Coût:
- 60 minutes gratuit
- 140 minutes payant × $0.024 = $3.36/mois
```

### Surveiller l'Usage

1. Aller sur: https://console.cloud.google.com/apis/api/speech.googleapis.com/quotas
2. Voir l'usage en temps réel
3. Configurer des alertes de quota

---

## 🔍 Dépannage

### Erreur: "Erreur de reconnaissance vocale"

**Causes possibles:**

1. **API Key manquante**
   ```bash
   # Vérifier que la clé est dans .env.local
   cat .env.local | grep GOOGLE_CLOUD_API_KEY
   
   # Si vide, ajouter:
   echo "GOOGLE_CLOUD_API_KEY=VOTRE_CLE" >> .env.local
   
   # Redémarrer
   npm run dev
   ```

2. **API non activée**
   - Aller sur: https://console.cloud.google.com/apis/library/speech.googleapis.com
   - Cliquer sur "ACTIVER"

3. **API Key invalide**
   - Vérifier que la clé est correcte (pas d'espaces, copie complète)
   - Régénérer une nouvelle clé si nécessaire

4. **Restrictions trop strictes**
   - Aller sur: https://console.cloud.google.com/apis/credentials
   - Cliquer sur votre clé API
   - Vérifier que "Cloud Speech-to-Text API" est autorisée

### Erreur: "Permission microphone refusée"

- Autoriser le microphone dans les paramètres du navigateur
- Chrome: `chrome://settings/content/microphone`
- Safari: Préférences → Sites web → Microphone

### Erreur: "Aucune parole détectée"

- Parler plus fort
- Vérifier que le microphone fonctionne
- Tester dans un environnement silencieux

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques

1. **Restreindre la clé API**
   - Limiter aux APIs nécessaires uniquement
   - Ajouter des restrictions de domaine en production

2. **Ne jamais exposer la clé**
   - Jamais de `NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY`
   - Toujours côté serveur uniquement

3. **Surveiller l'usage**
   - Configurer des alertes de quota
   - Vérifier les logs régulièrement

4. **Séparer dev/prod**
   - Utiliser des clés différentes si possible
   - Désactiver les clés dev après tests

### ❌ À Ne Jamais Faire

- ❌ Commit `.env.local` dans Git
- ❌ Partager la clé API publiquement
- ❌ Utiliser `NEXT_PUBLIC_` pour la clé
- ❌ Laisser la clé sans restrictions

---

## 📊 Monitoring

### Logs à Surveiller

```typescript
// Console navigateur (F12)
✅ Google Cloud STT: Calling API...
✅ Google Cloud STT Success: { transcript: "...", confidence: 0.95 }
🎤 Input VOCAL détecté → Réponse VOCALE activée automatiquement
```

### Métriques Google Cloud

1. Aller sur: https://console.cloud.google.com/apis/api/speech.googleapis.com/metrics
2. Voir:
   - Nombre de requêtes
   - Latence
   - Erreurs
   - Quota utilisé

---

## ✅ Checklist Finale

- [ ] Projet Google Cloud créé
- [ ] Speech-to-Text API activée
- [ ] Clé API créée et copiée
- [ ] Clé API restreinte (sécurité)
- [ ] `GOOGLE_CLOUD_API_KEY` ajoutée dans `.env.local`
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Test microphone réussi en local
- [ ] Variables d'environnement configurées en production
- [ ] Déploiement production effectué
- [ ] Test microphone réussi en production
- [ ] Monitoring configuré

---

## 📞 Support

En cas de problème:
- 📧 Email: amadou@omadigital.net
- 📱 WhatsApp: +221 701 193 811
- 📚 Documentation Google: https://cloud.google.com/speech-to-text/docs

---

**La reconnaissance vocale est maintenant configurée avec Google Cloud Speech-to-Text! 🎤✅**
