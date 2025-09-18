-- Add performance indexes on frequently queried columns

-- Indexes for conversations table
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);

-- Indexes for knowledge_base table
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_updated_at ON knowledge_base(updated_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- Indexes for user_intents table
CREATE INDEX IF NOT EXISTS idx_user_intents_created_at ON user_intents(created_at);
CREATE INDEX IF NOT EXISTS idx_user_intents_intent ON user_intents(intent);

-- Indexes for bot_responses table
CREATE INDEX IF NOT EXISTS idx_bot_responses_created_at ON bot_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_responses_response_type ON bot_responses(response_type);

-- Indexes for chatbot_interactions table
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_created_at ON chatbot_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_session_id ON chatbot_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_sentiment ON chatbot_interactions(sentiment);

-- Indexes for quotes table
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_updated_at ON quotes(updated_at);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- Indexes for blog_articles table
CREATE INDEX IF NOT EXISTS idx_blog_articles_created_at ON blog_articles(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_articles_updated_at ON blog_articles(updated_at);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON blog_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);

-- Indexes for analytics_events table
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Indexes for cta_tracking table
CREATE INDEX IF NOT EXISTS idx_cta_tracking_created_at ON cta_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_action_type ON cta_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_session_id ON cta_tracking(session_id);

-- Indexes for ab_test_results table
CREATE INDEX IF NOT EXISTS idx_ab_test_results_timestamp ON ab_test_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_name ON ab_test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_conversion ON ab_test_results(conversion);

-- Indexes for performance monitoring tables
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_pagespeed_results_timestamp ON pagespeed_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_real_user_metrics_timestamp ON real_user_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_trends_date ON performance_trends(date);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_conversations_user_session ON conversations(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_name ON analytics_events(session_id, event_name);
CREATE INDEX IF NOT EXISTS idx_quotes_status_created ON quotes(status, created_at);