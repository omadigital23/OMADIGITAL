-- ESSENTIAL TABLES FOR OMA DIGITAL PROJECT
-- This file contains the most essential tables needed to get started

-- Enable vector extension for embeddings (must be done through Supabase dashboard)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Chatbot tables (most essential for the core functionality)
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

-- 2. User roles table for admin access
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Quotes table for contact form
CREATE TABLE IF NOT EXISTS quotes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  company text,
  service text not null,
  message text not null,
  budget text,
  status text not null default 'nouveau',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_language ON conversations(language);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_user_intents_intent ON user_intents(intent);

-- Index vectoriel pour la recherche sémantique (requires vector extension)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Create indexes for quotes and user roles
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_service ON quotes(service);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to chatbot (essential for functionality)
CREATE POLICY "Allow public access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow public access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow public read access to knowledge_base" ON knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public access to user_intents" ON user_intents FOR ALL USING (true);
CREATE POLICY "Allow public access to bot_responses" ON bot_responses FOR ALL USING (true);

-- Create policies for admin access
CREATE POLICY "Allow admin access to conversations" ON conversations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to messages" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to knowledge_base" ON knowledge_base FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to user_intents" ON user_intents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to bot_responses" ON bot_responses FOR ALL TO authenticated USING (true);

-- Allow inserts for contact forms
CREATE POLICY "Allow inserts for contact forms" ON quotes 
  FOR INSERT WITH CHECK (true);

-- Allow selects for admins only
CREATE POLICY "Allow selects for admins" ON quotes 
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Allow updates for admins only
CREATE POLICY "Allow updates for admins" ON quotes 
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

-- Allow selects for admins only
CREATE POLICY "Allow selects for admins" ON user_roles 
FOR SELECT USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  -- Allow users to see their own roles
  user_id = auth.uid()
);

-- Allow inserts and updates for admins only
CREATE POLICY "Allow admin writes" ON user_roles 
FOR ALL USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
);

-- Grant permissions
GRANT INSERT ON quotes TO anon;
GRANT SELECT, UPDATE ON quotes TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;

-- Insert some initial knowledge base data
-- Services OMA Digital en français
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Services d''automatisation WhatsApp', 
'OMA Digital propose des solutions d''automatisation WhatsApp pour PME sénégalaises. Nos services incluent : chatbots intelligents, réponses automatiques, gestion des commandes, suivi client, intégration CRM. Prix : 50 000 CFA/mois avec ROI garanti de 200% en 6 mois. Parfait pour restaurants, boutiques, services, e-commerce.',
'services', 'fr', 
ARRAY['whatsapp', 'automatisation', 'chatbot', 'pme', 'senegal', 'roi', 'prix', 'tarif']),

('Développement web et mobile',
'OMA Digital développe des sites web modernes et applications mobiles pour entreprises sénégalaises. Technologies : React, Next.js, React Native, Node.js. Services : sites vitrine, e-commerce, applications métier, maintenance. Responsive design, SEO optimisé, hébergement inclus.',
'services', 'fr',
ARRAY['site web', 'application mobile', 'développement', 'react', 'nextjs', 'ecommerce']),

('Contact et support',
'Contactez OMA Digital : Téléphone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Horaires : Lundi-Vendredi 9h-18h. Support technique 24/7. Devis gratuit sous 24h. Siège social Dakar, interventions tout Sénégal.',
'contact', 'fr',
ARRAY['contact', 'téléphone', 'email', 'support', 'devis', 'dakar']);

-- Services OMA Digital en anglais
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('WhatsApp Automation Services',
'OMA Digital provides WhatsApp automation solutions for Senegalese SMEs. Our services include: intelligent chatbots, automatic responses, order management, customer tracking, CRM integration. Price: 50,000 CFA/month with guaranteed 200% ROI in 6 months. Perfect for restaurants, shops, services, e-commerce.',
'services', 'en',
ARRAY['whatsapp', 'automation', 'chatbot', 'sme', 'senegal', 'roi', 'price', 'cost']),

('Web and Mobile Development',
'OMA Digital develops modern websites and mobile applications for Senegalese businesses. Technologies: React, Next.js, React Native, Node.js. Services: showcase sites, e-commerce, business applications, maintenance. Responsive design, SEO optimized, hosting included.',
'services', 'en',
ARRAY['website', 'mobile app', 'development', 'react', 'nextjs', 'ecommerce']),

('Contact and Support',
'Contact OMA Digital: Phone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Hours: Monday-Friday 9am-6pm. 24/7 technical support. Free quote within 24h. Head office Dakar, interventions throughout Senegal.',
'contact', 'en',
ARRAY['contact', 'phone', 'email', 'support', 'quote', 'dakar']);

COMMENT ON TABLE conversations IS 'Chatbot conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages in chatbot conversations';
COMMENT ON TABLE knowledge_base IS 'Knowledge base for chatbot responses';
COMMENT ON TABLE user_intents IS 'Detected user intents from messages';
COMMENT ON TABLE bot_responses IS 'Chatbot responses with feedback tracking';
COMMENT ON TABLE quotes IS 'Free quote form submissions';
COMMENT ON TABLE user_roles IS 'User roles for admin access control';