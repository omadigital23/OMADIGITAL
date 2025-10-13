# 🔐 Configuration Admin en Production

## ⚠️ Problème Actuel

Vous voyez le message **"Admin authentication misconfigured"** en production car les variables d'environnement admin ne sont pas configurées sur votre serveur.

---

## 📋 Variables d'Environnement Requises

Vous devez ajouter ces 3 variables sur votre plateforme de déploiement :

### 1. **ADMIN_USERNAME**
```
Votre nom d'utilisateur admin (exemple: admin)
```

### 2. **ADMIN_SALT**
```
Un salt hexadécimal aléatoire (32 caractères minimum)
```

### 3. **ADMIN_PASSWORD_HASH**
```
Le hash de votre mot de passe (128 caractères hexadécimaux)
```

---

## 🛠️ Comment Générer les Valeurs

### Option 1 : Script Node.js (Recommandé)

Créez un fichier `generate-admin-credentials.js` :

```javascript
const crypto = require('crypto');

// Votre mot de passe souhaité
const PASSWORD = 'VotreMotDePasseSecurise123!';

// Générer un salt aléatoire
const salt = crypto.randomBytes(16).toString('hex');
console.log('ADMIN_SALT=' + salt);

// Générer le hash du mot de passe
const hash = crypto.pbkdf2Sync(PASSWORD, salt, 10000, 64, 'sha512').toString('hex');
console.log('ADMIN_PASSWORD_HASH=' + hash);

console.log('\n✅ Copiez ces valeurs dans vos variables d\'environnement de production');
```

Exécutez :
```bash
node generate-admin-credentials.js
```

### Option 2 : En Ligne de Commande

```bash
# Générer le salt
node -e "console.log('ADMIN_SALT=' + require('crypto').randomBytes(16).toString('hex'))"

# Générer le hash (remplacez VotreMotDePasse)
node -e "const crypto = require('crypto'); const salt = 'VOTRE_SALT_ICI'; const hash = crypto.pbkdf2Sync('VotreMotDePasse', salt, 10000, 64, 'sha512').toString('hex'); console.log('ADMIN_PASSWORD_HASH=' + hash)"
```

---

## 🚀 Configuration sur Vercel

### Via l'Interface Web

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet **OMADIGITAL**
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les 3 variables :

| Name | Value | Environment |
|------|-------|-------------|
| `ADMIN_USERNAME` | `admin` (ou votre choix) | Production, Preview, Development |
| `ADMIN_SALT` | `[votre salt généré]` | Production, Preview, Development |
| `ADMIN_PASSWORD_HASH` | `[votre hash généré]` | Production, Preview, Development |

5. Cliquez sur **Save**
6. **Redéployez** votre application

### Via CLI Vercel

```bash
# Installer Vercel CLI si nécessaire
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables
vercel env add ADMIN_USERNAME
vercel env add ADMIN_SALT
vercel env add ADMIN_PASSWORD_HASH

# Redéployer
vercel --prod
```

---

## 🌐 Configuration sur Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Sélectionnez votre site
3. Allez dans **Site settings** → **Environment variables**
4. Cliquez sur **Add a variable**
5. Ajoutez les 3 variables :
   - `ADMIN_USERNAME`
   - `ADMIN_SALT`
   - `ADMIN_PASSWORD_HASH`
6. **Redéployez** votre site

---

## 🔒 Sécurité - Bonnes Pratiques

### ✅ À FAIRE :
- Utilisez un mot de passe fort (12+ caractères, majuscules, minuscules, chiffres, symboles)
- Générez un nouveau salt unique pour chaque environnement
- Ne partagez JAMAIS ces valeurs publiquement
- Stockez-les dans un gestionnaire de mots de passe
- Changez le mot de passe régulièrement

### ❌ À NE PAS FAIRE :
- Ne commitez JAMAIS ces valeurs dans Git
- Ne les envoyez pas par email non chiffré
- Ne les partagez pas dans des messages publics
- N'utilisez pas de mots de passe simples comme "admin123"

---

## 🧪 Vérification

### 1. Vérifier que les Variables sont Définies

Ajoutez temporairement ce code dans `pages/api/admin/auth.ts` (ligne 25) :

```typescript
console.log('ENV CHECK:', {
  hasUsername: !!ADMIN_USERNAME,
  hasHash: !!ADMIN_PASSWORD_HASH,
  hasSalt: !!ADMIN_SALT,
  saltLength: ADMIN_SALT?.length,
  hashLength: ADMIN_PASSWORD_HASH?.length
});
```

### 2. Tester la Connexion

1. Allez sur `https://votre-site.com/admin/login`
2. Entrez vos identifiants
3. Si ça fonctionne → ✅ Configuration OK
4. Si erreur → Vérifiez les logs de production

---

## 🐛 Dépannage

### Erreur : "Admin authentication misconfigured"

**Cause :** Variables d'environnement manquantes ou mal formatées

**Solution :**
1. Vérifiez que les 3 variables sont définies
2. Vérifiez que `ADMIN_SALT` est en hexadécimal (32 caractères)
3. Vérifiez que `ADMIN_PASSWORD_HASH` est en hexadécimal (128 caractères)
4. Redéployez après avoir ajouté les variables

### Erreur : "Invalid credentials"

**Cause :** Mot de passe incorrect ou hash mal généré

**Solution :**
1. Régénérez le hash avec le même salt
2. Vérifiez que vous utilisez le bon mot de passe
3. Assurez-vous que le salt et le hash correspondent

### Connexion OK en Local mais pas en Production

**Cause :** Variables d'environnement différentes

**Solution :**
1. Vérifiez que les variables de production sont bien définies
2. Comparez avec votre `.env.local`
3. Redéployez après modification

---

## 📝 Exemple Complet

```bash
# 1. Générer les credentials
node generate-admin-credentials.js

# Output:
# ADMIN_SALT=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
# ADMIN_PASSWORD_HASH=1234567890abcdef...

# 2. Ajouter sur Vercel
vercel env add ADMIN_USERNAME
# Entrez: admin

vercel env add ADMIN_SALT
# Collez le salt généré

vercel env add ADMIN_PASSWORD_HASH
# Collez le hash généré

# 3. Redéployer
vercel --prod

# 4. Tester
# Allez sur https://votre-site.com/admin/login
```

---

## 🎯 Checklist Finale

- [ ] Variables d'environnement ajoutées sur la plateforme
- [ ] Salt généré (32 caractères hex minimum)
- [ ] Hash généré avec le bon salt (128 caractères hex)
- [ ] Application redéployée
- [ ] Connexion testée en production
- [ ] Credentials sauvegardés dans un gestionnaire de mots de passe

---

## 📞 Support

Si vous avez toujours des problèmes :

1. Vérifiez les logs de production
2. Testez d'abord en local avec les mêmes credentials
3. Assurez-vous que `JWT_SECRET` est aussi défini en production
4. Contactez le support de votre plateforme de déploiement

---

**✅ Une fois configuré, vous pourrez vous connecter à `/admin/login` en production !**
