# 🏷️ Guide de Configuration Google Tag Manager

Ce guide vous aide à configurer Google Tag Manager (GTM) pour gérer tous vos tags marketing de manière centralisée.

---

## 📊 Vos Identifiants

```
Google Tag Manager (GTM)
├─ Container ID : GT-5DHVDLCW

Google Analytics 4 (GA4)
├─ ID de mesure : G-MHSXEJMW8C
├─ ID de flux   : 12236663569
```

---

## ✅ Étape 1 : Configuration Locale (.env.local)

Ajoutez ces lignes dans votre fichier `.env.local` :

```bash
# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GT-5DHVDLCW

# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-MHSXEJMW8C
```

---

## 🚀 Étape 2 : Configuration Vercel (Production)

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **OMADIGITAL**
3. **Settings** → **Environment Variables**
4. Ajoutez ces 2 variables :

### Variable 1 : GTM
```
Key: NEXT_PUBLIC_GTM_ID
Value: GT-5DHVDLCW
Environment: ☑️ Production ☑️ Preview ☑️ Development
```

### Variable 2 : GA4
```
Key: NEXT_PUBLIC_GA_ID
Value: G-MHSXEJMW8C
Environment: ☑️ Production ☑️ Preview ☑️ Development
```

5. Cliquez sur **Save**
6. Redéployez votre site

---

## 🎯 Étape 3 : Configurer GA4 dans GTM

### Option A : Via GTM (Recommandé)

1. Allez sur [tagmanager.google.com](https://tagmanager.google.com)
2. Sélectionnez votre conteneur **GT-5DHVDLCW**
3. Cliquez sur **Balises** → **Nouvelle**

#### Configuration de la Balise GA4

**Nom de la balise :** Google Analytics 4 - Configuration

**Type de balise :**
- Sélectionnez **Google Analytics : Configuration GA4**

**Paramètres :**
- **ID de mesure** : `G-MHSXEJMW8C`
- **Envoyer un événement de page vue** : ☑️ Activé

**Déclencheur :**
- Sélectionnez **All Pages** (Toutes les pages)

**Cliquez sur Enregistrer**

#### Créer des Événements Personnalisés

**1. Événement : Demande de Devis**

- **Nom** : Quote Request
- **Type** : Événement GA4
- **Nom de l'événement** : `quote_request`
- **Déclencheur** : Clic sur bouton "Demander un devis"

**2. Événement : Contact WhatsApp**

- **Nom** : WhatsApp Contact
- **Type** : Événement GA4
- **Nom de l'événement** : `whatsapp_contact`
- **Déclencheur** : Clic sur lien WhatsApp

**3. Événement : Appel Téléphonique**

- **Nom** : Phone Call
- **Type** : Événement GA4
- **Nom de l'événement** : `phone_call`
- **Déclencheur** : Clic sur numéro de téléphone

**4. Événement : Inscription Newsletter**

- **Nom** : Newsletter Signup
- **Type** : Événement GA4
- **Nom de l'événement** : `newsletter_signup`
- **Déclencheur** : Soumission formulaire newsletter

**5. Événement : Interaction Chatbot**

- **Nom** : Chatbot Interaction
- **Type** : Événement GA4
- **Nom de l'événement** : `chatbot_interaction`
- **Déclencheur** : Ouverture du chatbot vocal

### Option B : GA4 Direct (Actuel)

Si vous préférez garder GA4 directement dans le code (sans passer par GTM), c'est déjà configuré ! Vous pouvez désactiver la balise GA4 dans GTM pour éviter les doublons.

---

## 🔍 Étape 4 : Créer des Déclencheurs

### Déclencheur 1 : Clic sur Bouton Devis

1. **Déclencheurs** → **Nouveau**
2. **Nom** : Click - Quote Button
3. **Type** : Clic - Tous les éléments
4. **Conditions** :
   - Click Text contient "devis" OU "quote"
   - OU Click Classes contient "quote-button"

### Déclencheur 2 : Clic WhatsApp

1. **Nom** : Click - WhatsApp
2. **Type** : Clic - Tous les éléments
3. **Conditions** :
   - Click URL contient "wa.me" OU "whatsapp"

### Déclencheur 3 : Clic Téléphone

1. **Nom** : Click - Phone
2. **Type** : Clic - Tous les éléments
3. **Conditions** :
   - Click URL contient "tel:"

### Déclencheur 4 : Soumission Formulaire

1. **Nom** : Form Submit - Newsletter
2. **Type** : Envoi de formulaire
3. **Conditions** :
   - Form ID contient "newsletter"

---

## 📊 Étape 5 : Publier les Modifications

1. Cliquez sur **Envoyer** (en haut à droite)
2. **Nom de la version** : "Configuration initiale GA4 + Événements"
3. **Description** : "Ajout GA4 et événements de conversion"
4. Cliquez sur **Publier**

---

## ✅ Étape 6 : Vérification

### Test en Mode Aperçu

1. Dans GTM, cliquez sur **Aperçu** (en haut à droite)
2. Entrez l'URL : `https://www.omadigital.net`
3. Cliquez sur **Connect**
4. Naviguez sur votre site et vérifiez que :
   - ✅ GTM se charge
   - ✅ GA4 Configuration se déclenche
   - ✅ Les événements se déclenchent correctement

### Test dans GA4 Temps Réel

1. Allez sur [analytics.google.com](https://analytics.google.com)
2. Sélectionnez **G-MHSXEJMW8C**
3. **Rapports** → **Temps réel**
4. Ouvrez votre site et vérifiez :
   - ✅ Vous apparaissez dans les utilisateurs actifs
   - ✅ Les événements apparaissent dans "Événements par nom"

---

## 🎯 Étape 7 : Ajouter d'Autres Tags (Optionnel)

Avec GTM, vous pouvez facilement ajouter :

### Facebook Pixel

1. **Balises** → **Nouvelle**
2. **Type** : Pixel Facebook
3. **ID Pixel** : Votre ID Facebook
4. **Déclencheur** : All Pages

### LinkedIn Insight Tag

1. **Balises** → **Nouvelle**
2. **Type** : LinkedIn Insight Tag
3. **ID Partenaire** : Votre ID LinkedIn
4. **Déclencheur** : All Pages

### Hotjar

1. **Balises** → **Nouvelle**
2. **Type** : HTML personnalisé
3. **Code** : Script Hotjar
4. **Déclencheur** : All Pages

---

## 📈 Avantages de GTM

### ✅ Gestion Centralisée
- Tous vos tags au même endroit
- Pas besoin de modifier le code
- Déploiement instantané

### ✅ Flexibilité
- Ajout/suppression de tags en quelques clics
- Tests A/B faciles
- Conditions de déclenchement avancées

### ✅ Performance
- Chargement asynchrone
- Pas de ralentissement du site
- Optimisation automatique

### ✅ Collaboration
- Plusieurs utilisateurs
- Historique des versions
- Environnements de test

---

## 🔧 Dépannage

### GTM ne se charge pas

1. **Vérifiez `.env.local`**
   ```bash
   NEXT_PUBLIC_GTM_ID=GT-5DHVDLCW
   ```

2. **Vérifiez le code source**
   - Ouvrez votre site
   - Clic droit → Afficher le code source
   - Recherchez `GT-5DHVDLCW`
   - Vous devriez voir le script GTM

3. **Vérifiez la console**
   - F12 → Console
   - Pas d'erreurs JavaScript
   - `window.dataLayer` défini

### Les événements ne se déclenchent pas

1. **Mode Aperçu GTM**
   - Utilisez le mode aperçu pour déboguer
   - Vérifiez que les déclencheurs se déclenchent

2. **Vérifiez les conditions**
   - Les sélecteurs CSS sont corrects
   - Les URLs correspondent
   - Les classes/IDs existent

3. **Vérifiez GA4**
   - Les événements arrivent dans GA4 Temps Réel
   - Délai de 1-2 secondes normal

---

## 📚 Ressources

- [Documentation GTM](https://support.google.com/tagmanager)
- [Documentation GA4](https://support.google.com/analytics)
- [GTM Academy](https://tagmanageracademy.com)
- [Simo Ahava Blog](https://www.simoahava.com)

---

## ✅ Checklist Finale

- [ ] `NEXT_PUBLIC_GTM_ID=GT-5DHVDLCW` dans `.env.local`
- [ ] `NEXT_PUBLIC_GA_ID=G-MHSXEJMW8C` dans `.env.local`
- [ ] Variables ajoutées sur Vercel
- [ ] Site redéployé
- [ ] GA4 configuré dans GTM
- [ ] Événements créés dans GTM
- [ ] Déclencheurs configurés
- [ ] Version publiée dans GTM
- [ ] Test en mode aperçu réussi
- [ ] Événements visibles dans GA4 Temps Réel

---

**Votre Google Tag Manager est prêt ! 🎉**

Vous pouvez maintenant gérer tous vos tags marketing depuis une interface centralisée sans modifier le code.
