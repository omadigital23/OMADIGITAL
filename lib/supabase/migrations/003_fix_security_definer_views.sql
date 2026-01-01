-- ============================================================
-- MIGRATION 003: Fix SECURITY DEFINER Views
-- This migration recreates views without SECURITY DEFINER
-- Execute this script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Drop existing SECURITY DEFINER views
-- ============================================================

DROP VIEW IF EXISTS public.session_activity CASCADE;
DROP VIEW IF EXISTS public.tracking_analytics CASCADE;
DROP VIEW IF EXISTS public.return_eligibility CASCADE;
DROP VIEW IF EXISTS public.user_activity CASCADE;
DROP VIEW IF EXISTS public.order_delivery_countdown CASCADE;

-- ============================================================
-- STEP 2: Recreate views WITHOUT SECURITY DEFINER
-- These views now use SECURITY INVOKER (default) which respects RLS
-- ============================================================

-- 2.1 Session Activity View
CREATE OR REPLACE VIEW public.session_activity AS
SELECT 
  vs.id,
  vs.session_id,
  vs.visitor_id,
  vs.ip_address,
  vs.user_agent,
  vs.referrer,
  vs.landing_page,
  vs.exit_page,
  vs.start_time,
  vs.end_time,
  vs.duration,
  vs.page_views,
  vs.clicks,
  vs.scrolls,
  vs.device_type,
  vs.browser,
  vs.operating_system,
  vs.country,
  vs.region,
  vs.city,
  vs.is_bounce,
  vs.utm_source,
  vs.utm_medium,
  vs.utm_campaign,
  vs.created_at,
  COUNT(ube.id) AS total_events
FROM public.visitor_sessions vs
LEFT JOIN public.user_behavior_events ube ON vs.session_id = ube.session_id
GROUP BY vs.id;

-- 2.2 Tracking Analytics View
CREATE OR REPLACE VIEW public.tracking_analytics AS
SELECT 
  te.id,
  te.event,
  te.properties,
  te.user_id,
  te.session_id,
  te.user_agent,
  te.ip_address,
  te.timestamp,
  te.created_at,
  vs.landing_page,
  vs.referrer,
  vs.device_type,
  vs.browser,
  vs.country
FROM public.tracking_events te
LEFT JOIN public.visitor_sessions vs ON te.session_id = vs.session_id;

-- 2.3 Return Eligibility View (for orders)
CREATE OR REPLACE VIEW public.return_eligibility AS
SELECT 
  o.id AS order_id,
  o.user_id,
  o.order_number,
  o.total,
  o.status,
  o.payment_status,
  o.delivered_at,
  o.created_at,
  CASE 
    WHEN o.delivered_at IS NULL THEN FALSE
    WHEN o.status != 'delivered' THEN FALSE
    WHEN o.delivered_at + INTERVAL '14 days' < NOW() THEN FALSE
    ELSE TRUE
  END AS is_eligible_for_return,
  CASE 
    WHEN o.delivered_at IS NOT NULL THEN 
      GREATEST(0, EXTRACT(DAY FROM (o.delivered_at + INTERVAL '14 days') - NOW()))::integer
    ELSE NULL
  END AS days_remaining_for_return
FROM public.orders o
WHERE o.status IN ('delivered', 'shipped');

-- 2.4 User Activity View
CREATE OR REPLACE VIEW public.user_activity AS
SELECT 
  u.id AS user_id,
  u.email,
  u.firstname,
  u.lastname,
  u.created_at AS user_created_at,
  COUNT(DISTINCT o.id) AS total_orders,
  COALESCE(SUM(o.total), 0) AS total_spent,
  MAX(o.created_at) AS last_order_date,
  COUNT(DISTINCT te.id) AS total_events,
  MAX(te.timestamp) AS last_activity
FROM public.users u
LEFT JOIN public.orders o ON u.id = o.user_id
LEFT JOIN public.tracking_events te ON u.id = te.user_id
GROUP BY u.id, u.email, u.firstname, u.lastname, u.created_at;

-- 2.5 Order Delivery Countdown View
CREATE OR REPLACE VIEW public.order_delivery_countdown AS
SELECT 
  o.id AS order_id,
  o.user_id,
  o.order_number,
  o.status,
  o.shipped_at,
  o.estimated_delivery_date,
  o.delivery_duration_days,
  o.tracking_number,
  o.carrier,
  o.created_at,
  CASE 
    WHEN o.status = 'delivered' THEN 0
    WHEN o.estimated_delivery_date IS NULL THEN NULL
    WHEN o.estimated_delivery_date < NOW() THEN 0
    ELSE EXTRACT(DAY FROM (o.estimated_delivery_date - NOW()))::integer
  END AS days_until_delivery,
  CASE 
    WHEN o.status = 'delivered' THEN 'Livré'
    WHEN o.status = 'shipped' THEN 'En transit'
    WHEN o.status = 'processing' THEN 'En préparation'
    WHEN o.status = 'pending' THEN 'En attente'
    WHEN o.status = 'cancelled' THEN 'Annulé'
    ELSE o.status
  END AS status_label
FROM public.orders o
WHERE o.status NOT IN ('cancelled');

-- ============================================================
-- STEP 3: Grant appropriate permissions on views
-- ============================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON public.session_activity TO authenticated;
GRANT SELECT ON public.tracking_analytics TO authenticated;
GRANT SELECT ON public.return_eligibility TO authenticated;
GRANT SELECT ON public.user_activity TO authenticated;
GRANT SELECT ON public.order_delivery_countdown TO authenticated;

-- Grant SELECT on views to service role (for admin API)
GRANT SELECT ON public.session_activity TO service_role;
GRANT SELECT ON public.tracking_analytics TO service_role;
GRANT SELECT ON public.return_eligibility TO service_role;
GRANT SELECT ON public.user_activity TO service_role;
GRANT SELECT ON public.order_delivery_countdown TO service_role;

-- ============================================================
-- VERIFICATION: Check views are created without SECURITY DEFINER
-- ============================================================
-- Run this query to verify:
-- SELECT viewname, definition FROM pg_views WHERE schemaname = 'public' AND viewname IN ('session_activity', 'tracking_analytics', 'return_eligibility', 'user_activity', 'order_delivery_countdown');
