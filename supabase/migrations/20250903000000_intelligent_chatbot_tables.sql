-- Migration pour le chatbot intelligent OMA Digital
-- Tables pour conversations, messages, contexte et knowledge base

-- Extension pour les vecteurs (embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    session_id TEXT NOT NULL,
    language VARCHAR(2) DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
    language VARCHAR(2) DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    confidence FLOAT DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de la base de connaissances OMA Digital
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
    keywords TEXT[],
    embedding vector(1536), -- Pour les embeddings OpenAI/Google
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des intentions détectées
CREATE TABLE IF NOT EXISTS user_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    intent VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    entities JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réponses du chatbot avec feedback
CREATE TABLE IF NOT EXISTS bot_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_type VARCHAR(50) DEFAULT 'generated',
    source VARCHAR(100), -- 'knowledge_base', 'ai_generated', 'fallback'
    confidence FLOAT DEFAULT 1.0,
    user_feedback INTEGER CHECK (user_feedback IN (-1, 0, 1)), -- -1: negative, 0: neutral, 1: positive
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_language ON conversations(language);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_user_intents_intent ON user_intents(intent);

-- Index vectoriel pour la recherche sémantique
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (permettre l'accès public pour le chatbot)
CREATE POLICY "Allow public access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow public access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow public read access to knowledge_base" ON knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public access to user_intents" ON user_intents FOR ALL USING (true);
CREATE POLICY "Allow public access to bot_responses" ON bot_responses FOR ALL USING (true);

-- Allow admins to access all chatbot data
CREATE POLICY "Allow admin access to conversations" ON conversations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to messages" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to knowledge_base" ON knowledge_base FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to user_intents" ON user_intents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to bot_responses" ON bot_responses FOR ALL TO authenticated USING (true);