-- ============================================================
-- RLS POLICIES - PARTIE 3: Tables publiques
-- Exécuter CE SCRIPT EN DERNIER (après part1 et part2)
-- ============================================================

-- 10. TABLE: knowledge_base
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read knowledge base" ON public.knowledge_base;

CREATE POLICY "Public can read knowledge base" ON public.knowledge_base
  FOR SELECT USING (is_active = true);

-- 11. TABLE: quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create quotes" ON public.quotes;

CREATE POLICY "Anyone can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (true);

-- 12. TABLE: blog_subscribers
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.blog_subscribers;

CREATE POLICY "Anyone can subscribe" ON public.blog_subscribers
  FOR INSERT WITH CHECK (true);

-- 13. TABLE: chatbot_conversations
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chatbot_conversations;

CREATE POLICY "Anyone can create conversations" ON public.chatbot_conversations
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- FIN - Toutes les policies RLS sont configurées!
-- ============================================================
