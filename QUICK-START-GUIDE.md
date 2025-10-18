# 🚀 Guide de Démarrage Rapide - RAG-FIRST Chatbot

## ⚡ Démarrage en 5 Minutes

### 1. Vérifier les Prérequis

```bash
# Node.js version
node --version  # Doit être >= 16.x

# NPM version
npm --version   # Doit être >= 8.x
```

### 2. Installer les Dépendances

```bash
cd /c/Users/fallp/Music/OMADIGITAL
npm install
```

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet:

```env
# Supabase (REQUIS)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google AI (REQUIS)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Optional
NODE_ENV=development
```

### 4. Vérifier la Base de Connaissances

La base de connaissances Supabase doit contenir la table `knowledge_base` avec vos 200+ entrées déjà insérées.

**Vérification rapide**:
```sql
-- Dans Supabase SQL Editor
SELECT COUNT(*) FROM knowledge_base WHERE is_active = true;
-- Devrait retourner 200+
```

### 5. Lancer le Serveur de Développement

```bash
npm run dev
```

Le chatbot sera accessible sur `http://localhost:3000`

### 6. Tester le Chatbot

Ouvrez votre navigateur et testez ces questions:

**Test 1 - RAG SEUL (haute confiance)**:
```
Question: "Quels sont vos services WhatsApp ?"
Résultat attendu: Réponse directe depuis la base de connaissances
Source: rag_only
```

**Test 2 - RAG + Gemini (confiance moyenne)**:
```
Question: "Comment vous pouvez m'aider ?"
Résultat attendu: Gemini avec contexte RAG
Source: rag_gemini
```

**Test 3 - Gemini Fallback (question générale)**:
```
Question: "Quelle est la capitale du Sénégal ?"
Résultat attendu: Gemini seul
Source: gemini_fallback
```

---

## 🔧 Configuration Avancée

### Ajuster les Seuils de Confiance

Éditez `src/lib/rag/rag-first-service.ts`:

```typescript
class RAGFirstService {
  private readonly MIN_RAG_CONFIDENCE = 0.7;  // Modifier ici
  private readonly RAG_LIMIT = 5;              // Nombre de documents
}
```

### Modifier les Prompts Gemini

Éditez les méthodes dans `src/lib/rag/rag-first-service.ts`:

```typescript
private createRAGPrompt(question: string, ragContext: string, language: 'fr' | 'en'): string {
  // Personnalisez le prompt ici
}

private createGeneralPrompt(question: string, language: 'fr' | 'en'): string {
  // Personnalisez le prompt ici
}
```

### Activer/Désactiver le Cache RAG

Éditez `src/lib/rag/optimized-vector-search.ts`:

```typescript
private readonly CACHE_TTL = 300000; // 5 minutes (modifier ici)
private readonly MAX_CACHE_SIZE = 100; // Taille max cache
```

---

## 📊 Monitoring en Production

### Vérifier les Logs

```bash
# Logs du serveur
npm run logs

# Logs en temps réel
npm run logs:watch
```

### Métriques Importantes

Surveillez ces métriques dans Supabase:

1. **Taux de succès RAG**:
```sql
SELECT 
  source,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence
FROM chatbot_conversations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY source;
```

2. **Temps de réponse moyen**:
```sql
SELECT 
  AVG(response_time_ms) as avg_response_time,
  MAX(response_time_ms) as max_response_time
FROM chatbot_conversations
WHERE created_at > NOW() - INTERVAL '24 hours';
```

3. **Questions fréquentes**:
```sql
SELECT 
  user_message,
  COUNT(*) as frequency
FROM chatbot_conversations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_message
ORDER BY frequency DESC
LIMIT 10;
```

---

## 🐛 Dépannage

### Problème: "Supabase connection failed"

**Solution**:
1. Vérifiez vos variables d'environnement
2. Testez la connexion:
```bash
curl https://your-project.supabase.co/rest/v1/knowledge_base \
  -H "apikey: your_anon_key"
```

### Problème: "Gemini API error"

**Solution**:
1. Vérifiez votre clé API Google AI
2. Testez l'API:
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Problème: "No documents found in RAG"

**Solution**:
1. Vérifiez que la table `knowledge_base` existe
2. Vérifiez que `is_active = true` pour vos documents
3. Vérifiez que la langue correspond (fr/en)

### Problème: "Rate limit exceeded"

**Solution**:
1. Attendez 1 minute
2. Réduisez la fréquence des requêtes
3. Vérifiez les logs pour détecter des boucles

---

## 📝 Checklist de Déploiement

### Avant de Déployer en Production

- [ ] Variables d'environnement configurées
- [ ] Base de connaissances Supabase peuplée (200+ entrées)
- [ ] Tests end-to-end passés
- [ ] Clé API Google AI valide
- [ ] Rate limiting configuré
- [ ] Monitoring configuré
- [ ] Logs activés
- [ ] Backup base de connaissances créé
- [ ] Documentation à jour
- [ ] Équipe formée sur la nouvelle architecture

### Commandes de Déploiement

```bash
# 1. Build production
npm run build

# 2. Vérifier le build
npm run start

# 3. Déployer (selon votre plateforme)
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Custom server
pm2 start npm --name "omadigital-chatbot" -- start
```

---

## 🎯 Exemples d'Utilisation

### Exemple 1: Intégration dans une Page

```tsx
import { SmartChatbotNext } from '@/components/SmartChatbotNext';

export default function HomePage() {
  return (
    <div>
      <h1>Bienvenue sur OMA Digital</h1>
      {/* Le chatbot s'affiche en bas à droite */}
      <SmartChatbotNext />
    </div>
  );
}
```

### Exemple 2: Appel API Direct

```typescript
const response = await fetch('/api/chat/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Quels sont vos services ?",
    sessionId: 'unique-session-id'
  })
});

const data = await response.json();
console.log(data.response);  // Réponse du chatbot
console.log(data.source);    // rag_only, rag_gemini, ou gemini_fallback
console.log(data.confidence); // Score 0-1
```

### Exemple 3: Utilisation du Service RAG Directement

```typescript
import { ragFirstService } from '@/lib/rag/rag-first-service';

const result = await ragFirstService.answerQuestion(
  "Comment automatiser mon WhatsApp ?",
  {
    language: 'fr',
    limit: 5,
    similarity_threshold: 0.7
  }
);

console.log(result.answer);      // Réponse
console.log(result.source);      // Source
console.log(result.confidence);  // Confiance
console.log(result.documents);   // Documents RAG utilisés
```

---

## 📞 Support

**Besoin d'aide ?**

- 📧 Email: omadigital23@gmail.com
- 📱 Téléphone: +212 701 193 811
- 🌐 Site: https://omadigital.net

**Documentation**:
- Architecture: `docs/RAG-FIRST-ARCHITECTURE.md`
- Diagrammes: `docs/ARCHITECTURE-DIAGRAM.md`
- Résumé: `IMPLEMENTATION-SUMMARY.md`
- Tests: `tests/rag-first.test.ts`

---

## 🎉 Félicitations !

Votre chatbot RAG-FIRST est maintenant opérationnel ! 🚀

Le système utilise intelligemment:
- ✅ Base de connaissances Supabase (priorité absolue)
- ✅ Gemini avec contexte RAG (confiance moyenne)
- ✅ Gemini seul (questions générales)
- ✅ Aucun fallback mécanique

**Prochaines étapes**:
1. Tester avec des questions réelles
2. Monitorer les performances
3. Ajuster les seuils si nécessaire
4. Enrichir la base de connaissances
5. Former votre équipe

Bon développement ! 💪
