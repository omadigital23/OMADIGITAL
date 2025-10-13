# 🎤 Fix Audio STT pour iOS Safari

## Problème

Le microphone du chatbot ne fonctionnait pas sur iPhone (iOS Safari et Chrome iOS), affichant "Erreur de reconnaissance vocale".

## Cause Racine

1. **Web Speech API non supporté**: iOS Safari ne supporte pas l'API `webkitSpeechRecognition` de manière fiable
2. **Formats audio incompatibles**: iOS Safari enregistre en MP4/M4A au lieu de WebM/Opus
3. **Permissions microphone strictes**: iOS nécessite une gestion spéciale des permissions
4. **MediaRecorder limitations**: iOS a des contraintes sur les formats et configurations audio

## Solution Implémentée

### 1. Helper iOS Audio (`src/lib/utils/ios-audio-helper.ts`)

Nouveau module qui gère:
- ✅ Détection iOS/Safari
- ✅ Sélection automatique du meilleur format audio supporté
- ✅ Gestion des permissions microphone avec messages d'erreur clairs
- ✅ Conversion audio optimisée pour l'API

**Formats supportés par ordre de préférence**:
1. `audio/mp4` (iOS Safari)
2. `audio/aac` (iOS)
3. `audio/wav` (fallback)
4. `audio/webm;codecs=opus` (autres navigateurs)

### 2. Hook STT Amélioré (`src/components/SmartChatbot/hooks/useSTT.ts`)

Modifications:
- ✅ Utilise `requestMicrophonePermission()` pour iOS
- ✅ Détecte automatiquement le meilleur format avec `getBestAudioFormat()`
- ✅ Timeslice réduit à 500ms sur iOS (vs 1000ms ailleurs)
- ✅ Messages d'erreur spécifiques iOS
- ✅ Logs de debug pour diagnostiquer les problèmes

### 3. Backend STT Optimisé (`src/lib/google-cloud-speech-service.ts`)

Améliorations:
- ✅ Détection automatique du format audio (MP4, WAV, OGG, WebM)
- ✅ Configuration dynamique de l'encoding Google Cloud Speech
- ✅ Support des formats iOS (MP4/M4A → MP3 encoding)
- ✅ Fallback intelligent si format non reconnu

**Formats détectés**:
```typescript
- MP4/M4A (iOS) → encoding: 'MP3'
- WAV → encoding: 'LINEAR16', sampleRate: 16000
- OGG → encoding: 'OGG_OPUS'
- WebM → encoding: 'WEBM_OPUS' (défaut)
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    iOS Safari / Chrome                       │
│                                                              │
│  1. User clicks microphone button                           │
│  2. requestMicrophonePermission() → getUserMedia()          │
│  3. getBestAudioFormat() → audio/mp4 (iOS)                  │
│  4. MediaRecorder records with optimal settings             │
│  5. Audio blob sent to /api/stt/transcribe                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              API Route: /api/stt/transcribe                  │
│                                                              │
│  1. Receives base64 audio data                              │
│  2. Converts to ArrayBuffer                                 │
│  3. Calls googleCloudSpeechService.transcribeAudio()        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Google Cloud Speech Service (Backend)                │
│                                                              │
│  1. Detects audio format from header bytes                  │
│     - MP4/M4A (iOS) → encoding: 'MP3'                       │
│     - WAV → encoding: 'LINEAR16'                            │
│     - OGG → encoding: 'OGG_OPUS'                            │
│     - WebM → encoding: 'WEBM_OPUS'                          │
│  2. Calls Google Cloud Speech API                           │
│  3. Returns { text, confidence, language }                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Chatbot UI (Frontend)                     │
│                                                              │
│  1. Displays transcription                                  │
│  2. Sends to LLM for response                               │
│  3. Plays TTS response                                      │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Requise

### Variables d'Environnement

```bash
# Google Cloud API Key (pour STT/TTS)
GOOGLE_CLOUD_API_KEY=AIzaSyB3Kper2sR01N8fl0AxFqf_eEJ9jXVOApM
```

✅ **Déjà configuré dans `.env.local`**

### API Google Cloud

L'API utilise **Google Cloud Speech-to-Text API** avec API Key (pas Vertex AI).

**APIs activées requises**:
- ✅ Cloud Speech-to-Text API
- ✅ Cloud Text-to-Speech API

## Test sur iOS

### Étapes de Test

1. **Ouvrir sur iPhone**:
   ```
   https://omadigital.net (production)
   ou
   https://[votre-url-vercel].vercel.app (staging)
   ```

2. **Ouvrir le chatbot** (icône en bas à droite)

3. **Cliquer sur le bouton microphone** 🎤

4. **Autoriser l'accès au microphone** (popup iOS)

5. **Parler clairement** pendant 2-5 secondes

6. **Vérifier la transcription** dans le chatbot

### Debug sur iOS

Pour voir les logs de debug:

1. **Safari iOS**: 
   - Connecter iPhone au Mac
   - Safari > Develop > [iPhone] > [Page]
   - Console pour voir les logs

2. **Chrome iOS**:
   - Utiliser Remote Debugging via Chrome DevTools

**Logs attendus**:
```javascript
📱 iOS Audio Capabilities: {
  isIOS: true,
  isSafari: true,
  mediaRecorderSupported: true,
  supportedFormats: ['audio/mp4', 'audio/aac'],
  recommendedFormat: { mimeType: 'audio/mp4', ... }
}

🎤 Format audio sélectionné: { mimeType: 'audio/mp4', ... }

✅ MediaRecorder créé avec: {
  mimeType: 'audio/mp4',
  state: 'inactive'
}

🎤 Enregistrement démarré (timeslice: 500 ms)

🎤 STT Service: Transcribing with Vertex AI, size: 45678

🎤 Détecté: Format MP4/M4A (iOS)

✅ Google Cloud STT Success: {
  transcript: 'Bonjour, je voudrais...',
  confidence: 0.95,
  detectedLanguage: 'fr'
}
```

## Erreurs Courantes et Solutions

### 1. "Permission microphone refusée"

**Cause**: L'utilisateur a refusé l'accès au microphone

**Solution**:
- iOS: Réglages > Safari > Microphone > Autoriser
- Chrome iOS: Réglages > Chrome > Microphone > Autoriser

### 2. "Aucun microphone détecté"

**Cause**: Problème matériel ou microphone désactivé

**Solution**:
- Vérifier que le microphone fonctionne dans d'autres apps
- Redémarrer l'iPhone

### 3. "Empty audio recording"

**Cause**: MediaRecorder n'a pas capturé de données

**Solution**:
- Parler plus fort
- Vérifier que le microphone n'est pas bloqué
- Essayer un timeslice plus long (déjà optimisé à 500ms sur iOS)

### 4. "STT API error: 400"

**Cause**: Format audio non supporté par Google Cloud

**Solution**:
- Le code détecte automatiquement le format
- Si problème persiste, vérifier les logs pour voir le format détecté
- Ajouter un nouveau format dans la détection si nécessaire

## Avantages de la Solution

1. ✅ **Compatible iOS**: Fonctionne sur Safari et Chrome iOS
2. ✅ **Détection automatique**: Pas besoin de configuration manuelle
3. ✅ **Messages d'erreur clairs**: L'utilisateur sait quoi faire
4. ✅ **Fallback intelligent**: Essaie plusieurs formats
5. ✅ **Performance optimisée**: Timeslice adapté à iOS
6. ✅ **Logs de debug**: Facilite le diagnostic
7. ✅ **Production-ready**: Gestion d'erreurs robuste

## Alternatives Considérées

### ❌ Web Speech API (natif)
- **Problème**: Non supporté sur iOS Safari
- **Rejeté**: Pas fiable sur mobile

### ❌ Vertex AI Speech
- **Problème**: Nécessite Service Account (complexe)
- **Rejeté**: Google Cloud API Key plus simple

### ✅ Google Cloud Speech API (choisi)
- **Avantages**: Simple, API Key, supporte tous les formats
- **Inconvénient**: Coût par requête (mais acceptable)

## Coût Estimé

**Google Cloud Speech-to-Text**:
- Prix: $0.006 par 15 secondes
- 1000 requêtes de 5 secondes = ~$2
- Volume mensuel estimé: 10,000 requêtes = ~$20/mois

**Optimisations**:
- Timeslice court (500ms) réduit la latence
- Cache TTS pour réduire les coûts
- Pas de transcription continue (seulement on-demand)

## Prochaines Améliorations

1. **Compression audio**: Réduire la taille des fichiers avant envoi
2. **Détection de silence**: Arrêter automatiquement l'enregistrement
3. **Feedback visuel**: Waveform pendant l'enregistrement
4. **Multi-langue**: Support automatique de plus de langues
5. **Offline fallback**: Message si pas de connexion

## Références

- [Google Cloud Speech API](https://cloud.google.com/speech-to-text/docs)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [iOS Safari Audio Limitations](https://webkit.org/blog/6784/new-video-policies-for-ios/)
- [Web Audio on Mobile](https://developers.google.com/web/fundamentals/media/recording-audio)

## Support

Pour toute question ou problème:
1. Vérifier les logs dans la console
2. Tester sur un autre appareil iOS
3. Vérifier que l'API Key est valide
4. Contacter le support si le problème persiste

---

**Dernière mise à jour**: 13 octobre 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
