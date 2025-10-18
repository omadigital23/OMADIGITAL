# 🚀 Guide de Déploiement Sécurisé - OMA Digital

## 📋 Prérequis

- Node.js 18+ installé
- Compte GitHub
- Compte Vercel (recommandé) ou autre hébergeur Next.js
- Compte Google Cloud Platform avec Vertex AI activé
- Compte Supabase

---

## 🔐 Étape 1 : Vérification de Sécurité

### Fichiers à NE JAMAIS commiter (déjà dans .gitignore)

```
✅ .env.local
✅ .env.development.local
✅ .env.production.local
✅ vertex-ai-credentials.json
✅ node_modules/
✅ .next/
✅ *.pem, *.key, *.crt
✅ secrets/
✅ credentials/
```

### Vérifier qu'aucun secret n'est exposé

```bash
# Rechercher des clés API potentiellement exposées
git grep -i "api_key"
git grep -i "secret"
git grep -i "password"
git grep -i "private_key"
```

---

## 📦 Étape 2 : Préparer le Repository

### 1. Initialiser Git (si pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit - OMA Digital Platform"
```

### 2. Créer un nouveau repository sur GitHub

1. Aller sur https://github.com/new
2. Nom : `OMADIGITAL` ou `oma-digital-platform`
3. Description : "Plateforme de transformation digitale pour PME - Sénégal & Maroc"
4. **Privé** (recommandé) ou Public
5. **NE PAS** initialiser avec README, .gitignore ou LICENSE

### 3. Lier le repository local

```bash
# Remplacer YOUR_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR_USERNAME/OMADIGITAL.git
git branch -M main
git push -u origin main
```

---

## 🌐 Étape 3 : Déploiement sur Vercel

### Option A : Via GitHub (Recommandé)

1. Aller sur https://vercel.com
2. Cliquer sur "Import Project"
3. Sélectionner votre repository GitHub
4. Configurer les variables d'environnement (voir ci-dessous)

### Option B : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

---

## 🔑 Étape 4 : Variables d'Environnement Vercel

### Variables REQUISES (à ajouter dans Vercel Dashboard)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Vertex AI
GOOGLE_CLOUD_PROJECT=omadigital23
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-2.0-flash-exp

# Service Account (copier TOUT le contenu du JSON)
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=omadigital23
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=abc123...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=vertex-express@omadigital23.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=123456789...
GOOGLE_SERVICE_ACCOUNT_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_SERVICE_ACCOUNT_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN=googleapis.com

# Admin
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_hashed_password
ADMIN_SALT=your_salt
JWT_SECRET=your_jwt_secret_32_chars_minimum

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# Analytics (optionnel)
NEXT_PUBLIC_GTM_ID=GT-5DHVDLCW
NEXT_PUBLIC_GA_ID=G-MHSXEJMW8C
```

### ⚠️ Important pour GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

La clé privée doit être formatée avec `\n` pour les retours à la ligne :

```bash
# Exemple
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

---

## 🔒 Étape 5 : Sécurité Post-Déploiement

### 1. Configurer les CORS dans Supabase

```sql
-- Dans Supabase SQL Editor
ALTER TABLE IF EXISTS public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chatbot_interactions ENABLE ROW LEVEL SECURITY;
```

### 2. Vérifier les Headers de Sécurité

Ajouter dans `next.config.js` :

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

### 3. Activer HTTPS Only

Dans Vercel Dashboard :
- Settings → Domains → Force HTTPS

---

## 📊 Étape 6 : Monitoring

### 1. Vérifier les Logs

```bash
# Via Vercel CLI
vercel logs --prod

# Ou dans Vercel Dashboard
# Project → Logs
```

### 2. Configurer les Alertes

Dans Vercel Dashboard :
- Settings → Notifications
- Activer les alertes pour :
  - Deployment failures
  - Performance issues
  - Error rate spikes

---

## 🧪 Étape 7 : Tests Post-Déploiement

### Checklist de Vérification

```bash
# 1. Page d'accueil
curl https://your-domain.vercel.app

# 2. API Health Check
curl https://your-domain.vercel.app/api/health

# 3. Chatbot (doit retourner une réponse)
curl -X POST https://your-domain.vercel.app/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour","sessionId":"test"}'

# 4. Blog
curl https://your-domain.vercel.app/blog

# 5. Sitemap
curl https://your-domain.vercel.app/sitemap.xml
```

### Tests Manuels

- ✅ Chatbot fonctionne (texte + voix)
- ✅ Formulaire de contact envoie les emails
- ✅ Blog articles s'affichent
- ✅ Pages légales accessibles
- ✅ Analytics trackent les événements
- ✅ Responsive sur mobile
- ✅ Performance (Lighthouse > 90)

---

## 🔄 Étape 8 : CI/CD (Optionnel)

### GitHub Actions pour Tests Automatiques

Créer `.github/workflows/ci.yml` :

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

---

## 📝 Étape 9 : Documentation

### README.md à jour

Vérifier que le README contient :
- ✅ Description du projet
- ✅ Technologies utilisées
- ✅ Instructions d'installation
- ✅ Variables d'environnement requises
- ✅ Commandes de développement
- ✅ Licence

---

## 🚨 Troubleshooting

### Erreur : "Cannot find module"

```bash
# Nettoyer et rebuilder
rm -rf .next node_modules
npm install
npm run build
```

### Erreur : "Vertex AI 429 Quota Exceeded"

1. Vérifier les quotas dans Google Cloud Console
2. Demander une augmentation (voir AUGMENTATION_QUOTA_VERTEX_AI.md)
3. Le cache est activé pour réduire les appels

### Erreur : "Supabase connection failed"

1. Vérifier que les variables NEXT_PUBLIC_SUPABASE_* sont correctes
2. Vérifier que le projet Supabase est actif
3. Vérifier les CORS dans Supabase Dashboard

---

## 📞 Support

- **Documentation** : Voir les fichiers `.md` dans le projet
- **Issues** : Créer une issue sur GitHub
- **Email** : omadigital23@gmail.com

---

## ✅ Checklist Finale

Avant de considérer le déploiement comme terminé :

- [ ] Repository GitHub créé et poussé
- [ ] Toutes les variables d'environnement configurées sur Vercel
- [ ] Build réussi sur Vercel
- [ ] Tests manuels passés
- [ ] Monitoring configuré
- [ ] Documentation à jour
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] SSL/HTTPS activé
- [ ] Analytics fonctionnent
- [ ] Chatbot répond correctement

---

## 🎉 Félicitations !

Votre plateforme OMA Digital est maintenant déployée en production de manière sécurisée ! 🚀
