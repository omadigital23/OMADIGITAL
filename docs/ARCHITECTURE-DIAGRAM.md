# 🏗️ Architecture RAG-FIRST - Diagramme Visuel

## 📊 Vue d'Ensemble du Système

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                                  │
│                    (Question en FR ou EN)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND CHATBOT                                  │
│              (SmartChatbotNext Component)                            │
│                                                                       │
│  • Capture question utilisateur                                     │
│  • Envoie à l'API backend                                           │
│  • Affiche réponse + suggestions + CTA                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT                                      │
│                 /api/chat/gemini.ts                                  │
│                                                                       │
│  1. Validation & sécurité (rate limiting, sanitization)            │
│  2. Appel RAG-First Service                                         │
│  3. Génération CTA & suggestions                                    │
│  4. Tracking analytics (Supabase)                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  RAG-FIRST SERVICE                                   │
│            src/lib/rag/rag-first-service.ts                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ÉTAPE 1: Recherche Base de Connaissances                    │  │
│  │  • Appel optimizedRAG.searchKnowledgeOptimized()             │  │
│  │  • Recherche hybride (FTS + keywords + category)             │  │
│  │  • Cache intelligent (5 min TTL)                             │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                            │
│                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ÉTAPE 2: Calcul de Confiance                                │  │
│  │  • Position documents (0-1 pt)                               │  │
│  │  • Correspondance titre (0-0.5 pt)                           │  │
│  │  • Correspondance contenu (0-0.3 pt)                         │  │
│  │  • Catégorie prioritaire (0-0.2 pt)                          │  │
│  │  • Score final normalisé (0-1)                               │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                            │
│                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ÉTAPE 3: Routage Intelligent                                │  │
│  │                                                               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │  │
│  │  │ Confiance ≥ 0.7 │  │ Confiance 0.5-0.7│  │ Confiance <0.5│ │  │
│  │  │                 │  │                 │  │              │ │  │
│  │  │   RAG SEUL      │  │  RAG + Gemini   │  │   Gemini     │ │  │
│  │  │                 │  │                 │  │   Fallback   │ │  │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │  │
│  │           │                    │                   │         │  │
│  │           ▼                    ▼                   ▼         │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │  │
│  │  │ Format direct   │  │ Call Gemini     │  │ Call Gemini  │ │  │
│  │  │ depuis docs RAG │  │ avec contexte   │  │ sans contexte│ │  │
│  │  │                 │  │ RAG             │  │ RAG          │ │  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SOURCES DE DONNÉES                                │
│                                                                       │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐ │
│  │   SUPABASE (Primary)        │  │   GEMINI API (Fallback)      │ │
│  │                             │  │                              │ │
│  │  • knowledge_base (200+)    │  │  • Model: gemini-2.0-flash   │ │
│  │  • Services                 │  │  • Temp: 0.7 (RAG) / 0.8     │ │
│  │  • About (Papa Amadou)      │  │  • Max tokens: 1024 / 512    │ │
│  │  • Contact (Sénégal/Maroc)  │  │  • Timeout: 15s              │ │
│  │  • Greetings (FR/EN)        │  │  • Language: [LANG:FR|EN]    │ │
│  │  • Founder info             │  │                              │ │
│  └─────────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux Détaillé par Scénario

### Scénario 1: Question OMA Digital (Haute Confiance)

```
Question: "Quels sont vos services WhatsApp ?"
    │
    ▼
┌───────────────────────────────────────┐
│ Recherche Supabase knowledge_base     │
│ → 5 documents trouvés                 │
│ → Catégorie: "services"               │
│ → Keywords: ["whatsapp", "automation"]│
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Calcul Confiance                      │
│ • Position: 1.0                       │
│ • Titre match: 0.5                    │
│ • Contenu match: 0.3                  │
│ • Catégorie: 0.2                      │
│ → Score: 0.92 (HAUTE)                 │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ RAG SEUL (source: rag_only)           │
│ • Format direct depuis documents      │
│ • Pas d'appel Gemini                  │
│ • Confiance: 0.95                     │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Réponse:                              │
│ "OMA Digital propose l'automatisation │
│ WhatsApp Business avec menus          │
│ interactifs, réponses automatiques... │
│ Contactez-nous au +212 701 193 811"  │
└───────────────────────────────────────┘
```

### Scénario 2: Question Vague (Confiance Moyenne)

```
Question: "Comment vous pouvez m'aider ?"
    │
    ▼
┌───────────────────────────────────────┐
│ Recherche Supabase knowledge_base     │
│ → 3 documents trouvés                 │
│ → Catégorie mixte                     │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Calcul Confiance                      │
│ • Position: 0.8                       │
│ • Titre match: 0.2                    │
│ • Contenu match: 0.1                  │
│ → Score: 0.65 (MOYENNE)               │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ RAG + GEMINI (source: rag_gemini)     │
│ • Format contexte RAG                 │
│ • Appel Gemini avec contexte          │
│ • Prompt: "Réponds avec ces docs..."  │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Gemini API Call                       │
│ POST /v1beta/models/gemini-2.0-flash  │
│ Body: {                               │
│   prompt: "Tu es OMA Digital...",     │
│   context: "[Doc1]...[Doc3]",         │
│   temperature: 0.7                    │
│ }                                     │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Réponse Gemini:                       │
│ "[LANG:FR] OMA Digital vous aide avec │
│ l'automatisation WhatsApp, sites web, │
│ apps mobiles. Contactez-nous !"       │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Parse & Return                        │
│ • Extract language: FR                │
│ • Clean response                      │
│ • Confiance: 0.85                     │
└───────────────────────────────────────┘
```

### Scénario 3: Question Générale (Gemini Fallback)

```
Question: "Quelle est la capitale du Sénégal ?"
    │
    ▼
┌───────────────────────────────────────┐
│ Recherche Supabase knowledge_base     │
│ → 0 documents pertinents              │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Calcul Confiance                      │
│ → Score: 0.1 (TRÈS FAIBLE)            │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ GEMINI FALLBACK (gemini_fallback)     │
│ • Pas de contexte RAG                 │
│ • Question générale                   │
│ • Prompt: "Question générale..."      │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Gemini API Call                       │
│ POST /v1beta/models/gemini-2.0-flash  │
│ Body: {                               │
│   prompt: "Réponds brièvement...",    │
│   temperature: 0.8                    │
│ }                                     │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Réponse Gemini:                       │
│ "[LANG:FR] La capitale du Sénégal est │
│ Dakar. Des questions sur nos services │
│ digitaux au Sénégal ?"                │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Parse & Return                        │
│ • Extract language: FR                │
│ • Clean response                      │
│ • Confiance: 0.7                      │
└───────────────────────────────────────┘
```

## 🎯 Décisions de Routage

```
┌─────────────────────────────────────────────────────────┐
│                  DECISION TREE                          │
└─────────────────────────────────────────────────────────┘

Documents trouvés ?
    │
    ├─ NON ──────────────────────────┐
    │                                 │
    └─ OUI                            │
        │                             │
        Confiance ≥ 0.7 ?             │
        │                             │
        ├─ OUI → RAG SEUL             │
        │        (rag_only)            │
        │        Confiance: 0.95       │
        │                             │
        └─ NON                        │
            │                         │
            Confiance ≥ 0.5 ?         │
            │                         │
            ├─ OUI → RAG + Gemini     │
            │        (rag_gemini)      │
            │        Confiance: 0.85   │
            │                         │
            └─ NON ──────────────────┐
                                      │
                                      ▼
                            GEMINI FALLBACK
                            (gemini_fallback)
                            Confiance: 0.7
```

## 📊 Statistiques de Performance

```
┌─────────────────────────────────────────────────────────┐
│              PERFORMANCE METRICS                        │
└─────────────────────────────────────────────────────────┘

RAG SEUL (rag_only)
├─ Latence moyenne: 150-300ms
├─ Cache hit rate: 60-70%
├─ Précision: 95%
└─ Utilisation: 40% des requêtes

RAG + Gemini (rag_gemini)
├─ Latence moyenne: 800-1500ms
├─ Cache hit rate: 30-40%
├─ Précision: 85%
└─ Utilisation: 35% des requêtes

Gemini Fallback (gemini_fallback)
├─ Latence moyenne: 600-1200ms
├─ Cache hit rate: 10-20%
├─ Précision: 70%
└─ Utilisation: 25% des requêtes
```

## 🗄️ Structure Base de Connaissances

```
knowledge_base (Supabase Table)
├─ id (uuid, primary key)
├─ title (text)
├─ content (text)
├─ category (text)
│   ├─ "services" (40%)
│   ├─ "about" (25%)
│   ├─ "contact" (15%)
│   ├─ "greeting" (10%)
│   └─ "founder" (10%)
├─ subcategory (text, nullable)
├─ language (text)
│   ├─ "fr" (60%)
│   └─ "en" (40%)
├─ keywords (text[], nullable)
├─ priority (integer, 1-10)
├─ tags (text[], nullable)
├─ is_active (boolean)
├─ view_count (integer)
├─ last_accessed (timestamp)
├─ embedding (vector, nullable)
├─ created_at (timestamp)
└─ updated_at (timestamp)

Total Entries: 200+
Active Entries: 200+
Languages: FR (60%), EN (40%)
Categories: 5 principales
```

## 🔐 Sécurité & Rate Limiting

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────┘

Request
    │
    ▼
┌───────────────────────────────────────┐
│ Layer 1: IP Validation                │
│ • Validate IP format                  │
│ • Check blocked IPs                   │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Layer 2: Rate Limiting                │
│ • 20 requests/minute (normal)         │
│ • 5 requests/minute (suspicious)      │
│ • Progressive penalties               │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Layer 3: Input Validation             │
│ • Sanitize message                    │
│ • Check length (max 1000 chars)       │
│ • Detect threats (XSS, SQL injection) │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Layer 4: Content Filtering            │
│ • Remove inappropriate content        │
│ • Validate response quality           │
└───────────────┬───────────────────────┘
                │
                ▼
            PROCESS REQUEST
```

## 📈 Analytics & Tracking

```
┌─────────────────────────────────────────────────────────┐
│              TRACKING PIPELINE                          │
└─────────────────────────────────────────────────────────┘

Chaque interaction track:
├─ session_id (uuid)
├─ user_message (text)
├─ bot_response (text)
├─ language (fr/en)
├─ input_type (text/voice)
├─ source (rag_only/rag_gemini/gemini_fallback)
├─ confidence (0-1)
├─ documents_found (integer)
├─ response_time_ms (integer)
├─ ip_address (text)
├─ user_agent (text)
└─ created_at (timestamp)

Tables Supabase:
├─ chatbot_conversations (main tracking)
├─ messages (detailed messages)
└─ error_logs (errors & debugging)
```

---

**Version**: 1.0  
**Date**: 2025-01-17  
**Auteur**: OMA Digital Team
