# 🔐 Guide de Configuration des Variables d'Environnement

Ce guide vous aide à configurer correctement votre fichier `.env.local` pour le projet OMADIGITAL.

---

## 📋 Table des Matières

1. [Variables Requises](#variables-requises)
2. [Variables Optionnelles](#variables-optionnelles)
3. [Configuration Locale](#configuration-locale)
4. [Configuration Vercel (Production)](#configuration-vercel-production)
5. [Sécurité](#sécurité)

---

## ✅ Variables Requises

### 1. Supabase (Base de données)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Où les trouver :**
1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (cliquez "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. Google Vertex AI (Chatbot LLM, STT, TTS)

```bash
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-credentials.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
VERTEX_AI_ENDPOINT=us-central1-aiplatform.googleapis.com
```

**⚠️ IMPORTANT : 100% Vertex AI uniquement**
- ❌ PAS de Google AI Studio (AI Studio Gemini)
- ❌ PAS de Hugging Face
- ❌ PAS de détection de langue locale

**Comment configurer :**

1. **Créer un Service Account :**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com)
   - **IAM & Admin** → **Service Accounts**
   - Cliquez sur **Create Service Account**
   - Nom : `vertex-ai-chatbot`
   - Rôles requis :
     - `Vertex AI User`
     - `Cloud Speech Client`
     - `Cloud Text-to-Speech Client`

2. **Télécharger les credentials :**
   - Cliquez sur le service account créé
   - **Keys** → **Add Key** → **Create new key**
   - Type : **JSON**
   - Téléchargez le fichier
   - Renommez-le en `vertex-ai-credentials.json`
   - Placez-le à la racine du projet

3. **Activer les APIs :**
   - Vertex AI API
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API

---

### 3. Admin Authentication

```bash
ADMIN_USERNAME=admin_xxxxx
ADMIN_PASSWORD_HASH=xxxxx...
ADMIN_SALT=xxxxx...
JWT_SECRET=xxxxx...
```

**Comment générer :**

```bash
# Générer les credentials admin
node generate-admin-credentials.js "VotreMotDePasse123!"

# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Le script `generate-admin-credentials.js` vous donnera :
- `ADMIN_USERNAME`
- `ADMIN_SALT`
- `ADMIN_PASSWORD_HASH`

---

## 🔧 Variables Optionnelles

### Google Analytics (Optionnel)

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Monitoring (Optionnel)

```bash
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_SECURITY_LEVEL=high
```

### Cron Jobs (Optionnel)

```bash
CRON_AUTH_TOKEN=your_random_token
```

---

## 💻 Configuration Locale (Développement)

### Étape 1 : Créer `.env.local`

```bash
# Copier le template
cp .env.example .env.local
```

### Étape 2 : Remplir les valeurs

Ouvrez `.env.local` et remplacez toutes les valeurs `your_xxx` par vos vraies credentials.

### Étape 3 : Vérifier

```bash
# Tester en local
npm run dev
```

Ouvrez http://localhost:3000 et testez :
- ✅ Formulaire de contact (Supabase)
- ✅ Newsletter (Supabase)
- ✅ Chatbot (Vertex AI)
- ✅ Admin login (JWT + Admin credentials)

---

## 🚀 Configuration Vercel (Production)

### Étape 1 : Ajouter les Variables

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**

### Étape 2 : Ajouter chaque variable

**Format :**
- **Key** : Nom de la variable (ex: `NEXT_PUBLIC_SUPABASE_URL`)
- **Value** : Valeur de la variable
- **Environment** : ☑️ Production, ☑️ Preview, ☑️ Development

### Étape 3 : Variables Vercel Requises

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GOOGLE_CLOUD_PROJECT
✅ GOOGLE_CLOUD_LOCATION
✅ VERTEX_AI_MODEL
✅ VERTEX_AI_ENDPOINT
✅ ADMIN_USERNAME
✅ ADMIN_PASSWORD_HASH
✅ ADMIN_SALT
✅ JWT_SECRET
✅ NODE_ENV (set to "production")
```

### Étape 4 : Service Account JSON

Pour `GOOGLE_APPLICATION_CREDENTIALS`, vous avez 2 options :

**Option A : Variable d'environnement (Recommandé)**
```
Key: GOOGLE_APPLICATION_CREDENTIALS_JSON
Value: [Coller tout le contenu du fichier vertex-ai-credentials.json]
```

Puis dans votre code, créez le fichier temporairement :
```typescript
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  // Utiliser credentials
}
```

**Option B : Vercel Blob Storage**
Uploadez le fichier JSON sur Vercel Blob et référencez-le.

---

## 🔒 Sécurité

### ❌ Ne JAMAIS exposer côté client :

- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SALT`
- `CRON_AUTH_TOKEN`
- `vertex-ai-credentials.json`

### ✅ Safe pour le client (NEXT_PUBLIC_*) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_BASE_URL`

### 🛡️ Bonnes Pratiques :

1. ✅ Ajoutez `.env.local` et `vertex-ai-credentials.json` au `.gitignore`
2. ✅ Ne commitez JAMAIS les credentials
3. ✅ Utilisez des secrets différents pour dev/prod
4. ✅ Rotez les credentials régulièrement
5. ✅ Limitez les permissions du Service Account au minimum nécessaire

---

## 📝 Checklist de Vérification

### Développement Local

- [ ] `.env.local` créé et rempli
- [ ] `vertex-ai-credentials.json` téléchargé et placé à la racine
- [ ] Toutes les APIs Google Cloud activées
- [ ] `npm run dev` fonctionne sans erreur
- [ ] Chatbot répond correctement
- [ ] Admin login fonctionne
- [ ] Formulaires (contact, newsletter) fonctionnent

### Production Vercel

- [ ] Toutes les variables ajoutées sur Vercel
- [ ] Service Account JSON configuré
- [ ] Déploiement réussi
- [ ] Site accessible
- [ ] Chatbot fonctionne en production
- [ ] Admin login fonctionne en production
- [ ] Formulaires fonctionnent en production

---

## 🆘 Dépannage

### Erreur : "Missing required environment variable"

**Solution :** Vérifiez que toutes les variables requises sont définies dans `.env.local` (local) ou Vercel (production).

### Erreur : "Invalid API key" (Supabase)

**Solution :** Vérifiez que vous avez copié la clé complète (très longue, commence par `eyJ...`).

### Erreur : "Vertex AI authentication failed"

**Solution :**
1. Vérifiez que `vertex-ai-credentials.json` existe
2. Vérifiez que le Service Account a les bons rôles
3. Vérifiez que les APIs sont activées

### Erreur : "Admin login failed"

**Solution :**
1. Régénérez les credentials avec `generate-admin-credentials.js`
2. Vérifiez que `JWT_SECRET` est défini (minimum 32 caractères)
3. Vérifiez que les 3 variables admin sont correctes

---

## 📞 Support

Pour toute question, consultez :
- Documentation Supabase : https://supabase.com/docs
- Documentation Vertex AI : https://cloud.google.com/vertex-ai/docs
- Documentation Next.js : https://nextjs.org/docs

---

**Dernière mise à jour :** Octobre 2025
