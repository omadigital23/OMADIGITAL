-- ============================================================
-- RLS POLICIES - PARTIE 2: order_items et auth tables
-- Exécuter CE SCRIPT EN DEUXIÈME (après part1)
-- ============================================================

-- 4. TABLE: order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- 5. TABLE: auth_sessions
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.auth_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.auth_sessions;

CREATE POLICY "Users can view own sessions" ON public.auth_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.auth_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 6. TABLE: auth_logs
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own auth logs" ON public.auth_logs;

CREATE POLICY "Users can view own auth logs" ON public.auth_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 7. TABLE: email_verifications
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email verifications" ON public.email_verifications;

CREATE POLICY "Users can view own email verifications" ON public.email_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- 8. TABLE: password_resets
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own password resets" ON public.password_resets;

CREATE POLICY "Users can view own password resets" ON public.password_resets
  FOR SELECT USING (auth.uid() = user_id);

-- 9. TABLE: tracking_events
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert tracking events" ON public.tracking_events;

CREATE POLICY "Users can insert tracking events" ON public.tracking_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
