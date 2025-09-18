-- Add database aggregation functions for efficient metrics calculations

-- Function to calculate conversation statistics
CREATE OR REPLACE FUNCTION get_conversation_stats(start_date TIMESTAMPTZ DEFAULT NULL, end_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(
  total_conversations BIGINT,
  avg_messages_per_conversation NUMERIC,
  avg_conversation_duration INTERVAL,
  most_active_hour INTEGER,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_conversations AS (
    SELECT * FROM conversations 
    WHERE (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at <= end_date)
  ),
  conversation_message_counts AS (
    SELECT 
      c.id as conversation_id,
      COUNT(m.id) as message_count,
      MAX(m.created_at) - MIN(m.created_at) as duration
    FROM filtered_conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    GROUP BY c.id
  ),
  hourly_activity AS (
    SELECT 
      EXTRACT(HOUR FROM created_at) as hour,
      COUNT(*) as conversation_count
    FROM filtered_conversations
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY conversation_count DESC
    LIMIT 1
  )
  SELECT 
    COUNT(DISTINCT c.id)::BIGINT as total_conversations,
    COALESCE(ROUND(AVG(cmc.message_count), 2), 0)::NUMERIC as avg_messages_per_conversation,
    COALESCE(AVG(cmc.duration), '0 seconds'::INTERVAL) as avg_conversation_duration,
    COALESCE((SELECT hour::INTEGER FROM hourly_activity), 0) as most_active_hour,
    COALESCE(ROUND(
      (COUNT(DISTINCT CASE WHEN cmc.message_count > 1 THEN c.id END)::NUMERIC / 
       GREATEST(COUNT(DISTINCT c.id), 1)) * 100, 2
    ), 0)::NUMERIC as completion_rate
  FROM filtered_conversations c
  LEFT JOIN conversation_message_counts cmc ON c.id = cmc.conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate chatbot interaction statistics
CREATE OR REPLACE FUNCTION get_chatbot_interaction_stats(start_date TIMESTAMPTZ DEFAULT NULL, end_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(
  total_interactions BIGINT,
  avg_response_time NUMERIC,
  positive_sentiment_rate NUMERIC,
  avg_satisfaction NUMERIC,
  most_common_intent TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_interactions AS (
    SELECT * FROM chatbot_interactions 
    WHERE (start_date IS NULL OR timestamp >= start_date)
      AND (end_date IS NULL OR timestamp <= end_date)
  ),
  intent_counts AS (
    SELECT 
      intent,
      COUNT(*) as intent_count
    FROM user_intents ui
    JOIN filtered_interactions fi ON ui.message_id = fi.message_id
    GROUP BY intent
    ORDER BY intent_count DESC
    LIMIT 1
  )
  SELECT 
    COUNT(*)::BIGINT as total_interactions,
    COALESCE(ROUND(AVG(response_time), 2), 0)::NUMERIC as avg_response_time,
    COALESCE(ROUND(
      (COUNT(CASE WHEN sentiment = 'positive' THEN 1 END)::NUMERIC / 
       GREATEST(COUNT(*), 1)) * 100, 2
    ), 0)::NUMERIC as positive_sentiment_rate,
    COALESCE(ROUND(AVG(user_satisfaction), 2), 0)::NUMERIC as avg_satisfaction,
    COALESCE((SELECT intent FROM intent_counts), 'unknown') as most_common_intent
  FROM filtered_interactions;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate quote conversion statistics
CREATE OR REPLACE FUNCTION get_quote_conversion_stats(start_date TIMESTAMPTZ DEFAULT NULL, end_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(
  total_quotes BIGINT,
  conversion_rate NUMERIC,
  avg_response_time INTERVAL,
  most_popular_service TEXT,
  status_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_quotes AS (
    SELECT * FROM quotes 
    WHERE (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at <= end_date)
  ),
  service_counts AS (
    SELECT 
      service,
      COUNT(*) as service_count
    FROM filtered_quotes
    GROUP BY service
    ORDER BY service_count DESC
    LIMIT 1
  ),
  status_counts AS (
    SELECT 
      status,
      COUNT(*) as count
    FROM filtered_quotes
    GROUP BY status
  )
  SELECT 
    COUNT(*)::BIGINT as total_quotes,
    COALESCE(ROUND(
      (COUNT(CASE WHEN status IN ('converted', 'accepted') THEN 1 END)::NUMERIC / 
       GREATEST(COUNT(*), 1)) * 100, 2
    ), 0)::NUMERIC as conversion_rate,
    COALESCE(AVG(updated_at - created_at), '0 seconds'::INTERVAL) as avg_response_time,
    COALESCE((SELECT service FROM service_counts), 'unknown') as most_popular_service,
    COALESCE((SELECT jsonb_object_agg(status, count) FROM status_counts), '{}') as status_distribution
  FROM filtered_quotes;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate blog analytics
CREATE OR REPLACE FUNCTION get_blog_analytics(start_date TIMESTAMPTZ DEFAULT NULL, end_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(
  total_articles BIGINT,
  published_articles BIGINT,
  avg_reading_time NUMERIC,
  most_popular_tag TEXT,
  engagement_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_articles AS (
    SELECT * FROM blog_articles 
    WHERE (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at <= end_date)
  ),
  tag_counts AS (
    SELECT 
      unnest(tags) as tag,
      COUNT(*) as tag_count
    FROM filtered_articles
    WHERE tags IS NOT NULL
    GROUP BY unnest(tags)
    ORDER BY tag_count DESC
    LIMIT 1
  ),
  article_views AS (
    SELECT 
      url,
      COUNT(*) as view_count
    FROM analytics_events
    WHERE event_name = 'page_view'
      AND url LIKE '%/blog%'
      AND (start_date IS NULL OR timestamp >= start_date)
      AND (end_date IS NULL OR timestamp <= end_date)
    GROUP BY url
  )
  SELECT 
    COUNT(*)::BIGINT as total_articles,
    COUNT(CASE WHEN status = 'published' THEN 1 END)::BIGINT as published_articles,
    COALESCE(ROUND(AVG(reading_time), 2), 0)::NUMERIC as avg_reading_time,
    COALESCE((SELECT tag FROM tag_counts), 'unknown') as most_popular_tag,
    COALESCE(ROUND(
      (COALESCE((SELECT SUM(view_count) FROM article_views), 0)::NUMERIC / 
       GREATEST(COUNT(CASE WHEN status = 'published' THEN 1 END), 1)) * 100, 2
    ), 0)::NUMERIC as engagement_rate
  FROM filtered_articles;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate CTA performance
CREATE OR REPLACE FUNCTION get_cta_performance_stats(start_date TIMESTAMPTZ DEFAULT NULL, end_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(
  total_ctas BIGINT,
  total_views BIGINT,
  total_clicks BIGINT,
  click_through_rate NUMERIC,
  conversion_rate NUMERIC,
  best_performing_cta TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_tracking AS (
    SELECT * FROM cta_tracking 
    WHERE (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at <= end_date)
  ),
  cta_metrics AS (
    SELECT 
      cta_id,
      COUNT(CASE WHEN action_type = 'view' THEN 1 END) as views,
      COUNT(CASE WHEN action_type = 'click' THEN 1 END) as clicks
    FROM filtered_tracking
    GROUP BY cta_id
  ),
  cta_performance AS (
    SELECT 
      cm.cta_id,
      ca.action as cta_action,
      cm.views,
      cm.clicks,
      CASE 
        WHEN cm.views > 0 THEN ROUND((cm.clicks::NUMERIC / cm.views) * 100, 2)
        ELSE 0 
      END as ctr
    FROM cta_metrics cm
    JOIN cta_actions ca ON cm.cta_id = ca.id
    ORDER BY ctr DESC
    LIMIT 1
  )
  SELECT 
    COUNT(DISTINCT ct.cta_id)::BIGINT as total_ctas,
    COALESCE(SUM(CASE WHEN ct.action_type = 'view' THEN 1 ELSE 0 END), 0)::BIGINT as total_views,
    COALESCE(SUM(CASE WHEN ct.action_type = 'click' THEN 1 ELSE 0 END), 0)::BIGINT as total_clicks,
    COALESCE(ROUND(
      (SUM(CASE WHEN ct.action_type = 'click' THEN 1 END)::NUMERIC / 
       GREATEST(SUM(CASE WHEN ct.action_type = 'view' THEN 1 END), 1)) * 100, 2
    ), 0)::NUMERIC as click_through_rate,
    COALESCE(ROUND(
      (SUM(CASE WHEN ct.action_type = 'conversion' THEN 1 END)::NUMERIC / 
       GREATEST(SUM(CASE WHEN ct.action_type = 'click' THEN 1 END), 1)) * 100, 2
    ), 0)::NUMERIC as conversion_rate,
    COALESCE((SELECT cta_action FROM cta_performance), 'unknown') as best_performing_cta
  FROM filtered_tracking ct;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate overall dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(period_days INTEGER DEFAULT 7)
RETURNS TABLE(
  total_users BIGINT,
  active_chats BIGINT,
  total_conversations BIGINT,
  avg_response_time NUMERIC,
  conversion_rate NUMERIC,
  total_quotes BIGINT,
  blog_views BIGINT,
  cta_clicks BIGINT,
  total_blog_articles BIGINT
) AS $$
DECLARE
  start_date TIMESTAMPTZ := NOW() - (period_days || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  SELECT 
    -- Total unique users from conversations and chatbot interactions
    (SELECT COUNT(DISTINCT COALESCE(c.user_id, ci.user_id::TEXT, c.session_id)) 
     FROM conversations c 
     FULL JOIN chatbot_interactions ci ON c.session_id = ci.session_id
     WHERE COALESCE(c.created_at, ci.timestamp) >= start_date)::BIGINT as total_users,
    
    -- Active chats (conversations with recent activity)
    (SELECT COUNT(*) 
     FROM conversations c
     WHERE c.updated_at >= NOW() - INTERVAL '1 hour'
       AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id))::BIGINT as active_chats,
    
    -- Total conversations
    (SELECT COUNT(*) FROM conversations WHERE created_at >= start_date)::BIGINT as total_conversations,
    
    -- Average response time from chatbot interactions
    (SELECT COALESCE(ROUND(AVG(response_time), 2), 0) 
     FROM chatbot_interactions 
     WHERE timestamp >= start_date)::NUMERIC as avg_response_time,
    
    -- Conversion rate (quotes / conversations)
    (SELECT COALESCE(ROUND(
      (COUNT(CASE WHEN q.status IN ('converted', 'accepted') THEN 1 END)::NUMERIC / 
       GREATEST(COUNT(*), 1)) * 100, 2
    ), 0)
     FROM quotes q 
     WHERE q.created_at >= start_date)::NUMERIC as conversion_rate,
    
    -- Total quotes
    (SELECT COUNT(*) FROM quotes WHERE created_at >= start_date)::BIGINT as total_quotes,
    
    -- Blog views from analytics events
    (SELECT COUNT(*) 
     FROM analytics_events 
     WHERE event_name = 'page_view' 
       AND url LIKE '%/blog%' 
       AND timestamp >= start_date)::BIGINT as blog_views,
    
    -- CTA clicks
    (SELECT COUNT(*) 
     FROM cta_tracking 
     WHERE action_type = 'click' 
       AND created_at >= start_date)::BIGINT as cta_clicks,
    
    -- Total blog articles
    (SELECT COUNT(*) FROM blog_articles)::BIGINT as total_blog_articles;
END;
$$ LANGUAGE plpgsql;