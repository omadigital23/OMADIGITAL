# Configuration Sécurisée Vertex AI

## ⚠️ SÉCURITÉ CRITIQUE

**NE JAMAIS partager ou commiter:**
- Service account JSON
- Clés privées
- Fichiers .env.local
- Credentials

## Configuration Sécurisée

### 1. Créer un Nouveau Service Account

```bash
# Google Cloud Console
# IAM & Admin → Service Accounts → Create

Nom: vertex-ai-chatbot
Permissions:
  - Vertex AI User
  - Cloud Speech Client (optionnel pour STT/TTS)
```

### 2. Télécharger la Clé JSON

```bash
# Sauvegarder dans un dossier sécurisé (PAS dans le repo Git!)
# Exemple: C:\Users\fallp\.gcp\omadigital-vertex.json
```

### 3. Configurer .env.local

```bash
# Créer/Modifier .env.local (déjà dans .gitignore)

# Vertex AI Configuration
GCP_PROJECT_ID=omadigital23
VERTEX_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\fallp\.gcp\omadigital-vertex.json

# Ou utiliser le contenu JSON directement (base64)
# GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
```

### 4. Vérifier .gitignore

```bash
# S'assurer que ces fichiers sont ignorés:
.env.local
.env.*.local
*.json
credentials/
.gcp/
```

## Utilisation dans le Code

```typescript
// ✅ BON: Utiliser les variables d'environnement
const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.VERTEX_AI_LOCATION;

// ❌ MAUVAIS: Hardcoder les credentials
const credentials = {
  private_key: "-----BEGIN PRIVATE KEY-----..." // JAMAIS!
};
```

## Vertex AI pour le Chatbot

```typescript
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION
});

const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
});
```

## Avantages Vertex AI vs Google AI

✅ **Meilleur respect du contexte RAG**
✅ **Plus de contrôle sur les réponses**
✅ **Quotas plus élevés**
✅ **Meilleure sécurité**
✅ **Conformité entreprise**

## Prochaines Étapes

1. ✅ Révoquer l'ancien service account exposé
2. ✅ Créer un nouveau service account
3. ✅ Configurer .env.local
4. ✅ Tester la connexion Vertex AI
5. ✅ Migrer le chatbot vers Vertex AI
