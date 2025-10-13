# 🎤 ARCHITECTURE STT HUGGING FACE

## 🏗️ Architecture Implémentée

```
src/lib/
├── config/api-keys.ts          # Configuration centralisée
└── apis/
    ├── huggingface.ts          # Client HF
    └── stt-service.ts          # Service avec fallbacks

src/components/SmartChatbot/
├── hooks/useSTT.ts             # Hook principal STT
├── components/VoiceInput.tsx   # Interface vocale
└── index.tsx                   # Intégration chatbot

pages/api/stt/
└── huggingface.ts              # API route serveur
```

## 🔧 Fonctionnalités

### Client-Side
- **Enregistrement audio** via MediaRecorder
- **Transcription** avec Hugging Face Whisper
- **Fallback** vers API native navigateur
- **Détection langue** automatique FR/EN
- **Interface** avec feedback visuel

### Server-Side
- **API route** `/api/stt/huggingface`
- **Modèle** : `openai/whisper-large-v3`
- **Clé API** : `[REDACTED]`
- **Gestion erreurs** robuste

## 🎯 Utilisation

### Dans le Chatbot
1. Clic sur bouton microphone
2. Enregistrement audio automatique
3. Transcription via Hugging Face
4. Texte inséré dans l'input
5. Envoi du message

### États Visuels
- 🎤 **Gris** : Prêt à enregistrer
- 🔴 **Rouge pulsant** : Enregistrement en cours
- 🟡 **Jaune** : Traitement STT
- ❌ **Erreur** : Message d'erreur affiché

## 🔒 Sécurité & Performance

- **Validation** des données audio
- **Gestion erreurs** avec fallbacks
- **Rate limiting** côté serveur
- **Types TypeScript** stricts
- **Clean architecture** modulaire

## ✅ Tests Recommandés

```typescript
// Test du hook STT
const { startRecording, stopRecording } = useSTT();

// Test de l'API
POST /api/stt/huggingface
Body: { audioData: "base64..." }
```

**STT INTÉGRÉ AVEC SUCCÈS** 🚀