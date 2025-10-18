# 🔄 Instructions: Réinitialisation Base de Connaissances

## Étape 1: Vider la Base Actuelle

### Via Supabase Dashboard:

1. Allez sur **Supabase Dashboard** → **SQL Editor**
2. Exécutez ce script:

```sql
-- Vider complètement la base de connaissances
DELETE FROM knowledge_base;

-- Vérification
SELECT COUNT(*) as total_documents FROM knowledge_base;
-- Résultat attendu: 0
```

Ou utilisez le fichier:
```
supabase/migrations/20250117000002_clear_knowledge_base.sql
```

---

## Étape 2: Fournir les Nouvelles Informations

### Format Requis:

Donnez-moi les informations suivantes pour chaque catégorie:

### 📞 **1. CONTACT**
```
Téléphone/WhatsApp: 
Emails: 
Site web: 
Horaires: 
Adresses (avec villes et pays):
```

### 🛠️ **2. SERVICES**
Pour chaque service:
```
Nom du service:
Description (2-3 phrases):
Prix/Tarif (si applicable):
Mots-clés:
```

### 💰 **3. TARIFICATION & ROI**
```
Informations sur les prix:
ROI/Rentabilité:
Garanties:
```

### ❓ **4. FAQ (Questions Fréquentes)**
```
Q: Question 1
R: Réponse 1

Q: Question 2
R: Réponse 2
```

### 📊 **5. CAS D'USAGE**
```
Secteur 1 (ex: Restaurants):
- Description
- Avantages

Secteur 2 (ex: E-commerce):
- Description
- Avantages
```

### 🔧 **6. INFORMATIONS TECHNIQUES**
```
Technologies utilisées:
Sécurité:
Intégrations:
```

---

## Étape 3: Je Créerai le SQL

Une fois que vous m'aurez donné toutes les informations, je créerai un fichier SQL complet avec:
- ✅ Toutes les données en français
- ✅ Toutes les données en anglais
- ✅ Mots-clés optimisés pour le RAG
- ✅ Catégories correctes

---

## Étape 4: Insertion dans Supabase

Vous exécuterez le SQL généré dans Supabase Dashboard.

---

## 📝 Notes Importantes

- **Bilingue**: Chaque information doit être en FR et EN
- **Précision**: Donnez des informations exactes et complètes
- **Mots-clés**: Je les optimiserai automatiquement pour le RAG
- **Structure**: Je suivrai le format SQL Supabase

---

## ✅ Prêt!

**Donnez-moi maintenant toutes les informations correctes pour OMA Digital!**

Je commencerai par les informations de contact, puis nous continuerons avec les autres sections.
