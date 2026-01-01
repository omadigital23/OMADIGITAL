-- ============================================================
-- MIGRATION 004: Complete Database Schema with RLS
-- This is a comprehensive migration for OMA Digital
-- Execute in order after running previous migrations
-- ============================================================

-- ============================================================
-- PART 1: CORE TABLES (if not exists)
-- ============================================================

-- 1.1 Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL UNIQUE,
  firstname text,
  lastname text,
  phone text,
  address text,
  city text,
  postalcode text,
  country text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 1.2 Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username character varying NOT NULL UNIQUE,
  email character varying UNIQUE,
  password_hash text NOT NULL,
  salt text NOT NULL,
  role character varying NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  first_name character varying,
  last_name character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true
);

-- 1.3 User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  role character varying NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================
-- PART 2: AUTHENTICATION & SECURITY TABLES
-- ============================================================

-- 2.1 Auth logs
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
  ip_address inet,
  user_agent text,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT auth_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2.2 Auth sessions
CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  refresh_token text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2.3 Email verifications
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  verified_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2.4 Password resets
CREATE TABLE IF NOT EXISTS public.password_resets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2.5 Rate limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL,
  endpoint text NOT NULL,
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone
);

-- ============================================================
-- PART 3: E-COMMERCE TABLES
-- ============================================================

-- 3.1 Cart items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  service_id text NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, service_id)
);

-- 3.2 Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_number text NOT NULL UNIQUE,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_method text,
  shipping_address jsonb,
  delivery_duration_days integer NOT NULL DEFAULT 3,
  shipped_at timestamp with time zone,
  estimated_delivery_date timestamp with time zone,
  delivered_at timestamp with time zone,
  tracking_number text,
  carrier text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3.3 Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  service_id text NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- 3.4 Delivery tracking
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  status text NOT NULL,
  status_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT delivery_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- 3.5 Quotes (devis)
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text,
  service text NOT NULL,
  message text NOT NULL,
  budget text,
  location text DEFAULT 'senegal',
  status text DEFAULT 'nouveau',
  security_validated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- PART 4: CHATBOT & AI TABLES
-- ============================================================

-- 4.1 Chatbot conversations
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_message text NOT NULL,
  bot_response text NOT NULL,
  language text DEFAULT 'fr-FR',
  input_type text DEFAULT 'text',
  confidence numeric,
  has_audio boolean DEFAULT false,
  voice_model text,
  response_quality text,
  user_agent text,
  ip_address text,
  referrer text,
  sentiment text,
  lead_score integer,
  created_at timestamp without time zone DEFAULT now()
);

-- 4.2 Bot responses
CREATE TABLE IF NOT EXISTS public.bot_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid,
  response_text text NOT NULL,
  response_type character varying DEFAULT 'generated',
  source character varying,
  confidence double precision DEFAULT 1.0,
  user_feedback integer CHECK (user_feedback IN (-1, 0, 1)),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 4.3 User intents
CREATE TABLE IF NOT EXISTS public.user_intents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid,
  intent character varying NOT NULL,
  confidence double precision NOT NULL,
  entities jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 4.4 Knowledge base
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  subcategory text,
  language text DEFAULT 'fr-FR',
  keywords text[],
  priority integer DEFAULT 5,
  tags text[],
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  last_accessed timestamp without time zone,
  embedding vector(1536),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- ============================================================
-- PART 5: ANALYTICS & TRACKING TABLES
-- ============================================================

-- 5.1 Visitor sessions
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  visitor_id uuid,
  ip_address inet,
  user_agent text,
  referrer text,
  landing_page text NOT NULL,
  exit_page text,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  duration interval,
  page_views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  scrolls integer DEFAULT 0,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser text,
  operating_system text,
  country text,
  region text,
  city text,
  is_bounce boolean DEFAULT true,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5.2 User behavior events
CREATE TABLE IF NOT EXISTS public.user_behavior_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('click', 'scroll', 'form_submit', 'download', 'video_play', 'video_complete', 'social_share', 'search', 'filter', 'sort', 'pagination')),
  element_id text,
  element_class text,
  element_text text,
  page_url text NOT NULL,
  x_position integer,
  y_position integer,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb,
  CONSTRAINT user_behavior_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.visitor_sessions(session_id) ON DELETE CASCADE
);

-- 5.3 Tracking events
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event text NOT NULL,
  properties jsonb DEFAULT '{}',
  user_id uuid,
  session_id text NOT NULL,
  user_agent text,
  ip_address text,
  timestamp timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tracking_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5.4 AB test results
CREATE TABLE IF NOT EXISTS public.ab_test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name text NOT NULL,
  variant text NOT NULL,
  conversion boolean NOT NULL DEFAULT false,
  user_id uuid,
  session_id text,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb
);

-- 5.5 Web vitals
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_rating text CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  metric_delta numeric,
  metric_id text,
  page_url text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text,
  ip_address text,
  metadata jsonb
);

-- 5.6 Error logs
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type text NOT NULL,
  error_message text NOT NULL,
  user_message text,
  session_id text,
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- PART 6: NEWSLETTER & BLOG TABLES
-- ============================================================

-- 6.1 Blog subscribers
CREATE TABLE IF NOT EXISTS public.blog_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  source text NOT NULL DEFAULT 'footer',
  confirmation_token text,
  unsubscribe_token text NOT NULL DEFAULT gen_random_uuid()::text,
  subscribed_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  segment text NOT NULL DEFAULT 'general',
  last_sent_day integer NOT NULL DEFAULT 0
);

-- 6.2 Newsletter analytics
CREATE TABLE IF NOT EXISTS public.newsletter_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid,
  event_type character varying NOT NULL,
  event_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6.3 Newsletter webhook logs
CREATE TABLE IF NOT EXISTS public.newsletter_webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_email text NOT NULL,
  event_type text NOT NULL,
  webhook_url text,
  payload jsonb,
  response_status integer,
  response_body text,
  retry_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  error_message text
);

-- ============================================================
-- PART 7: WEBHOOK & LOGS
-- ============================================================

-- 7.1 Webhook logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type character varying NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  error_message text,
  sent_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- PART 8: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 9: RLS POLICIES
-- ============================================================

-- 9.1 Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role full access users" ON public.users FOR ALL TO service_role USING (true);

-- 9.2 Cart items policies
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert to own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Service role full access cart" ON public.cart_items;

CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access cart" ON public.cart_items FOR ALL TO service_role USING (true);

-- 9.3 Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL TO service_role USING (true);

-- 9.4 Order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;

CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Service role full access order_items" ON public.order_items FOR ALL TO service_role USING (true);

-- 9.5 Delivery tracking policies
DROP POLICY IF EXISTS "Users can view own delivery tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Service role full access delivery" ON public.delivery_tracking;

CREATE POLICY "Users can view own delivery tracking" ON public.delivery_tracking FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Service role full access delivery" ON public.delivery_tracking FOR ALL TO service_role USING (true);

-- 9.6 Auth sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.auth_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.auth_sessions;
DROP POLICY IF EXISTS "Service role full access sessions" ON public.auth_sessions;

CREATE POLICY "Users can view own sessions" ON public.auth_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.auth_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access sessions" ON public.auth_sessions FOR ALL TO service_role USING (true);

-- 9.7 Tracking events policies
DROP POLICY IF EXISTS "Users can view own tracking" ON public.tracking_events;
DROP POLICY IF EXISTS "Anyone can insert tracking" ON public.tracking_events;
DROP POLICY IF EXISTS "Service role full access tracking" ON public.tracking_events;

CREATE POLICY "Users can view own tracking" ON public.tracking_events FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can insert tracking" ON public.tracking_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access tracking" ON public.tracking_events FOR ALL TO service_role USING (true);

-- 9.8 Public read-only policies for chatbot and knowledge base
DROP POLICY IF EXISTS "Public can read knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Service role full access knowledge" ON public.knowledge_base;

CREATE POLICY "Public can read knowledge base" ON public.knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access knowledge" ON public.knowledge_base FOR ALL TO service_role USING (true);

-- 9.9 Chatbot conversations (anyone can insert, service role manages)
DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "Service role full access conversations" ON public.chatbot_conversations;

CREATE POLICY "Anyone can insert conversations" ON public.chatbot_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access conversations" ON public.chatbot_conversations FOR ALL TO service_role USING (true);

-- 9.10 Quotes (anyone can insert, service role manages)
DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Service role full access quotes" ON public.quotes;

CREATE POLICY "Anyone can insert quotes" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access quotes" ON public.quotes FOR ALL TO service_role USING (true);

-- 9.11 Blog subscribers
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Service role full access subscribers" ON public.blog_subscribers;

CREATE POLICY "Anyone can subscribe" ON public.blog_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access subscribers" ON public.blog_subscribers FOR ALL TO service_role USING (true);

-- 9.12 Analytics tables (service role only)
DROP POLICY IF EXISTS "Service role full access visitor_sessions" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Service role full access user_behavior" ON public.user_behavior_events;
DROP POLICY IF EXISTS "Service role full access ab_tests" ON public.ab_test_results;
DROP POLICY IF EXISTS "Service role full access web_vitals" ON public.web_vitals;
DROP POLICY IF EXISTS "Service role full access error_logs" ON public.error_logs;
DROP POLICY IF EXISTS "Service role full access auth_logs" ON public.auth_logs;
DROP POLICY IF EXISTS "Service role full access webhook_logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Service role full access newsletter_analytics" ON public.newsletter_analytics;
DROP POLICY IF EXISTS "Service role full access newsletter_webhooks" ON public.newsletter_webhook_logs;

CREATE POLICY "Service role full access visitor_sessions" ON public.visitor_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access user_behavior" ON public.user_behavior_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access ab_tests" ON public.ab_test_results FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access web_vitals" ON public.web_vitals FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access error_logs" ON public.error_logs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access auth_logs" ON public.auth_logs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access webhook_logs" ON public.webhook_logs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access newsletter_analytics" ON public.newsletter_analytics FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access newsletter_webhooks" ON public.newsletter_webhook_logs FOR ALL TO service_role USING (true);

-- Allow anon to insert for public tracking endpoints
DROP POLICY IF EXISTS "Anon can insert visitor_sessions" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Anon can insert web_vitals" ON public.web_vitals;
DROP POLICY IF EXISTS "Anon can insert error_logs" ON public.error_logs;

CREATE POLICY "Anon can insert visitor_sessions" ON public.visitor_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert web_vitals" ON public.web_vitals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert error_logs" ON public.error_logs FOR INSERT TO anon WITH CHECK (true);

-- 9.13 Admin tables (service role only)
DROP POLICY IF EXISTS "Service role full access admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role full access user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access rate_limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role full access email_verifications" ON public.email_verifications;
DROP POLICY IF EXISTS "Service role full access password_resets" ON public.password_resets;
DROP POLICY IF EXISTS "Service role full access bot_responses" ON public.bot_responses;
DROP POLICY IF EXISTS "Service role full access user_intents" ON public.user_intents;

CREATE POLICY "Service role full access admin_users" ON public.admin_users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access user_roles" ON public.user_roles FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access rate_limits" ON public.rate_limits FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access email_verifications" ON public.email_verifications FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access password_resets" ON public.password_resets FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access bot_responses" ON public.bot_responses FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access user_intents" ON public.user_intents FOR ALL TO service_role USING (true);

-- ============================================================
-- PART 10: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session ON public.tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user ON public.tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session ON public.visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_session ON public.chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created ON public.auth_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);

-- ============================================================
-- PART 11: TRIGGERS
-- ============================================================

-- Update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visitor_sessions_updated_at ON public.visitor_sessions;
CREATE TRIGGER update_visitor_sessions_updated_at BEFORE UPDATE ON public.visitor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_subscribers_updated_at ON public.blog_subscribers;
CREATE TRIGGER update_blog_subscribers_updated_at BEFORE UPDATE ON public.blog_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMPLETE - Run migration 003 after this for view fixes
-- ============================================================
